/**
 * Contextual help copy - centralized registry for all help text, tooltips, and documentation
 */

export interface HelpEntry {
  key: string;
  title: string;
  content: string;
  category: "Search" | "Results" | "Graph" | "Monitoring" | "Admin" | "AI" | "Reports" | "Security";
  tags?: string[];
}

// Centralized help registry
export const HELP_ENTRIES: Record<string, HelpEntry> = {
  search_bar: {
    key: "search_bar",
    title: "Search Bar",
    content: "Type any artifact (email, username, domain, IP, phone) — we'll auto-detect the type and query relevant providers automatically.",
    category: "Search",
    tags: ["input", "search", "artifact", "detection"]
  },
  risk_score: {
    key: "risk_score",
    title: "Risk Score",
    content: "0–100 composite score calculated from severity, recency, and corroboration across multiple data sources. Higher scores indicate greater potential risk.",
    category: "Results",
    tags: ["score", "risk", "severity", "analysis"]
  },
  reliability: {
    key: "reliability",
    title: "Reliability Score",
    content: "Reflects data quality heuristics and agreement confidence across providers. Higher reliability means more trustworthy findings.",
    category: "Results",
    tags: ["confidence", "quality", "trust"]
  },
  darkweb_badge: {
    key: "darkweb_badge",
    title: "Dark Web Signal",
    content: "Aggregated dark web metadata signal indicating potential exposure in underground forums or marketplaces. No raw credentials are displayed. Enable in Admin → Policies.",
    category: "Security",
    tags: ["darkweb", "breach", "exposure"]
  },
  provider_method: {
    key: "provider_method",
    title: "Provider Methods",
    content: "HEAD = fast existence check, GET = page heuristics extraction, Apify = JavaScript-rendered fallback for dynamic content.",
    category: "Search",
    tags: ["providers", "methods", "technical"]
  },
  budget_guard: {
    key: "budget_guard",
    title: "Budget Protection",
    content: "Automatically stops scans when your workspace hits configured budget thresholds to prevent cost overruns.",
    category: "Admin",
    tags: ["budget", "cost", "limits", "billing"]
  },
  monitor_create: {
    key: "monitor_create",
    title: "Continuous Monitoring",
    content: "Re-scan targets on a schedule and receive alerts when new high-risk findings appear. Perfect for ongoing surveillance.",
    category: "Monitoring",
    tags: ["monitoring", "alerts", "watchlist", "automation"]
  },
  graph_expand: {
    key: "graph_expand",
    title: "Graph Expansion",
    content: "Expand connected entities from selected providers to discover relationships. Hold Shift to select and expand multiple nodes simultaneously.",
    category: "Graph",
    tags: ["graph", "visualization", "relationships", "network"]
  },
  evidence_pack: {
    key: "evidence_pack",
    title: "Evidence Pack",
    content: "Cryptographically signed bundle with SHA-256 hashes and complete timeline metadata for legal evidence submission.",
    category: "Reports",
    tags: ["evidence", "export", "legal", "forensics"]
  },
  persona_dna: {
    key: "persona_dna",
    title: "Persona DNA",
    content: "Behavioral fingerprint derived from digital presence patterns and activity across multiple platforms and sources.",
    category: "AI",
    tags: ["behavior", "patterns", "fingerprint", "analysis"]
  },
  threat_intel: {
    key: "threat_intel",
    title: "Threat Intelligence",
    content: "External indicators from threat feeds (OTX, MISP, Shodan, GreyNoise) to identify compromised or malicious entities.",
    category: "Security",
    tags: ["threats", "intelligence", "feeds", "indicators"]
  },
  timeline: {
    key: "timeline",
    title: "Timeline View",
    content: "Chronological view of all findings, scans, monitors and intelligence hits to track activity over time.",
    category: "Results",
    tags: ["timeline", "chronology", "history", "tracking"]
  },
  workspace: {
    key: "workspace",
    title: "Workspace",
    content: "Isolated environment for team collaboration with shared quotas, policies, and role-based access control.",
    category: "Admin",
    tags: ["team", "collaboration", "environment", "organization"]
  },
  rbac: {
    key: "rbac",
    title: "Role-Based Access Control",
    content: "Role-based access control: Admin, Analyst, or Viewer permissions to control feature and data access.",
    category: "Admin",
    tags: ["roles", "permissions", "access", "security"]
  },
  case_notes: {
    key: "case_notes",
    title: "Case Notes",
    content: "Collaborative notes with timestamps; supports @mentions and markdown formatting for team coordination.",
    category: "Reports",
    tags: ["notes", "collaboration", "markdown", "comments"]
  },
  correlation_engine: {
    key: "correlation_engine",
    title: "Correlation Engine",
    content: "Links related entities using graph algorithms and ML similarity scoring to surface hidden connections.",
    category: "AI",
    tags: ["ml", "correlation", "patterns", "intelligence"]
  },
  export_data: {
    key: "export_data",
    title: "Export Data",
    content: "Download results as JSON, CSV, or Evidence Pack v4 (cryptographically signed ZIP bundle).",
    category: "Reports",
    tags: ["export", "download", "formats", "data"]
  },
  command_palette: {
    key: "command_palette",
    title: "Command Palette",
    content: "Press ⌘K (Mac) or Ctrl+K (Windows/Linux) to access quick actions, navigation, and features from anywhere in the app.",
    category: "Search",
    tags: ["shortcuts", "navigation", "keyboard", "productivity"]
  },
  explain_feature: {
    key: "explain_feature",
    title: "Explain ✨",
    content: "AI-powered explanations for findings, scores, and technical concepts. Click the sparkle icon anywhere for instant help.",
    category: "AI",
    tags: ["ai", "explain", "help", "learning"]
  },
  plugins_marketplace: {
    key: "plugins_marketplace",
    title: "Plugin Marketplace",
    content: "Community-contributed providers that extend FootprintIQ functionality. All plugins run in a secure sandbox with strict timeout and size limits.",
    category: "Admin",
    tags: ["plugins", "extensions", "community", "marketplace", "sandbox"]
  },
  sandbox_security: {
    key: "sandbox_security",
    title: "Plugin Sandbox Security",
    content: "Plugins execute in isolated environments with 15s timeouts, 5MB limits, and no access to sensitive data or network beyond approved permissions.",
    category: "Security",
    tags: ["sandbox", "security", "isolation", "plugins"]
  },
  guided_tours: {
    key: "guided_tours",
    title: "Guided Tours",
    content: "Interactive walkthroughs for first-time users. Access via Help menu or press ⌘K and search for 'tour'.",
    category: "Search",
    tags: ["onboarding", "tutorial", "help", "learning"]
  }
};

// Legacy simple HELP object for backward compatibility
export const HELP: Record<string, string> = Object.entries(HELP_ENTRIES).reduce((acc, [key, entry]) => {
  acc[key] = entry.content;
  return acc;
}, {} as Record<string, string>);

export type HelpKey = keyof typeof HELP;
