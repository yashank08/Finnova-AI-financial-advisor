"""
Transactions Router
-------------------
POST   /api/transactions
GET    /api/transactions
GET    /api/transactions/{id}
PUT    /api/transactions/{id}
DELETE /api/transactions/{id}
"""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, status, Query

from app.dependencies.auth import get_current_user
from app.schemas.transaction import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    TransactionListResponse,
)
from app.services import transaction_service
from app.services.budget_service import update_budget_spent

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])


async def _sync_budget(user_id: str) -> None:
    """Recalculate and update this month's budget spend after any write."""
    try:
        from app.services.transaction_service import get_all_user_transactions
        from datetime import timezone
        current_month = datetime.now(timezone.utc).strftime("%Y-%m")
        txs = await get_all_user_transactions(user_id)
        month_spend = sum(
            float(t["amount"])
            for t in txs
            if t["type"] == "Expense" and str(t["date"])[:7] == current_month
        )
        await update_budget_spent(user_id, current_month, month_spend)
    except Exception:
        pass  # Budget sync is best-effort; never block the primary operation


@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    data: TransactionCreate,
    current_user: dict = Depends(get_current_user),
):
    """Create a new income or expense transaction."""
    user_id = str(current_user.get("_id", current_user.get("id")))
    result = await transaction_service.create_transaction(user_id, data)
    await _sync_budget(user_id)
    return result


@router.get("", response_model=TransactionListResponse)
async def list_transactions(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search in description"),
    type: Optional[str] = Query(None, description="Filter by type: Income or Expense"),
    category: Optional[str] = Query(None, description="Filter by category"),
    date_from: Optional[datetime] = Query(None, description="Filter from date (ISO)"),
    date_to: Optional[datetime] = Query(None, description="Filter to date (ISO)"),
    amount_min: Optional[float] = Query(None, ge=0, description="Minimum amount filter"),
    amount_max: Optional[float] = Query(None, ge=0, description="Maximum amount filter"),
    current_user: dict = Depends(get_current_user),
):
    """List user transactions with optional filters and pagination."""
    user_id = str(current_user.get("_id", current_user.get("id")))
    return await transaction_service.get_transactions(
        user_id=user_id,
        page=page,
        limit=limit,
        search=search,
        tx_type=type,
        category=category,
        date_from=date_from,
        date_to=date_to,
        amount_min=amount_min,
        amount_max=amount_max,
    )


@router.get("/{tx_id}", response_model=TransactionResponse)
async def get_transaction(
    tx_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Retrieve a single transaction by ID."""
    user_id = str(current_user.get("_id", current_user.get("id")))
    return await transaction_service.get_transaction_by_id(user_id, tx_id)


@router.put("/{tx_id}", response_model=TransactionResponse)
async def update_transaction(
    tx_id: str,
    data: TransactionUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update an existing transaction."""
    user_id = str(current_user.get("_id", current_user.get("id")))
    result = await transaction_service.update_transaction(user_id, tx_id, data)
    await _sync_budget(user_id)
    return result


@router.delete("/{tx_id}")
async def delete_transaction(
    tx_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete a transaction by ID."""
    user_id = str(current_user.get("_id", current_user.get("id")))
    result = await transaction_service.delete_transaction(user_id, tx_id)
    await _sync_budget(user_id)
    return result
