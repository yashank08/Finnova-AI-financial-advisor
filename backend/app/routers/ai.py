"""
AI Router
---------
GET /api/ai/summary
GET /api/ai/predict
GET /api/ai/recommendations
"""

from fastapi import APIRouter, Depends
from app.dependencies.auth import get_current_user
from app.schemas.ai import (
    AISummaryResponse,
    AIPredictResponse,
    AIRecommendationsResponse,
)
from app.services.ai_service import (
    get_ai_summary,
    get_ai_prediction,
    get_ai_recommendations,
)

router = APIRouter(prefix="/api/ai", tags=["AI Insights"])


@router.get("/summary", response_model=AISummaryResponse)
async def ai_summary(current_user: dict = Depends(get_current_user)):
    """
    AI-powered spending summary.
    - Total income, expenses, savings
    - Savings rate
    - Top spending category
    - Category breakdown with percentages
    - Human-readable AI summary text
    """
    user_id = str(current_user.get("_id", current_user.get("id")))
    return await get_ai_summary(user_id)


@router.get("/predict", response_model=AIPredictResponse)
async def ai_predict(current_user: dict = Depends(get_current_user)):
    """
    Predict next month's expenses using scikit-learn LinearRegression.
    - Trained on user's historical monthly expense totals
    - Includes trend (increasing/decreasing/stable)
    - Persists prediction to MongoDB
    """
    user_id = str(current_user.get("_id", current_user.get("id")))
    return await get_ai_prediction(user_id)


from pydantic import BaseModel, Field
from typing import List, Optional
from app.services.chat_service import get_gemini_reply


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    conversationHistory: Optional[List[ChatMessage]] = []


class ChatResponse(BaseModel):
    reply: str


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    req: ChatRequest,
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    Conversational AI Chatbot endpoint powered by Gemini & grounded in live ML forecast data.
    """
    history_dicts = (
        [{"role": m.role, "content": m.content} for m in req.conversationHistory]
        if req.conversationHistory
        else []
    )
    
    forecast_ctx = None
    if current_user:
        user_id = str(current_user.get("_id", current_user.get("id")))
        try:
            forecast_ctx = await get_ai_prediction(user_id)
        except Exception:
            forecast_ctx = None

    reply = await get_gemini_reply(
        message=req.message, 
        conversation_history=history_dicts,
        user_id=str(current_user.get("id")) if current_user else None,
        forecast_context=forecast_ctx
    )
    return ChatResponse(reply=reply)

