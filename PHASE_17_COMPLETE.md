# Phase 17 Complete: Plugin Sandbox + Guided Tour + Help System

## ✅ Implementation Summary

### 1. Plugin Sandbox (Secure Execution Environment)

**Edge Functions Created:**
- `sandbox-execute` - Executes untrusted plugins with strict security controls
- `sandbox-health` - Health check endpoint for sandbox status

**Security Features:**
- 15-second timeout per execution
- 5MB response size limit
- Isolated execution environment
- No access to cookies, auth, or PII
- Rate limiting by origin + API token
- Comprehensive audit logging

**Database:**
- `sandbox_runs` table with RLS policies
- Tracks: plugin_id, latency, status, bytes, findings_count, errors
- Admin-only access to all runs, users can view their own

**Client Library:**
- `src/lib/sandbox/client.ts` - Type-safe client for invoking sandbox
- Handles errors, timeouts, and result validation

### 2. Guided Tour System

**Core Files:**
- `src/lib/tour/types.ts` - Tour and step type definitions
- `src/lib/tour/steps.ts` - 7 pre-configured tours
- `src/hooks/useTour.ts` - Tour state management hook
- `src/components/tour/TourHighlight.tsx` - Spotlight UI component
- `src/lib/tour/firstTime.ts` - First-time user detection

**Tours Available:**
1. **Onboarding** - Welcome & basic concepts
2. **Search** - How to perform scans
3. **Results** - Understanding findings
4. **Graph** - Entity visualization
5. **Monitor** - Continuous monitoring
6. **Admin** - Workspace management (role-restricted)
7. **Reports** - Generate professional reports

**Features:**
- CSS spotlight with animated pulse
- Keyboard navigation (←/→/ESC)
- Progress persistence in localStorage
- Auto-scroll to targets
- Accessible (ARIA labels, focus management)
- Responsive popover positioning

**Routes:**
- `/onboarding` - Interactive tour launcher page
- `/onboarding?tour=search` - Specific tour selector

### 3. Centralized Help System

**Help Registry:**
- `src/lib/help/copy.ts` - Single source of truth for all help text
- 22+ help topics across 8 categories
- Structured with title, content, category, and tags

**Categories:**
- Search
- Results
- Graph
- Monitoring
- Admin
- AI
- Reports
- Security

**Help Center Page:**
- `/help` - Searchable documentation hub
- Live search across titles, content, and tags
- Category filtering
- Export to Markdown
- SEO-optimized

**UI Component:**
- `src/components/ui/help-tooltip.tsx` - Reusable tooltip component
- Pulls content from centralized registry
- Consistent styling across app

### 4. Integration Points

**Command Palette:**
- Added "Help & Learning" section
- Quick access to tours and help center
- Keyboard shortcuts for all tours

**Header Navigation:**
- Added "Help Center" link in Resources dropdown
- Positioned between Blog and Support

**First-Time User Experience:**
- Auto-detects first visit
- Redirects to onboarding tour after 1s delay
- Marks user as visited on tour completion
- Won't auto-start if tour already seen

**Data Tour Attributes Added:**
- `data-tour="search-bar"` - Main search area
- `data-tour="search-input"` - Input field
- `data-tour="provider-select"` - Provider selector (future)
- `data-tour="scan-button"` - Scan submit button
- `data-tour="command-palette"` - Quick actions button

## 🎯 Acceptance Criteria Met

| Feature | Status | Notes |
|---------|--------|-------|
| Plugin Sandbox Execution | ✅ | 15s timeout, 5MB limit, audited |
| Sandbox Security | ✅ | Isolated, no PII access, rate-limited |
| Guided Tours | ✅ | 7 tours, keyboard nav, progress tracking |
| Tour Auto-Start | ✅ | First-time users see onboarding |
| Help Center | ✅ | Searchable, categorized, exportable |
| Centralized Help Copy | ✅ | Single source, 22+ topics |
| Command Palette Integration | ✅ | Quick access to tours and help |
| Data Tour Attributes | ✅ | Key elements tagged |
| No Layout Shift | ✅ | Smooth transitions, no jumps |
| Accessibility | ✅ | ARIA labels, keyboard support |

## 📊 Statistics

- **Help Topics**: 22
- **Tour Steps Total**: 29 across 7 tours
- **Categories**: 8
- **Edge Functions**: 2 new (sandbox-execute, sandbox-health)
- **Database Tables**: 1 new (sandbox_runs)
- **UI Components**: 3 new (TourHighlight, HelpTooltip, HelpCenter page)

## 🔐 Security Notes

### Plugin Sandbox
- All community plugins run in isolated environment
- Cannot access auth tokens, cookies, or user data
- Network requests limited to approved permissions
- Automatic timeout prevents infinite loops
- Size limits prevent memory exhaustion

### RLS Policies
- Users can only view their own sandbox runs
- Admins can view all runs for monitoring
- Service role can insert audit logs

## 🚀 Usage Examples

### Starting a Tour Programmatically
```typescript
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();
navigate('/onboarding?tour=graph');
```

### Using Help Tooltips
```tsx
import { HelpTooltip } from "@/components/ui/help-tooltip";

<Label>
  Risk Score
  <HelpTooltip helpKey="risk_score" side="right" />
</Label>
```

### Executing Sandbox Plugin
```typescript
import { executeSandboxPlugin } from "@/lib/sandbox/client";

const result = await executeSandboxPlugin(
  "johndoe",
  "username",
  pluginManifest
);
```

## 🔄 Future Enhancements

1. **Plugin Marketplace UI** - Browse and install community plugins
2. **Tour Progress Dashboard** - Admin view of team onboarding completion
3. **Interactive Help** - AI-powered help that learns from user behavior
4. **Video Tours** - Embedded video walkthroughs for complex features
5. **Contextual Help** - Smart help that appears based on user actions
6. **Multi-language Support** - Localized tours and help content
7. **Plugin Analytics** - Usage stats and performance metrics
8. **Custom Tour Builder** - Let admins create custom onboarding flows

## 📝 Documentation Links

- [Lovable Docs - Visual Edits](https://docs.lovable.dev/features/visual-edit)
- [Lovable Cloud - Edge Functions](https://docs.lovable.dev/features/cloud)
- [Security Best Practices](https://docs.lovable.dev/features/security)

## 🎉 Phase 17 Complete!

All foundation tier features are now implemented. The platform has:
- ✅ Secure plugin ecosystem
- ✅ Interactive onboarding
- ✅ Comprehensive help system
- ✅ First-time user experience
- ✅ Centralized documentation

Ready for production deployment and community plugin contributions!
