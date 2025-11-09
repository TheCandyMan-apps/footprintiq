FROM openjdk:17-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    curl \
    git \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages for maltego-trx
RUN pip3 install --no-cache-dir \
    maltego-trx \
    requests \
    beautifulsoup4 \
    dnspython

# Download Maltego CE (Community Edition)
# Note: In production, you'd mount Maltego CE installation or use official containers
RUN mkdir -p /opt/maltego

# Create transform server configuration
COPY transforms/ /app/transforms/
COPY server.py /app/

# Expose port for REST API
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Run the REST API server
CMD ["python3", "server.py"]
