"""
Transaction Service
-------------------
Handles all CRUD operations for the Transactions collection.
Supports MongoDB (async Motor) with automatic in-memory fallback.
"""

import uuid
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status
from bson import ObjectId

from app.core.database import get_db
from app.schemas.transaction import TransactionCreate, TransactionUpdate

logger = logging.getLogger("finnova.transactions")


def _serialize_tx(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Convert a MongoDB document into a JSON-serialisable dict."""
    return {
        "id": str(doc.get("_id", doc.get("id", ""))),
        "userId": str(doc.get("userId", "")),
        "type": doc.get("type", ""),
        "category": doc.get("category", ""),
        "amount": float(doc.get("amount", 0)),
        "description": doc.get("description", ""),
        "date": doc.get("date") if isinstance(doc.get("date"), datetime) else datetime.fromisoformat(str(doc.get("date", ""))),
        "createdAt": doc.get("createdAt") if isinstance(doc.get("createdAt"), datetime) else datetime.now(timezone.utc),
    }


# ---------------------------------------------------------------------------
# CREATE
# ---------------------------------------------------------------------------

async def create_transaction(user_id: str, data: TransactionCreate) -> Dict[str, Any]:
    db_obj = get_db()
    now = datetime.now(timezone.utc)

    # Check if category needs AI auto-classification
    generic_cats = {"", "other", "general", "uncategorized", "unknown"}
    category_val = (data.category or "").strip()
    confidence = 1.0

    if not category_val or category_val.lower() in generic_cats:
        try:
            from app.ai_engine.classification.predict import predict_category
            res = predict_category(data.description)
            category_val = res.get("predicted_category", category_val or "Other")
            confidence = float(res.get("confidence", 0.0))
        except Exception as e:
            logger.warning(f"Transaction classification fallback: {e}")
            category_val = category_val or "Other"
            confidence = 0.0

    doc = {
        "userId": user_id,
        "type": data.type or ("Income" if category_val == "Income" else "Expense"),
        "category": category_val,
        "classificationConfidence": confidence,
        "amount": data.amount,
        "description": data.description,
        "date": data.date,
        "createdAt": now,
    }

    if db_obj.is_connected and db_obj.db is not None:
        result = await db_obj.db.transactions.insert_one(doc)
        doc["_id"] = result.inserted_id
    else:
        tx_id = str(uuid.uuid4())
        doc["_id"] = tx_id
        doc["id"] = tx_id
        db_obj.in_memory_transactions[tx_id] = doc

    return _serialize_tx(doc)


# ---------------------------------------------------------------------------
# READ (list with filters + pagination)
# ---------------------------------------------------------------------------

async def get_transactions(
    user_id: str,
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    tx_type: Optional[str] = None,
    category: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    amount_min: Optional[float] = None,
    amount_max: Optional[float] = None,
) -> Dict[str, Any]:
    db_obj = get_db()
    skip = (page - 1) * limit

    if db_obj.is_connected and db_obj.db is not None:
        query: Dict[str, Any] = {"userId": user_id}

        if tx_type:
            query["type"] = tx_type
        if category:
            query["category"] = category
        if search:
            query["description"] = {"$regex": search, "$options": "i"}
        if date_from or date_to:
            date_filter: Dict[str, Any] = {}
            if date_from:
                date_filter["$gte"] = date_from
            if date_to:
                date_filter["$lte"] = date_to
            query["date"] = date_filter
        if amount_min is not None or amount_max is not None:
            amount_filter: Dict[str, Any] = {}
            if amount_min is not None:
                amount_filter["$gte"] = amount_min
            if amount_max is not None:
                amount_filter["$lte"] = amount_max
            query["amount"] = amount_filter

        total = await db_obj.db.transactions.count_documents(query)
        cursor = db_obj.db.transactions.find(query).sort("date", -1).skip(skip).limit(limit)
        docs = await cursor.to_list(length=limit)
    else:
        # In-memory fallback
        all_txs = [
            tx for tx in db_obj.in_memory_transactions.values()
            if str(tx.get("userId", "")) == user_id
        ]

        # Apply filters
        if tx_type:
            all_txs = [t for t in all_txs if t.get("type") == tx_type]
        if category:
            all_txs = [t for t in all_txs if t.get("category") == category]
        if search:
            all_txs = [t for t in all_txs if search.lower() in t.get("description", "").lower()]
        if date_from:
            all_txs = [t for t in all_txs if t.get("date", datetime.min) >= date_from]
        if date_to:
            all_txs = [t for t in all_txs if t.get("date", datetime.max) <= date_to]
        if amount_min is not None:
            all_txs = [t for t in all_txs if float(t.get("amount", 0)) >= amount_min]
        if amount_max is not None:
            all_txs = [t for t in all_txs if float(t.get("amount", 0)) <= amount_max]

        # Sort newest first
        all_txs.sort(key=lambda t: t.get("date", datetime.min), reverse=True)
        total = len(all_txs)
        docs = all_txs[skip: skip + limit]

    transactions = [_serialize_tx(doc) for doc in docs]
    total_pages = max(1, (total + limit - 1) // limit)

    return {
        "transactions": transactions,
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": total_pages,
    }


# ---------------------------------------------------------------------------
# READ (single)
# ---------------------------------------------------------------------------

async def get_transaction_by_id(user_id: str, tx_id: str) -> Dict[str, Any]:
    db_obj = get_db()

    if db_obj.is_connected and db_obj.db is not None:
        try:
            doc = await db_obj.db.transactions.find_one(
                {"_id": ObjectId(tx_id), "userId": user_id}
            )
        except Exception:
            doc = None
    else:
        doc = db_obj.in_memory_transactions.get(tx_id)
        if doc and str(doc.get("userId", "")) != user_id:
            doc = None

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found."
        )
    return _serialize_tx(doc)


# ---------------------------------------------------------------------------
# UPDATE
# ---------------------------------------------------------------------------

async def update_transaction(user_id: str, tx_id: str, data: TransactionUpdate) -> Dict[str, Any]:
    db_obj = get_db()
    updates = {k: v for k, v in data.model_dump().items() if v is not None}

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided to update."
        )

    updates["updatedAt"] = datetime.now(timezone.utc)

    if db_obj.is_connected and db_obj.db is not None:
        try:
            result = await db_obj.db.transactions.find_one_and_update(
                {"_id": ObjectId(tx_id), "userId": user_id},
                {"$set": updates},
                return_document=True
            )
        except Exception:
            result = None
        if not result:
            raise HTTPException(status_code=404, detail="Transaction not found.")
        return _serialize_tx(result)
    else:
        doc = db_obj.in_memory_transactions.get(tx_id)
        if not doc or str(doc.get("userId", "")) != user_id:
            raise HTTPException(status_code=404, detail="Transaction not found.")
        doc.update(updates)
        return _serialize_tx(doc)


# ---------------------------------------------------------------------------
# DELETE
# ---------------------------------------------------------------------------

async def delete_transaction(user_id: str, tx_id: str) -> Dict[str, Any]:
    db_obj = get_db()

    if db_obj.is_connected and db_obj.db is not None:
        try:
            result = await db_obj.db.transactions.find_one_and_delete(
                {"_id": ObjectId(tx_id), "userId": user_id}
            )
        except Exception:
            result = None
        if not result:
            raise HTTPException(status_code=404, detail="Transaction not found.")
    else:
        doc = db_obj.in_memory_transactions.get(tx_id)
        if not doc or str(doc.get("userId", "")) != user_id:
            raise HTTPException(status_code=404, detail="Transaction not found.")
        del db_obj.in_memory_transactions[tx_id]

    return {"message": "Transaction deleted successfully."}


# ---------------------------------------------------------------------------
# Helper: get all user transactions (used by other services)
# ---------------------------------------------------------------------------

async def get_all_user_transactions(user_id: str) -> List[Dict[str, Any]]:
    db_obj = get_db()

    if db_obj.is_connected and db_obj.db is not None:
        cursor = db_obj.db.transactions.find({"userId": user_id}).sort("date", 1)
        docs = await cursor.to_list(length=None)
    else:
        docs = [
            tx for tx in db_obj.in_memory_transactions.values()
            if str(tx.get("userId", "")) == user_id
        ]
        docs.sort(key=lambda t: t.get("date", datetime.min))

    return [_serialize_tx(doc) for doc in docs]
