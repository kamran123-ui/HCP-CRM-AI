"""
Application factory and entrypoint.

Run locally with:  uvicorn app.main:app --reload
Run in production: uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
"""
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.error_handlers import register_exception_handlers
from app.core.logging_config import configure_logging, get_logger
from app.db.init_db import init_db

configure_logging()
logger = get_logger(__name__)


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        description=(
            "AI-first CRM API for the Healthcare Professional (HCP) module. "
            "Provides structured + conversational interaction logging backed by a "
            "LangGraph agent running on Groq's gemma2-9b-it."
        ),
        version="1.0.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start) * 1000
        logger.info(
            "%s %s -> %s (%.1fms)", request.method, request.url.path, response.status_code, duration_ms
        )
        return response

    register_exception_handlers(app)
    app.include_router(api_router, prefix=settings.API_V1_PREFIX)

    @app.on_event("startup")
    def on_startup() -> None:
        init_db()
        logger.info("%s started in %s mode.", settings.APP_NAME, settings.ENVIRONMENT)

    return app


app = create_app()
