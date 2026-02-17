FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for cryptg
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the API server
COPY server.py /app/

# Ensure immediate log output (critical for Cloud Run debugging)
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Run the server
CMD ["python", "server.py"]
