/**
 * Contextual help copy - short, action-oriented micro-copy
 */

export const HELP = {
  search_bar: "Type a username, email, domain or IP. We auto-detect the type and run the right checks.",
  risk_score: "0–100 score derived from provider severity, recency and corroboration.",
  confidence_score: "How confident we are in this result based on heuristics and corroboration.",
  darkweb_badge: "Signal from metadata (no raw creds). Enable in Admin → Policies.",
  provider_method: "HEAD = fast existence check, GET = page heuristics, Apify = JS-heavy fallback.",
  reliability: "How confident we are in this result based on heuristics and corroboration.",
  monitor_create: "Re-scan targets on a schedule and alert on new high-risk findings.",
  budget_guard: "Stops scans when your plan's monthly budget threshold is reached.",
  evidence_pack: "Signed bundle with hashes, timeline and referenced artifacts.",
  graph_expand: "Pull connected entities via selected providers. Hold Shift for multi-select.",
  persona_dna: "Behavioral fingerprint derived from digital presence patterns and activity.",
  threat_intel: "External indicators from threat feeds (OTX, MISP, Shodan, GreyNoise).",
  timeline: "Chronological view of all findings, scans, monitors and intelligence hits.",
  workspace: "Isolated environment for team collaboration with shared quotas and policies.",
  rbac: "Role-based access control: Admin, Analyst, or Viewer permissions.",
  case_notes: "Collaborative notes with timestamps; supports @mentions and markdown.",
  correlation_engine: "Links related entities using graph algorithms and ML similarity.",
  export_data: "Download results as JSON, CSV, or Evidence Pack v4 (signed ZIP).",
} as const;

export type HelpKey = keyof typeof HELP;
