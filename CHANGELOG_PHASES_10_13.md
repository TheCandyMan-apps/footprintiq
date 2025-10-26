# FootprintIQ Phases 10-13 Implementation

## Phase 10: Enterprise Infrastructure ✅ COMPLETED

### 1. Workspaces & Multi-Tenancy

#### Database Schema
Created comprehensive workspace infrastructure with full RLS policies:

**Tables Created:**
- `workspaces` - Main workspace table with subscription tiers
- `workspace_users` - RBAC with roles (owner, admin, analyst, viewer)
- `invitations` - Team member invitation system with expiry
- `workspace_api_keys` - Scoped API tokens per workspace
- `usage_counters` - Track resource consumption per workspace
- `audit_logs` - Comprehensive audit trail with metadata
- `billing_customers` - Stripe integration for subscriptions
- `retention_policies` - Data retention management

**Enums:**
- `workspace_role`: owner, admin, analyst, viewer
- `subscription_tier`: free, pro, analyst, enterprise
- `invitation_status`: pending, accepted, declined, expired

#### RBAC Implementation

**Roles & Permissions:**
- **Owner**: Full workspace control, billing management
- **Admin**: User management, API keys, audit logs, all CRUD operations
- **Analyst**: Read/write scans, cases, monitors, create investigations
- **Viewer**: Read-only access to findings and reports

**Security Features:**
- `has_workspace_permission()` - Security definer function for RLS
- Hierarchical permission model (owner > admin > analyst > viewer)
- Row-level security on all workspace tables
- Automatic workspace creation on user signup

### 2. Audit Logging System

**Features:**
- Comprehensive action tracking across all resources
- Metadata storage: IP address, user agent, timestamps
- Resource-specific tracking with IDs
- Searchable and filterable UI

**Tracked Actions:**
```typescript
- Workspace: created, updated, deleted
- Members: invited, added, removed, role_changed
- API Keys: created, revoked, used
- Scans: created, completed, deleted
- Monitors: created, paused, resumed, deleted
- Cases: created, updated, closed, evidence_added
- Billing: subscription upgraded/downgraded/cancelled
```

**UI Components:**
- `/admin/audit-logs` - Full audit log viewer
- Search by action, resource, or user
- Filter by action category
- Export capabilities

### 3. Plan Quotas & Billing

**Subscription Tiers:**

| Feature | Free | Pro | Analyst | Enterprise |
|---------|------|-----|---------|------------|
| Scans/Month | 10 | 100 | 500 | Unlimited |
| Monitors | 2 | 10 | 50 | Unlimited |
| API Calls/Hour | 100 | 1,000 | 5,000 | 10,000 |
| Team Members | 1 | 5 | 20 | Unlimited |
| Retention Days | 30 | 90 | 365 | 730 |
| AI Analyst Queries | 5 | 50 | 500 | Unlimited |
| Dark Web Access | ❌ | ✅ | ✅ | ✅ |
| SSO Enabled | ❌ | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ❌ | ✅ | ✅ |

**Quota Enforcement:**
- `getQuotas(tier)` - Get plan limits
- `canPerformAction()` - Check if action allowed
- Real-time usage tracking
- Soft limits with upgrade prompts

### 4. API Key Management

**Features:**
- Workspace-scoped API keys with prefixes
- SHA-256 hashed storage
- Configurable scopes: `read:findings`, `create:scans`, `manage:monitors`
- Rate limiting per key (configurable per hour)
- Last used tracking
- Expiration dates

**UI:**
- Create/revoke keys
- Copy-once security model
- Usage statistics
- Scope management

### 5. React Hooks & Context

**`useWorkspace()` Hook:**
```typescript
const {
  workspace,        // Current workspace
  workspaces,       // All user workspaces
  currentRole,      // User's role in workspace
  loading,          // Loading state
  error,            // Error state
  switchWorkspace,  // Switch active workspace
  refreshWorkspace, // Reload workspace data
  can,             // Permission check
} = useWorkspace();
```

**Permission Checks:**
```typescript
if (can('manage_users')) {
  // Show admin UI
}
if (can('write')) {
  // Allow data modifications
}
```

