from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import init_db
from .routers import auth, profile, logs, predict, recommendations


def create_app(mongo_client=None) -> FastAPI:
    """
    App factory. Pass `mongo_client` (e.g. a mongomock-motor client) to run
    against an in-memory database — used by the test suite. Leave it None
    for normal use, which connects to MONGODB_URI from the environment.
    """

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        client = await init_db(mongo_client)
        app.state.mongo_client = client
        yield
        client.close()

    app = FastAPI(
        title="Femina Pulse API",
        description="Backend for the Femina Pulse PCOS tracking app: auth, profile, daily logs, ML risk prediction, and lifestyle recommendations. Backed by MongoDB Atlas.",
        version="2.0.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router)
    app.include_router(profile.router)
    app.include_router(logs.router)
    app.include_router(predict.router)
    app.include_router(recommendations.router)

    @app.get("/health", tags=["meta"])
    def health():
        return {"status": "ok"}

    return app


app = create_app()
