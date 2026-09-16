"""
Report Service
--------------
Builds monthly, category, and yearly financial reports.
All responses include Chart.js-ready label/data arrays.
"""

import logging
from datetime import datetime, timezone
from typing import List, Dict, Any
from collections import defaultdict

from app.services.transaction_service import get_all_user_transactions

logger = logging.getLogger("finnova.reports")

MONTH_LABELS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]


def _get_month_key(dt: Any) -> str:
    if isinstance(dt, datetime):
        return dt.strftime("%Y-%m")
    try:
        return str(dt)[:7]
    except Exception:
        return ""


def _month_label(key: str) -> str:
    try:
        year, m = key.split("-")
        return f"{MONTH_LABELS[int(m) - 1]} {year}"
    except Exception:
        return key


# ---------------------------------------------------------------------------
# Monthly Report
# ---------------------------------------------------------------------------

async def get_monthly_report(user_id: str) -> Dict[str, Any]:
    """Return income/expense/savings grouped by month."""
    txs = await get_all_user_transactions(user_id)

    monthly: Dict[str, Dict[str, Any]] = defaultdict(
        lambda: {"income": 0.0, "expenses": 0.0, "count": 0}
    )
    for t in txs:
        key = _get_month_key(t["date"])
        if not key:
            continue
        if t["type"] == "Income":
            monthly[key]["income"] += float(t["amount"])
        elif t["type"] == "Expense":
            monthly[key]["expenses"] += float(t["amount"])
        monthly[key]["count"] += 1

    sorted_keys = sorted(monthly.keys())
    data = []
    for key in sorted_keys:
        income = monthly[key]["income"]
        expenses = monthly[key]["expenses"]
        savings = max(0.0, income - expenses)
        data.append({
            "month": key,
            "label": _month_label(key),
            "income": round(income, 2),
            "expenses": round(expenses, 2),
            "savings": round(savings, 2),
            "transactionCount": monthly[key]["count"],
        })

    return {
        "data": data,
        "labels": [d["label"] for d in data],
        "incomeData": [d["income"] for d in data],
        "expenseData": [d["expenses"] for d in data],
        "savingsData": [d["savings"] for d in data],
    }


# ---------------------------------------------------------------------------
# Category Report
# ---------------------------------------------------------------------------

async def get_category_report(user_id: str) -> Dict[str, Any]:
    """Return expense totals grouped by category."""
    txs = await get_all_user_transactions(user_id)

    category_totals: Dict[str, Dict[str, Any]] = defaultdict(
        lambda: {"amount": 0.0, "count": 0}
    )
    total_expense = 0.0

    for t in txs:
        if t["type"] == "Expense":
            cat = t["category"]
            amount = float(t["amount"])
            category_totals[cat]["amount"] += amount
            category_totals[cat]["count"] += 1
            total_expense += amount

    data = []
    for cat, info in sorted(category_totals.items(), key=lambda x: x[1]["amount"], reverse=True):
        pct = round((info["amount"] / total_expense * 100) if total_expense > 0 else 0.0, 1)
        data.append({
            "category": cat,
            "totalAmount": round(info["amount"], 2),
            "transactionCount": info["count"],
            "percentage": pct,
        })

    return {
        "data": data,
        "labels": [d["category"] for d in data],
        "amounts": [d["totalAmount"] for d in data],
        "percentages": [d["percentage"] for d in data],
    }


# ---------------------------------------------------------------------------
# Yearly Report
# ---------------------------------------------------------------------------

async def get_yearly_report(user_id: str) -> Dict[str, Any]:
    """Return income/expense/savings grouped by year with monthly breakdown."""
    txs = await get_all_user_transactions(user_id)

    yearly: Dict[str, Dict[str, Any]] = defaultdict(
        lambda: {"income": 0.0, "expenses": 0.0, "monthly": defaultdict(
            lambda: {"income": 0.0, "expenses": 0.0, "count": 0}
        )}
    )

    for t in txs:
        key = _get_month_key(t["date"])
        if not key:
            continue
        year = key[:4]
        if t["type"] == "Income":
            yearly[year]["income"] += float(t["amount"])
            yearly[year]["monthly"][key]["income"] += float(t["amount"])
        elif t["type"] == "Expense":
            yearly[year]["expenses"] += float(t["amount"])
            yearly[year]["monthly"][key]["expenses"] += float(t["amount"])
        yearly[year]["monthly"][key]["count"] += 1

    data = []
    for year in sorted(yearly.keys()):
        income = yearly[year]["income"]
        expenses = yearly[year]["expenses"]
        savings = max(0.0, income - expenses)

        monthly_breakdown = []
        for mk in sorted(yearly[year]["monthly"].keys()):
            mi = yearly[year]["monthly"][mk]["income"]
            me = yearly[year]["monthly"][mk]["expenses"]
            ms = max(0.0, mi - me)
            monthly_breakdown.append({
                "month": mk,
                "label": _month_label(mk),
                "income": round(mi, 2),
                "expenses": round(me, 2),
                "savings": round(ms, 2),
                "transactionCount": yearly[year]["monthly"][mk]["count"],
            })

        data.append({
            "year": int(year),
            "totalIncome": round(income, 2),
            "totalExpenses": round(expenses, 2),
            "totalSavings": round(savings, 2),
            "monthlyBreakdown": monthly_breakdown,
        })

    return {
        "data": data,
        "labels": [str(d["year"]) for d in data],
        "incomeData": [d["totalIncome"] for d in data],
        "expenseData": [d["totalExpenses"] for d in data],
        "savingsData": [d["totalSavings"] for d in data],
    }


# ---------------------------------------------------------------------------
# Unified Summary  (used by Reports page /api/reports/summary)
# ---------------------------------------------------------------------------

async def get_report_summary(user_id: str) -> Dict[str, Any]:
    """
    Return a combined report summary:
      - overall totals (totalIncome, totalExpenses, netSavings)
      - per-category expense breakdown  [{_id, totalAmount}]
      - monthly income/expense trend    [{month, income, expense}]
    """
    txs = await get_all_user_transactions(user_id)

    total_income = 0.0
    total_expenses = 0.0
    category_map: Dict[str, float] = defaultdict(float)
    monthly: Dict[str, Dict[str, float]] = defaultdict(lambda: {"income": 0.0, "expense": 0.0})

    for t in txs:
        amount = float(t.get("amount", 0))
        key = _get_month_key(t.get("date", ""))
        if t["type"] == "Income":
            total_income += amount
            if key:
                monthly[key]["income"] += amount
        elif t["type"] == "Expense":
            total_expenses += amount
            category_map[t.get("category", "Other")] += amount
            if key:
                monthly[key]["expense"] += amount

    net_savings = max(0.0, total_income - total_expenses)

    category_breakdown = [
        {"_id": cat, "totalAmount": round(amt, 2)}
        for cat, amt in sorted(category_map.items(), key=lambda x: x[1], reverse=True)
    ]

    monthly_trend = [
        {
            "month": MONTH_LABELS[int(key.split("-")[1]) - 1] if len(key) == 7 else key,
            "income": round(monthly[key]["income"], 2),
            "expense": round(monthly[key]["expense"], 2),
        }
        for key in sorted(monthly.keys())
    ]

    return {
        "summary": {
            "totalIncome": round(total_income, 2),
            "totalExpenses": round(total_expenses, 2),
            "netSavings": round(net_savings, 2),
        },
        "categoryBreakdown": category_breakdown,
        "monthlyTrend": monthly_trend,
    }
