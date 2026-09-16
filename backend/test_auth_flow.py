import asyncio
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_auth_flow():
    print("\n--- Testing FinNova Auth APIs ---")
    
    # 1. Register User
    user_payload = {
        "fullName": "Aarav Sharma",
        "email": "aarav.sharma@example.com",
        "password": "FinPassword123!",
        "confirmPassword": "FinPassword123!",
        "nationality": "Indian",
        "acceptTerms": True
    }
    
    reg_resp = client.post("/api/auth/register", json=user_payload)
    print(f"Register Status Code: {reg_resp.status_code}")
    print(f"Register Response: {reg_resp.json()}")
    assert reg_resp.status_code == 201
    reg_data = reg_resp.json()
    assert reg_data["email"] == "aarav.sharma@example.com"
    assert reg_data["preferredCurrency"] == "INR"
    assert reg_data["nationality"] == "Indian"

    # 2. Duplicate Registration Rejection
    dup_resp = client.post("/api/auth/register", json=user_payload)
    print(f"Duplicate Email Status Code: {dup_resp.status_code}")
    assert dup_resp.status_code == 400

    # 3. Login
    login_payload = {
        "email": "aarav.sharma@example.com",
        "password": "FinPassword123!",
        "rememberMe": True
    }
    login_resp = client.post("/api/auth/login", json=login_payload)
    print(f"Login Status Code: {login_resp.status_code}")
    print(f"Login Token: {login_resp.json().get('access_token')[:25]}...")
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]

    # 4. Protected Route Request (/api/users/me)
    headers = {"Authorization": f"Bearer {token}"}
    me_resp = client.get("/api/users/me", headers=headers)
    print(f"Protected Route Status Code: {me_resp.status_code}")
    print(f"Protected Route Response: {me_resp.json()}")
    assert me_resp.status_code == 200
    assert me_resp.json()["fullName"] == "Aarav Sharma"

    # 5. Forgot Password Request
    forgot_resp = client.post("/api/auth/forgot-password", json={"email": "aarav.sharma@example.com"})
    print(f"Forgot Password Response: {forgot_resp.json()}")
    assert forgot_resp.status_code == 200
    reset_token = forgot_resp.json().get("reset_token")

    # 6. Reset Password Execution
    reset_payload = {
        "token": reset_token,
        "newPassword": "NewStrongPass2026!",
        "confirmPassword": "NewStrongPass2026!"
    }
    reset_resp = client.post("/api/auth/reset-password", json=reset_payload)
    print(f"Reset Password Status Code: {reset_resp.status_code}")
    assert reset_resp.status_code == 200

    print("--- ALL FINNOVA AUTH TESTS PASSED PERFECTLY! ---")

if __name__ == "__main__":
    test_full_auth_flow()
