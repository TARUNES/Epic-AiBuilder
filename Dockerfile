# ==============================================================================
# Multi-stage Dockerfile for EPIC-Hour (Google Cloud Run Deployment)
# Stage 1: Build React/Vite Frontend
# Stage 2: Fast, lightweight Python 3.11 FastAPI Backend serving API & Static SPA
# ==============================================================================

# --- Stage 1: Frontend Build ---
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

# Copy dependency files first to leverage Docker layer caching
COPY frontend/package*.json ./
RUN npm ci || npm install

# Copy frontend source code and build production assets
COPY frontend/ ./
ENV NODE_ENV=production
RUN npm run build

# --- Stage 2: Production Backend Container ---
FROM python:3.11-slim AS production

# Set Python environment flags
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ENVIRONMENT=production \
    PORT=8080

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python backend dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ ./

# Copy built frontend assets from stage 1 into backend static directory
COPY --from=frontend-builder /app/frontend/dist /app/dist

# Expose the Cloud Run container port
EXPOSE 8080

# Cloud Run injects $PORT (default 8080). Start uvicorn with production settings
CMD ["sh", "-c", "exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080} --workers 1"]
