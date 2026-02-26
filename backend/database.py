import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "HRMS")

client: AsyncIOMotorClient = None
db = None


async def connect_to_mongo():
    """Connect to MongoDB Atlas."""
    global client, db
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    # Create indexes for performance
    await db.employees.create_index("employee_id", unique=True)
    await db.employees.create_index("email", unique=True)
    await db.attendance.create_index([("employee_id", 1), ("date", 1)], unique=True)
    print("[OK] Connected to MongoDB Atlas")


async def close_mongo_connection():
    """Close MongoDB connection."""
    global client
    if client:
        client.close()
        print("[CLOSED] MongoDB connection closed")


def get_database():
    """Return the database instance."""
    return db
