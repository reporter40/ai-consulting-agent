"""LLM backend resolution."""

from app.config import Settings
from app.services.llm_client import LlmBackend, llm_is_configured, resolve_llm_backend


def test_anthropic_wins_when_both_keys() -> None:
    s = Settings(anthropic_api_key="a", abacus_api_key="b")
    assert resolve_llm_backend(s) == LlmBackend.anthropic
    assert llm_is_configured(s) is True


def test_abacus_when_only_abacus_key() -> None:
    s = Settings(anthropic_api_key="", abacus_api_key="x")
    assert resolve_llm_backend(s) == LlmBackend.openai_compatible
    assert llm_is_configured(s) is True


def test_none_when_no_keys() -> None:
    s = Settings(anthropic_api_key="", abacus_api_key="")
    assert resolve_llm_backend(s) == LlmBackend.none
    assert llm_is_configured(s) is False
