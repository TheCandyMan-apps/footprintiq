# FootprintIQ - Production Deployment Guide

## Overview
This guide covers deploying FootprintIQ to production with optimal performance, security, and monitoring.

## Pre-Deployment Checklist

### ✅ Code Quality
- [ ] All TypeScript errors resolved
- [ ] ESLint checks passing
- [ ] No console errors in production build
- [ ] Bundle size optimized (<2MB initial)
- [ ] All tests passing (if applicable)

### ✅ Security
- [ ] All API keys stored as secrets (not in code)
- [ ] CSP headers configured
- [ ] HTTPS enforced via HSTS
- [ ] XSS protection enabled
- [ ] Clickjacking protection enabled
- [ ] RLS policies verified in Supabase

### ✅ Performance
- [ ] Lazy loading implemented
- [ ] Images optimized
- [ ] Fonts preloaded
- [ ] Service worker configured
- [ ] Cache headers set
- [ ] Bundle splitting enabled

### ✅ Accessibility
- [ ] WCAG 2.1 AA compliance verified
- [ ] Keyboard navigation tested
- [ ] Screen reader tested
- [ ] Color contrast validated
- [ ] Skip links implemented

### ✅ SEO
- [ ] Meta tags configured
- [ ] Open Graph tags added
- [ ] Sitemap generated
- [ ] Robots.txt configured
- [ ] Canonical URLs set

## Environment Setup

### Required Environment Variables

```bash
# Supabase (Auto-configured by Lovable Cloud)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id

# Application
VITE_APP_ENV=production
VITE_APP_URL=https://footprintiq.com
```

### Optional Environment Variables

```bash
# Analytics
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Error Tracking (if using Sentry)
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx

# Feature Flags
VITE_ENABLE_BETA_FEATURES=false
```

## Build Process

### 1. Install Dependencies
```bash
npm ci
```

### 2. Run Type Check
```bash
npm run type-check
```

### 3. Build for Production
```bash
npm run build
```

### 4. Preview Build Locally
```bash
npm run preview
```

## Deployment Steps

### Option 1: Deploy via Lovable (Recommended)

1. **Click Publish Button**
   - Desktop: Top right of editor
   - Mobile: Bottom-right in Preview mode

2. **Verify Deployment**
   - Check the deployment URL
   - Test all critical paths
   - Verify security headers

3. **Custom Domain (Optional)**
   - Go to Project > Settings > Domains
   - Add your custom domain
   - Update DNS records as instructed
   - Wait for SSL certificate (5-10 minutes)

### Option 2: Manual Deployment

#### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

#### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

#### Custom Server
```bash
# Build
npm run build

# Upload dist/ folder to your server
# Configure nginx/apache to serve static files
# Ensure SPA routing works (redirect to index.html)
```

## Post-Deployment Verification

### 1. Functional Testing
```bash
# Test critical user flows
- [ ] Homepage loads
- [ ] User can sign up/login
- [ ] Scans can be initiated
- [ ] Results display correctly
- [ ] Exports work
- [ ] Mobile navigation functions
```

### 2. Performance Testing
```bash
# Run Lighthouse audit
npx lighthouse https://your-domain.com --view

# Check metrics
- [ ] Performance Score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 2.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
```

### 3. Security Testing
```bash
# Check security headers
curl -I https://your-domain.com

# Verify headers present:
- [ ] Strict-Transport-Security
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Content-Security-Policy
- [ ] Referrer-Policy

# Use online scanner
https://securityheaders.com/?q=your-domain.com
Target: A+ rating
```

### 4. Accessibility Testing
```bash
# Run axe DevTools
- [ ] No critical issues
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast passes
```

## Monitoring Setup

### 1. Error Tracking (Optional)

**Sentry Integration:**
```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: "production",
    tracesSampleRate: 0.1,
  });
}
```

### 2. Analytics

**Google Analytics:**
```html
<!-- index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 3. Uptime Monitoring

**Free Options:**
- UptimeRobot (https://uptimerobot.com)
- Freshping (https://www.freshworks.com/website-monitoring/)
- StatusCake (https://www.statuscake.com)

**Setup:**
1. Create account
2. Add your domain
3. Set check interval (1-5 minutes)
4. Configure alert email

## Performance Optimization

### 1. CDN Configuration
```
# Recommended CDN providers
- Cloudflare (free tier available)
- AWS CloudFront
- Fastly
```

### 2. Image Optimization
```bash
# Use modern formats
- WebP for photos
- SVG for icons/logos
- Lazy load below-fold images
```

### 3. Caching Strategy
```
# Cache durations
Static assets: 1 year (immutable)
HTML: No cache (always fresh)
API responses: 5 minutes (stale-while-revalidate)
```

## Rollback Procedure

### If Issues Occur:

1. **Via Lovable History:**
   - Open History tab
   - Select previous working version
   - Click "Restore"
   - Republish

2. **Via Git (if using GitHub sync):**
   ```bash
   git revert HEAD
   git push origin main
   # Trigger redeployment
   ```

3. **Via Hosting Platform:**
   - Most platforms keep previous deployments
   - Select previous deployment in dashboard
   - Click "Rollback" or "Restore"

## Troubleshooting

### Common Issues

#### 1. Blank Screen After Deploy
```
Cause: Bundle size too large or CSP blocking scripts
Fix: 
- Check browser console for errors
- Verify CSP allows all necessary sources
- Check bundle size with `npm run build`
```

#### 2. 404 on Routes
```
Cause: SPA routing not configured on server
Fix: Configure server to serve index.html for all routes

