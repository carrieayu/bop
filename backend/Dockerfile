# syntax=docker/dockerfile:1

ARG PYTHON_VERSION=3.10.11
FROM python:${PYTHON_VERSION}-slim as base

ENV PYTHONDONTWRITEBYTECODE=1

ENV PYTHONUNBUFFERED=1

WORKDIR /app

ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser

RUN apt-get update && apt-get install -y build-essential
RUN apt-get update && apt-get install -y pkg-config
RUN apt-get update && apt-get install -y --no-install-recommends default-libmysqlclient-dev

RUN --mount=type=cache,target=/root/.cache/pip \
    --mount=type=bind,source=requirements.txt,target=requirements.txt \
    python -m pip install -r requirements.txt

USER appuser

COPY . .

EXPOSE 8000

CMD gunicorn 'backend.wsgi' --bind=0.0.0.0:8000
