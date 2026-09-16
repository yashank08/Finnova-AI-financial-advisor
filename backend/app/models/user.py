from datetime import datetime, timezone
import re
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator

class UserRegisterRequest(BaseModel):
    fullName: str = Field(..., min_length=2, max_length=100, description="Full Name of user")
    username: Optional[str] = Field(None, description="Username")
    email: EmailStr = Field(..., description="Valid Email Address")
    password: str = Field(..., min_length=6, description="Password min 6 characters")
    confirmPassword: Optional[str] = Field(None, description="Password confirmation")
    nationality: Optional[str] = Field("Indian", description="Nationality of user")
    acceptTerms: Optional[bool] = Field(True, description="Terms and conditions acceptance")


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str
    rememberMe: Optional[bool] = False


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    newPassword: str = Field(..., min_length=8)
    confirmPassword: str

    @field_validator("confirmPassword")
    @classmethod
    def reset_passwords_match(cls, v, info):
        if "newPassword" in info.data and v != info.data["newPassword"]:
            raise ValueError("New password and confirm password do not match.")
        return v

    @field_validator("newPassword")
    @classmethod
    def validate_reset_password_complexity(cls, v):
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter.")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number.")
        if not re.search(r"[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]", v):
            raise ValueError("Password must contain at least one special character.")
        return v


class UserPreferences(BaseModel):
    preferredCurrency: str = "INR"
    currencySymbol: str = "₹"
    currencyName: str = "Indian Rupee"


class UserResponse(BaseModel):
    id: str
    fullName: str
    username: Optional[str] = None
    email: str
    nationality: str
    preferredCurrency: str = "INR"
    createdAt: datetime
    updatedAt: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
