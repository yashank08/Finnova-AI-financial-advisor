"""
FinNova Multi-Model ML Expense Predictor
------------------------------------------
Orchestrates end-to-end expense forecasting:
1. Preprocesses user transaction history into time-series features.
2. Compares multiple regression models (Linear Regression, Random Forest, Gradient Boosting).
3. Evaluates models using time-aware train/test split.
4. Selects the best performing model based on minimum MAE.
5. Handles cold-start accounts (< 3 months data) with moving-average fallback.
6. Returns predictions alongside accuracy metrics and financial insights.
"""

import logging
from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor

from app.ml.feature_engineering import prepare_monthly_dataframe, build_feature_matrix
from app.ml.model_evaluation import compare_and_select_best_model

logger = logging.getLogger("finnova.ml.predictor")


class MultiModelExpensePredictor:
    """
    End-to-end ML expense predictor comparing Linear Regression, 
    Random Forest, and Gradient Boosting models.
    """

    MIN_MONTHS_FOR_ML = 3  # Minimum historical months needed to run ML pipeline

    def __init__(self):
        self.models = {
            "Linear Regression (Baseline)": LinearRegression(),
            "Random Forest Regressor": RandomForestRegressor(n_estimators=50, random_state=42, max_depth=3),
            "Gradient Boosting Regressor": GradientBoostingRegressor(n_estimators=50, random_state=42, max_depth=2, learning_rate=0.1)
        }

    def forecast_next_month(self, transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Execute full forecasting pipeline for a user's transaction history.
        """
        if not transactions:
            return self._build_empty_response()

        # Step 1: Data Cleaning & Monthly Aggregation
        df_monthly = prepare_monthly_dataframe(transactions)
        n_months = len(df_monthly)

        if df_monthly.empty or n_months == 0:
            return self._build_empty_response()

        historical_avg = float(df_monthly["total_expense"].mean())

        # Step 2 & 9: Cold Start Check (< 3 months data)
        if n_months < self.MIN_MONTHS_FOR_ML:
            return self._build_cold_start_response(df_monthly, n_months, historical_avg)

        # Step 3: Feature Engineering
        X, y, latest_features = build_feature_matrix(df_monthly)

        if X.empty or y.empty or len(y) == 0:
            return self._build_cold_start_response(df_monthly, n_months, historical_avg)

        # Step 5, 6, & 7: Model Evaluation & Best Model Selection
        best_model_name, best_model, metrics = compare_and_select_best_model(
            self.models, X, y
        )

        # Step 8: Predict Next Month's Expense
        try:
            raw_pred = float(best_model.predict(latest_features)[0])
            predicted_expense = max(0.0, round(raw_pred, 2))
        except Exception as e:
            logger.error(f"Prediction failed with selected model {best_model_name}: {e}")
            predicted_expense = round(historical_avg, 2)
            best_model_name = "Rule-based Fallback (Average)"

        # Trend & Percentage Calculations
        last_month_expense = float(df_monthly["total_expense"].iloc[-1])
        change_pct = round(((predicted_expense - last_month_expense) / max(1.0, last_month_expense)) * 100.0, 1)

        if change_pct > 3.0:
            trend = "increasing"
        elif change_pct < -3.0:
            trend = "decreasing"
        else:
            trend = "stable"

        # Expected Savings (Income - Predicted Expense)
        latest_income = float(df_monthly["total_income"].iloc[-1])
        expected_savings = max(0.0, round(latest_income - predicted_expense, 2))

        confidence_note = (
            f"High confidence ML forecast evaluated across {n_months} months. "
            f"Best model '{best_model_name}' achieved MAE of Rs. {metrics['mae']:,.0f}."
        )

        return {
            "predicted_expense": predicted_expense,
            "historical_average": round(historical_avg, 2),
            "trend": trend,
            "model_used": best_model_name,
            "training_months": n_months,
            "mae": metrics["mae"],
            "rmse": metrics["rmse"],
            "r2": metrics["r2"],
            "expected_savings": expected_savings,
            "forecast_change_pct": change_pct,
            "confidence_note": confidence_note
        }

    def _build_cold_start_response(
        self, 
        df_monthly: pd.DataFrame, 
        n_months: int, 
        historical_avg: float
    ) -> Dict[str, Any]:
        """Generate rule-based moving average prediction for cold-start users."""
        latest_expense = float(df_monthly["total_expense"].iloc[-1]) if not df_monthly.empty else 0.0
        predicted = round(latest_expense if latest_expense > 0 else historical_avg, 2)
        
        latest_income = float(df_monthly["total_income"].iloc[-1]) if not df_monthly.empty else 0.0
        expected_savings = max(0.0, round(latest_income - predicted, 2))

        return {
            "predicted_expense": predicted,
            "historical_average": round(historical_avg, 2),
            "trend": "stable",
            "model_used": "3-Month Moving Average (Cold Start)",
            "training_months": n_months,
            "mae": None,
            "rmse": None,
            "r2": None,
            "expected_savings": expected_savings,
            "forecast_change_pct": 0.0,
            "confidence_note": (
                f"Rule-based estimate based on {n_months} month(s) of activity. "
                f"ML model evaluation will automatically activate at {self.MIN_MONTHS_FOR_ML} months of history."
            )
        }

    def _build_empty_response(self) -> Dict[str, Any]:
        """Return fallback when no transaction records exist."""
        return {
            "predicted_expense": 0.0,
            "historical_average": 0.0,
            "trend": "stable",
            "model_used": "No Data Fallback",
            "training_months": 0,
            "mae": None,
            "rmse": None,
            "r2": None,
            "expected_savings": 0.0,
            "forecast_change_pct": 0.0,
            "confidence_note": "No transaction records found. Log transactions to activate ML expense forecasting."
        }


# Maintain backward compatibility with LinearRegressionPredictor alias
LinearRegressionPredictor = MultiModelExpensePredictor
