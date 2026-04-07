"""Unified LLM: Anthropic API or Abacus RouteLLM (OpenAI-compatible)."""

from __future__ import annotations

from collections.abc import AsyncIterator
from enum import Enum
from functools import lru_cache

import httpx
from anthropic import AsyncAnthropic
from openai import AsyncOpenAI

from app.config import Settings


def _proxy_url(settings: Settings) -> str | None:
    u = (settings.https_proxy or "").strip() or (settings.http_proxy or "").strip()
    return u or None


@lru_cache(maxsize=16)
def _async_httpx_for_proxy(proxy_url: str) -> httpx.AsyncClient:
    """Общий клиент на URL прокси (HTTPS/SOCKS5 — см. документацию httpx)."""
    return httpx.AsyncClient(
        proxy=proxy_url,
        timeout=httpx.Timeout(600.0, connect=120.0),
    )


def _anthropic_client(settings: Settings) -> AsyncAnthropic:
    p = _proxy_url(settings)
    if p:
        return AsyncAnthropic(
            api_key=settings.anthropic_api_key,
            http_client=_async_httpx_for_proxy(p),
        )
    return AsyncAnthropic(api_key=settings.anthropic_api_key)


def _abacus_openai_client(settings: Settings) -> AsyncOpenAI:
    p = _proxy_url(settings)
    if p:
        return AsyncOpenAI(
            api_key=settings.abacus_api_key,
            base_url=settings.abacus_base_url,
            http_client=_async_httpx_for_proxy(p),
        )
    return AsyncOpenAI(
        api_key=settings.abacus_api_key,
        base_url=settings.abacus_base_url,
    )


class LlmBackend(str, Enum):
    anthropic = "anthropic"
    openai_compatible = "openai_compatible"
    none = "none"


def resolve_llm_backend(settings: Settings) -> LlmBackend:
    """Prefer Anthropic when both keys are set."""
    if settings.anthropic_api_key:
        return LlmBackend.anthropic
    if settings.abacus_api_key:
        return LlmBackend.openai_compatible
    return LlmBackend.none


def llm_is_configured(settings: Settings) -> bool:
    return resolve_llm_backend(settings) != LlmBackend.none


async def stream_chat_tokens(
    settings: Settings,
    system: str,
    user: str,
    temperature: float,
    max_tokens: int = 2048,
) -> AsyncIterator[str]:
    """Stream plain text deltas from the active provider."""
    backend = resolve_llm_backend(settings)
    if backend == LlmBackend.none:
        yield "[LLM disabled: set ANTHROPIC_API_KEY or ABACUS_API_KEY]\n"
        return
    if backend == LlmBackend.anthropic:
        client = _anthropic_client(settings)
        async with client.messages.stream(
            model=settings.llm_model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system,
            messages=[{"role": "user", "content": user}],
        ) as stream:
            async for text in stream.text_stream:
                yield text
        return

    client = _abacus_openai_client(settings)
    stream = await client.chat.completions.create(
        model=settings.llm_model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        temperature=temperature,
        max_tokens=max_tokens,
        stream=True,
    )
    async for chunk in stream:
        if not chunk.choices:
            continue
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta


async def complete_chat_text(
    settings: Settings,
    user: str,
    *,
    system: str | None = None,
    temperature: float = 0.3,
    max_tokens: int = 2048,
) -> tuple[str, LlmBackend]:
    """Single completion; returns (text, backend). Empty if no provider."""
    backend = resolve_llm_backend(settings)
    if backend == LlmBackend.none:
        return "", backend
    if backend == LlmBackend.anthropic:
        client = _anthropic_client(settings)
        kwargs: dict = {
            "model": settings.llm_model,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": [{"role": "user", "content": user}],
        }
        if system:
            kwargs["system"] = system
        msg = await client.messages.create(**kwargs)
        text = ""
        for block in msg.content:
            if block.type == "text":
                text += block.text
        return text, backend

    client = _abacus_openai_client(settings)
    messages: list[dict[str, str]] = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": user})
    chat = await client.chat.completions.create(
        model=settings.llm_model,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    text = chat.choices[0].message.content or ""
    return text, backend
