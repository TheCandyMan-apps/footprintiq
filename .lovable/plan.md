

## Refactor: Telegram Worker Health → Telegram Intelligence Status

### What Changes

The `TelegramHealthIndicator` component in `TelegramTab.tsx` will be updated with user-friendly language and an optional admin debug toggle. No backend changes needed.

### UI Label Changes

| Current (Infrastructure) | New (Intelligence) |
|---|---|
| "Telegram Worker Health" | "Telegram Intelligence Status" |
| "Worker online" | "Data source operational" |
| "Worker offline / unauthorized" | "Data source unavailable" |
| "Checking worker..." | "Checking status..." |
| "Worker status unknown" | "Status unknown" |
| "Findings stored" | "Scan findings recorded" |
| "Username not found" | "No public profile found" |
| "Results pending" | "Analysis in progress" |
| "No results returned" | "Analysis timed out" |
| "Not triggered" | "Not yet scanned" |

### Description Text Changes

| Current | New |
|---|---|
| "Telegram worker unavailable — retrigger may fail." | "Telegram data source is currently unreachable. Scans may be limited." |
| "Worker online — no saved Telegram findings..." | "Public Telegram data is accessible — no findings recorded for this scan yet." |
| "Worker online and findings are stored for this scan." | "Data source operational and scan findings have been recorded." |
| "Worker online — results are being processed." | "Data source operational — analysis is in progress." |
| "Worker ran but the username could not be resolved on Telegram." | "The username could not be found on public Telegram." |

### Admin Debug Toggle

A small "Show diagnostics" text button will be added at the bottom of the card, visible only when a debug flag is active (e.g., `localStorage.getItem('fpiq_debug') === 'true'`). When toggled, it reveals the raw worker status (`workerOnline`, `findingsStatus`, `triggeredAt` timestamp) in a muted code block. This keeps low-level info accessible for admins without cluttering the user view.

### Icon Change

Replace the `Activity` icon in the card header with `Shield` (from lucide-react) to reinforce the intelligence/security framing.

### Files Modified

- **`src/components/scan/results-tabs/TelegramTab.tsx`** — All changes are within the `TelegramHealthIndicator` function (lines ~600-755). Only UI labels, descriptions, icon, and the debug toggle are affected. Backend health-check logic remains untouched.

