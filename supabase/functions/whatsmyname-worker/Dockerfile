FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    golang-go \
    && rm -rf /var/lib/apt/lists/*

# Install Python tools
RUN pip install --no-cache-dir sherlock-project holehe

# Install GoSearch
ENV GOPATH=/root/go
ENV PATH=$PATH:$GOPATH/bin
RUN go install github.com/ibnaleem/gosearch@latest

# Copy the API server
COPY server.py /app/

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Run the server
CMD ["python", "server.py"]
