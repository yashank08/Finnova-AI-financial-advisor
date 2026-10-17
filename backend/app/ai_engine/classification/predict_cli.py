"""
CLI Bridge for Transaction Classifier
-------------------------------------
Invoked by Node.js / Express backend to run single or batch merchant classification inference.
Accepts single transaction string or JSON array of descriptions via stdin or args.

Usage:
  python predict_cli.py "ZOMATO ORDER 438"
  echo '["ZOMATO", "UBER TRIP"]' | python predict_cli.py
"""

import sys
import os
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "..", ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.ai_engine.classification.predict import predict_category


def main():
    raw_input = ""
    if not sys.stdin.isatty():
        raw_input = sys.stdin.read().strip()
    
    if not raw_input and len(sys.argv) > 1:
        raw_input = " ".join(sys.argv[1:]).strip()

    if not raw_input:
        print(json.dumps([]))
        return

    # Try JSON array parsing for batch categorization
    try:
        data = json.loads(raw_input)
        if isinstance(data, list):
            results = []
            for item in data:
                desc = str(item or "").strip()
                if desc:
                    res = predict_category(desc)
                    results.append({
                        "description": desc,
                        "predicted_category": res["predicted_category"],
                        "confidence": res["confidence"]
                    })
                else:
                    results.append({"description": "", "predicted_category": "Other", "confidence": 0.0})
            print(json.dumps(results))
            return
    except Exception:
        pass

    # Single string fallback
    try:
        res = predict_category(raw_input)
        result = {
            "description": res["description"],
            "predicted_category": res["predicted_category"],
            "confidence": res["confidence"]
        }
    except Exception as e:
        result = {
            "description": raw_input,
            "predicted_category": "Other",
            "confidence": 0.0,
            "error": str(e)
        }

    print(json.dumps(result))


if __name__ == "__main__":
    main()
