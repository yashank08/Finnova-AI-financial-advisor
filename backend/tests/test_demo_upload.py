import urllib.request
import json
import os

def test_demo_csv_upload():
    url = "http://localhost:8000/api/transactions/upload"
    boundary = "---------------------------974767299852498929531610575"
    
    file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "demo_statement.csv"))
    with open(file_path, "rb") as f:
        csv_content = f.read()


    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="demo_statement.csv"\r\n'
        f"Content-Type: text/csv\r\n\r\n"
    ).encode("utf-8") + csv_content + f"\r\n--{boundary}--\r\n".encode("utf-8")

    headers = {"Content-Type": f"multipart/form-data; boundary={boundary}"}
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            res_body = json.loads(response.read().decode("utf-8"))
            print("Demo Upload Result:", json.dumps(res_body, indent=2))
            
            # Fetch latest transactions from server to display assigned categories
            list_url = "http://localhost:8000/api/transactions?limit=10"
            list_req = urllib.request.Request(list_url)
            with urllib.request.urlopen(list_req) as list_res:
                list_body = json.loads(list_res.read().decode("utf-8"))
                txs = list_body.get("transactions", [])
                print("\n--- Imported Transactions in Ledger ---")
                print(f"{'Description':<28} | {'Assigned Category':<15} | {'Confidence':<10}")
                print("-" * 62)
                for tx in txs[:6]:
                    desc = tx.get("description", "")
                    cat = tx.get("category", "")
                    conf = tx.get("classificationConfidence", 0.0) * 100.0
                    print(f"{desc:<28} | {cat:<15} | {conf:6.2f}%")
    except Exception as e:
        print("Upload failed:", e)

if __name__ == "__main__":
    test_demo_csv_upload()
