import { supabase } from '@/integrations/supabase/client';
import { buildEntityTimeline, TimelineEvent } from '../timeline/builder';

export interface ReportSection {
  type: string;
  title: string;
  content?: string;
  data?: any;
  order: number;
}

export interface ReportScope {
  entityIds: string[];
  startDate?: Date;
  endDate?: Date;
  includeSections: string[];
}

export async function buildCaseReport(
  workspaceId: string,
  caseId: string | null,
  scope: ReportScope
): Promise<{ sections: ReportSection[]; metadata: Record<string, any> }> {
  const sections: ReportSection[] = [];
  let order = 0;
  
  // 1. Executive Summary
  if (scope.includeSections.includes('summary')) {
    const summary = await generateExecutiveSummary(workspaceId, scope.entityIds);
    sections.push({
      type: 'summary',
      title: 'Executive Summary',
      content: summary,
      order: order++,
    });
  }
  
  // 2. Timeline
  if (scope.includeSections.includes('timeline')) {
    const timeline = await buildEntityTimeline(scope.entityIds[0], {
      startDate: scope.startDate,
      endDate: scope.endDate,
    });
    
    sections.push({
      type: 'timeline',
      title: 'Activity Timeline',
      data: timeline,
      order: order++,
    });
  }
  
  // 3. Entities Overview
  if (scope.includeSections.includes('entities')) {
    const entities = await getEntitiesDetails(scope.entityIds);
    sections.push({
      type: 'entities',
      title: 'Entities Analysis',
      data: entities,
      order: order++,
    });
  }
  
  // 4. Dark Web Signals
  if (scope.includeSections.includes('darkweb')) {
    const darkWebData = await getDarkWebSignals(workspaceId, scope.entityIds);
    sections.push({
      type: 'darkweb',
      title: 'Dark Web Intelligence',
      data: darkWebData,
      order: order++,
    });
  }
  
  // 5. Threat Intelligence
  if (scope.includeSections.includes('threatintel')) {
    const threatData = await getThreatIntelligence(workspaceId);
    sections.push({
      type: 'threatintel',
      title: 'Threat Intelligence',
      data: threatData,
      order: order++,
    });
  }
  
  // 6. Recommendations
  if (scope.includeSections.includes('recommendations')) {
    const recommendations = await generateRecommendations(workspaceId, scope.entityIds);
    sections.push({
      type: 'recommendations',
      title: 'Recommendations',
      content: recommendations,
      order: order++,
    });
  }
  
  const metadata = {
    generated_at: new Date().toISOString(),
    entity_count: scope.entityIds.length,
    section_count: sections.length,
    date_range: {
      start: scope.startDate?.toISOString(),
      end: scope.endDate?.toISOString(),
    },
  };
  
  return { sections, metadata };
}

async function generateExecutiveSummary(workspaceId: string, entityIds: string[]): Promise<string> {
  // Call AI analyst for summary
  try {
    const { data, error } = await supabase.functions.invoke('ai-analyst', {
      body: {
        action: 'summarize',
        entityIds,
        questions: ['Provide an executive summary of key findings and risks'],
      },
    });
    
    if (error) throw error;
    return data.summary || 'No summary available';
  } catch (error) {
    return 'Unable to generate summary at this time';
  }
}

async function getEntitiesDetails(entityIds: string[]): Promise<any[]> {
  const { data } = await supabase
    .from('entity_nodes' as any)
    .select('*')
    .in('id', entityIds);
  
  return data || [];
}

async function getDarkWebSignals(workspaceId: string, entityIds: string[]): Promise<any[]> {
  const { data } = await supabase
    .from('darkweb_findings' as any)
    .select('*')
    .eq('workspace_id', workspaceId)
    .limit(50);
  
  return data || [];
}

async function getThreatIntelligence(workspaceId: string): Promise<any[]> {
  const { data } = await supabase
    .from('threat_intel' as any)
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('last_seen', { ascending: false })
    .limit(50);
  
  return data || [];
}

async function generateRecommendations(workspaceId: string, entityIds: string[]): Promise<string> {
  // Call AI analyst for recommendations
  try {
    const { data, error } = await supabase.functions.invoke('ai-analyst', {
      body: {
        action: 'summarize',
        entityIds,
        questions: ['What are the top 5 actionable recommendations based on these findings?'],
      },
    });
    
    if (error) throw error;
    return data.summary || 'No recommendations available';
  } catch (error) {
    return 'Unable to generate recommendations at this time';
  }
}

export function renderReportHTML(
  title: string,
  sections: ReportSection[],
  metadata: Record<string, any>,
  branding?: { logo?: string; name?: string }
): string {
  const sortedSections = sections.sort((a, b) => a.order - b.order);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
    .logo { max-width: 200px; margin-bottom: 20px; }
    h1 { color: #333; }
    h2 { color: #666; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
    .section { margin-bottom: 30px; }
    .metadata { font-size: 0.9em; color: #666; margin-bottom: 40px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f5f5f5; font-weight: bold; }
    .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 0.8em; color: #999; }
  </style>
</head>
<body>
  <div class="header">
    ${branding?.logo ? `<img src="${branding.logo}" alt="Logo" class="logo" />` : ''}
    <h1>${title}</h1>
    ${branding?.name ? `<p><strong>${branding.name}</strong></p>` : ''}
  </div>
  
  <div class="metadata">
    <p><strong>Generated:</strong> ${new Date(metadata.generated_at).toLocaleString()}</p>
    <p><strong>Entities Analyzed:</strong> ${metadata.entity_count}</p>
    ${metadata.date_range?.start ? `<p><strong>Date Range:</strong> ${new Date(metadata.date_range.start).toLocaleDateString()} - ${new Date(metadata.date_range.end).toLocaleDateString()}</p>` : ''}
  </div>
  
  ${sortedSections.map(section => `
    <div class="section">
      <h2>${section.title}</h2>
      ${section.content ? `<p>${section.content}</p>` : ''}
      ${section.data ? renderSectionData(section.type, section.data) : ''}
    </div>
  `).join('')}
  
  <div class="footer">
    <p>FootprintIQ Report | Confidential</p>
    <p>Report Hash: ${generateReportHash(sections)}</p>
  </div>
</body>
</html>
  `;
}

function renderSectionData(type: string, data: any): string {
  if (type === 'timeline' && Array.isArray(data)) {
    return `
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Type</th>
            <th>Severity</th>
            <th>Event</th>
          </tr>
        </thead>
        <tbody>
          ${data.map((event: TimelineEvent) => `
            <tr>
              <td>${new Date(event.timestamp).toLocaleString()}</td>
              <td>${event.type}</td>
              <td>${event.severity}</td>
              <td>${event.title}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
  
  if (type === 'entities' && Array.isArray(data)) {
    return `
      <table>
        <thead>
          <tr>
            <th>Entity Type</th>
            <th>Value</th>
            <th>Risk Score</th>
            <th>Findings</th>
          </tr>
        </thead>
        <tbody>
          ${data.map((entity: any) => `
            <tr>
              <td>${entity.entity_type}</td>
              <td>${entity.entity_value}</td>
              <td>${entity.risk_score?.toFixed(2) || '0.00'}</td>
              <td>${entity.finding_count || 0}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
  
  return '<p>Data visualization not available</p>';
}

function generateReportHash(sections: ReportSection[]): string {
  const content = JSON.stringify(sections);
  // Simple hash for demonstration
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}
