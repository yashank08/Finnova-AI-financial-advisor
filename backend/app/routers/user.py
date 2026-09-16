from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from app.models.user import UserResponse
from app.dependencies.auth import get_current_user
from app.core.database import get_db
from bson import ObjectId

router = APIRouter(prefix="/api/users", tags=["Users"])


class ProfileUpdateRequest(BaseModel):
    fullName: Optional[str] = Field(None, min_length=2, max_length=100)
    username: Optional[str] = Field(None, min_length=2, max_length=100)
    nationality: Optional[str] = Field(None, min_length=2)
    preferredCurrency: Optional[str] = Field(None, min_length=3, max_length=10)


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("_id", current_user.get("id")))
    u_name = current_user.get("username") or current_user.get("fullName") or current_user.get("email", "").split('@')[0]
    f_name = current_user.get("fullName") or current_user.get("username") or u_name
    return UserResponse(
        id=user_id,
        fullName=f_name,
        username=u_name,
        email=current_user["email"],
        nationality=current_user.get("nationality", "Indian"),
        preferredCurrency=current_user.get("preferredCurrency", "INR"),
        createdAt=current_user.get("createdAt", datetime.now(timezone.utc)),
        updatedAt=current_user.get("updatedAt", datetime.now(timezone.utc))
    )


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    data: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile: name, username, nationality, and/or preferred currency."""
    updates = {k: v for k, v in data.model_dump().items() if v is not None}

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided to update."
        )

    # Sync username and fullName if either updated
    if "username" in updates and "fullName" not in updates:
        updates["fullName"] = updates["username"]
    elif "fullName" in updates and "username" not in updates:
        updates["username"] = updates["fullName"]

    updates["updatedAt"] = datetime.now(timezone.utc)
    db_obj = get_db()
    user_id = str(current_user.get("_id", current_user.get("id")))

    if db_obj.is_connected and db_obj.db is not None:
        try:
            updated_user = await db_obj.db.users.find_one_and_update(
                {"_id": ObjectId(user_id)},
                {"$set": updates},
                return_document=True
            )
        except Exception:
            updated_user = await db_obj.db.users.find_one_and_update(
                {"_id": user_id},
                {"$set": updates},
                return_document=True
            )
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found.")
    else:
        if user_id not in db_obj.in_memory_users:
            raise HTTPException(status_code=404, detail="User not found.")
        db_obj.in_memory_users[user_id].update(updates)
        updated_user = db_obj.in_memory_users[user_id]

    u_name = updated_user.get("username") or updated_user.get("fullName") or updated_user.get("email", "").split('@')[0]
    f_name = updated_user.get("fullName") or updated_user.get("username") or u_name

    return UserResponse(
        id=user_id,
        fullName=f_name,
        username=u_name,
        email=updated_user["email"],
        nationality=updated_user.get("nationality", "Indian"),
        preferredCurrency=updated_user.get("preferredCurrency", "INR"),
        createdAt=updated_user.get("createdAt", datetime.now(timezone.utc)),
        updatedAt=updated_user.get("updatedAt", datetime.now(timezone.utc))
    )
