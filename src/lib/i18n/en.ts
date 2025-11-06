/**
 * English translations
 */

export const en = {
  // Navigation
  nav: {
    home: 'Home',
    search: 'Search',
    graph: 'Graph',
    monitoring: 'Monitoring',
    cases: 'Cases',
    analytics: 'Analytics',
    settings: 'Settings',
  },
  
  // Common actions
  actions: {
    search: 'Search',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    export: 'Export',
    import: 'Import',
    create: 'Create',
    update: 'Update',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    refresh: 'Refresh',
    retry: 'Retry',
  },
  
  // Search
  search: {
    placeholder: 'Search username, email, domain, IP, or phone...',
    no_results: 'No results found',
    searching: 'Searching...',
    found: 'Found {{count}} results',
  },
  
  // Results
  results: {
    risk_score: 'Risk Score',
    confidence: 'Confidence',
    providers: 'Providers',
    findings: 'Findings',
    timeline: 'Timeline',
    graph: 'Graph',
  },
  
  // Monitoring
  monitoring: {
    create: 'Create Monitor',
    active: 'Active Monitors',
    paused: 'Paused',
    runs: 'Runs',
    alerts: 'Alerts',
  },
  
  // Cases
  cases: {
    new: 'New Case',
    open: 'Open Cases',
    closed: 'Closed Cases',
    notes: 'Notes',
    evidence: 'Evidence',
  },
  
  // Settings
  settings: {
    preferences: 'Preferences',
    theme: 'Theme',
    language: 'Language',
    density: 'Density',
    tooltips: 'Tooltips',
    providers: 'Providers',
    billing: 'Billing',
    subscription_management: 'Subscription Management',
  },
  
  // Errors
  errors: {
    generic: 'Something went wrong',
    network: 'Network error',
    auth: 'Authentication required',
    permission: 'Permission denied',
    not_found: 'Not found',
    quota_exceeded: 'Quota exceeded',
  },
} as const;
