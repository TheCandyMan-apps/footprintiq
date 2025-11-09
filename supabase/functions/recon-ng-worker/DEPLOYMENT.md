# Recon-ng Worker Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- A server or cloud platform (GCP, AWS, Azure, DigitalOcean, etc.)
- Domain name (optional, for HTTPS)

## Quick Deploy Options

### Option 1: Local Development

```bash
cd supabase/functions/recon-ng-worker

# Generate secure token
export WORKER_TOKEN=$(openssl rand -hex 32)
echo "WORKER_TOKEN=$WORKER_TOKEN" > .env

# Build and run
docker-compose up -d

# Test
curl http://localhost:8080/health
```

### Option 2: DigitalOcean App Platform

1. **Create new app** from Docker Hub or GitHub
2. **Add environment variable**: `WORKER_TOKEN=your-secure-token`
3. **Set port**: 8080
4. **Deploy** and get your app URL

### Option 3: Google Cloud Run (Recommended)

```bash
# Set project and region
gcloud config set project YOUR_PROJECT_ID
export REGION=us-central1

# Build and push
cd supabase/functions/recon-ng-worker
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/recon-ng-worker

# Generate token
export WORKER_TOKEN=$(openssl rand -hex 32)

# Deploy
gcloud run deploy recon-ng-worker \
  --image gcr.io/YOUR_PROJECT_ID/recon-ng-worker \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars WORKER_TOKEN=$WORKER_TOKEN \
  --max-instances 10 \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300s

# Get URL
gcloud run services describe recon-ng-worker --region $REGION --format 'value(status.url)'
```

### Option 4: AWS ECS/Fargate

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

# Create repository
aws ecr create-repository --repository-name recon-ng-worker

# Build and push
cd supabase/functions/recon-ng-worker
docker build -t recon-ng-worker .
docker tag recon-ng-worker:latest \
  YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/recon-ng-worker:latest
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/recon-ng-worker:latest

# Create ECS task definition (task-definition.json)
# Deploy via ECS console or CLI
```

### Option 5: Render.com

1. Connect your GitHub repository
2. Create new **Web Service**
3. Select Docker runtime
4. Set **Dockerfile Path**: `supabase/functions/recon-ng-worker/Dockerfile`
5. Add environment variable: `WORKER_TOKEN`
6. Deploy

### Option 6: Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Create fly.toml
cd supabase/functions/recon-ng-worker
cat > fly.toml <<EOF
app = "recon-ng-worker"

[build]
  dockerfile = "Dockerfile"

[env]
  PORT = "8080"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  cpu_kind = "shared"
  cpus = 2
  memory_mb = 2048
EOF

# Set secret
fly secrets set WORKER_TOKEN=$(openssl rand -hex 32)

# Deploy
fly deploy
```

## Configure Supabase Edge Function

After deploying, add these secrets to your Supabase project:

```bash
# In Supabase dashboard or CLI
RECON_NG_WORKER_URL=https://your-worker-url.com
WORKER_TOKEN=your-secure-token
```

Or via CLI:
```bash
supabase secrets set RECON_NG_WORKER_URL=https://your-worker-url.com
supabase secrets set WORKER_TOKEN=your-secure-token
```

## Production Checklist

- [ ] Generate strong random token (`openssl rand -hex 32`)
- [ ] Set `WORKER_TOKEN` environment variable
- [ ] Configure HTTPS (use cloud provider's built-in or add nginx/Caddy)
- [ ] Set up monitoring and alerting
- [ ] Configure resource limits (2GB RAM, 2 CPUs recommended)
- [ ] Enable auto-scaling (max 10 instances)
- [ ] Set timeout to 300s for long scans
- [ ] Add rate limiting at load balancer level
- [ ] Configure log aggregation
- [ ] Set up health check alerts

## Security Best Practices

1. **Token Security**
   - Never commit tokens to git
   - Rotate tokens every 90 days
   - Use different tokens for dev/staging/prod

2. **Network Security**
   - Use private networking where possible
   - Restrict access to edge function only
   - Enable HTTPS/TLS everywhere

3. **Resource Limits**
   - Set memory/CPU limits
   - Configure timeout (5 minutes max)
   - Limit concurrent requests

4. **Monitoring**
   - Track failed authentication attempts
   - Monitor scan duration and failures
   - Alert on high resource usage

## Testing Deployment

```bash
# Health check
curl https://your-worker-url.com/health

# Test scan (replace TOKEN and URL)
curl -X POST https://your-worker-url.com/scan \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "target": "example.com",
    "modules": ["recon/domains-hosts/google_site_web"],
    "workspace": "test_scan"
  }'
```

## Troubleshooting

### Worker not responding
- Check logs: `docker logs recon-ng-worker` or cloud platform logs
- Verify WORKER_TOKEN is set
- Check firewall/security group settings

### Scans failing
- Check memory limits (need 2GB minimum)
- Verify timeout is 300s+
- Review module compatibility

### Authentication errors
- Verify token matches between worker and edge function
- Check Authorization header format: `Bearer <token>`

## Cost Estimation

**Cloud Run (GCP)**: ~$20-50/month for moderate usage
- Free tier: 2 million requests/month
- CPU: $0.00002400/vCPU-second
- Memory: $0.00000250/GiB-second

**ECS Fargate (AWS)**: ~$40-80/month
- vCPU: $0.04048/hour
- Memory: $0.004445/GB/hour

**DigitalOcean App**: $12-24/month (fixed pricing)

**Render.com**: $7/month (starter) - $85/month (pro)

## Support

For issues:
1. Check logs for error messages
2. Verify environment variables
3. Test with curl commands
4. Review module compatibility
