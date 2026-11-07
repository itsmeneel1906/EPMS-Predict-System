# ==============================================================================
# EPMS Backend - Production Dockerfile (Python 3.12 / FastAPI / ML Engine)
# ==============================================================================
FROM python:3.12-slim AS builder

WORKDIR /app

# Install system dependencies needed for compiling C-extensions (psycopg2, scikit-learn)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies in wheels cache
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Final runtime image
FROM python:3.12-slim AS runner

WORKDIR /app

# Install libpq runtime for PostgreSQL
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed python packages from builder
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Create non-root system user for security
RUN groupadd -r epms && useradd -r -g epms -d /app -s /sbin/nologin epms

# Copy backend source code into container
COPY --chown=epms:epms . /app/backend

# Create artifacts dir with proper permissions
RUN mkdir -p /app/backend/app/ml/artifacts && \
    chown -R epms:epms /app

USER epms

ENV PYTHONPATH="/app" \
    PORT=8000 \
    PYTHONUNBUFFERED=1

EXPOSE 8000

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://127.0.0.1:8000/api/health || exit 1

CMD ["python", "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
