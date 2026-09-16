"""
Dashboard Service
-----------------
Aggregates all financial data for the main dashboard view.
"""

import logging
from datetime import datetime, timezone
from typing import List, Dict, Any
from collections import defaultdict

from app.services.transaction_service import get_all_user_transactions
from app.services.budget_service import get_or_create_budget

logger = logging.getLogger("finnova.dashboard")

MONTH_LABELS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]


async def get_dashboard_data(user_id: str) -> Dict[str, Any]:
    """Build the full dashboard summary for the user."""
    all_txs = await get_all_user_transactions(user_id)
    current_month = datetime.now(timezone.utc).strftime("%Y-%m")
    budget = await get_or_create_budget(user_id, current_month)

    # ---------------- Totals (all-time) ----------------
    total_income = sum(
        float(t["amount"]) for t in all_txs if t["type"] == "Income"
    )
    total_expenses = sum(
        float(t["amount"]) for t in all_txs if t["type"] == "Expense"
    )
    total_savings = max(0.0, total_income - total_expenses)

    # ---------------- Current month expenses for budget ----------------
    current_month_expenses = sum(
        float(t["amount"])
        for t in all_txs
        if t["type"] == "Expense" and _get_month_key(t["date"]) == current_month
    )
    monthly_budget = float(budget["monthlyBudget"])
    remaining_budget = max(0.0, monthly_budget - current_month_expenses)
    budget_used_pct = round(
        min(100.0, (current_month_expenses / monthly_budget * 100)) if monthly_budget > 0 else 0.0,
        1
    )

    # ---------------- Latest 5 transactions ----------------
    sorted_txs = sorted(all_txs, key=lambda t: t["date"], reverse=True)
    latest = []
    for t in sorted_txs[:5]:
        latest.append({
            "id": t["id"],
            "type": t["type"],
            "category": t["category"],
            "amount": t["amount"],
            "description": t["description"],
            "date": t["date"].strftime("%d/%m/%Y") if isinstance(t["date"], datetime) else str(t["date"]),
        })

    # ---------------- Expense category breakdown ----------------
    category_totals: Dict[str, float] = defaultdict(float)
    for t in all_txs:
        if t["type"] == "Expense":
            category_totals[t["category"]] += float(t["amount"])

    expense_categories = []
    if total_expenses > 0:
        for cat, amount in sorted(category_totals.items(), key=lambda x: x[1], reverse=True):
            expense_categories.append({
                "category": cat,
                "amount": round(amount, 2),
                "percentage": round(amount / total_expenses * 100, 1),
            })

    # ---------------- Monthly analytics (last 6 months) ----------------
    monthly_analytics = _build_monthly_analytics(all_txs)

    return {
        "totalIncome": round(total_income, 2),
        "totalExpenses": round(total_expenses, 2),
        "totalSavings": round(total_savings, 2),
        "monthlyBudget": monthly_budget,
        "remainingBudget": round(remaining_budget, 2),
        "budgetUsedPercent": budget_used_pct,
        "latestTransactions": latest,
        "expenseCategories": expense_categories,
        "monthlyAnalytics": monthly_analytics,
    }


def _get_month_key(dt: Any) -> str:
    if isinstance(dt, datetime):
        return dt.strftime("%Y-%m")
    try:
        return str(dt)[:7]
    except Exception:
        return ""


def _build_monthly_analytics(transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Build last 6 months of income/expense/savings data for charts."""
    monthly: Dict[str, Dict[str, float]] = defaultdict(lambda: {"income": 0.0, "expenses": 0.0})

    for t in transactions:
        key = _get_month_key(t["date"])
        if not key:
            continue
        if t["type"] == "Income":
            monthly[key]["income"] += float(t["amount"])
        elif t["type"] == "Expense":
            monthly[key]["expenses"] += float(t["amount"])

    # Get last 6 months sorted
    sorted_months = sorted(monthly.keys())[-6:]

    result = []
    for key in sorted_months:
        try:
            year, month_num = key.split("-")
            label = f"{MONTH_LABELS[int(month_num) - 1]} {year}"
        except Exception:
            label = key

        income = monthly[key]["income"]
        expenses = monthly[key]["expenses"]
        savings = max(0.0, income - expenses)

        result.append({
            "month": label,
            "income": round(income, 2),
            "expenses": round(expenses, 2),
            "savings": round(savings, 2),
        })

    return result
