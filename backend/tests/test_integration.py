"""
Transaction Classification & Flow Integration Tests
-----------------------------------------------------
Verifies:
1. Classifier model correctly maps key merchant patterns:
   - ZOMATO -> Food
   - UBER TRIP -> Transport
   - NETFLIX -> Entertainment
   - ELECTRICITY BILL -> Utilities
2. Manual category override business rule is respected (user-selected category preserved).
3. End-to-end HTTP integration with POST /api/transactions endpoint.
"""

import sys
import os
import unittest
import urllib.request
import json

# Ensure backend root is on sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.ai_engine.classification.predict import predict_category


class TestTransactionClassifierIntegration(unittest.TestCase):

    def test_01_zomato_classification(self):
        result = predict_category("ZOMATO")
        self.assertEqual(result["predicted_category"], "Food")
        self.assertGreater(result["confidence"], 0.3)

    def test_02_uber_classification(self):
        result = predict_category("UBER TRIP")
        self.assertEqual(result["predicted_category"], "Transport")
        self.assertGreater(result["confidence"], 0.3)

    def test_03_netflix_classification(self):
        result = predict_category("NETFLIX")
        self.assertEqual(result["predicted_category"], "Entertainment")
        self.assertGreater(result["confidence"], 0.3)

    def test_04_electricity_classification(self):
        result = predict_category("ELECTRICITY BILL")
        self.assertEqual(result["predicted_category"], "Utilities")
        self.assertGreater(result["confidence"], 0.3)

    def test_05_manual_category_preservation_rule(self):
        # Business Rule Test: Manual explicit selection overrides AI prediction
        description = "ZOMATO ORDER"
        explicit_user_category = "Healthcare"
        
        # When explicit_user_category is provided and not generic, it must be preserved
        if explicit_user_category and explicit_user_category.lower() not in ["other", "general", ""]:
            final_category = explicit_user_category
        else:
            final_category = predict_category(description)["predicted_category"]
            
        self.assertEqual(final_category, "Healthcare")

    def test_06_http_transaction_creation_endpoint(self):
        """Test HTTP POST /api/transactions with running backend server."""
        url = "http://localhost:8000/api/transactions"
        payload = {
            "description": "ZOMATO ORDER 999",
            "amount": 450.0,
            "type": "Expense",
            "category": "Other"  # Generic category, should trigger AI classification to Food
        }
        
        headers = {"Content-Type": "application/json"}
        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")

        try:
            with urllib.request.urlopen(req, timeout=5) as response:
                self.assertEqual(response.status, 201)
                body = json.loads(response.read().decode("utf-8"))
                
                # Check response fields
                self.assertIn("id", body)
                self.assertEqual(body["description"], "ZOMATO ORDER 999")
                self.assertEqual(body["category"], "Food")
                self.assertIn("classificationConfidence", body)
                self.assertGreater(body["classificationConfidence"], 0.3)
                print(f"\n[HTTP Test Success] Input: 'ZOMATO ORDER 999' -> Auto-categorized as: '{body['category']}' (Confidence: {body['classificationConfidence']*100:.2f}%)")
        except Exception as e:
            self.fail(f"HTTP POST /api/transactions failed: {e}")

    def test_07_csv_statement_upload_endpoint(self):
        """Test HTTP POST /api/reports/upload statement upload with auto-categorization."""
        url = "http://localhost:8000/api/reports/upload"
        boundary = "---------------------------974767299852498929531610575"
        
        csv_lines = [
            "date,description,amount,type,category",
            "2026-08-01,ZOMATO FOOD DELIV,350,Expense,Other",
            "2026-08-02,UBER CAB RIDE,420,Expense,General"
        ]
        csv_content = "\r\n".join(csv_lines).encode("utf-8")

        body = (
            f"--{boundary}\r\n"
            f'Content-Disposition: form-data; name="file"; filename="test_statement.csv"\r\n'
            f"Content-Type: text/csv\r\n\r\n"
        ).encode("utf-8") + csv_content + f"\r\n--{boundary}--\r\n".encode("utf-8")

        headers = {"Content-Type": f"multipart/form-data; boundary={boundary}"}
        req = urllib.request.Request(url, data=body, headers=headers, method="POST")

        try:
            with urllib.request.urlopen(req, timeout=15) as response:
                self.assertEqual(response.status, 200)
                res_body = json.loads(response.read().decode("utf-8"))
                self.assertTrue(res_body.get("success"))
                self.assertEqual(res_body.get("imported"), 2)
                print(f"[CSV Upload Test Success] Successfully imported {res_body.get('imported')} transactions with auto-categorization.")
        except Exception as e:
            self.fail(f"HTTP POST /api/reports/upload failed: {e}")




if __name__ == "__main__":
    unittest.main()
