"""Persist LLM keys in backend/data/llm_secrets.json (not committed to git)."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from pydantic import BaseModel

from app.config import Settings

SECRETS_PATH = Path(__file__).resolve().parent.parent / "data" / "llm_secrets.json"
ALLOWED_KEYS = frozenset(
    {"anthropic_api_key", "abacus_api_key", "abacus_base_url", "llm_model"}
)


def load_file_raw() -> dict[str, Any]:
    if not SECRETS_PATH.exists():
        return {}
    try:
        data = json.loads(SECRETS_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    if not isinstance(data, dict):
        return {}
    return {k: v for k, v in data.items() if k in ALLOWED_KEYS}


def merge_into_settings(base: Settings) -> Settings:
    raw = load_file_raw()
    if not raw:
        return base
    patch: dict[str, str] = {}
    for k in ALLOWED_KEYS:
        if k not in raw:
            continue
        v = raw[k]
        if v is None:
            continue
        s = str(v).strip()
        if s:
            patch[k] = s
    if not patch:
        return base
    return base.model_copy(update=patch)


class LlmSecretsPatch(BaseModel):
    """None = leave unchanged; empty string = remove key from file."""

    anthropic_api_key: str | None = None
    abacus_api_key: str | None = None
    abacus_base_url: str | None = None
    llm_model: str | None = None


def apply_patch(patch: LlmSecretsPatch) -> None:
    current = load_file_raw()
    for field_name in ALLOWED_KEYS:
        val = getattr(patch, field_name, None)
        if val is None:
            continue
        if val == "":
            current.pop(field_name, None)
        else:
            current[field_name] = val.strip()
    SECRETS_PATH.parent.mkdir(parents=True, exist_ok=True)
    SECRETS_PATH.write_text(
        json.dumps(current, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


class LlmSettingsPublic(BaseModel):
    llm_configured: bool
    llm_backend: str
    anthropic_key_set: bool
    abacus_key_set: bool
    abacus_base_url: str
    llm_model: str
    settings_write_enabled: bool
