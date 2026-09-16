"""
Model Evaluation Module for FinNova Expense Forecasting
--------------------------------------------------------
Provides time-aware evaluation of regression models on financial time-series data.

Key Functions:
- time_series_split: Splits historical data sequentially (older -> training, newer -> testing).
- evaluate_regression_model: Computes MAE, RMSE, and R^2 metrics.
- evaluate_all_models: Compares candidate models and selects the top performer.
"""

import logging
from typing import Dict, Any, Tuple, Optional
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

logger = logging.getLogger("finnova.ml.evaluation")


def time_series_split(
    X: pd.DataFrame, 
    y: pd.Series, 
    test_size: float = 0.25
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
    """
    Perform a sequential, time-aware train/test split.
    
    Do NOT shuffle, because order matters in time-series forecasting.
    Older data points go to training set, newest points go to testing set.
    """
    n_samples = len(X)
    if n_samples < 2:
        return X, X, y, y

    n_test = max(1, int(n_samples * test_size))
    # If sample size is very small (e.g. 3-4 months), keep at least 2 for training
    if n_samples - n_test < 2 and n_samples >= 3:
        n_test = 1

    split_idx = n_samples - n_test

    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

    return X_train, X_test, y_train, y_test


def evaluate_model_predictions(
    y_true: np.ndarray, 
    y_pred: np.ndarray
) -> Dict[str, float]:
    """
    Compute standard regression evaluation metrics:
    - MAE (Mean Absolute Error)
    - RMSE (Root Mean Squared Error)
    - R2 (Coefficient of Determination)
    """
    y_true = np.array(y_true, dtype=float)
    y_pred = np.array(y_pred, dtype=float)

    if len(y_true) == 0:
        return {"mae": 0.0, "rmse": 0.0, "r2": 0.0}

    mae = float(mean_absolute_error(y_true, y_pred))
    
    # Calculate RMSE compatible across sklearn versions
    mse = mean_squared_error(y_true, y_pred)
    rmse = float(np.sqrt(mse))

    # R2 requires at least 2 distinct true values to be meaningful
    if len(y_true) >= 2 and np.var(y_true) > 1e-6:
        r2 = float(r2_score(y_true, y_pred))
        # Clip R2 between -1.0 and 1.0 to avoid extreme negative metrics on tiny datasets
        r2 = float(np.clip(r2, -1.0, 1.0))
    else:
        r2 = 0.0

    return {
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "r2": round(r2, 2)
    }


def compare_and_select_best_model(
    models: Dict[str, Any],
    X: pd.DataFrame,
    y: pd.Series
) -> Tuple[str, Any, Dict[str, float]]:
    """
    Train and evaluate multiple models on time-aware split data.
    Selects the best model based on lowest MAE on the test set.

    Args:
        models: Dictionary mapping model_name -> instantiated sklearn model.
        X: Feature matrix
        y: Target values

    Returns:
        best_name (str): Name of the best model (e.g., 'Gradient Boosting Regressor')
        best_model (object): Trained scikit-learn model object
        best_metrics (dict): MAE, RMSE, R2 metrics for the chosen model
    """
    n_samples = len(X)
    
    # If sample size is small (< 4), evaluate on whole set or use default
    if n_samples < 4:
        X_train, X_test, y_train, y_test = X, X, y, y
    else:
        X_train, X_test, y_train, y_test = time_series_split(X, y, test_size=0.25)

    best_name = None
    best_model = None
    best_metrics = {"mae": float("inf"), "rmse": float("inf"), "r2": 0.0}

    for name, model_instance in models.items():
        try:
            # Fit model on training partition
            model_instance.fit(X_train, y_train)

            # Predict on test partition
            preds = model_instance.predict(X_test)
            # Ensure non-negative expense predictions
            preds = np.maximum(0.0, preds)

            metrics = evaluate_model_predictions(y_test.values, preds)
            logger.info(f"Model '{name}' Evaluation: MAE={metrics['mae']}, RMSE={metrics['rmse']}, R2={metrics['r2']}")

            # Selection criteria: Lowest MAE
            if metrics["mae"] < best_metrics["mae"]:
                best_metrics = metrics
                best_name = name
                best_model = model_instance

        except Exception as e:
            logger.warning(f"Evaluation failed for model '{name}': {e}")
            continue

    # Fallback if all failed
    if best_model is None and models:
        first_name = list(models.keys())[0]
        best_name = first_name
        best_model = models[first_name]
        best_model.fit(X, y)
        best_metrics = {"mae": 0.0, "rmse": 0.0, "r2": 0.0}
    else:
        # Re-fit the winning model on all historical data for optimal final prediction
        best_model.fit(X, y)

    return best_name, best_model, best_metrics
