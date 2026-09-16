from typing import List, Dict, Any
from pydantic import BaseModel, Field


class MonthlyReportItem(BaseModel):
    month: str          # "2026-07"
    label: str          # "Jul 2026"
    income: float
    expenses: float
    savings: float
    transactionCount: int


class CategoryReportItem(BaseModel):
    category: str
    totalAmount: float
    transactionCount: int
    percentage: float


class YearlyReportItem(BaseModel):
    year: int
    totalIncome: float
    totalExpenses: float
    totalSavings: float
    monthlyBreakdown: List[MonthlyReportItem]


class MonthlyReportResponse(BaseModel):
    data: List[MonthlyReportItem]
    # Chart.js ready
    labels: List[str]
    incomeData: List[float]
    expenseData: List[float]
    savingsData: List[float]


class CategoryReportResponse(BaseModel):
    data: List[CategoryReportItem]
    # Chart.js ready
    labels: List[str]
    amounts: List[float]
    percentages: List[float]


class YearlyReportResponse(BaseModel):
    data: List[YearlyReportItem]
    # Chart.js ready
    labels: List[str]
    incomeData: List[float]
    expenseData: List[float]
    savingsData: List[float]


class ReportSummaryMetrics(BaseModel):
    totalIncome: float
    totalExpenses: float
    netSavings: float


class CategoryBreakdownItem(BaseModel):
    id: str = Field(..., alias="_id")
    totalAmount: float

    model_config = {"populate_by_name": True}


class MonthlyTrendItem(BaseModel):
    month: str
    income: float
    expense: float       # singular — matches the service output key


class ReportSummaryResponse(BaseModel):
    summary: ReportSummaryMetrics
    categoryBreakdown: List[CategoryBreakdownItem]
    monthlyTrend: List[MonthlyTrendItem]


