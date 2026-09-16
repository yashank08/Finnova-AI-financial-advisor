"""
Budget Service
--------------
Manages monthly budgets per user.
Budget documents live in the 'budgets' collection.
"""

import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional

from fastapi import HTTPException, status
from bson import ObjectId

from app.core.database import get_db
from app.schemas.budget import BudgetCreate, BudgetUpdate

logger = logging.getLogger("finnova.budgets")


def _current_month() -> str:
    now = datetime.now(timezone.utc)
    return now.strftime("%Y-%m")


def _serialize_budget(doc: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": str(doc.get("_id", doc.get("id", ""))),
        "userId": str(doc.get("userId", "")),
        "monthlyBudget": float(doc.get("monthlyBudget", 0)),
        "spent": float(doc.get("spent", 0)),
        "remaining": float(doc.get("remaining", doc.get("monthlyBudget", 0))),
        "month": doc.get("month", _current_month()),
    }


async def get_or_create_budget(user_id: str, month: Optional[str] = None) -> Dict[str, Any]:
    """Get the budget for a given month, or create a default one."""
    if month is None:
        month = _current_month()

    db_obj = get_db()

    if db_obj.is_connected and db_obj.db is not None:
        doc = await db_obj.db.budgets.find_one({"userId": user_id, "month": month})
    else:
        doc = next(
            (b for b in db_obj.in_memory_budgets.values()
             if str(b.get("userId")) == user_id and b.get("month") == month),
            None
        )

    if doc:
        return _serialize_budget(doc)

    # Create default budget
    default_budget = {
        "userId": user_id,
        "monthlyBudget": 50000.0,
        "spent": 0.0,
        "remaining": 50000.0,
        "month": month,
        "createdAt": datetime.now(timezone.utc),
    }

    if db_obj.is_connected and db_obj.db is not None:
        result = await db_obj.db.budgets.insert_one(default_budget)
        default_budget["_id"] = result.inserted_id
    else:
        bid = str(uuid.uuid4())
        default_budget["_id"] = bid
        default_budget["id"] = bid
        db_obj.in_memory_budgets[bid] = default_budget

    return _serialize_budget(default_budget)


async def set_budget(user_id: str, data: BudgetCreate) -> Dict[str, Any]:
    """Create or update a monthly budget."""
    db_obj = get_db()
    month = data.month
    now = datetime.now(timezone.utc)

    if db_obj.is_connected and db_obj.db is not None:
        existing = await db_obj.db.budgets.find_one({"userId": user_id, "month": month})
        if existing:
            spent = float(existing.get("spent", 0))
            remaining = max(0.0, data.monthlyBudget - spent)
            result = await db_obj.db.budgets.find_one_and_update(
                {"userId": user_id, "month": month},
                {"$set": {
                    "monthlyBudget": data.monthlyBudget,
                    "remaining": remaining,
                    "updatedAt": now
                }},
                return_document=True
            )
            return _serialize_budget(result)
        else:
            doc = {
                "userId": user_id,
                "monthlyBudget": data.monthlyBudget,
                "spent": 0.0,
                "remaining": data.monthlyBudget,
                "month": month,
                "createdAt": now,
            }
            result = await db_obj.db.budgets.insert_one(doc)
            doc["_id"] = result.inserted_id
            return _serialize_budget(doc)
    else:
        existing = next(
            (b for b in db_obj.in_memory_budgets.values()
             if str(b.get("userId")) == user_id and b.get("month") == month),
            None
        )
        if existing:
            spent = float(existing.get("spent", 0))
            existing["monthlyBudget"] = data.monthlyBudget
            existing["remaining"] = max(0.0, data.monthlyBudget - spent)
            return _serialize_budget(existing)
        else:
            bid = str(uuid.uuid4())
            doc = {
                "_id": bid,
                "id": bid,
                "userId": user_id,
                "monthlyBudget": data.monthlyBudget,
                "spent": 0.0,
                "remaining": data.monthlyBudget,
                "month": month,
                "createdAt": now,
            }
            db_obj.in_memory_budgets[bid] = doc
            return _serialize_budget(doc)


async def update_budget_spent(user_id: str, month: str, spent_total: float) -> None:
    """Recalculate and persist spent/remaining for a given month's budget."""
    db_obj = get_db()

    if db_obj.is_connected and db_obj.db is not None:
        budget = await db_obj.db.budgets.find_one({"userId": user_id, "month": month})
        if budget:
            monthly_budget = float(budget.get("monthlyBudget", 50000))
            remaining = max(0.0, monthly_budget - spent_total)
            await db_obj.db.budgets.update_one(
                {"userId": user_id, "month": month},
                {"$set": {"spent": spent_total, "remaining": remaining}}
            )
    else:
        budget = next(
            (b for b in db_obj.in_memory_budgets.values()
             if str(b.get("userId")) == user_id and b.get("month") == month),
            None
        )
        if budget:
            monthly_budget = float(budget.get("monthlyBudget", 50000))
            budget["spent"] = spent_total
            budget["remaining"] = max(0.0, monthly_budget - spent_total)
