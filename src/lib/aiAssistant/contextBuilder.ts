/**
 * Context Builder
 * Collects persona, scan, risk, and timeline data for AI summarization
 */

import { supabase } from "@/integrations/supabase/client";

export interface ScanContext {
  scanId: string;
  scanType: string;
  privacyScore: number;
  totalSources: number;
  riskBreakdown: {
    high: number;
    medium: number;
    low: number;
  };
  dataSources: any[];
  socialProfiles: any[];
  createdAt: string;
}

export interface OrganizationContext {
  organizationId: string;
  scans: ScanContext[];
  aggregatedMetrics: {
    totalScans: number;
    averagePrivacyScore: number;
    totalExposures: number;
    commonRisks: string[];
  };
}

/**
 * Build context for a single scan
 */
export async function buildScanContext(scanId: string): Promise<ScanContext | null> {
  try {
    // Fetch scan data
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .select('*')
      .eq('id', scanId)
      .single();

    if (scanError || !scan) {
      console.error('Error fetching scan:', scanError);
      return null;
    }

    // Fetch data sources
    const { data: dataSources } = await supabase
      .from('data_sources')
      .select('*')
      .eq('scan_id', scanId);

    // Fetch social profiles
    const { data: socialProfiles } = await supabase
      .from('social_profiles')
      .select('*')
      .eq('scan_id', scanId);

    return {
      scanId: scan.id,
      scanType: scan.scan_type,
      privacyScore: scan.privacy_score || 0,
      totalSources: scan.total_sources_found || 0,
      riskBreakdown: {
        high: scan.high_risk_count || 0,
        medium: scan.medium_risk_count || 0,
        low: scan.low_risk_count || 0,
      },
      dataSources: dataSources || [],
      socialProfiles: socialProfiles || [],
      createdAt: scan.created_at,
    };
  } catch (error) {
    console.error('Error building scan context:', error);
    return null;
  }
}

/**
 * Build context for an organization (multiple scans)
 */
export async function buildOrganizationContext(
  userId: string
): Promise<OrganizationContext | null> {
  try {
    // Fetch all user scans
    const { data: scans, error: scansError } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (scansError) {
      console.error('Error fetching scans:', scansError);
      return null;
    }

    if (!scans || scans.length === 0) {
      return null;
    }

    // Build context for each scan
    const scanContexts: ScanContext[] = [];
    for (const scan of scans) {
      const context = await buildScanContext(scan.id);
      if (context) {
        scanContexts.push(context);
      }
    }

    // Calculate aggregated metrics
    const totalScans = scanContexts.length;
    const averagePrivacyScore = totalScans > 0
      ? scanContexts.reduce((sum, ctx) => sum + ctx.privacyScore, 0) / totalScans
      : 0;
    const totalExposures = scanContexts.reduce((sum, ctx) => sum + ctx.totalSources, 0);

    // Extract common risks
    const allRisks = scanContexts.flatMap(ctx => 
      ctx.dataSources.map((ds: any) => ds.category as string)
    );
    const riskCounts = allRisks.reduce((acc, risk) => {
      if (risk) {
        acc[risk] = (acc[risk] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const commonRisks = Object.entries(riskCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([risk]) => risk);

    return {
      organizationId: userId,
      scans: scanContexts,
      aggregatedMetrics: {
        totalScans,
        averagePrivacyScore: Math.round(averagePrivacyScore),
        totalExposures,
        commonRisks,
      },
    };
  } catch (error) {
    console.error('Error building organization context:', error);
    return null;
  }
}

/**
 * Generate a summary prompt for AI analysis
 */
export function generateAnalysisPrompt(context: ScanContext | OrganizationContext): string {
  if ('scanId' in context) {
    // Single scan context
    return `
Analyze this digital footprint scan and provide an executive summary:

**Scan Overview:**
- Privacy Score: ${context.privacyScore}/100
- Total Exposures: ${context.totalSources}
- High Risk: ${context.riskBreakdown.high}
- Medium Risk: ${context.riskBreakdown.medium}
- Low Risk: ${context.riskBreakdown.low}

**Data Sources Found:**
${context.dataSources.map(ds => `- ${ds.name} (${ds.category}): ${ds.risk_level} risk`).join('\n')}

**Social Profiles:**
${context.socialProfiles.map(sp => `- ${sp.platform}: @${sp.username}`).join('\n')}

Provide:
1. Executive Summary (2-3 sentences)
2. Top 3 Risks
3. Recommended Actions (prioritized)
4. Overall Risk Assessment
`;
  } else {
    // Organization context
    return `
Analyze this organization's digital footprint across multiple scans:

**Organization Metrics:**
- Total Scans: ${context.aggregatedMetrics.totalScans}
- Average Privacy Score: ${context.aggregatedMetrics.averagePrivacyScore}/100
- Total Exposures: ${context.aggregatedMetrics.totalExposures}
- Most Common Risk Categories: ${context.aggregatedMetrics.commonRisks.join(', ')}

**Individual Scans:**
${context.scans.slice(0, 5).map(scan => `
- Scan ${scan.scanId.substring(0, 8)}: Privacy Score ${scan.privacyScore}, ${scan.totalSources} exposures
`).join('\n')}

Provide:
1. Organization-wide Risk Assessment
2. Trends & Patterns
3. Strategic Recommendations
4. Priority Action Items
`;
  }
}
