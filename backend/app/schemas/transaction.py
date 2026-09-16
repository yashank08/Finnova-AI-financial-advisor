from datetime import datetime, date
from typing import Optional, List, Literal
from pydantic import BaseModel, Field, field_validator


VALID_CATEGORIES = [
    "Income", "Food", "Transport", "Utilities", "Entertainment",
    "Healthcare", "Education", "Investment", "Shopping", "Rent",
    "Insurance", "Travel", "Gifts", "Freelance", "Other"
]

VALID_TYPES = Literal["Income", "Expense"]


class TransactionCreate(BaseModel):
    type: VALID_TYPES = Field(..., description="'Income' or 'Expense'")
    category: str = Field(..., min_length=1, max_length=50)
    amount: float = Field(..., gt=0, description="Must be a positive number")
    description: str = Field(..., min_length=1, max_length=500)
    date: datetime = Field(..., description="Transaction date in ISO format")

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        if v not in VALID_CATEGORIES:
            raise ValueError(f"Category must be one of: {', '.join(VALID_CATEGORIES)}")
        return v


class TransactionUpdate(BaseModel):
    type: Optional[VALID_TYPES] = None
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    amount: Optional[float] = Field(None, gt=0)
    description: Optional[str] = Field(None, min_length=1, max_length=500)
    date: Optional[datetime] = None

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_CATEGORIES:
            raise ValueError(f"Category must be one of: {', '.join(VALID_CATEGORIES)}")
        return v


class TransactionResponse(BaseModel):
    id: str
    userId: str
    type: str
    category: str
    amount: float
    description: str
    date: datetime
    createdAt: datetime

    class Config:
        from_attributes = True


class TransactionListResponse(BaseModel):
    transactions: List[TransactionResponse]
    total: int
    page: int
    limit: int
    totalPages: int
