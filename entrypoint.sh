#!/bin/sh
set -e
cd /app
alembic upgrade head
python -m app.seed
PORT="${PORT:-8000}"
exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT"
