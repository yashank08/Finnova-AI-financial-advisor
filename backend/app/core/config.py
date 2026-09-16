import os
from pathlib import Path
from pydantic_settings import BaseSettings

# Always resolve .env relative to the backend root (two levels up from this file)
_ENV_FILE = Path(__file__).resolve().parent.parent.parent / ".env"

class Settings(BaseSettings):
    PROJECT_NAME: str = "FinNova"
    SECRET_KEY: str = "finnova_super_secret_jwt_key_2026_finance_advisor_app!"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "finnova_db"
    GEMINI_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""

    class Config:
        env_file = str(_ENV_FILE)
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
