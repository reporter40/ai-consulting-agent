"""FastAPI application entrypoint."""

# Конфиг первым: подхват proxy из .env до импортов, которые тянут LLM/httpx.
from app.config import get_settings  # noqa: F401

from fastapi import FastAPI, Request
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
        return JSONResponse(status_code=code, content={"detail": exc.message})

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
