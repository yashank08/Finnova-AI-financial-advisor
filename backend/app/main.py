from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection

# Routers
from app.routers import auth, user, transactions, dashboard, reports, ai

# Error handlers
from app.middleware.error_handler import (
    validation_exception_handler,
    http_exception_handler,
    generic_exception_handler,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "## FinNova — Smart Finance. Smarter Future.\n\n"
        "Production-ready REST API powering the FinNova personal finance platform.\n\n"
        "### Features\n"
        "- 🔐 JWT Authentication\n"
        "- 💸 Transaction Management (CRUD + Filters + Pagination)\n"
        "- 📊 Dashboard Analytics\n"
        "- 📈 Financial Reports (Monthly, Category, Yearly) — Chart.js ready\n"
        "- 🤖 AI Insights (Summary, LinearRegression Prediction, Recommendations)\n"
        "- 👤 User Profile Management\n"
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Global Exception Handlers
# ---------------------------------------------------------------------------
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(transactions.router)
app.include_router(dashboard.router)
app.include_router(reports.router)
app.include_router(ai.router)


@app.post("/api/chat")
async def chat_direct_endpoint(req: ai.ChatRequest):
    return await ai.chat_endpoint(req)



# ---------------------------------------------------------------------------
# Health Check
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"])
async def root():
    return {
        "message": "Welcome to FinNova API — Smart Finance. Smarter Future.",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health():
    from app.core.database import get_db
    db_obj = get_db()
    return {
        "status": "healthy",
        "database": "mongodb" if db_obj.is_connected else "in-memory (fallback)",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
