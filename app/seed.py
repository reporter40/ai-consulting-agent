"""Run idempotent DB seed (CLI: python -m app.seed)."""

from __future__ import annotations

import asyncio
import logging

from app.db.session import async_session_factory
from app.services.seed_service import seed_demo_if_empty

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def main() -> None:
    async with async_session_factory() as session:
        ran = await seed_demo_if_empty(session)
        await session.commit()
        if ran:
            logger.info("Demo seed applied (empty projects table).")
        else:
            logger.info("Skip seed: projects already exist.")


if __name__ == "__main__":
    asyncio.run(main())
