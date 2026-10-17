"""
Transaction Expense Classifier - Inference Module
--------------------------------------------------
Loads trained TF-IDF + Logistic Regression pipeline artifact and performs 
category prediction and confidence probability estimation for transaction descriptions.
"""

import os
import logging
from typing import Dict, Any, Optional
import joblib

import sys

# Ensure backend directory is on sys.path for direct script execution
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

logger = logging.getLogger("finnova.ai_engine.classification.predict")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "merchant_classifier.joblib")


class MerchantCategorizer:
    """
    Inference Engine for transaction description classification.
    """

    def __init__(self, model_path: str = MODEL_PATH):
        self.model_path = model_path
        self.pipeline = self._load_model()

    def _load_model(self):
        if not os.path.exists(self.model_path):
            logger.warning(f"Model artifact not found at {self.model_path}. Running training script first...")
            from app.ai_engine.classification.train import load_dataset, train_and_save_model
            df_data = load_dataset()
            return train_and_save_model(df_data, self.model_path)

        try:
            pipeline = joblib.load(self.model_path)
            logger.info("Successfully loaded trained classification pipeline artifact.")
            return pipeline
        except Exception as e:
            logger.error(f"Failed to load model artifact: {e}")
            raise e

    def predict(self, description: str) -> Dict[str, Any]:
        """
        Predict category and confidence score for a transaction description.

        Args:
            description (str): Raw merchant transaction string (e.g., "ZOMATO ORDER 438")

        Returns:
            Dict containing:
                - description: input transaction string
                - predicted_category: predicted category label
                - confidence: highest probability float (0.0 to 1.0)
                - all_probabilities: map of all categories to probabilities
        """
        if not description or not str(description).strip():
            return {
                "description": description,
                "predicted_category": "Other",
                "confidence": 0.0,
                "all_probabilities": {}
            }

        clean_desc = str(description).strip()
        
        # Predict class & probabilities
        probs = self.pipeline.predict_proba([clean_desc])[0]
        classes = self.pipeline.classes_

        # Map classes to probabilities
        prob_dict = {
            cls: float(round(prob, 4))
            for cls, prob in zip(classes, probs)
        }

        # Select highest probability category
        best_class = max(prob_dict, key=prob_dict.get)
        confidence = prob_dict[best_class]

        return {
            "description": clean_desc,
            "predicted_category": best_class,
            "confidence": confidence,
            "all_probabilities": prob_dict
        }


# Singleton instance for quick import and execution
_categorizer_instance: Optional[MerchantCategorizer] = None


def predict_category(description: str) -> Dict[str, Any]:
    """
    Convenience function for inference.
    """
    global _categorizer_instance
    if _categorizer_instance is None:
        _categorizer_instance = MerchantCategorizer()
    return _categorizer_instance.predict(description)


if __name__ == "__main__":
    # Quick inline check
    sample = "ZOMATO ORDER 438"
    result = predict_category(sample)
    print(f"Sample Input: '{sample}' -> Category: {result['predicted_category']} (Confidence: {result['confidence']*100:.2f}%)")
