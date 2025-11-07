# Production Audit Script

## Overview

The `audit:prod` script performs comprehensive production readiness checks including:

- 🔒 **Row Level Security (RLS)** - Validates all tables have proper RLS policies
- ⚡ **Performance** - Runs Lighthouse audit with 90+ target score
- 🛡️ **Security** - Executes npm audit for dependency vulnerabilities
- 🧪 **Tests** - Runs the complete test suite

## Usage

```bash
npm run audit:prod
```

## Output

The script generates a detailed HTML report at:
```
/public/admin/prod-report.html
```

## Auto-Commit

The report is automatically committed to the `audit` branch with a timestamped message.

## Exit Codes

- `0` - All checks passed
- `1` - One or more checks failed

## Requirements

- Node.js 18+
- Supabase CLI (for RLS checks)
- Chrome/Chromium (for Lighthouse)

## Report Sections

### 1. RLS Security
Checks that all database tables have proper Row Level Security policies enabled to prevent unauthorized data access.

### 2. Performance
Runs Lighthouse against the built application and requires:
- Performance: ≥90
- Accessibility: ≥90
- Best Practices: ≥90
- SEO: ≥90

### 3. Security Audit
Scans npm dependencies for known vulnerabilities:
- ❌ Fails on Critical or High severity
- ⚠️ Warns on Moderate severity
- ✅ Passes with only Low severity or none

### 4. Test Suite
Runs all unit and integration tests to ensure functionality.

## CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Production Audit
  run: npm run audit:prod

- name: Upload Audit Report
  uses: actions/upload-artifact@v4
  with:
    name: audit-report
    path: public/admin/prod-report.html
```

## Troubleshooting

**RLS checks fail**: Ensure Supabase CLI is installed and configured
```bash
npx supabase login
```

**Lighthouse fails**: Ensure Chrome/Chromium is installed
```bash
# macOS
brew install chromium

# Ubuntu/Debian
apt-get install chromium-browser
```

**Build errors**: Fix TypeScript and linting errors first
```bash
npm run typecheck
npm run lint
```