### 6. UI Pages

#### `/workspace` - Workspace Settings
- **Members Tab**: Invite team members, manage roles
- **API Keys Tab**: Create and manage API tokens
- **Billing Tab**: Subscription management
- **Settings Tab**: Workspace configuration

#### `/admin/audit-logs` - Audit Viewer
- Search by action, resource, or user
- Filter by category (workspace, members, scans, etc.)
- Real-time updates
- Export audit logs

#### `/trust` - Trust & Security Page
- Data encryption details (TLS 1.3, AES-256)
- Privacy by design practices
- Compliance certifications (SOC 2, GDPR, CCPA, ISO 27001)
- Infrastructure security
- Access control measures
- Incident response procedures

### 7. Audit Logging Helpers

**Usage Example:**
```typescript
import { logAudit, AuditActions } from '@/lib/workspace/audit';

await logAudit(workspace.id, {
  action: AuditActions.SCAN_CREATED,
  resourceType: 'scan',
  resourceId: scan.id,
  metadata: {
    query: scanQuery,
    providers: enabledProviders,
  },
});
```

### 8. Security Features

**Row-Level Security:**
- All workspace data isolated by workspace_id
- RLS policies enforce workspace boundaries
- No cross-workspace data leakage
- Security definer functions for complex checks

**PII Redaction:**
- Audit logs redact sensitive information
- IP addresses partially masked
- Email addresses partially hidden
- No raw credentials in logs

**Access Control:**
- Role-based permissions at database level
- Action-based permissions in application
- API key scoping and rate limiting
- MFA support ready

### 9. Performance Optimizations

**Database Indexes:**
```sql
- idx_workspaces_owner (owner_id)
- idx_workspace_users_workspace (workspace_id)
- idx_workspace_users_role (workspace_id, role)
- idx_audit_logs_workspace (workspace_id)
- idx_audit_logs_created (created_at DESC)
- idx_usage_counters_period (workspace_id, period_start, period_end)
```

**Query Optimization:**
- Efficient RLS with security definer functions
- Proper JOIN strategies
- Limited result sets with pagination
- Cached workspace context in React

---

## Phase 11: Browser Extension & Public API (PLANNED)

### Browser Extension
- [ ] Manifest v3 (Chrome, Edge, Firefox)
- [ ] Context menu lookup
- [ ] Popup search interface
- [ ] API token authentication
- [ ] Condensed findings display

### Public API
- [ ] OpenAPI 3.1 specification
- [ ] Swagger UI at `/api/docs`
- [ ] Rate limiting per API key
- [ ] Endpoints: `/api/v1/enrich`, `/api/v1/scan`, `/api/v1/findings`

### SDKs
- [ ] `@footprintiq/js` - TypeScript/JavaScript SDK
- [ ] `@footprintiq/python` - Python SDK with Pydantic models
- [ ] `@footprintiq/go` - Go SDK (auto-generated)

### Telemetry
- [ ] Per-endpoint latency tracking
- [ ] Error rate monitoring
- [ ] Provider quota overlay
- [ ] Developer dashboard

---

## Phase 12: Brand Protection & Takedown Kit (PLANNED)

### Brand Monitor
- [ ] SecurityTrails domain monitoring
- [ ] WHOISXML domain tracking
- [ ] Certificate Transparency log scanning
- [ ] Keyword-based alerts

### Phishing Detector
- [ ] URLScan integration
- [ ] VirusTotal URL scanning
- [ ] Levenshtein distance matching
- [ ] Registration date heuristics
- [ ] SPF/DKIM/DMARC checks

### Takedown Automator
- [ ] Email templates for registrars
- [ ] Hosting provider abuse contacts
- [ ] Zendesk/Jira webhook integration
- [ ] Resend API for verified sending
- [ ] Status tracking dashboard

### Evidence Pack v3
- [ ] URLScan screenshot references
- [ ] WHOIS details
- [ ] Timeline visualization
- [ ] JSON manifest with hashes
- [ ] Legal-ready formatting

---

## Phase 13: Community & Marketplace (PLANNED)