# Netlify: netlify.toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Vercel: vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### 3. Environment Variables Not Working
```
Cause: Variables not prefixed with VITE_
Fix: Ensure all variables start with VITE_
Rebuild after adding new variables
```

#### 4. Slow Initial Load
```
Cause: Bundle not optimized or CDN not configured
Fix:
- Enable lazy loading (already done)
- Check bundle analysis: npm run build -- --analyze
- Configure CDN
- Enable compression (gzip/brotli)
```

## SSL/TLS Configuration

### Lovable Hosting
- SSL certificates are automatic
- Supports custom domains
- Auto-renewal enabled

### Custom Server
```bash
# Using Let's Encrypt (free)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Database Backup

### Supabase (Lovable Cloud)
- Automatic daily backups (retained 7 days on free tier)
- Manual backups via Lovable Cloud interface
- Point-in-time recovery (paid plans)

### Manual Backup
```bash
# Export to SQL
# Via Lovable Cloud interface: Database > Backup

# Backup to JSON
# Create edge function to export data
```

## Scaling Considerations

### When to Scale:

**Indicators:**
- Response times > 2 seconds
- Error rate > 0.1%
- Database CPU > 80%
- Edge functions timing out

**Scaling Options:**
1. **Database:**
   - Upgrade Supabase plan
   - Add read replicas
   - Enable connection pooling

2. **Frontend:**
   - Enable CDN
   - Increase cache durations
   - Add service worker caching

3. **Edge Functions:**
   - Optimize function code
   - Add caching layer
   - Increase timeout limits

## Security Maintenance

### Regular Tasks

**Weekly:**
- [ ] Review Supabase audit logs
- [ ] Check for failed login attempts
- [ ] Monitor error rates

**Monthly:**
- [ ] Update dependencies (`npm outdated`)
- [ ] Review security advisories
- [ ] Test backup restoration
- [ ] Verify SSL certificate expiry

**Quarterly:**
- [ ] Security audit
- [ ] Penetration testing
- [ ] Update privacy policy
- [ ] Review RLS policies

## Compliance

### GDPR Compliance
- [ ] Privacy policy updated
- [ ] Cookie consent implemented
- [ ] Data export functionality
- [ ] Data deletion on request
- [ ] User data encryption

### Accessibility
- [ ] WCAG 2.1 AA compliance
- [ ] Regular accessibility audits
- [ ] User feedback mechanism

## Support & Documentation

### User Documentation
- Knowledge base: `/help`
- API docs: `/api`
- Video tutorials: TBD

### Developer Documentation
- Architecture docs: `README.md`
- API reference: `/docs/api`
- Contributing guide: TBD

## Success Metrics

### Performance
- Uptime: > 99.9%
- Response time: < 1 second (p95)
- Error rate: < 0.1%

### User Experience
- Lighthouse score: > 90
- Time to interactive: < 2.5s
- User satisfaction: > 4.5/5

### Security
- Zero critical vulnerabilities
- Security headers: A+ grade
- No data breaches

## Contact & Support

### Technical Issues
- Email: support@footprintiq.com
- GitHub: [Repository URL if public]
- Discord: [Server invite if available]

### Emergency Contacts
- On-call engineer: TBD
- Backup contact: TBD
- Escalation: TBD

---

## Appendix

### A. Useful Commands
```bash
# Build
npm run build

# Type check
npm run type-check

# Preview production build
npm run preview

# Analyze bundle
npm run build -- --analyze
```

### B. Key Files
- `vite.config.ts` - Build configuration
- `public/_headers` - Security headers
- `public/robots.txt` - SEO configuration
- `public/sitemap.xml` - Site structure
- `.env` - Environment variables

### C. Important URLs
- Production: https://your-domain.com
- Staging: https://staging.your-domain.com
- Lovable Cloud: [Your project URL]
- Status page: TBD

---

**Last Updated:** 2025
**Version:** 2.5.0
**Status:** Production Ready ✅
