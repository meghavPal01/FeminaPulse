"""
MongoDB connection setup, using Motor (async driver) + Beanie (ODM).

Configuration comes from environment variables (loaded from a .env file
via python-dotenv if present):

    MONGODB_URI   full connection string, e.g.
                  mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
    MONGODB_DB    database name to use (default: "femina_pulse")

See README.md "MongoDB Atlas setup" for how to get a connection string.

For tests, app/main.py's lifespan is bypassed and test_backend.py wires up
an in-memory mock client (mongomock-motor) instead — see that file.
"""

import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

load_dotenv()

MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB = os.environ.get("MONGODB_DB", "femina_pulse")


async def init_db(client: AsyncIOMotorClient | None = None):
    """
    Connect to MongoDB and register Beanie document models.
    Pass an explicit `client` (e.g. a mongomock-motor client) for tests;
    otherwise a real Motor client is created from MONGODB_URI.
    """
    from . import models  # local import to avoid circular imports

    if client is None:
        client = AsyncIOMotorClient(MONGODB_URI)

    await init_beanie(
        database=client[MONGODB_DB],
        document_models=[
            models.User,
            models.Profile,
            models.DailyLog,
            models.RiskCheck,
        ],
    )
    return client
