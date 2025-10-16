# Security Audit Checklist

## Overview
This checklist provides a structured approach to regularly auditing the security posture of FootprintIQ. Perform these audits on the schedule indicated to maintain production-grade security.

---

## 🔴 Critical Monthly Audits

### Authentication & Authorization

- [ ] **Review failed login attempts**
  - Check edge function logs for `auth_failure` events
  - Look for patterns indicating brute force attacks
  - Verify rate limiting is working (5 auth failures in 15 min = lockout)
  - Action: Block suspicious IPs if needed

- [ ] **Verify RLS policies are active**
  ```sql
  SELECT tablename, rowsecurity 
  FROM pg_tables 
  WHERE schemaname = 'public';
  ```
  - Confirm all tables show `rowsecurity = true`
  - Action: Enable RLS on any tables showing false

- [ ] **Check admin role assignments**
  ```sql
  SELECT user_id, role, created_at 
  FROM public.user_roles 
  WHERE role = 'admin' 
  ORDER BY created_at DESC;
  ```
  - Verify all admin accounts are authorized
  - Action: Revoke unauthorized admin access immediately

- [ ] **Review privilege escalation attempts**
  - Search logs for `privilege_escalation_attempt` events
  - Check for suspicious RPC calls to `grant_admin_role` or `update_user_subscription`
  - Action: Investigate and ban malicious users

### Database Security

- [ ] **Run Supabase security linter**
  - Access Lovable Cloud backend → Database → Security
  - Review all critical and high-priority findings
  - Action: Fix critical issues within 24 hours

- [ ] **Verify SECURITY DEFINER functions have search_path set**
  ```sql
  SELECT proname, prosecdef 
  FROM pg_proc 
  WHERE pronamespace = 'public'::regnamespace 
  AND prosecdef = true;
  ```
  - All should have `SET search_path = public` in definition
  - Action: Update functions missing search_path protection

- [ ] **Check for unauthorized database changes**
  - Review recent migrations in `supabase/migrations/`
  - Verify all changes were intentional and authorized
  - Action: Rollback unauthorized changes immediately

### Storage Security

- [ ] **Audit storage bucket policies**
  - Verify `scan-images` bucket is private (not public)
  - Check policies enforce user folder isolation (`auth.uid()::text = (storage.foldername(name))[1]`)
  - Action: Fix any overly permissive policies

- [ ] **Review uploaded files**
  - Check for unusually large files (>10MB)
  - Look for suspicious file extensions or patterns
  - Query: Check storage size trends
  - Action: Delete malicious files and ban uploaders

### Edge Function Security

- [ ] **Verify JWT verification status**
  - Review `supabase/config.toml`
  - Confirm all sensitive functions have `verify_jwt = true`
  - Only `send-support-email` should have `verify_jwt = false`
  - Action: Enable JWT on any unprotected functions

- [ ] **Check rate limit violations**
  - Search logs for `rate_limit_exceeded` events
  - Identify repeat offenders by IP address
  - Action: Extend rate limits or block abusive IPs

---

## 🟡 Quarterly Security Reviews

### Code Security Audit

- [ ] **Review all dangerouslySetInnerHTML usage**
  - Search codebase: `grep -r "dangerouslySetInnerHTML" src/`
  - Verify only static developer-controlled content (blog posts, charts)
  - Action: Add DOMPurify if user-generated content is added

- [ ] **Audit input validation schemas**
  - Review all Zod schemas in `src/`
  - Verify length limits, format validation, sanitization
  - Check file upload validation in `Support.tsx`
  - Action: Strengthen validation where needed

- [ ] **Check for hardcoded secrets**
  - Run: `git grep -i "api.key\|secret\|password" src/`
  - Verify no API keys, passwords, or secrets in code
  - Action: Move any secrets to Supabase secrets immediately

- [ ] **Review CORS configurations**
  - Check all edge functions have proper CORS headers
  - Verify `Access-Control-Allow-Origin: *` is intentional
  - Action: Restrict CORS to specific domains if needed

### Dependency Security

- [ ] **Update dependencies**
  - Run: `npm outdated`
  - Update all packages to latest stable versions
  - Focus on security-related packages (Stripe, Supabase, Zod)
  - Action: Test thoroughly after updates

- [ ] **Check for known vulnerabilities**
  - Run: `npm audit`
  - Review all high and critical severity issues
  - Action: Fix or mitigate all vulnerabilities

- [ ] **Verify Stripe API version**
  - Check edge functions use latest: `2025-08-27.basil`
  - Review Stripe changelog for security updates
  - Action: Update to latest stable version

### Access Control Review

- [ ] **Audit user permissions**
  ```sql
  SELECT 
    u.email,
    ur.role,
    ur.subscription_tier,
    ur.subscription_expires_at
  FROM auth.users u
  JOIN public.user_roles ur ON ur.user_id = u.id
  WHERE ur.role != 'free'
  ORDER BY ur.created_at DESC
  LIMIT 50;
  ```
  - Verify all premium/admin users are authorized
  - Check for expired subscriptions still active
  - Action: Downgrade/revoke unauthorized access

- [ ] **Review support ticket access**
  ```sql
  SELECT 
    COUNT(*) as ticket_count,
    user_id
  FROM public.support_tickets
  GROUP BY user_id
  HAVING COUNT(*) > 10
  ORDER BY ticket_count DESC;
  ```
  - Identify users with excessive support tickets (potential abuse)
  - Action: Investigate and limit if necessary

