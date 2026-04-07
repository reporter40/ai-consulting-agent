"""Redis client for pub/sub and caching."""

from __future__ import annotations

import json
from functools import lru_cache
from typing import Any

import redis.asyncio as redis

from app.config import get_settings


@lru_cache
def get_redis() -> redis.Redis:
    return redis.from_url(get_settings().redis_url, decode_responses=True)


async def publish_workflow_event(project_id: str, payload: dict[str, Any]) -> None:
    """Publish workflow event for SSE / subscribers."""
    r = get_redis()
    channel = f"workflow:{project_id}"
    await r.publish(channel, json.dumps(payload, default=str))


async def push_workflow_event_list(project_id: str, payload: dict[str, Any]) -> None:
    """Persist last events for GET /workflow/events (max 100)."""
    r = get_redis()
    key = f"workflow:{project_id}:events"
    await r.lpush(key, json.dumps(payload, default=str))
    await r.ltrim(key, 0, 99)


async def list_workflow_events(project_id: str, limit: int = 50) -> list[dict[str, Any]]:
    """Return recent workflow events (newest first)."""
    r = get_redis()
    key = f"workflow:{project_id}:events"
    raw = await r.lrange(key, 0, max(0, limit - 1))
    out: list[dict[str, Any]] = []
    for x in raw:
        try:
            out.append(json.loads(x))
        except json.JSONDecodeError:
            continue
    return out
