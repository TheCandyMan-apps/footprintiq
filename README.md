# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/93bce7e7-a3f9-4ffb-8036-32425962a83f

## 📘 API Docs & Launch Blog

FootprintIQ now includes comprehensive API documentation and a launch blog post:

- **[API Documentation](/docs/api):** Complete REST API reference with authentication, endpoints, and examples
- **[Persona DNA Launch Blog](/blog/persona-dna-and-evidence-packs):** Announcement of Atlas Expansion features

Both pages are fully SEO optimized with structured data, OG tags, and canonical URLs.

## 🔐 Environment Setup

Before running the application, set up your environment variables:

1. **Copy the example file:**
   ```sh
   cp .env.example .env
   ```

2. **Fill in required values:**
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` - Anon/public key (safe for client)
   - `VITE_SUPABASE_PROJECT_ID` - Project identifier
   - Optional: `VITE_APIFY_API_TOKEN` for username scanner

3. **Never commit secrets:**
   - `.env` files are git-ignored
   - Pre-commit hooks block `SUPABASE_SERVICE_ROLE_KEY` and `STRIPE_SECRET_KEY`
   - Only `VITE_*` variables are exposed to the browser

## 🛡️ Security Checklist

### Row-Level Security (RLS)
- ✅ RLS enabled on all tables with user data
- ✅ Policies use `auth.uid()` for user isolation  
- ✅ Security definer functions prevent recursive checks
- ✅ Admin access via `user_roles` table (never client-side checks)
- ✅ Regular audits via `/admin/rls-check` page

### Environment Variables
- ✅ Public keys prefixed with `VITE_` (client-safe)
- ✅ Secret keys never committed (`.gitignore` + pre-commit hooks)
- ✅ Config validated at boot (`src/lib/config.ts`)
- ✅ Health check endpoint at `/functions/v1/health`

## 🔌 Provider System

FootprintIQ uses a unified provider framework with 20+ data enrichment APIs:

- **Circuit breakers**: Automatic 60s cooldown after 5 consecutive failures
- **Rate limiting**: Token bucket (30 calls/min per provider)
- **Caching**: Per-provider TTL-based caching
- **Quotas & budgets**: Daily quotas (500 calls) and monthly budgets (£50)
- **Policy gates**: Dark web (`ALLOW_DARKWEB_SOURCES`) and enterprise toggles
- **Unified Finding Model (UFM)**: Standardized output across all providers

### Admin Console
- `/admin/providers` - Configure and monitor all providers
- `/admin/observability` - Real-time metrics dashboard
- `/admin/rls-check` - RLS policy verification

### Verification
```bash
npm run verify:providers
```
Generates HTML report at `verification/providers-report.html`

## 🤖 Bot Protection (Cloudflare Turnstile)

FootprintIQ uses Cloudflare Turnstile for bot protection on signup and scan flows.

### Configuration

1. **Client-side**: Set `VITE_TURNSTILE_SITE_KEY` in your environment
2. **Server-side**: Set `CLOUDFLARE_TURNSTILE_SECRET` in Edge Function secrets

### Gating Logic

- **Free tier users**: Turnstile verification required
- **Pro/Business/Analyst/Admin users**: Bypass verification
- **Unauthenticated users**: Verification required

### Components

| File | Purpose |
|------|---------|
| `src/components/auth/TurnstileGate.tsx` | Reusable verification widget |
| `src/hooks/useTurnstile.tsx` | Core hook for widget management |
| `src/hooks/useTurnstileGating.tsx` | Plan-aware gating logic |

### Usage Example

```tsx
import { TurnstileGate, TurnstileGateRef } from '@/components/auth/TurnstileGate';
import { useTurnstileGating } from '@/hooks/useTurnstileGating';

const turnstileRef = useRef<TurnstileGateRef>(null);
const { requiresTurnstile, validateToken } = useTurnstileGating();

// In JSX:
{requiresTurnstile && (
  <TurnstileGate
    ref={turnstileRef}
    onToken={setTurnstileToken}
    theme="dark"
    action="scan-start"
    inline
  />
)}
```

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/93bce7e7-a3f9-4ffb-8036-32425962a83f) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/93bce7e7-a3f9-4ffb-8036-32425962a83f) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
