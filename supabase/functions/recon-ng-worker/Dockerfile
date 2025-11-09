FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install recon-ng
RUN pip install --no-cache-dir recon-ng

# Create workspace directory
RUN mkdir -p /workspaces

# Set working directory
WORKDIR /app

# Copy REST API server
COPY server.py /app/

# Expose port
EXPOSE 8080

# Run the server
CMD ["python", "server.py"]
