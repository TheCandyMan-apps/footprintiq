import { Tour } from "./types";

export const TOURS: Record<string, Tour> = {
  onboarding: {
    id: "onboarding",
    name: "Welcome to FootprintIQ",
    description: "Get started with your first OSINT investigation",
    steps: [
      {
        id: "welcome",
        sel: "[data-tour='search-bar']",
        title: "Welcome to FootprintIQ",
        body: "FootprintIQ helps you investigate digital footprints across the internet. Let's start with a quick tour.",
        placement: "bottom"
      },
      {
        id: "search",
        sel: "[data-tour='search-input']",
        title: "Search Any Artifact",
        body: "Type an email, username, domain, phone, or IP address. We'll auto-detect the type and query relevant providers.",
        placement: "bottom"
      },
      {
        id: "providers",
        sel: "[data-tour='provider-select']",
        title: "Choose Your Providers",
        body: "Select which OSINT providers to query. Different providers excel at different artifact types.",
        placement: "right"
      },
      {
        id: "scan",
        sel: "[data-tour='scan-button']",
        title: "Launch Your Investigation",
        body: "Click Scan to start querying providers. You'll see real-time progress as results come in.",
        placement: "top"
      },
      {
        id: "command",
        sel: "[data-tour='command-palette']",
        title: "Quick Actions with ⌘K",
        body: "Press Cmd+K (or Ctrl+K) anytime to access quick actions, navigation, and features.",
        placement: "bottom"
      }
    ]
  },
  search: {
    id: "search",
    name: "Search & Scanning",
    description: "Learn how to perform OSINT investigations",
    steps: [
      {
        id: "auto-detect",
        sel: "[data-tour='search-input']",
        title: "Auto-Detection",
        body: "Our system automatically detects artifact types (email, username, domain, phone, IP) as you type.",
        placement: "bottom"
      },
      {
        id: "budget",
        sel: "[data-tour='budget-guard']",
        title: "Budget Protection",
        body: "Set budget limits to control scan costs. Scans automatically stop when thresholds are reached.",
        placement: "left"
      },
      {
        id: "saved-scans",
        sel: "[data-tour='saved-scans']",
        title: "Scan History",
        body: "Access your previous scans here. All results are saved and searchable.",
        placement: "right"
      }
    ]
  },
  results: {
    id: "results",
    name: "Understanding Results",
    description: "Navigate and analyze scan findings",
    steps: [
      {
        id: "risk-score",
        sel: "[data-tour='risk-score']",
        title: "Risk Score",
        body: "0–100 composite score based on severity, recency, and corroboration across sources.",
        placement: "left"
      },
      {
        id: "findings",
        sel: "[data-tour='findings-list']",
        title: "Findings Overview",
        body: "All discoveries organized by severity. Click any finding for detailed information.",
        placement: "right"
      },
      {
        id: "filters",
        sel: "[data-tour='finding-filters']",
        title: "Filter & Sort",
        body: "Narrow results by severity, provider, category, or custom criteria.",
        placement: "left"
      },
      {
        id: "export",
        sel: "[data-tour='export-controls']",
        title: "Export Evidence",
        body: "Generate PDF reports or create signed evidence packs for legal submission.",
        placement: "top"
      }
    ]
  },
  graph: {
    id: "graph",
    name: "Graph Explorer",
    description: "Visualize entity relationships",
    steps: [
      {
        id: "nodes",
        sel: "[data-tour='graph-canvas']",
        title: "Entity Network",
        body: "Entities (emails, domains, IPs) are shown as nodes. Lines represent relationships discovered during scans.",
        placement: "top"
      },
      {
        id: "expand",
        sel: "[data-tour='graph-expand']",
        title: "Expand Connections",
        body: "Click any node to expand its connections. Hold Shift to select multiple nodes for bulk expansion.",
        placement: "right"
      },
      {
        id: "layout",
        sel: "[data-tour='graph-layout']",
        title: "Layout Controls",
        body: "Switch between force-directed, hierarchical, or circular layouts to better visualize relationships.",
        placement: "left"
      }
    ]
  },
  monitor: {
    id: "monitor",
    name: "Continuous Monitoring",
    description: "Set up automated surveillance",
    steps: [
      {
        id: "watchlist",
        sel: "[data-tour='watchlist-create']",
        title: "Create Watchlists",
        body: "Monitor targets continuously. Schedule re-scans to detect new findings automatically.",
        placement: "right"
      },
      {
        id: "alerts",
        sel: "[data-tour='alert-config']",
        title: "Alert Configuration",
        body: "Get notified when high-risk findings appear. Configure thresholds and notification channels.",
        placement: "left"
      },
      {
        id: "diff",
        sel: "[data-tour='monitor-diff']",
        title: "Change Detection",
        body: "Compare scans over time to see what's new, changed, or resolved since your last check.",
        placement: "top"
      }
    ]
  },
  admin: {
    id: "admin",
    name: "Admin Features",
    description: "Manage workspace and team settings",
    steps: [
      {
        id: "providers",
        sel: "[data-tour='admin-providers']",
        title: "Provider Management",
        body: "Configure API keys, enable/disable providers, and monitor usage costs per provider.",
        placement: "right",
        role: "admin"
      },
      {
        id: "roles",
        sel: "[data-tour='admin-roles']",
        title: "Role-Based Access",
        body: "Control who can access sensitive providers and features based on role assignments.",
        placement: "right",
        role: "admin"
      },
      {
        id: "audit",
        sel: "[data-tour='admin-audit']",
        title: "Audit Logs",
        body: "Track all workspace activity including scans, exports, and configuration changes.",
        placement: "left",
        role: "admin"
      }
    ]
  },
  reports: {
    id: "reports",
    name: "Report Generation",
    description: "Create professional investigation reports",
    steps: [
      {
        id: "builder",
        sel: "[data-tour='report-builder']",
        title: "Narrative Builder",
        body: "Drag findings into sections to build your case story. Organize by timeline, severity, or custom categories.",
        placement: "right"
      },
      {
        id: "ai-assist",
        sel: "[data-tour='ai-report']",
        title: "AI Report Generator",
        body: "Let AI draft executive summaries, technical details, and recommendations based on your findings.",
        placement: "left"
      },
      {
        id: "export",
        sel: "[data-tour='report-export']",
        title: "Export Options",
        body: "Generate PDF reports, PowerPoint slides, or signed evidence packs with cryptographic verification.",
        placement: "top"
      }
    ]
  }
};
