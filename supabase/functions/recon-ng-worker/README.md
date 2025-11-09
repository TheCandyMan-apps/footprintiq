# Recon-ng Worker - Docker Deployment

Production-ready Docker container for executing Recon-ng scans via REST API.

## Quick Start

### 1. Build and Run with Docker Compose

```bash
# Set your worker token
export WORKER_TOKEN="your-secure-random-token"

# Build and start the worker
docker-compose up -d

# Check logs
docker-compose logs -f recon-ng-worker
```

### 2. Manual Docker Build

```bash
# Build image
docker build -t recon-ng-worker .

# Run container
docker run -d \
  -p 8080:8080 \
  -e WORKER_TOKEN="your-secure-token" \
  --name recon-ng-worker \
  recon-ng-worker
```

## API Endpoints

### Health Check
```bash
curl http://localhost:8080/health
```

### Execute Scan
```bash
curl -X POST http://localhost:8080/scan \
  -H "Authorization: Bearer your-secure-token" \
  -H "Content-Type: application/json" \
  -d '{
    "target": "example.com",
    "modules": [
      "recon/domains-hosts/google_site_web",
      "recon/domains-contacts/whois_pocs"
    ],
    "workspace": "example_scan"
  }'
```

### List Available Modules
```bash
curl http://localhost:8080/modules \
  -H "Authorization: Bearer your-secure-token"
```

### Validate Target
```bash
curl -X POST http://localhost:8080/validate \
  -H "Content-Type: application/json" \
  -d '{
    "target": "example.com",
    "target_type": "domain"
  }'
```

## Configuration

### Environment Variables

- `WORKER_TOKEN`: Authentication token for API requests (required)
- `PYTHONUNBUFFERED`: Set to 1 for immediate log output
- `LOG_LEVEL`: Logging level (INFO, DEBUG, WARNING, ERROR)

### Security

1. **Change the default token** in production:
   ```bash
   export WORKER_TOKEN=$(openssl rand -hex 32)
   ```

2. **Use HTTPS** in production with a reverse proxy (nginx, Caddy)

3. **Network isolation**: Run in a private network, expose only via API gateway

4. **Rate limiting**: Add rate limiting at the proxy level

## Production Deployment

### Option 1: Cloud Run (GCP)

```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/recon-ng-worker

# Deploy
gcloud run deploy recon-ng-worker \
  --image gcr.io/PROJECT_ID/recon-ng-worker \
  --platform managed \
  --region us-central1 \
  --set-env-vars WORKER_TOKEN=your-token \
  --max-instances 10 \
  --timeout 300
```

### Option 2: AWS ECS/Fargate

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.us-east-1.amazonaws.com
docker build -t recon-ng-worker .
docker tag recon-ng-worker:latest ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/recon-ng-worker:latest
docker push ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/recon-ng-worker:latest

# Create ECS task definition and service
```

### Option 3: Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: recon-ng-worker
spec:
  replicas: 3
  selector:
    matchLabels:
      app: recon-ng-worker
  template:
    metadata:
      labels:
        app: recon-ng-worker
    spec:
      containers:
      - name: recon-ng-worker
        image: your-registry/recon-ng-worker:latest
        ports:
        - containerPort: 8080
        env:
        - name: WORKER_TOKEN
          valueFrom:
            secretKeyRef:
              name: recon-ng-secrets
              key: worker-token
        resources:
          limits:
            memory: "2Gi"
            cpu: "2000m"
          requests:
            memory: "512Mi"
            cpu: "500m"
```

## Monitoring

### Health Checks
```bash
# Docker health check
docker inspect --format='{{.State.Health.Status}}' recon-ng-worker

# Manual check
curl http://localhost:8080/health
```

### Logs
```bash
# Docker logs
docker logs -f recon-ng-worker

# Docker Compose logs
docker-compose logs -f
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker logs recon-ng-worker

# Verify token is set
docker exec recon-ng-worker env | grep WORKER_TOKEN
```

### Scans timing out
- Increase `--timeout` in gunicorn config
- Check resource limits (CPU/memory)
- Review module selection (some modules are slow)

### Module not found
```bash
# List available modules
curl http://localhost:8080/modules -H "Authorization: Bearer your-token"

# Test recon-ng directly in container
docker exec -it recon-ng-worker recon-ng -x "modules search"
```

## Performance Tuning

### Gunicorn Workers
Edit `Dockerfile` CMD to adjust workers:
```dockerfile
CMD ["gunicorn", "--workers", "8", "--timeout", "600", ...]
```

### Resource Limits
Adjust in `docker-compose.yml`:
```yaml
deploy:
  resources:
    limits:
      cpus: '4'
      memory: 4G
```

## Development

### Local Testing
```bash
# Run with development server
docker run -it --rm \
  -p 8080:8080 \
  -e WORKER_TOKEN=dev-token \
  -e FLASK_ENV=development \
  recon-ng-worker \
  python worker_api.py
```

### Module Testing
```bash
# Test executor directly
docker exec -it recon-ng-worker python server.py
```

## License

MIT License - See LICENSE file for details
