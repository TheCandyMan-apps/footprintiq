/**
 * Feature tour configurations
 */

export interface TourStep {
  selector: string;
  title: string;
  body: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export const TOURS = {
  search: [
    { 
      selector: '#global-search', 
      title: 'Universal search', 
      body: 'Enter any artifact. We\'ll auto-detect whether it\'s a username, email, domain, IP, or phone number.',
      placement: 'bottom' as const,
    },
    { 
      selector: '#btn-run', 
      title: 'Run checks', 
      body: 'We\'ll call the right providers with cost guardrails and respect your quotas.',
      placement: 'bottom' as const,
    },
    { 
      selector: '#result-groups', 
      title: 'Grouped results', 
      body: 'Results are grouped by entity with risk scores and confidence levels.',
      placement: 'top' as const,
    },
  ],
  
  graph: [
    {
      selector: '#graph-canvas',
      title: 'Entity graph',
      body: 'Explore connected entities visually. Click to focus, drag to pan, scroll to zoom.',
      placement: 'top' as const,
    },
    {
      selector: '#graph-expand',
      title: 'Expand nodes',
      body: 'Pull connected entities via selected providers. Hold Shift for multi-select.',
      placement: 'left' as const,
    },
  ],
  
  monitoring: [
    {
      selector: '#create-monitor',
      title: 'Create monitor',
      body: 'Re-scan targets on a schedule and alert on new high-risk findings.',
      placement: 'bottom' as const,
    },
    {
      selector: '#monitor-list',
      title: 'Monitor watchlist',
      body: 'View all active monitors, pause/resume, and see recent runs.',
      placement: 'top' as const,
    },
  ],
  
  providers: [
    {
      selector: '#provider-grid',
      title: 'Provider registry',
      body: 'Enable/disable data sources. Each has cost and quota settings.',
      placement: 'top' as const,
    },
    {
      selector: '#provider-policy',
      title: 'Provider policies',
      body: 'Set default providers per entity type and configure adult content filtering.',
      placement: 'left' as const,
    },
  ],
} as const;

export type TourId = keyof typeof TOURS;
