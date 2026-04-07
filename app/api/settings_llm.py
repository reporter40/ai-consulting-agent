"""Dashboard: read / update LLM secrets file (requires SETTINGS_SECRET)."""

from fastapi import APIRouter, Header, HTTPException

from app.config import get_settings
from app.llm_secrets_store import (
    LlmSecretsPatch,
    LlmSettingsPublic,
    apply_patch,
)
from app.services.llm_client import llm_is_configured, resolve_llm_backend

router = APIRouter(prefix="/api/settings", tags=["settings"])


def _require_write_token(x_settings_token: str | None) -> None:
    s = get_settings()
    expected = (s.settings_secret or "").strip()
    if not expected:
        raise HTTPException(
            status_code=503,
            detail="На сервере не задан SETTINGS_SECRET — сохранение из UI отключено.",
        )
    got = (x_settings_token or "").strip()
    if got != expected:
        raise HTTPException(status_code=403, detail="Неверный токен настроек.")


@router.get("/llm", response_model=LlmSettingsPublic)
async def get_llm_settings() -> LlmSettingsPublic:
    s = get_settings()
    write_ok = bool((s.settings_secret or "").strip())
    return LlmSettingsPublic(
        llm_configured=llm_is_configured(s),
        llm_backend=resolve_llm_backend(s).value,
        anthropic_key_set=bool((s.anthropic_api_key or "").strip()),
        abacus_key_set=bool((s.abacus_api_key or "").strip()),
        abacus_base_url=s.abacus_base_url,
        llm_model=s.llm_model,
        settings_write_enabled=write_ok,
    )


@router.put("/llm", response_model=LlmSettingsPublic)
async def put_llm_settings(
    body: LlmSecretsPatch,
    x_settings_token: str | None = Header(default=None, alias="X-Settings-Token"),
) -> LlmSettingsPublic:
    _require_write_token(x_settings_token)
    apply_patch(body)
    s = get_settings()
    return LlmSettingsPublic(
        llm_configured=llm_is_configured(s),
        llm_backend=resolve_llm_backend(s).value,
        anthropic_key_set=bool((s.anthropic_api_key or "").strip()),
        abacus_key_set=bool((s.abacus_api_key or "").strip()),
        abacus_base_url=s.abacus_base_url,
        llm_model=s.llm_model,
        settings_write_enabled=bool((s.settings_secret or "").strip()),
    )
