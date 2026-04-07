"""FastAPI application entrypoint."""

# Конфиг первым: подхват proxy из .env до импортов, которые тянут LLM/httpx.
from app.config import get_settings  # noqa: F401

import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import (
    artifacts,
    diagnostic,
    health,
    hypotheses,
    iqd,
    knowledge_graph,
    projects,
    report,
    settings_llm,
    workflow,
)
from app.exceptions import AppError

logger = logging.getLogger(__name__)


def _error_payload(code: str, message: str) -> dict:
    return {
        "detail": message,  # backward-compat for existing clients
        "error": {"code": code, "message": message},
    }


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(AppError)
    async def app_error_handler(_request: Request, exc: AppError) -> JSONResponse:
        code = 404 if exc.code == "not_found" else 400
        return JSONResponse(
            status_code=code, content=_error_payload(exc.code, exc.message)
        )

    @app.exception_handler(RequestValidationError)
    async def request_validation_handler(
        _request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        message = "Invalid request payload"
        return JSONResponse(
            status_code=422,
            content={
                **_error_payload("request_validation_error", message),
                "fields": exc.errors(),
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_handler(_request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled API error: %s", exc)
        return JSONResponse(
            status_code=500,
            content=_error_payload("internal_error", "Internal server error"),
        )

    app.include_router(health.router)
    app.include_router(knowledge_graph.router)
    app.include_router(projects.router)
    app.include_router(artifacts.router)
    app.include_router(workflow.router)
    app.include_router(diagnostic.router)
    app.include_router(settings_llm.router)
    app.include_router(hypotheses.router)
    app.include_router(report.router)
    app.include_router(iqd.router)

    return app


app = create_app()
