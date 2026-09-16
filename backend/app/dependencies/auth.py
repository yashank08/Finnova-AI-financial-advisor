from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_access_token
from app.core.database import get_db
from bson import ObjectId

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload["sub"]
    db_obj = get_db()
    
    if db_obj.is_connected and db_obj.db is not None:
        try:
            user = await db_obj.db.users.find_one({"_id": ObjectId(user_id)})
            if not user:
                # Try finding by string id if stored as string
                user = await db_obj.db.users.find_one({"_id": user_id})
        except Exception:
            user = await db_obj.db.users.find_one({"email": payload.get("email")})
        
        if user:
            user["id"] = str(user.get("_id", user_id))
            return user
    
    # Check in-memory store fallback
    if user_id in db_obj.in_memory_users:
        user = db_obj.in_memory_users[user_id]
        return user
    
    # Also fallback check by email
    email = payload.get("email")
    if email:
        for u_id, u in db_obj.in_memory_users.items():
            if u.get("email") == email:
                return u

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="User not found or account deactivated",
        headers={"WWW-Authenticate": "Bearer"},
    )