### Community Hub
- [ ] `/community` - Public investigation feed
- [ ] User-approved case sharing
- [ ] Comments and discussion threads
- [ ] Follow system
- [ ] "Verify signal" reputation badges
- [ ] Weekly digest newsletter

### Marketplace
- [ ] Provider plugin directory
- [ ] GitHub submission workflow
- [ ] Sandboxed plugin execution
- [ ] Schema validation
- [ ] Revenue sharing (85/15 split)
- [ ] "Verified Partner" badges

### Growth Systems
- [ ] Referral link tracking (UTM)
- [ ] Credit system for rewards
- [ ] Affiliate program dashboard
- [ ] Partner onboarding flow

### Community Moderation
- [ ] Community guidelines
- [ ] Moderator roles
- [ ] Abuse report system
- [ ] Privacy protections
- [ ] Content moderation tools

---

## Technical Stack

### Backend
- **Database**: PostgreSQL with Supabase
- **Authentication**: Supabase Auth with RLS
- **Edge Functions**: Deno runtime
- **Storage**: Supabase Storage

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State**: TanStack Query
- **Routing**: React Router v6

### Infrastructure
- **Hosting**: Vercel/Netlify
- **Database**: Supabase Cloud
- **CDN**: Global edge network
- **Monitoring**: Built-in observability

---

## Testing Requirements

### Phase 10 Tests
- [ ] RBAC permission matrix validation
- [ ] RLS policy enforcement tests
- [ ] API key rate limiting
- [ ] Audit log completeness
- [ ] Quota enforcement
- [ ] Workspace isolation

### Integration Tests
- [ ] User invitation flow
- [ ] API key creation and usage
- [ ] Workspace switching
- [ ] Billing webhook handling
- [ ] Data retention policies

---

## Deployment Checklist

### Phase 10 Deployment
- [x] Database migration applied
- [x] RLS policies enabled
- [x] Workspace UI deployed
- [x] Audit logging active
- [ ] Stripe webhooks configured
- [ ] Email templates for invitations
- [ ] SSO configuration (Enterprise)

### Configuration Required
```env
# Stripe (for billing)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (for invitations)
RESEND_API_KEY=re_...

# SSO (Enterprise)
OIDC_CLIENT_ID=...
OIDC_CLIENT_SECRET=...
SAML_CERTIFICATE=...
```

---

## Migration Notes

### For Existing Users
1. Auto-migration creates default workspace on next login
2. All existing scans/cases automatically assigned to personal workspace
3. User becomes workspace owner with full permissions
4. No data loss or downtime

### For New Users
1. Workspace created automatically on signup
2. Default "free" tier assigned
3. Can invite team members immediately
4. Upgrade path clear with quota indicators

---

## API Usage Examples

### Create API Key
```typescript
const apiKey = `fpiq_${crypto.randomUUID().replace(/-/g, '')}`;
await supabase.from('workspace_api_keys').insert({
  workspace_id: workspace.id,
  name: 'Production API',
  key_hash: hashKey(apiKey),
  key_prefix: apiKey.substring(0, 12),
  scopes: ['read:findings', 'create:scans'],
});
```

### Check Permissions
```typescript
const { can } = useWorkspace();

if (can('manage_users')) {
  // Show team management UI
}
```

### Log Audit Event
```typescript
await logAudit(workspace.id, {
  action: AuditActions.MEMBER_REMOVED,
  resourceType: 'workspace_user',
  metadata: { user_id: removedUserId },
});
```

---

## Future Enhancements

### Phase 14+
- Real-time collaboration (WebSocket)
- Advanced analytics dashboard
- Custom provider plugins
- White-label solutions
- On-premise deployment
- SIEM integrations
- Mobile apps (iOS/Android)

---

## Support & Documentation

### Resources
- Documentation: `/docs`
- API Docs: `/api/docs`
- Trust Center: `/trust`
- Support: `support@footprintiq.com`
- Security: `security@footprintiq.com`

### Community
- GitHub: Issues and discussions
- Discord: Real-time community support
- Newsletter: Weekly updates and tips

---

**Last Updated**: 2025-01-26  
**Version**: Phase 10 Complete, Phases 11-13 Planned
