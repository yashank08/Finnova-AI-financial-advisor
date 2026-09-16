from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class LatestTransaction(BaseModel):
    id: str
    type: str
    category: str
    amount: float
    description: str
    date: str


class CategoryBreakdown(BaseModel):
    category: str
    amount: float
    percentage: float


class MonthlyDataPoint(BaseModel):
    month: str       # e.g. "Jul 2026"
    income: float
    expenses: float
    savings: float


class DashboardResponse(BaseModel):
    totalIncome: float
    totalExpenses: float
    totalSavings: float
    monthlyBudget: float
    remainingBudget: float
    budgetUsedPercent: float
    latestTransactions: List[LatestTransaction]
    expenseCategories: List[CategoryBreakdown]
    monthlyAnalytics: List[MonthlyDataPoint]
