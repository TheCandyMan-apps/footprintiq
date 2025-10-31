# Observability & Monitoring Guide

## Overview

FootprintIQ includes comprehensive observability infrastructure for production monitoring, error tracking, and performance optimization.

## Error Tracking (Sentry)

### Setup

1. **Get Sentry DSN**
   - Sign up at https://sentry.io
   - Create a new project for FootprintIQ
   - Copy the DSN from Project Settings → Client Keys

2. **Configure Environment**
   ```bash
   # Add to .env
   VITE_SENTRY_DSN=https://[key]@o[org].ingest.sentry.io/[project]
   VITE_APP_VERSION=2.5.0
   ```

3. **Initialize in Application**
   ```typescript
   import { initSentry } from '@/lib/observability/sentry';
   
   // In main.tsx or App.tsx
   initSentry();
   ```

### Usage

```typescript
import { captureException, captureMessage, addBreadcrumb } from '@/lib/observability/sentry';

// Capture exceptions
try {
  await riskyOperation();
} catch (error) {
  captureException(error, {
    user: { id: userId, email: userEmail },
    tags: { feature: 'scan', provider: 'shodan' },
    extra: { scanId, input }
  });
}

// Log important events
captureMessage('Scan completed successfully', 'info', {
  tags: { scanType: 'email' }
});

// Add breadcrumbs for debugging
addBreadcrumb('scan', 'Started email scan', { email: 'user@example.com' });
```

## Application Monitoring

### Health Checks

The monitoring service automatically tracks application health:

```typescript
import { monitoring } from '@/lib/observability/monitoring';

// Manual health check
const health = await monitoring.checkHealth();
console.log(health);
// {
//   status: 'healthy' | 'degraded' | 'down',
//   checks: { database: true, api: true, auth: true },
//   metrics: { uptime: 3600000, memory: 0.45, responseTime: 120 }
// }

// Get recorded metrics
const metrics = monitoring.getMetrics('web_vital_lcp');
```

### Web Vitals

Core Web Vitals are automatically tracked:

- **LCP (Largest Contentful Paint)**: Target < 2.5s
- **FID (First Input Delay)**: Target < 100ms
- **CLS (Cumulative Layout Shift)**: Target < 0.1

View metrics in browser console or export to analytics.

## Performance Monitoring

### Lighthouse CI

Automated performance audits run on every PR:

```bash
# Run locally
npm install -g @lhci/cli
npm run build
npx vite preview --port 4173 &
lhci autorun --collect.url=http://localhost:4173
```

Target scores:
- Performance: ≥85
- Accessibility: ≥95
- Best Practices: ≥90
- SEO: ≥95

### Bundle Size Monitoring

Track bundle size in CI/CD:

```bash
# Check bundle size
npm run build
du -sh dist
find dist/assets -name "*.js" -exec du -h {} \;
```

Thresholds:
- Total bundle: < 1.5 MB
- Main JS chunk: < 500 KB
- Individual chunks: < 250 KB

## Log Aggregation

### Production Logs

```typescript
// Use structured logging
console.log('[SCAN]', { scanId, provider, duration, status });

// Error logs with context
console.error('[ERROR]', { error: err.message, stack: err.stack, userId });
```

### Log Drain Setup (Recommended)

For production, configure log drain to aggregation service:

**Netlify/Vercel:**
- Built-in log streaming to services like Datadog, Logtail

**Self-hosted:**
```bash
# Example: Ship logs to Logtail
npm install @logtail/node

# In your edge functions
import { Logtail } from "@logtail/node";
const logtail = new Logtail(process.env.LOGTAIL_TOKEN);
```

## Uptime Monitoring

### Recommended Services

1. **Uptime Robot** (Free)
   - Monitor https://footprintiq.app
   - Check interval: 5 minutes
   - Alert via email/Slack

2. **Better Uptime** (Paid)
   - More comprehensive checks
   - Status page generation
   - Incident management

3. **Pingdom** (Paid)
   - Multi-region monitoring
   - Transaction monitoring
   - Real user monitoring (RUM)

### Health Endpoint

Create health check endpoint:

```typescript
// supabase/functions/health/index.ts
Deno.serve(async (req) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    providers: await checkProviders()
  };
  
  const healthy = Object.values(checks).every(v => v === true);
  
  return new Response(JSON.stringify({
    status: healthy ? 'ok' : 'degraded',
    checks,
    timestamp: new Date().toISOString()
  }), {
    status: healthy ? 200 : 503,
    headers: { 'Content-Type': 'application/json' }
  });
});
```

## Alerting

### Critical Alerts

Set up alerts for:

1. **Availability**
   - Site down > 2 minutes
   - API error rate > 5%
   - Database connection failures

2. **Performance**
   - Response time > 5s (p95)
   - LCP > 4s
   - API timeout rate > 1%

3. **Security**
   - Unusual authentication failures
   - Rate limit violations
   - Suspicious API patterns

4. **Business Metrics**
   - Payment failures
   - Scan quota exceeded
   - Provider API failures

### Alert Channels

- **Email**: For non-urgent alerts
- **Slack/Discord**: For team notifications
- **PagerDuty**: For on-call escalation
- **SMS**: For critical outages

## Metrics Dashboard

### Key Metrics

**Operational:**
- Uptime percentage (target: 99.9%)
- Request volume (requests/minute)
- Error rate (target: < 1%)
- Latency p50/p95/p99

**Business:**
- Active users (DAU/MAU)
- Scans performed (daily/weekly)
- Conversion rate (free → paid)
- Churn rate

**Technical:**
- Bundle size trend
- Core Web Vitals
- API quota utilization
- Provider success rates

## Security Monitoring

### Security Scans

Automated security scanning runs weekly:

```bash
# OSV Scanner (vulnerability detection)
osv-scanner --lockfile=package-lock.json

# NPM Audit (dependency vulnerabilities)
npm audit --production

# OWASP ZAP (web security)
docker run -t zaproxy/zap-stable zap-baseline.py -t https://footprintiq.app
```

### Security Alerts

Monitor for:
- Failed authentication attempts
- Unusual API access patterns
- Suspicious scan inputs
- Rate limit violations
- Expired API keys
- SSL certificate expiration

## Troubleshooting

### High Error Rate

1. Check Sentry for error patterns
2. Review recent deployments
3. Check provider API status
4. Verify database connectivity
5. Check edge function logs

### Slow Performance

1. Review Lighthouse CI results
2. Check bundle size
3. Analyze Web Vitals
4. Check API response times
5. Review database query performance
6. Check CDN cache hit rate

### Memory Leaks

1. Monitor heap size in Sentry
2. Check for unclosed connections
3. Review subscription cleanup
4. Check for circular references
5. Use Chrome DevTools memory profiler

## Best Practices

1. **Always add context to errors**
   ```typescript
   captureException(error, { 
     user, tags, extra 
   });
   ```

2. **Use breadcrumbs for debugging**
   ```typescript
   addBreadcrumb('user-action', 'Clicked scan button', { email });
   ```

3. **Monitor critical paths**
   - Authentication flow
   - Scan execution
   - Payment processing
   - API requests

4. **Set up alerts before problems occur**
   - Don't wait for downtime
   - Monitor trends, not just thresholds

5. **Review metrics regularly**
   - Weekly: Check error trends
   - Monthly: Review performance
   - Quarterly: Audit security

## Resources

- [Sentry Documentation](https://docs.sentry.io)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [OWASP ZAP](https://www.zaproxy.org/)

## Support

For observability questions:
- Email: devops@footprintiq.app
- Slack: #observability channel
