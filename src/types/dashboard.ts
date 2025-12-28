import { z } from 'zod';

// ============= KPI Types =============
export const KpiSchema = z.object({
  scans: z.number(),
  findings: z.number(),
  high: z.number(),
  darkweb: z.number(),
  successRate: z.number(),
  spend: z.number(),
  deltas: z.object({
    scans: z.number(),
    findings: z.number(),
    high: z.number(),
    darkweb: z.number(),
    successRate: z.number(),
    spend: z.number(),
  }),
});

export type Kpi = z.infer<typeof KpiSchema>;

// ============= Chart Types =============
export const SeriesPointSchema = z.object({
  ts: z.string(),
  low: z.number(),
  medium: z.number(),
  high: z.number(),
  forecast: z.number().optional(),
});

export type SeriesPoint = z.infer<typeof SeriesPointSchema>;

export const SourceBreakdownSchema = z.object({
  provider: z.string(),
  count: z.number(),
});

export type SourceBreakdown = z.infer<typeof SourceBreakdownSchema>;

// ============= Alert Types =============
export const SeveritySchema = z.enum(['low', 'medium', 'high', 'critical']);
export type Severity = z.infer<typeof SeveritySchema>;

export const AlertRowSchema = z.object({
  id: z.string(),
  time: z.string(),
  entity: z.string(),
  provider: z.string(),
  severity: SeveritySchema,
  confidence: z.number().min(0).max(100),
  category: z.string(),
  description: z.string(),
  evidence: z.array(z.any()).optional(),
  // URL fields for context enrichment - any of these can be used
  url: z.string().optional(),
  profile_url: z.string().optional(),
  source_url: z.string().optional(),
  link: z.string().optional(),
});

export type AlertRow = z.infer<typeof AlertRowSchema>;

export const AlertsResponseSchema = z.object({
  rows: z.array(AlertRowSchema),
  total: z.number(),
});

export type AlertsResponse = z.infer<typeof AlertsResponseSchema>;

// ============= Filter Types =============
export type DateRange = '7d' | '30d' | '90d' | 'custom';

export interface DashboardFilters {
  dateRange: DateRange;
  from?: string;
  to?: string;
  workspace?: string;
  severity?: Severity[];
  provider?: string[];
  entity?: string;
}

// ============= Role Types =============
export type UserRole = 'viewer' | 'analyst' | 'admin';

export interface RoleCapabilities {
  canExport: boolean;
  canAssign: boolean;
  canViewPII: boolean;
  canBulkEdit: boolean;
}

export const getRoleCapabilities = (role: UserRole): RoleCapabilities => {
  switch (role) {
    case 'viewer':
      return {
        canExport: false,
        canAssign: false,
        canViewPII: false,
        canBulkEdit: false,
      };
    case 'analyst':
      return {
        canExport: true,
        canAssign: true,
        canViewPII: true,
        canBulkEdit: false,
      };
    case 'admin':
      return {
        canExport: true,
        canAssign: true,
        canViewPII: true,
        canBulkEdit: true,
      };
  }
};

// ============= View State Types =============
export interface SavedView {
  id: string;
  name: string;
  filters: DashboardFilters;
  columns: string[];
  density: 'compact' | 'comfortable';
}

export interface DashboardState extends DashboardFilters {
  savedViewId?: string;
  columns: string[];
  density: 'compact' | 'comfortable';
}
