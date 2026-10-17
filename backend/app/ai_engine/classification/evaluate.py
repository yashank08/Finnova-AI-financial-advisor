"""
Transaction Expense Classifier - Evaluation Module
---------------------------------------------------
Evaluates the TF-IDF + Logistic Regression classification pipeline on hold-out test data.
Reports:
- Accuracy Score
- Precision (Macro & Weighted)
- Recall (Macro & Weighted)
- Macro F1-Score
- Classification Report (per-class Precision, Recall, F1)
- Confusion Matrix Table
"""

import os
import logging
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)

import sys

# Ensure backend directory is on sys.path for direct script execution
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

from app.ai_engine.classification.train import load_dataset

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("finnova.ai_engine.classification.evaluate")


def evaluate_classifier(test_size: float = 0.25, random_state: int = 42):
    """
    Perform full evaluation pipeline on hold-out dataset split.
    """
    df = load_dataset()
    X = df["description"]
    y = df["category"]

    # Stratified train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )

    # Build Pipeline
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            ngram_range=(1, 2),
            lowercase=True,
            sublinear_tf=True,
            min_df=1
        )),
        ('clf', LogisticRegression(
            C=5.0,
            max_iter=1000,
            random_state=random_state,
            solver='lbfgs'
        ))
    ])

    # Fit on training set
    pipeline.fit(X_train, y_train)

    # Predict on hold-out test set
    y_pred = pipeline.predict(X_test)

    # Calculate metrics
    acc = accuracy_score(y_test, y_pred)
    prec_macro = precision_score(y_test, y_pred, average='macro', zero_division=0)
    prec_weighted = precision_score(y_test, y_pred, average='weighted', zero_division=0)
    rec_macro = recall_score(y_test, y_pred, average='macro', zero_division=0)
    rec_weighted = recall_score(y_test, y_pred, average='weighted', zero_division=0)
    f1_macro = f1_score(y_test, y_pred, average='macro', zero_division=0)
    f1_weighted = f1_score(y_test, y_pred, average='weighted', zero_division=0)

    # Classification report & confusion matrix
    cls_report = classification_report(y_test, y_pred, zero_division=0)
    labels = sorted(list(y.unique()))
    cm = confusion_matrix(y_test, y_pred, labels=labels)

    # Print summary output
    print("\n" + "=" * 65)
    print("      FINNOVA MERCHANT CLASSIFIER - MODEL EVALUATION REPORT")
    print("=" * 65)
    print(f"Total Dataset Size : {len(df)} samples")
    print(f"Training Samples   : {len(X_train)} samples")
    print(f"Testing Samples    : {len(X_test)} samples ({test_size*100:.0f}% hold-out)")
    print(f"Target Categories  : {len(labels)} categories {labels}")
    print("-" * 65)
    print(f"Accuracy Score     : {acc * 100:.2f}% ({acc:.4f})")
    print(f"Macro Precision    : {prec_macro * 100:.2f}% ({prec_macro:.4f})")
    print(f"Macro Recall       : {rec_macro * 100:.2f}% ({rec_macro:.4f})")
    print(f"Macro F1-Score     : {f1_macro * 100:.2f}% ({f1_macro:.4f})")
    print(f"Weighted F1-Score  : {f1_weighted * 100:.2f}% ({f1_weighted:.4f})")
    print("=" * 65)
    print("\n--- Detailed Per-Category Classification Report ---\n")
    print(cls_report)
    print("-" * 65)
    print("\n--- Confusion Matrix ---\n")
    cm_df = pd.DataFrame(cm, index=[f"True:{l}" for l in labels], columns=[f"Pred:{l}" for l in labels])
    print(cm_df.to_string())
    print("\n" + "=" * 65 + "\n")

    return {
        "accuracy": acc,
        "precision_macro": prec_macro,
        "recall_macro": rec_macro,
        "f1_macro": f1_macro,
        "confusion_matrix": cm,
        "labels": labels
    }


if __name__ == "__main__":
    evaluate_classifier()
