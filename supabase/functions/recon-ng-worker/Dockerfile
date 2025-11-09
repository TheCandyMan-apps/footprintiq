FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install recon-ng and dependencies
RUN pip install --no-cache-dir \
    recon-ng \
    flask \
    flask-cors \
    gunicorn \
    requests

# Create directories
RUN mkdir -p /root/.recon-ng/workspaces \
    && mkdir -p /app/logs

# Set working directory
WORKDIR /app

# Copy REST API server
COPY server.py /app/
COPY worker_api.py /app/

# Create healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Expose port
EXPOSE 8080

# Run with gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "4", "--timeout", "300", "--access-logfile", "-", "--error-logfile", "-", "worker_api:app"]
