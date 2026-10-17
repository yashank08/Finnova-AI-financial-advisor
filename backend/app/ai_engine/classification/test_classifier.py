"""
Transaction Expense Classifier - Simple Test Script
----------------------------------------------------
Runs classification inference on sample test transactions specified in requirements:
- "ZOMATO ORDER"
- "UBER TRIP"
- "NETFLIX"
- "AMAZON"
- "ELECTRICITY BILL"
- "APOLLO PHARMACY"
"""

import sys
import os

# Ensure backend directory is on sys.path for direct script execution
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

from app.ai_engine.classification.predict import predict_category


def run_tests():
    # Required test strings from prompt
    test_cases = [
        "ZOMATO ORDER",
        "UBER TRIP",
        "NETFLIX",
        "AMAZON",
        "ELECTRICITY BILL",
        "APOLLO PHARMACY",
        # Additional validation samples
        "SWIGGY FOOD DELIVERY",
        "PETROL PUMP HPCL",
        "SPOTIFY MUSIC SUB",
        "JIO BROADBAND RECHARGE"
    ]

    print("\n" + "=" * 75)
    print("      FINNOVA MERCHANT CLASSIFIER - INFERENCE TEST RESULTS")
    print("=" * 75)
    print(f"{'Input Transaction Description':<32} | {'Predicted Category':<15} | {'Confidence':<10}")
    print("-" * 75)

    for query in test_cases:
        res = predict_category(query)
        desc = res["description"]
        cat = res["predicted_category"]
        conf = res["confidence"] * 100.0
        print(f"{desc:<32} | {cat:<15} | {conf:6.2f}%")

    print("=" * 75 + "\n")


if __name__ == "__main__":
    run_tests()
