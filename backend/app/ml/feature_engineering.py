"""
Feature Engineering Module for FinNova Expense Forecasting
------------------------------------------------------------
Transforms raw transaction dictionaries into time-series features 
for Machine Learning models without data leakage.

Features engineered:
- previous_month_expense (Expense at t-1)
- rolling_3m_avg_expense (3-month rolling average)
- rolling_6m_avg_expense (6-month rolling average)
- monthly_income (Total income recorded in that month)
- savings_rate (Net savings / Total income percentage)
- transaction_count (Number of expense transactions in that month)
- Category breakdown features (Food, Shopping, Transport, Entertainment, Bills, Other)

Target variable:
- next_month_expense (Total expense at t+1)
"""

import logging
from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional
import pandas as pd
import numpy as np

logger = logging.getLogger("finnova.ml.features")

# Key categories to track individually as features
TRACKED_CATEGORIES = ["Food", "Shopping", "Transport", "Entertainment", "Bills"]


def prepare_monthly_dataframe(transactions: List[Dict[str, Any]]) -> pd.DataFrame:
    """
    Convert raw user transactions list into a aggregated monthly DataFrame.
    
    Each row represents a calendar month (YYYY-MM).
    Calculates monthly total expenses, total income, transaction count, 
    and breakdown per category.
    """
    if not transactions:
        return pd.DataFrame()

    records = []
    for tx in transactions:
        try:
            # Parse date safely
            dt = tx.get("date")
            if isinstance(dt, str):
                dt = datetime.fromisoformat(dt.replace("Z", "+00:00"))
            elif not isinstance(dt, datetime):
                continue
            
            month_key = dt.strftime("%Y-%m")
            tx_type = str(tx.get("type", "")).strip().capitalize()
            category = str(tx.get("category", "Other")).strip().capitalize()
            amount = float(tx.get("amount", 0.0))

            records.append({
                "month": month_key,
                "type": tx_type,
                "category": category,
                "amount": amount
            })
        except Exception as e:
            logger.warning(f"Skipping invalid transaction in feature engineering: {e}")
            continue

    if not records:
        return pd.DataFrame()

    df_raw = pd.DataFrame(records)
    
    # Extract unique months in chronological order
    unique_months = sorted(df_raw["month"].unique())
    if not unique_months:
        return pd.DataFrame()

    # Fill continuous month range to ensure missing months are accounted for
    start_m = pd.Period(unique_months[0], freq='M')
    end_m = pd.Period(unique_months[-1], freq='M')
    full_month_range = [str(p) for p in pd.period_range(start_m, end_m, freq='M')]

    monthly_rows = []
    for m in full_month_range:
        m_txs = df_raw[df_raw["month"] == m]
        
        income_txs = m_txs[m_txs["type"] == "Income"]
        expense_txs = m_txs[m_txs["type"] == "Expense"]
        
        total_income = float(income_txs["amount"].sum()) if not income_txs.empty else 0.0
        total_expense = float(expense_txs["amount"].sum()) if not expense_txs.empty else 0.0
        tx_count = int(len(expense_txs))
        
        savings = max(0.0, total_income - total_expense)
        savings_rate = (savings / total_income * 100.0) if total_income > 0 else 0.0

        # Category level expenses
        cat_expenses = {}
        for cat in TRACKED_CATEGORIES:
            cat_sum = float(expense_txs[expense_txs["category"] == cat]["amount"].sum()) if not expense_txs.empty else 0.0
            cat_expenses[f"cat_{cat.lower()}"] = cat_sum
            
        row = {
            "month": m,
            "total_income": round(total_income, 2),
            "total_expense": round(total_expense, 2),
            "transaction_count": tx_count,
            "savings_rate": round(savings_rate, 2),
            **cat_expenses
        }
        monthly_rows.append(row)

    return pd.DataFrame(monthly_rows)


def build_feature_matrix(
    df_monthly: pd.DataFrame
) -> Tuple[pd.DataFrame, pd.Series, Optional[pd.DataFrame]]:
    """
    Construct time-series feature matrix X and target y.
    
    Target y[t] = total_expense[t+1] (Next month's expense)
    Features X[t] include:
      - previous_month_expense (total_expense at t)
      - rolling_3m_avg_expense (Mean total_expense over t-2..t)
      - rolling_6m_avg_expense (Mean total_expense over t-5..t)
      - monthly_income (at t)
      - savings_rate (at t)
      - transaction_count (at t)
      - cat_food, cat_shopping, cat_transport, cat_entertainment, cat_bills (at t)

    Returns:
        X (DataFrame): Feature matrix for historical training (length N-1)
        y (Series): Target values for historical training (length N-1)
        latest_feature_vector (DataFrame): 1-row DataFrame representing current month 
                                           used to forecast NEXT month.
    """
    if df_monthly.empty or len(df_monthly) < 1:
        return pd.DataFrame(), pd.Series(dtype=float), None

    df = df_monthly.copy()

    # 1. Feature: Lagged previous month expense (t-1 from target perspective)
    df["previous_month_expense"] = df["total_expense"]

    # 2. Features: Rolling 3-month and 6-month averages
    # min_periods=1 ensures we get rolling values even with 1 or 2 months of history
    df["rolling_3m_avg_expense"] = (
        df["total_expense"].rolling(window=3, min_periods=1).mean().round(2)
    )
    df["rolling_6m_avg_expense"] = (
        df["total_expense"].rolling(window=6, min_periods=1).mean().round(2)
    )

    # 3. Target: Shift total_expense backwards by 1 step (next_month_expense)
    df["next_month_expense"] = df["total_expense"].shift(-1)

    feature_cols = [
        "previous_month_expense",
        "rolling_3m_avg_expense",
        "rolling_6m_avg_expense",
        "total_income",
        "savings_rate",
        "transaction_count",
    ] + [f"cat_{cat.lower()}" for cat in TRACKED_CATEGORIES]

    # Latest feature vector (current month 't') used to predict upcoming month ('t+1')
    latest_feature_vector = df.iloc[[-1]][feature_cols].copy()

    # Training pairs (where target next_month_expense is known)
    train_df = df.dropna(subset=["next_month_expense"]).copy()

    if train_df.empty:
        return pd.DataFrame(), pd.Series(dtype=float), latest_feature_vector

    X = train_df[feature_cols]
    y = train_df["next_month_expense"]

    return X, y, latest_feature_vector
