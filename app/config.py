"""Application settings loaded from environment + optional data/llm_secrets.json."""

import os
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_backend_dir = Path(__file__).resolve().parent.parent
_repo_root = _backend_dir.parent
# Monorepo: repo-root .env затем backend/.env (позже перекрывает — локальный DATABASE_URL из backend/.env).
# В Docker (/app без frontend/) читаем только /app/.env.
_env_files: tuple[str, ...]
if (_repo_root / "frontend").is_dir() and (_repo_root / ".env").is_file():
    _env_files = (
        str(_repo_root / ".env"),
        str(_backend_dir / ".env"),
    )
elif (_backend_dir / ".env").is_file():
    _env_files = (str(_backend_dir / ".env"),)
else:
    _env_files = ()


class Settings(BaseSettings):
    """Runtime configuration."""

    model_config = SettingsConfigDict(
        env_file=_env_files if _env_files else None,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "AI Consulting Agent API"
    debug: bool = False

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/ai_consulting"
    redis_url: str = "redis://localhost:6379/0"
    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "neo4jpassword"

    anthropic_api_key: str = ""
    # Abacus RouteLLM (OpenAI-compatible): https://abacus.ai/help/developer-platform/route-llm
    abacus_api_key: str = ""
    abacus_base_url: str = "https://routellm.abacus.ai/v1"
    llm_model: str = "claude-sonnet-4-20250514"

    # Токен для PUT /api/settings/llm (заголовок X-Settings-Token). Без него ключи из UI не сохраняются.
    settings_secret: str = ""

    cors_origins: str = "http://localhost:3000"

    # Исходящие запросы к LLM (Anthropic / Abacus) через прокси/VPN-туннель на сервере.
    # Пример: HTTPS_PROXY=http://127.0.0.1:7890 или socks5://user:pass@host:1080
    # NO_PROXY обязателен, иначе БД/Redis могут пойти в прокси.
    http_proxy: str = ""
    https_proxy: str = ""
    no_proxy: str = ""

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


def _apply_llm_proxy_env() -> None:
    """Подставляет HTTP(S)_PROXY из .env в os.environ до создания httpx-клиентов (setdefault — не затирает shell)."""
    try:
        s = Settings()
    except Exception:
        return
    if s.http_proxy.strip():
        os.environ.setdefault("HTTP_PROXY", s.http_proxy.strip())
    if s.https_proxy.strip():
        os.environ.setdefault("HTTPS_PROXY", s.https_proxy.strip())
    if s.no_proxy.strip():
        os.environ.setdefault("NO_PROXY", s.no_proxy.strip())


_apply_llm_proxy_env()


def get_settings() -> Settings:
    """Env + merge `data/llm_secrets.json` (перечитывается при каждом вызове)."""
    base = Settings()
    from app.llm_secrets_store import merge_into_settings

    return merge_into_settings(base)
