"""
Transaction Expense Classifier - Training Pipeline
---------------------------------------------------
Trains a traditional NLP + Machine Learning model using:
- TF-IDF (Term Frequency - Inverse Document Frequency) for text vectorization.
- Logistic Regression for multi-class merchant expense classification.

Saves the trained pipeline artifact to `model/merchant_classifier.joblib`.
"""

import os
import logging
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score, f1_score

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("finnova.ai_engine.classification.train")

# Base directory paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "dataset", "merchant_data_dev.csv")
MODEL_DIR = os.path.join(BASE_DIR, "model")
MODEL_PATH = os.path.join(MODEL_DIR, "merchant_classifier.joblib")


def load_dataset(file_path: str = DATASET_PATH) -> pd.DataFrame:
    """Load and validate labeled transaction dataset."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Training dataset not found at: {file_path}")

    # Read CSV ignoring comment lines starting with #
    df = pd.read_csv(file_path, comment='#')
    
    required_cols = {"description", "category"}
    if not required_cols.issubset(df.columns):
        raise ValueError(f"Dataset missing required columns: {required_cols - set(df.columns)}")

    # Clean whitespace and missing values
    df["description"] = df["description"].astype(str).str.strip()
    df["category"] = df["category"].astype(str).str.strip()
    df = df.dropna(subset=["description", "category"])
    df = df[df["description"] != ""]

    logger.info(f"Successfully loaded dataset with {len(df)} transaction records across {df['category'].nunique()} categories.")
    return df


def train_and_save_model(
    df: pd.DataFrame, 
    model_output_path: str = MODEL_PATH,
    test_size: float = 0.20,
    random_state: int = 42
) -> Pipeline:
    """
    Build, train, evaluate, and save TF-IDF + Logistic Regression pipeline.
    """
    X = df["description"]
    y = df["category"]

    # Stratified train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )

    logger.info(f"Train set size: {len(X_train)} samples | Test set size: {len(X_test)} samples")

    # Build Pipeline: TF-IDF Vectorizer + Logistic Regression Classifier
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            ngram_range=(1, 2),        # Unigrams & Bigrams
            lowercase=True,            # Case-insensitive
            sublinear_tf=True,         # Sublinear TF scaling 1 + log(tf)
            min_df=1
        )),
        ('clf', LogisticRegression(
            C=5.0,                     # Higher C for stronger classification boundary on small text samples
            max_iter=1000,             # Solver convergence
            random_state=random_state,
            solver='lbfgs'
        ))
    ])

    # Fit pipeline on training split
    logger.info("Training TF-IDF + Logistic Regression Pipeline...")
    pipeline.fit(X_train, y_train)

    # Evaluate on test split
    y_pred = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    macro_f1 = f1_score(y_test, y_pred, average='macro')

    logger.info(f"Model Evaluation on Test Set -> Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%) | Macro F1: {macro_f1:.4f}")

    # Ensure model directory exists
    os.makedirs(os.path.dirname(model_output_path), exist_ok=True)
    
    # Re-train on full dataset before saving for maximum coverage in inference
    logger.info("Re-fitting pipeline on complete dataset for final model artifact...")
    pipeline.fit(X, y)

    # Save artifact using joblib
    joblib.dump(pipeline, model_output_path)
    logger.info(f"Saved trained pipeline model artifact to: {model_output_path}")

    return pipeline


if __name__ == "__main__":
    df_data = load_dataset()
    train_and_save_model(df_data)
