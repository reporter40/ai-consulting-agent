"""Shared dependencies."""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db


async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async for s in get_db():
        yield s
