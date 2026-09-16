from typing import List, Optional
from pydantic import BaseModel


class SpendingCategoryItem(BaseModel):
    category: str
    amount: float
    percentage: float


class AISummaryResponse(BaseModel):
    totalIncome: float
    totalExpenses: float
    totalSavings: float
    savingsRate: float           # percentage
    topSpendingCategory: str
    topSpendingAmount: float
    expenseCategories: List[SpendingCategoryItem]
    summaryText: str             # Human-readable AI-generated summary


class AIPredictResponse(BaseModel):
    predictionMonth: str         # e.g. "2026-08"
    predictionMonthLabel: str    # e.g. "August 2026"
    predictedExpense: float
    confidenceNote: str
    historicalAverage: float
    trend: str                   # "increasing" | "decreasing" | "stable"
    modelUsed: Optional[str] = "Linear Regression"
    trainingMonths: Optional[int] = 0
    mae: Optional[float] = None
    rmse: Optional[float] = None
    r2: Optional[float] = None
    expectedSavings: Optional[float] = 0.0
    forecastChangePct: Optional[float] = 0.0
    createdAt: str


class RecommendationItem(BaseModel):
    title: str
    description: str
    priority: str                # "high" | "medium" | "low"
    category: str


class AIRecommendationsResponse(BaseModel):
    recommendations: List[RecommendationItem]
    generatedAt: str
    basedOnMonths: int
