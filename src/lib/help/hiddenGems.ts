/**
 * Hidden Gems - Lesser-known powerful features
 */

export interface HiddenGem {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  shortcut?: string;
  route?: string;
  badge?: string;
}

export const HIDDEN_GEMS: HiddenGem[] = [
  {
    id: "keyboard-shortcuts",
    title: "Keyboard Shortcuts",
    description: "Navigate faster with Cmd+K for command palette, / for search, ? for help, g+g for graph, g+m for monitoring.",
    category: "Productivity",
    icon: "Keyboard",
    shortcut: "Cmd+K",
  },
  {
    id: "bulk-export",
    title: "Bulk Export",
    description: "Export multiple scan results at once from the Cases view. Select multiple cases and use the batch export feature.",
    category: "Export",
    icon: "Download",
    route: "/cases",
  },
  {
    id: "advanced-filters",
    title: "Advanced Filters",
    description: "Combine multiple filter criteria in scan results using AND/OR logic for precise result filtering.",
    category: "Search",
    icon: "Filter",
  },
  {
    id: "api-automation",
    title: "API Automation",
    description: "Generate API keys to automate scans via REST API. Perfect for integrating with your existing workflows.",
    category: "Integration",
    icon: "Code",
    route: "/api-keys",
    badge: "Pro",
  },
  {
    id: "scheduled-scans",
    title: "Scheduled Scans",
    description: "Set up recurring scans with custom intervals. Monitor targets continuously without manual intervention.",
    category: "Monitoring",
    icon: "Calendar",
    route: "/monitoring",
  },
  {
    id: "graph-export",
    title: "Graph Export",
    description: "Export your knowledge graph as JSON or GraphML for analysis in external tools like Gephi or Neo4j.",
    category: "Graph",
    icon: "Network",
    route: "/graph",
  },
  {
    id: "dark-web-monitoring",
    title: "Dark Web Monitoring",
    description: "Enable passive dark web monitoring to detect breaches and mentions without active scanning.",
    category: "Security",
    icon: "Shield",
    badge: "Enterprise",
  },
  {
    id: "custom-workflows",
    title: "Custom Workflows",
    description: "Build multi-step investigation workflows with conditional logic and automated actions.",
    category: "Automation",
    icon: "GitBranch",
    route: "/workflows",
    badge: "Pro",
  },
  {
    id: "referral-program",
    title: "Referral Program",
    description: "Earn free credits by referring others. Get 100 credits per successful referral.",
    category: "Credits",
    icon: "Users",
    route: "/referrals",
  },
  {
    id: "batch-scanning",
    title: "Batch Scanning",
    description: "Upload CSV files with multiple targets and scan them all at once. Process up to 1000 targets per batch.",
    category: "Productivity",
    icon: "List",
    route: "/scan/batch",
    badge: "Pro",
  },
  {
    id: "ai-insights",
    title: "AI Insights",
    description: "Get AI-generated summaries and risk assessments for your scan results automatically.",
    category: "AI",
    icon: "Sparkles",
  },
  {
    id: "provider-health",
    title: "Provider Health Console",
    description: "Admin-only view showing real-time health metrics and success rates for all scan providers.",
    category: "Admin",
    icon: "Activity",
    route: "/admin/providers",
    badge: "Admin",
  },
];
