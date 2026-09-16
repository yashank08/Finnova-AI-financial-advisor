"""
AI Service
----------
Orchestrates the ML predictor to produce:
- Spending summary with savings rate
- Next-month expense prediction (LinearRegression)
- Personalised financial recommendations
Also persists predictions to MongoDB/in-memory.
"""

import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List
from collections import defaultdict

from app.core.database import get_db
from app.services.transaction_service import get_all_user_transactions
from app.ml.predictor import LinearRegressionPredictor

logger = logging.getLogger("finnova.ai")

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


def _next_month_label() -> Dict[str, str]:
    now = datetime.now(timezone.utc)
    m = now.month % 12 + 1
    y = now.year if now.month < 12 else now.year + 1
    return {
        "key": f"{y}-{m:02d}",
        "label": f"{MONTH_LABELS[m - 1]} {y}"
    }


# ---------------------------------------------------------------------------
# AI Summary
# ---------------------------------------------------------------------------

async def get_ai_summary(user_id: str) -> Dict[str, Any]:
    """Return spending summary with savings rate and category breakdown."""
    txs = await get_all_user_transactions(user_id)

    total_income = sum(float(t["amount"]) for t in txs if t["type"] == "Income")
    total_expenses = sum(float(t["amount"]) for t in txs if t["type"] == "Expense")
    total_savings = max(0.0, total_income - total_expenses)
    savings_rate = round((total_savings / total_income * 100) if total_income > 0 else 0.0, 1)

    predictor = LinearRegressionPredictor()
    top_cat_info = predictor.get_highest_category(txs)
    category_breakdown = predictor.get_category_breakdown(txs)

    # Human-readable summary text
    if not txs:
        summary_text = "No transactions recorded yet. Start adding income and expenses to see AI insights."
    elif savings_rate >= 20:
        summary_text = (
            f"Excellent financial health! You're saving {savings_rate}% of your income "
            f"and your top expense is {top_cat_info['category']}. "
            "Consider channelling surplus into SIPs or index funds for long-term compounding."
        )
    elif savings_rate >= 10:
        summary_text = (
            f"Moderate savings at {savings_rate}% of income. "
            f"Your highest spend category is {top_cat_info['category']} at ₹{top_cat_info['amount']:,.0f}. "
            "Review this category to find optimisation opportunities."
        )
    else:
        summary_text = (
            f"Your savings rate is {savings_rate}%, below the recommended 20%. "
            f"The biggest drain on your budget is {top_cat_info['category']} at ₹{top_cat_info['amount']:,.0f}. "
            "Consider setting a strict monthly budget cap on non-essential categories."
        )

    return {
        "totalIncome": round(total_income, 2),
        "totalExpenses": round(total_expenses, 2),
        "totalSavings": round(total_savings, 2),
        "savingsRate": savings_rate,
        "topSpendingCategory": top_cat_info["category"],
        "topSpendingAmount": top_cat_info["amount"],
        "expenseCategories": category_breakdown,
        "summaryText": summary_text,
    }


# ---------------------------------------------------------------------------
# AI Prediction
# ---------------------------------------------------------------------------

async def get_ai_prediction(user_id: str) -> Dict[str, Any]:
    """Train ML models (Linear Regression, Random Forest, Gradient Boosting) on monthly expenses and predict next month."""
    txs = await get_all_user_transactions(user_id)

    predictor = LinearRegressionPredictor()
    result = predictor.forecast_next_month(txs)

    next_month = _next_month_label()
    now = datetime.now(timezone.utc)

    predicted_expense = result.get("predicted_expense", 0.0)
    model_used = result.get("model_used", "Rule-based Moving Average")

    prediction_doc = {
        "userId": user_id,
        "predictionMonth": next_month["key"],
        "predictionMonthLabel": next_month["label"],
        "predictedExpense": predicted_expense,
        "historicalAverage": result.get("historical_average", 0.0),
        "trend": result.get("trend", "stable"),
        "modelUsed": model_used,
        "trainingMonths": result.get("training_months", 0),
        "mae": result.get("mae"),
        "rmse": result.get("rmse"),
        "r2": result.get("r2"),
        "expectedSavings": result.get("expected_savings", 0.0),
        "forecastChangePct": result.get("forecast_change_pct", 0.0),
        "confidenceNote": result.get("confidence_note", ""),
        "aiRecommendation": (
            f"Based on {result.get('training_months', 0)} month(s) of data, predicted expense for "
            f"{next_month['label']} is ₹{predicted_expense:,.0f} using {model_used}."
        ),
        "createdAt": now,
    }

    # Persist prediction
    db_obj = get_db()
    if db_obj.is_connected and db_obj.db is not None:
        await db_obj.db.predictions.find_one_and_replace(
            {"userId": user_id, "predictionMonth": next_month["key"]},
            prediction_doc,
            upsert=True
        )
    else:
        pred_id = str(uuid.uuid4())
        prediction_doc["_id"] = pred_id
        db_obj.in_memory_predictions[pred_id] = prediction_doc

    return {
        "predictionMonth": next_month["key"],
        "predictionMonthLabel": next_month["label"],
        "predictedExpense": predicted_expense,
        "confidenceNote": result.get("confidence_note", ""),
        "historicalAverage": result.get("historical_average", 0.0),
        "trend": result.get("trend", "stable"),
        "modelUsed": model_used,
        "trainingMonths": result.get("training_months", 0),
        "mae": result.get("mae"),
        "rmse": result.get("rmse"),
        "r2": result.get("r2"),
        "expectedSavings": result.get("expected_savings", 0.0),
        "forecastChangePct": result.get("forecast_change_pct", 0.0),
        "createdAt": now.isoformat(),
    }


# ---------------------------------------------------------------------------
# AI Recommendations
# ---------------------------------------------------------------------------

async def get_ai_recommendations(user_id: str, user: Dict[str, Any]) -> Dict[str, Any]:
    """Generate personalised financial recommendations."""
    txs = await get_all_user_transactions(user_id)

    total_income = sum(float(t["amount"]) for t in txs if t["type"] == "Income")
    total_expenses = sum(float(t["amount"]) for t in txs if t["type"] == "Expense")
    total_savings = max(0.0, total_income - total_expenses)
    savings_rate = round((total_savings / total_income * 100) if total_income > 0 else 0.0, 1)

    predictor = LinearRegressionPredictor()
    top_cat = predictor.get_highest_category(txs)

    # Build monthly expense totals for trend
    monthly_expenses: Dict[str, float] = defaultdict(float)
    for t in txs:
        if t["type"] == "Expense":
            key = _get_month_key(t["date"])
            if key:
                monthly_expenses[key] += float(t["amount"])

    sorted_months = sorted(monthly_expenses.keys())
    monthly_totals = [monthly_expenses[m] for m in sorted_months]
    predictor.train(monthly_totals)
    prediction = predictor.predict_next_month()

    summary_data = {
        "total_income": total_income,
        "total_expenses": total_expenses,
        "savings_rate": savings_rate,
        "top_category": top_cat["category"],
    }

    recommendations = predictor.generate_recommendations(user, summary_data, prediction)
    now = datetime.now(timezone.utc)

    return {
        "recommendations": recommendations,
        "generatedAt": now.isoformat(),
        "basedOnMonths": len(sorted_months),
    }
