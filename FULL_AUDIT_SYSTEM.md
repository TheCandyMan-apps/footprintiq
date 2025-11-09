# Full Codebase Audit System

## Overview
Comprehensive automated audit system that checks RLS policies, performance, security, and test coverage with AI-powered prioritization and auto-fix capabilities.

## Features

### 1. **Multi-Category Audits**
- **RLS Policies**: Checks Row Level Security on critical tables
- **Performance**: Validates Lighthouse scores (target: >95)
- **Security**: Runs npm audit for vulnerabilities
- **Tests**: Executes full test suite

### 2. **AI-Powered Analysis**
- Uses Grok to analyze findings
- Provides risk assessment
- Suggests priority fixes
- Identifies quick wins

### 3. **Auto-Fix Common Issues**
- Detects fixable problems
- Applies corrections automatically
- Logs all changes

### 4. **Persistent Logging**
- Stores all audits in `audit_logs` table
- Tracks trends over time
- Includes AI summaries

## Usage

### Run Full Audit
```bash
npm run audit:full
```

### What Gets Checked

#### 1. RLS Policies
```typescript
// Checks critical tables:
- scans
- workspaces
- workspace_members
- profiles
- cases
- monitors
```

#### 2. Performance
```bash
# Lighthouse CI metrics:
- Performance score > 95
- First Contentful Paint < 1.8s
- Speed Index < 3.4s
- Largest Contentful Paint < 2.5s
```

#### 3. Security
```bash
# Checks for:
- Exposed secrets in client code
- Vulnerable dependencies (npm audit)
- Missing security headers
```

#### 4. Tests
```bash
# Runs:
- Unit tests
- Integration tests
- E2E tests
- Ethics tests
```

## Architecture

### Edge Function: `audit-full`
```typescript
POST /functions/v1/audit-full

Response:
{
  success: true,
  summary: {
    total_issues: 5,
    fixed: 2,
    severity_breakdown: {
      critical: 0,
      high: 1,
      medium: 2,
      low: 2
    },
    duration_ms: 1500
  },
  ai_summary: "System healthy. Priority: RLS policies",
  prioritized_issues: [...],
  all_issues: [...]
}
```

### Database Schema
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_type TEXT NOT NULL,
  issues_found INT NOT NULL,
  issues_fixed INT NOT NULL,
  severity_breakdown JSONB NOT NULL,
  ai_summary TEXT,
  prioritized_issues JSONB,
  details JSONB NOT NULL,
  duration_ms INT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

## CLI Script

### Output Example
```bash
🔍 Starting full codebase audit...

📊 Audit Summary:
   Total Issues: 5
   Auto-Fixed: 2
   Duration: 1500ms

🎯 Severity Breakdown:
   Critical: 0
   High: 1
   Medium: 2
   Low: 2

🤖 AI Analysis:
System is generally healthy. Priority fixes:
1. RLS policies on user tables
2. Performance optimization (code splitting)
3. Update vulnerable dependencies

⚡ Priority Issues:
1. [HIGH] Missing RLS policy on scans table
   Add SELECT policy for authenticated users

2. [MEDIUM] Large bundle size
   Consider code splitting
   ✅ Auto-fixable (FIXED)

✅ Audit passed! No critical issues found.
```

## Auto-Fix Examples

### 1. Bundle Size Optimization
```typescript
// Detects: Large bundles
// Fix: Adds dynamic imports
const Component = lazy(() => import('./Component'));
```

### 2. Missing Indexes
```sql
-- Detects: Slow queries
-- Fix: Creates indexes
CREATE INDEX idx_scans_user_id ON scans(user_id);
```

### 3. Dependency Mismatches
```bash
# Detects: Version conflicts
# Fix: Updates package.json
npm install package@latest
```

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: Full Audit

on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
  workflow_dispatch:

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run audit:full
```

## Exit Codes
- `0`: Success (no critical/high issues)
- `1`: Failure (critical issues found)

## Severity Levels

| Level | Description | Action Required |
|-------|-------------|-----------------|
| 🔴 Critical | Security breach risk | Fix immediately |
| 🟠 High | Significant issues | Fix within 24h |
| 🟡 Medium | Moderate problems | Fix within week |
| 🟢 Low | Minor issues | Fix when possible |

## AI Prioritization

Grok analyzes all findings and provides:
1. **Risk Assessment**: Overall system health
2. **Top 3 Priorities**: Most critical fixes
3. **Quick Wins**: Easy improvements
4. **Long-term**: Strategic recommendations

## Testing

```bash
npm run test -- tests/audit-full.test.ts
```

Tests cover:
- RLS detection
- Auto-fix logic
- AI analysis
- Severity categorization
- Performance validation

## Troubleshooting

### Issue: Too many false positives
**Solution**: Adjust severity thresholds in edge function

### Issue: AI analysis unavailable
**Solution**: Check `GROK_API_KEY` secret is configured

### Issue: Slow audit execution
**Solution**: Run specific category only:
```bash
# Check RLS only
npm run audit:scans

# Check performance only
npm run test:e2e
```

## Future Enhancements

- [ ] Slack/Discord notifications
- [ ] Auto-create GitHub issues
- [ ] Trend analysis dashboard
- [ ] Custom audit rules
- [ ] Integration with monitoring tools

## Support

For issues or questions:
- Check logs in `audit_logs` table
- Review AI recommendations
- Run `npm run audit:full -- --verbose`

---

*Last Updated: 2025-01-09*
*Version: 1.0*
