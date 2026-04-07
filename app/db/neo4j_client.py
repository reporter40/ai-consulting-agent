"""Neo4j async driver wrapper (singleton)."""

from __future__ import annotations

from functools import lru_cache

from neo4j import AsyncGraphDatabase, AsyncDriver

from app.config import get_settings


@lru_cache(maxsize=8)
def _neo4j_driver_for(uri: str, user: str, password: str) -> AsyncDriver:
    """Ключ — URI и учётные данные; иначе @lru_cache без аргументов кэширует один раз навсегда и ломает смену пароля из .env."""
    return AsyncGraphDatabase.driver(uri, auth=(user, password))


def get_neo4j_driver() -> AsyncDriver:
    s = get_settings()
    return _neo4j_driver_for(s.neo4j_uri, s.neo4j_user, s.neo4j_password)
