from typing import Optional
from pydantic import BaseModel, Field


class BudgetCreate(BaseModel):
    monthlyBudget: float = Field(..., gt=0, description="Monthly budget limit in INR")
    month: str = Field(..., pattern=r"^\d{4}-(0[1-9]|1[0-2])$",
                       description="Month in YYYY-MM format, e.g. 2026-07")


class BudgetUpdate(BaseModel):
    monthlyBudget: float = Field(..., gt=0)


class BudgetResponse(BaseModel):
    id: str
    userId: str
    monthlyBudget: float
    spent: float
    remaining: float
    month: str

    class Config:
        from_attributes = True
