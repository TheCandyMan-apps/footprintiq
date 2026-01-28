

# App.tsx Route Cleanup Plan

## Overview

This plan addresses the routing issues in `src/App.tsx` identified in the platform review. The file contains **543 lines** with multiple duplicate routes and component conflicts that can cause confusion and maintenance issues.

## Problem Summary

| Issue Type | Count | Risk Level |
|------------|-------|------------|
| Exact duplicate routes (same path, same component) | 3 | Very Low |
| Conflicting routes (same path, different components) | 5 | Low-Medium |
| Inline placeholder overriding real component | 1 | Bug |

---

## Phase 1: Remove Exact Duplicates (Zero Risk)

These routes are defined twice with the same component. React Router uses first-match-wins, so the second definition is unreachable dead code.

| Path | Lines | Action |
|------|-------|--------|
| `/auth` | 292, 293 | Remove line 293 |
| `/404` | 520, 521 | Remove line 521 |
| `/settings/billing` | 374, 391 | Remove line 391 |
| `/api-docs` | 384, 394 | Remove line 394 |
| `/settings/api-keys` | 375, 395 | Remove line 395 |
| `/dark-web-monitoring` | 338, 393 | Remove line 393 |

---

## Phase 2: Resolve Conflicting Routes

### 2.1 `/integrations` Bug (Critical)

**Current State:**
- Line 406: `<Route path="/integrations" element={<Integrations />} />`
- Line 511: `<Route path="/integrations" element={<div className="...">Integrations coming soon</div>} />`

**Analysis:** The `Integrations.tsx` component is a full 546-line page with webhook management, API integrations, and Slack/Discord setup. The inline "coming soon" placeholder is dead code.

**Action:** Remove line 511 (inline placeholder).

---

### 2.2 `/workspaces` Conflict

**Current State:**
- Line 436: `<Route path="/workspaces" element={<Workspaces />} />`
- Line 514: `<Route path="/workspaces" element={<OrganizationNew />} />`

**Analysis:**
- `Workspaces.tsx` (317 lines): Full workspace management with member invitations, case management, and workspace switching.
- `OrganizationNew.tsx` (268 lines): Workspace creation wizard focused on new workspace setup.

**Recommendation:** Keep `Workspaces` at `/workspaces` (line 436). If `OrganizationNew` functionality is needed, expose it at a new path like `/workspaces/new`.

**Action:** Remove line 514 or change to `/workspaces/new`.

---

### 2.3 `/admin/observability` Conflict

**Current State:**
- Line 427: `<Route path="/admin/observability" element={<Observability />} />`
- Line 459: `<Route path="/admin/observability" element={<ObservabilityDashboard />} />`

**Analysis:**
- `Observability.tsx` (422 lines): Real-time metrics, provider health charts, and performance monitoring.
- `ObservabilityDashboard.tsx` (471 lines): SLO definitions, incident management, and alert configuration.

**Recommendation:** Both pages serve distinct purposes. Keep `Observability` at `/admin/observability` and move `ObservabilityDashboard` to `/admin/incidents` or `/admin/slo`.

**Action:** Change line 459 to use a different path (e.g., `/admin/incidents`).

---

### 2.4 `/admin/roles` Conflict

**Current State:**
- Line 417: `<Route path="/admin/roles" element={<RoleManagement />} />`
- Line 474: `<Route path="/admin/roles" element={<Admin />} />`

**Analysis:** `RoleManagement.tsx` is a dedicated role management page. The `Admin` component is a general admin dashboard that likely has its own roles section.

**Recommendation:** Keep `RoleManagement` at `/admin/roles` (more specific). The generic `Admin` component is already at `/admin` (line 475).

**Action:** Remove line 474.

---

## Phase 3: Implementation Steps

1. **Backup first** - The changes are low-risk, but having a restore point is good practice.

2. **Remove dead duplicate routes:**
   - Delete lines: 293, 391, 393, 394, 395, 521

3. **Remove inline placeholder:**
   - Delete line 511 (`/integrations` coming soon)

4. **Resolve workspace conflict:**
   - Delete line 514 OR rename to `/workspaces/new`

5. **Resolve observability conflict:**
   - Change line 459 from `/admin/observability` to `/admin/incidents`

6. **Resolve roles conflict:**
   - Delete line 474

7. **Test critical routes:**
   - `/auth` - Login flow
   - `/integrations` - Full integrations page loads
   - `/workspaces` - Workspace management
   - `/admin/observability` - Metrics dashboard
   - `/admin/roles` - Role management

---

## Technical Details

### Files Modified
- `src/App.tsx` (only file)

### Lines Removed (8 total)
- 293, 391, 393, 394, 395, 474, 511, 514, 521

### Lines Modified (1 total)
- 459: Path change from `/admin/observability` to `/admin/incidents`

### Estimated Time
- Implementation: ~5 minutes
- Testing: ~10 minutes

---

## Risk Assessment

| Change | Risk | Reason |
|--------|------|--------|
| Remove duplicate `/auth` | None | Dead code (never reached) |
| Remove duplicate `/404` | None | Dead code (never reached) |
| Remove duplicate settings routes | None | Dead code (never reached) |
| Remove inline integrations placeholder | None | Bug fix (restores intended behavior) |
| Resolve `/workspaces` | Low | Need to verify no deep links exist to OrganizationNew |
| Resolve `/admin/observability` | Low | Admin pages, limited user access |
| Resolve `/admin/roles` | None | Dead code (never reached) |

**Overall Risk: 1-2%** - All changes either remove dead code or fix obvious bugs.

---

## Optional Future Improvements (Not in Scope)

1. **Route Refactoring**: Extract routes into separate files (`adminRoutes.tsx`, `blogRoutes.tsx`, etc.) for better maintainability.

2. **Bundle Optimization**: Group legal pages (Privacy, Terms, DPA) into a single lazy chunk to reduce network waterfall.

3. **AdminNav Updates**: Ensure all admin pages use the consolidated AdminNav sidebar.

