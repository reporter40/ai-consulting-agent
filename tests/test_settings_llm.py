"""Settings LLM API and secrets file merge."""

import json

import pytest
from fastapi.testclient import TestClient

from app import llm_secrets_store
from app.config import get_settings
from app.main import app


@pytest.fixture
def secrets_path(tmp_path, monkeypatch):
    p = tmp_path / "llm_secrets.json"
    monkeypatch.setattr(llm_secrets_store, "SECRETS_PATH", p)
    return p


def test_get_llm_settings(secrets_path) -> None:
    client = TestClient(app)
    r = client.get("/api/settings/llm")
    assert r.status_code == 200
    data = r.json()
    assert "llm_backend" in data
    assert "settings_write_enabled" in data


def test_put_without_server_secret_returns_503(monkeypatch, secrets_path) -> None:
    monkeypatch.delenv("SETTINGS_SECRET", raising=False)
    client = TestClient(app)
    r = client.put(
        "/api/settings/llm",
        json={"llm_model": "m"},
        headers={"X-Settings-Token": "x"},
    )
    assert r.status_code == 503


def test_put_with_bad_token_403(monkeypatch, secrets_path) -> None:
    monkeypatch.setenv("SETTINGS_SECRET", "good")
    client = TestClient(app)
    r = client.put(
        "/api/settings/llm",
        json={"llm_model": "m"},
        headers={"X-Settings-Token": "bad"},
    )
    assert r.status_code == 403


def test_put_writes_file(monkeypatch, secrets_path) -> None:
    monkeypatch.setenv("SETTINGS_SECRET", "tok")
    client = TestClient(app)
    r = client.put(
        "/api/settings/llm",
        json={
            "abacus_api_key": "key-abacus",
            "abacus_base_url": "https://routellm.abacus.ai/v1",
            "llm_model": "gpt-4o",
        },
        headers={"X-Settings-Token": "tok"},
    )
    assert r.status_code == 200
    assert secrets_path.exists()
    data = json.loads(secrets_path.read_text(encoding="utf-8"))
    assert data["abacus_api_key"] == "key-abacus"
    out = r.json()
    assert out["abacus_key_set"] is True


def test_merge_into_settings_from_file(monkeypatch, secrets_path) -> None:
    monkeypatch.setenv("ANTHROPIC_API_KEY", "")
    monkeypatch.delenv("ABACUS_API_KEY", raising=False)
    secrets_path.write_text(
        json.dumps({"abacus_api_key": "from-file", "llm_model": "m1"}),
        encoding="utf-8",
    )
    s = get_settings()
    assert s.abacus_api_key == "from-file"
    assert s.llm_model == "m1"
