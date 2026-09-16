import logging
import asyncio
import os
import json
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

logger = logging.getLogger("finnova.database")

FALLBACK_FILE = os.path.join(os.path.dirname(__file__), "..", "..", "fallback_data.json")

class Database:
    client: AsyncIOMotorClient = None
    db = None
    is_connected = False
    in_memory_users = {}          # Fallback: Users
    in_memory_transactions = {}   # Fallback: Transactions
    in_memory_budgets = {}        # Fallback: Budgets
    in_memory_predictions = {}    # Fallback: Predictions

db_instance = Database()

def load_fallback_data():
    if os.path.exists(FALLBACK_FILE):
        try:
            with open(FALLBACK_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                db_instance.in_memory_users = data.get("users", {})
                db_instance.in_memory_transactions = data.get("transactions", {})
                db_instance.in_memory_budgets = data.get("budgets", {})
                db_instance.in_memory_predictions = data.get("predictions", {})
                logger.info(f"Loaded fallback data with {len(db_instance.in_memory_users)} users.")
        except Exception as e:
            logger.warning(f"Failed to load fallback data file: {e}")

def save_fallback_data():
    try:
        data = {
            "users": db_instance.in_memory_users,
            "transactions": db_instance.in_memory_transactions,
            "budgets": db_instance.in_memory_budgets,
            "predictions": db_instance.in_memory_predictions
        }
        with open(FALLBACK_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, default=str)
    except Exception as e:
        logger.warning(f"Failed to save fallback data file: {e}")

async def seed_demo_data():
    from app.core.security import hash_password
    demo_users = [
        {
            "id": "demo-user-aarav-1234",
            "_id": "demo-user-aarav-1234",
            "fullName": "Aarav Sharma",
            "email": "aarav.sharma@example.com",
            "password": hash_password("FinPassword123!"),
            "nationality": "Indian",
            "preferredCurrency": "INR",
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "updatedAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "demo-user-main-5678",
            "_id": "demo-user-main-5678",
            "fullName": "Demo User",
            "email": "demo@finnova.com",
            "password": hash_password("Demo1234!"),
            "nationality": "Indian",
            "preferredCurrency": "INR",
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "updatedAt": datetime.now(timezone.utc).isoformat()
        }
    ]

    for u in demo_users:
        if not any(x.get("email") == u["email"] for x in db_instance.in_memory_users.values()):
            db_instance.in_memory_users[u["id"]] = u

    if db_instance.is_connected and db_instance.db is not None:
        try:
            for u in demo_users:
                existing = await db_instance.db.users.find_one({"email": u["email"]})
                if not existing:
                    user_doc = dict(u)
                    user_doc.pop("id", None)
                    user_doc["createdAt"] = datetime.now(timezone.utc)
                    user_doc["updatedAt"] = datetime.now(timezone.utc)
                    await db_instance.db.users.insert_one(user_doc)
        except Exception as e:
            logger.warning(f"Error seeding MongoDB demo users: {e}")
    else:
        save_fallback_data()

async def connect_to_mongo():
    load_fallback_data()
    try:
        db_instance.client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=5000
        )
        # Test connection
        await db_instance.client.admin.command('ping')
        db_instance.db = db_instance.client[settings.DATABASE_NAME]
        db_instance.is_connected = True
        logger.info("Successfully connected to MongoDB!")

        # Create unique index for email
        await db_instance.db.users.create_index("email", unique=True)
    except Exception as e:
        logger.warning(f"MongoDB connection failed: {e}. Falling back to in-memory async database handler.")
        db_instance.is_connected = False
        db_instance.db = None
    
    await seed_demo_data()

async def close_mongo_connection():
    if not db_instance.is_connected:
        save_fallback_data()
    if db_instance.client:
        db_instance.client.close()
        logger.info("Closed MongoDB connection.")

def get_db():
    return db_instance