### Monitoring & Logging

- [ ] **Review security event logs**
  - Check for `sql_injection_attempt`, `xss_attempt` events
  - Analyze patterns in `suspicious_activity` events
  - Action: Block IPs with repeated attacks

- [ ] **Verify logging is working**
  - Confirm edge function logs are accessible
  - Test that security events are being logged
  - Action: Fix any logging failures immediately

- [ ] **Check log retention**
  - Verify logs are retained for compliance (90 days minimum)
  - Action: Configure backup or export if needed

---

## 🟢 Annual Security Assessment

### Comprehensive Penetration Testing

- [ ] **Authentication bypass testing**
  - Attempt to access protected routes without authentication
  - Try to forge JWT tokens
  - Test session fixation vulnerabilities
  - Action: Fix any bypass vulnerabilities

- [ ] **Authorization testing**
  - Test horizontal privilege escalation (access other users' data)
  - Test vertical privilege escalation (free → premium, user → admin)
  - Verify RLS policies prevent unauthorized access
  - Action: Strengthen authorization checks

- [ ] **SQL injection testing**
  - Test all input fields with SQL injection payloads
  - Verify Supabase client methods prevent injection
  - Test RPC calls with malicious parameters
  - Action: Add validation where needed

- [ ] **XSS testing**
  - Test all input fields with XSS payloads
  - Check HTML email rendering (support system)
  - Verify escapeHtml function works correctly
  - Action: Fix any XSS vulnerabilities

- [ ] **CSRF testing**
  - Verify state-changing operations require authentication
  - Check sensitive operations have CSRF protection
  - Action: Implement CSRF tokens if needed

- [ ] **Rate limiting testing**
  - Test all public endpoints exceed rate limits
  - Verify rate limiting works per IP
  - Test distributed rate limit bypass
  - Action: Strengthen rate limiting

### Infrastructure Security

- [ ] **Review Supabase project security settings**
  - Confirm leaked password protection is enabled
  - Check email verification is required (disable auto-confirm for production)
  - Verify CAPTCHA is enabled for sign-ups
  - Action: Enable all production security settings

- [ ] **Review DNS and domain configuration**
  - Verify SSL/TLS certificates are valid
  - Check for DNS hijacking vulnerabilities
  - Ensure HSTS is enabled
  - Action: Fix any DNS/SSL issues

- [ ] **Backup and disaster recovery testing**
  - Test database restoration from backup
  - Verify point-in-time recovery works
  - Test edge function redeployment
  - Action: Document and improve recovery procedures

### Compliance Review

- [ ] **Privacy policy compliance**
  - Review privacy policy for accuracy
  - Verify GDPR compliance (UK)
  - Check cookie consent implementation
  - Action: Update policies as needed

- [ ] **Data retention compliance**
  - Verify user data deletion process works
  - Check support ticket retention (90 days)
  - Test scan data cleanup
  - Action: Implement automated cleanup if needed

- [ ] **Third-party audit**
  - Consider hiring external security auditor
  - Review their findings and recommendations
  - Action: Implement high-priority recommendations

---

## 🚨 Incident Response Checklist

### When Security Issue Detected

1. **Immediate Actions** (within 1 hour)
   - [ ] Identify scope and severity of issue
   - [ ] Document initial findings
   - [ ] Notify technical team
   - [ ] Disable affected feature if critical

2. **Investigation** (within 4 hours)
   - [ ] Review relevant logs
   - [ ] Identify affected users
   - [ ] Determine attack vector
   - [ ] Assess data exposure

3. **Remediation** (within 24 hours)
   - [ ] Develop and test fix
   - [ ] Deploy security patch
   - [ ] Verify issue is resolved
   - [ ] Update security documentation

4. **Post-Incident** (within 1 week)
   - [ ] Notify affected users if required
   - [ ] Update security policies
   - [ ] Implement preventive measures
   - [ ] Conduct post-mortem review

---

## 📊 Security Metrics to Track

Track these metrics over time to identify trends:

| Metric | Frequency | Target | Alert Threshold |
|--------|-----------|--------|-----------------|
| Failed login attempts per day | Daily | <100 | >500 |
| Rate limit violations per day | Daily | <50 | >200 |
| Support tickets per user avg | Weekly | <3 | >10 |
| File uploads per user avg | Weekly | <5 | >20 |
| Admin account count | Monthly | <5 | >10 |
| Unauthorized access attempts | Daily | 0 | >10 |
| Security linter findings | Weekly | 0 critical | >1 critical |

---

## 🔧 Security Maintenance Tasks

### Weekly
- Review edge function error logs
- Check rate limit violation patterns
- Monitor file upload trends

### Monthly
- Run security linter
- Review admin accounts
- Check failed login patterns
- Audit storage policies

### Quarterly
- Update dependencies
- Review code for security issues
- Test authentication flows
- Audit user permissions

### Annually
- Comprehensive penetration testing
- Third-party security audit
- Disaster recovery testing
- Compliance review

---

## 📝 Notes

**Last Updated:** 2025-10-16  
**Next Quarterly Review:** [Set date 3 months from now]  
**Next Annual Review:** [Set date 1 year from now]  

**Security Contact:** [Add security team contact]  
**Incident Reporting:** [Add incident reporting process]

---

## ✅ Audit Completion Sign-Off

| Date | Auditor | Type | Findings | Status |
|------|---------|------|----------|--------|
| | | Monthly | | |
| | | Quarterly | | |
| | | Annual | | |
