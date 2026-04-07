FROM python:3.12-slim

WORKDIR /app

RUN pip install --no-cache-dir pip setuptools wheel

COPY pyproject.toml /app/
COPY fonts /app/fonts
COPY app /app/app
COPY alembic /app/alembic
COPY alembic.ini /app/
COPY prompts /app/prompts
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

RUN pip install --no-cache-dir -e ".[dev]"

ENV PYTHONPATH=/app
EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]
