# Security Policy

## Overview

FootprintIQ takes security seriously. This document outlines our security practices, how to report vulnerabilities, and our security architecture.

## Reporting Security Vulnerabilities

If you discover a security vulnerability, please report it responsibly:

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please email: **security@footprintiq.com**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes

We will acknowledge receipt within 24 hours and provide a detailed response within 72 hours.

## Security Features

### 1. Authentication & Authorization

- **JWT-based authentication** using Supabase Auth
- **Role-based access control (RBAC)** with three tiers:
  - `admin`: Full system access
  - `analyst`: Enhanced features and workspace management
  - `free`: Standard user access
- **Row-Level Security (RLS)** policies on all database tables
- **Security definer functions** to prevent RLS recursion

### 2. Input Validation

All edge functions implement comprehensive input validation:

- **Zod schema validation** for request bodies
- **SQL injection detection** using regex patterns
- **XSS prevention** with HTML sanitization
- **Path traversal detection**
- **Command injection prevention**
- **Email, UUID, and phone number validation**

### 3. Rate Limiting

Multi-tier rate limiting system:

- **Anonymous users**: 10 requests/minute
- **Free tier**: 60 requests/minute
- **Premium tier**: 300 requests/minute
- **Enterprise tier**: 1000 requests/minute
- **Admin**: Unlimited

Separate limits for:
- API requests
- Scan operations
- Export operations

### 4. Security Event Monitoring

Real-time security event tracking:

- SQL injection attempts
- XSS attack attempts
- Path traversal attempts
- Command injection attempts
- Authentication failures
- Rate limit violations

Events are logged to `security_events` table with:
- Event type and severity
- User ID and IP address
- User agent
- Endpoint
- Payload (sanitized)
- Timestamp

### 5. Data Protection

- **Encryption at rest** using Supabase encryption
- **TLS/SSL encryption** for all data in transit
- **API key storage** in Supabase Vault
- **PII masking** in logs
- **Automatic data retention** policies

### 6. Network Security

Security headers on all responses:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```

## Security Architecture

### Edge Function Security

All edge functions follow this security pattern:

```typescript
1. CORS preflight handling
2. JWT authentication validation
3. Role-based authorization check
4. Rate limiting enforcement
5. Input validation and sanitization
6. Business logic execution
7. Security event logging
8. Standardized error responses
```

### Database Security

- All tables have RLS enabled
- Security definer functions for role checks
- Parameterized queries only (no raw SQL)
- Foreign key constraints
- Check constraints for data integrity

### Client-Side Security

- No sensitive data in localStorage
- No API keys in client code
- CSRF token validation
- XSS prevention with sanitization
- Secure cookie handling

## Compliance

### SOC 2

FootprintIQ is working towards SOC 2 compliance with:

- Access control policies
- Audit logging
- Data encryption
- Incident response procedures
- Change management processes
- Monitoring and alerting

### GDPR

- Data minimization
- Right to erasure
- Data portability
- Consent management
- Privacy by design

### HIPAA (Healthcare customers)

- PHI encryption
- Access controls
- Audit trails
- Business associate agreements

## Security Testing

Regular security testing includes:

- Automated security linting
- SQL injection testing
- XSS prevention testing
- Authentication bypass testing
- Rate limiting testing
- Penetration testing (quarterly)

## Vulnerability Management

### Severity Levels

- **Critical**: Immediate fix required (< 24 hours)
- **High**: Fix within 7 days
- **Medium**: Fix within 30 days
- **Low**: Fix within 90 days

### Disclosure Timeline

1. **Day 0**: Vulnerability reported
2. **Day 1**: Acknowledgment sent
3. **Day 3**: Initial assessment complete
4. **Day 7-30**: Fix developed and tested
5. **Day 30+**: Public disclosure (if applicable)

## Security Updates

Subscribe to security updates:
- GitHub Security Advisories
- Email notifications: security@footprintiq.com

## Security Contact

For security concerns or questions:
- **Email**: security@footprintiq.com
- **PGP Key**: Available on request
- **Response Time**: 24 hours

## Acknowledgments

We appreciate security researchers who help improve FootprintIQ security.

### Hall of Fame

(Security researchers who responsibly disclose vulnerabilities will be listed here)

## Version History

- **v1.0** (2025-01-19): Initial security policy
- Comprehensive security hardening implemented
- Security event monitoring deployed
- Rate limiting system active

---

Last Updated: January 19, 2025
