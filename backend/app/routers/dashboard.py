"""
Dashboard Router
----------------
GET /api/dashboard
"""

from fastapi import APIRouter, Depends
from app.dependencies.auth import get_current_user
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard_service import get_dashboard_data

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardResponse)
async def get_dashboard(current_user: dict = Depends(get_current_user)):
    """
    Returns the full financial dashboard summary:
    - Total Income, Expenses, Savings
    - Monthly Budget & Remaining
    - Latest 5 Transactions
    - Expense Category Breakdown
    - Monthly Analytics (last 6 months) for Chart.js
    """
    user_id = str(current_user.get("_id", current_user.get("id")))
    return await get_dashboard_data(user_id)
