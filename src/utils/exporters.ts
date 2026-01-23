export interface ExportOptions {
  includeAllFields?: boolean;
}

/**
 * Helper to extract site/platform from a finding
 */
function extractSite(result: any): string {
  // Check evidence array first
  if (result.evidence && Array.isArray(result.evidence)) {
    const siteEvidence = result.evidence.find((e: any) => e.key === 'site');
    if (siteEvidence?.value) return siteEvidence.value;
  }
  // Fallback to meta
  if (result.meta?.platform) return result.meta.platform;
  if (result.meta?.site) return result.meta.site;
  // Fallback to direct property
  if (result.site) return result.site;
  return '';
}

/**
 * Helper to extract URL from a finding
 */
function extractUrl(result: any): string {
  // Check evidence array first
  if (result.evidence && Array.isArray(result.evidence)) {
    const urlEvidence = result.evidence.find((e: any) => e.key === 'url');
    if (urlEvidence?.value) return urlEvidence.value;
  }
  // Fallback to direct property
  if (result.url) return result.url;
  return '';
}

/**
 * Helper to extract username from a finding
 */
function extractUsername(result: any): string {
  if (result.evidence && Array.isArray(result.evidence)) {
    const usernameEvidence = result.evidence.find((e: any) => e.key === 'username');
    if (usernameEvidence?.value) return usernameEvidence.value;
  }
  if (result.meta?.username) return result.meta.username;
  return '';
}

/**
 * Helper to derive status from a finding
 */
function deriveStatusForExport(result: any): string {
  if (result.status) return result.status.toLowerCase();
  if (result.kind === 'profile_presence') return 'found';
  
  if (result.evidence && Array.isArray(result.evidence)) {
    const existsEvidence = result.evidence.find((e: any) => e.key === 'exists');
    if (existsEvidence?.value === true) return 'found';
    if (existsEvidence?.value === false) return 'not_found';
  }
  
  const meta = result.meta || result.metadata || {};
  if (meta.status) return meta.status.toLowerCase();
  if (meta.exists === true) return 'found';
  if (meta.exists === false) return 'not_found';
  
  return 'unknown';
}

/**
 * Transform raw finding to a flattened, human-readable format
 */
function transformFinding(result: any): Record<string, any> {
  return {
    id: result.id,
    site: extractSite(result),
    status: deriveStatusForExport(result),
    url: extractUrl(result),
    username: extractUsername(result),
    provider: result.provider || '',
    severity: result.severity || '',
    kind: result.kind || '',
    confidence: result.confidence || '',
    platform_description: result.meta?.description || '',
    tool: result.meta?.tool || '',
    created_at: result.created_at || '',
  };
}

export function exportResultsToJSON(results: any[], jobId: string, options: ExportOptions = {}) {
  const { includeAllFields = true } = options;
  
  // Transform results to include extracted fields
  const dataToExport = results.map((r) => {
    const transformed = transformFinding(r);
    if (includeAllFields) {
      // Include original nested data as well
      return {
        ...transformed,
        meta: r.meta,
        evidence: r.evidence,
      };
    }
    return transformed;
  });
  
  const json = JSON.stringify(dataToExport, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, `footprintiq_scan_${jobId}.json`);
}

export function exportResultsToCSV(results: any[], jobId: string, options: ExportOptions = {}) {
  const { includeAllFields = true } = options;
  
  // Transform all results to flattened format
  const transformedResults = results.map(transformFinding);
  
  if (includeAllFields && transformedResults.length > 0) {
    // Use all keys from transformed results
    const headers = ['id', 'site', 'status', 'url', 'username', 'provider', 'severity', 'kind', 'confidence', 'platform_description', 'tool', 'created_at'];
    
    const rows = transformedResults.map((r) => 
      headers.map((header) => {
        const value = r[header];
        if (value === null || value === undefined) return '';
        return String(value);
      })
    );

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => escapeCSVField(cell)).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    downloadBlob(blob, `footprintiq_scan_${jobId}.csv`);
  } else {
    // Basic export with fixed headers
    const headers = ['Site', 'Status', 'URL', 'Provider', 'Severity'];
    const rows = transformedResults.map((r) => [
      r.site || '',
      r.status || '',
      r.url || '',
      r.provider || '',
      r.severity || '',
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => escapeCSVField(cell)).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    downloadBlob(blob, `footprintiq_scan_${jobId}.csv`);
  }
}

function escapeCSVField(field: string): string {
  // Prevent CSV injection
  const dangerousChars = ['=', '+', '-', '@', '\t', '\r'];
  let sanitized = field;
  
  if (dangerousChars.some(char => sanitized.startsWith(char))) {
    sanitized = "'" + sanitized;
  }
  
  // Escape quotes and wrap if contains special chars
  if (sanitized.includes(',') || sanitized.includes('"') || sanitized.includes('\n')) {
    return `"${sanitized.replace(/"/g, '""')}"`;
  }
  return `"${sanitized}"`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Derive status from result data when status field is missing
function deriveStatus(result: any): string {
  // Direct status field
  if (result.status) return result.status.toLowerCase();
  
  // For profile_presence kind, treat as "found"
  if (result.kind === 'profile_presence') return 'found';
  
  // Check evidence for status indicators
  if (result.evidence && Array.isArray(result.evidence)) {
    const existsEvidence = result.evidence.find((e: any) => e.key === 'exists');
    if (existsEvidence?.value === true) return 'found';
    if (existsEvidence?.value === false) return 'not_found';
  }
  
  // Check for explicit status in meta
  const meta = result.meta || result.metadata || {};
  if (meta.status) return meta.status.toLowerCase();
  if (meta.exists === true) return 'found';
  if (meta.exists === false) return 'not_found';
  
  return 'unknown';
}

export function groupByStatus(rows: any[]) {
  const groups: Record<string, any[]> = {
    found: [],
    claimed: [],
    not_found: [],
    unknown: [],
  };

  for (const r of rows) {
    const status = deriveStatus(r);
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(r);
  }

  return groups;
}
