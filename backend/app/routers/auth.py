import uuid
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, status
from bson import ObjectId

from app.models.user import (
    UserRegisterRequest,
    UserLoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    UserResponse,
    TokenResponse
)
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from app.core.database import get_db, save_fallback_data

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# In-memory store for password reset tokens
reset_tokens_db = {}

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(req: UserRegisterRequest):
    db_obj = get_db()
    email_clean = req.email.lower().strip()
    
    # 1. Check if email already registered
    if db_obj.is_connected and db_obj.db is not None:
        existing_user = await db_obj.db.users.find_one({"email": email_clean})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address is already registered. Please login or use a different email."
            )
    else:
        # In-memory check
        for u in db_obj.in_memory_users.values():
            if u["email"].lower() == email_clean:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email address is already registered. Please login or use a different email."
                )

    # 2. Hash password using bcrypt
    hashed_pwd = hash_password(req.password)
    now = datetime.now(timezone.utc)

    # 3. Create user document adhering strictly to MongoDB collection schema
    username_val = req.username.strip() if req.username else req.fullName.strip()
    user_doc = {
        "fullName": req.fullName.strip(),
        "username": username_val,
        "email": email_clean,
        "password": hashed_pwd,
        "nationality": req.nationality,
        "preferredCurrency": "INR",
        "createdAt": now,
        "updatedAt": now
    }

    if db_obj.is_connected and db_obj.db is not None:
        result = await db_obj.db.users.insert_one(user_doc)
        user_id = str(result.inserted_id)
    else:
        user_id = str(uuid.uuid4())
        user_doc["id"] = user_id
        user_doc["_id"] = user_id
        db_obj.in_memory_users[user_id] = user_doc
        save_fallback_data()

    return UserResponse(
        id=user_id,
        fullName=user_doc["fullName"],
        username=user_doc["username"],
        email=user_doc["email"],
        nationality=user_doc["nationality"],
        preferredCurrency=user_doc["preferredCurrency"],
        createdAt=user_doc["createdAt"],
        updatedAt=user_doc["updatedAt"]
    )


@router.post("/login", response_model=TokenResponse)
async def login(req: UserLoginRequest):
    db_obj = get_db()
    email_clean = req.email.lower().strip()
    user_record = None

    if db_obj.is_connected and db_obj.db is not None:
        user_record = await db_obj.db.users.find_one({"email": email_clean})
    else:
        for u in db_obj.in_memory_users.values():
            if u["email"].lower() == email_clean:
                user_record = u
                break

    if not user_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify password hash
    if not verify_password(req.password, user_record["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = str(user_record.get("_id", user_record.get("id")))
    username_val = user_record.get("username") or user_record.get("fullName") or user_record["email"].split('@')[0]
    fullName_val = user_record.get("fullName") or user_record.get("username") or username_val

    # Generate JWT Token
    access_token_expires = timedelta(days=30) if req.rememberMe else timedelta(hours=24)
    access_token = create_access_token(
        data={"sub": user_id, "email": user_record["email"], "name": fullName_val, "username": username_val},
        expires_delta=access_token_expires
    )

    user_resp = UserResponse(
        id=user_id,
        fullName=fullName_val,
        username=username_val,
        email=user_record["email"],
        nationality=user_record.get("nationality", "Indian"),
        preferredCurrency=user_record.get("preferredCurrency", "INR"),
        createdAt=user_record.get("createdAt", datetime.now(timezone.utc)),
        updatedAt=user_record.get("updatedAt", datetime.now(timezone.utc))
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_resp
    )


@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    db_obj = get_db()
    email_clean = req.email.lower().strip()
    user_found = False

    if db_obj.is_connected and db_obj.db is not None:
        user_doc = await db_obj.db.users.find_one({"email": email_clean})
        user_found = user_doc is not None
    else:
        for u in db_obj.in_memory_users.values():
            if u["email"].lower() == email_clean:
                user_found = True
                break

    if not user_found:
        # Don't leak registered user emails for security, return friendly response
        return {
            "message": "If an account exists for this email, password reset instructions have been generated.",
            "reset_token": None
        }

    # Generate secure reset token
    reset_token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
    reset_tokens_db[reset_token] = {
        "email": email_clean,
        "expires_at": expires_at
    }

    return {
        "message": "Password reset token generated successfully.",
        "reset_token": reset_token,
        "expires_in_minutes": 15
    }


@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    token_info = reset_tokens_db.get(req.token)
    if not token_info:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token."
        )

    if datetime.now(timezone.utc) > token_info["expires_at"]:
        reset_tokens_db.pop(req.token, None)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset token has expired. Please request a new one."
        )

    email = token_info["email"]
    new_hashed_pwd = hash_password(req.newPassword)
    now = datetime.now(timezone.utc)

    db_obj = get_db()
    if db_obj.is_connected and db_obj.db is not None:
        await db_obj.db.users.update_one(
            {"email": email},
            {"$set": {"password": new_hashed_pwd, "updatedAt": now}}
        )
    else:
        for u in db_obj.in_memory_users.values():
            if u["email"].lower() == email:
                u["password"] = new_hashed_pwd
                u["updatedAt"] = now
                break

    reset_tokens_db.pop(req.token, None)

    return {"message": "Password reset successfully! You can now log in with your new password."}
