export interface ExportOptions {
  includeAllFields?: boolean;
}

export function exportResultsToJSON(results: any[], jobId: string, options: ExportOptions = {}) {
  const { includeAllFields = true } = options;
  
  // If includeAllFields is false, strip to basic fields only
  const dataToExport = includeAllFields ? results : results.map((r) => ({
    id: r.id,
    site: r.site,
    status: r.status,
    url: r.url,
    provider: r.provider,
    severity: r.severity,
  }));
  
  const json = JSON.stringify(dataToExport, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, `footprintiq_scan_${jobId}.json`);
}

export function exportResultsToCSV(results: any[], jobId: string, options: ExportOptions = {}) {
  const { includeAllFields = true } = options;
  
  if (includeAllFields && results.length > 0) {
    // Collect all unique keys across all results
    const allKeys = new Set<string>();
    results.forEach((r) => {
      Object.keys(r).forEach((key) => {
        // Skip complex nested objects for CSV, but include their string representation
        const value = r[key];
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          allKeys.add(key);
        }
      });
    });
    
    // Sort headers alphabetically, but put common ones first
    const priorityHeaders = ['id', 'site', 'status', 'url', 'provider', 'severity', 'kind', 'confidence', 'title', 'description'];
    const headers = [
      ...priorityHeaders.filter(h => allKeys.has(h)),
      ...Array.from(allKeys).filter(h => !priorityHeaders.includes(h)).sort()
    ];
    
    const rows = results.map((r) => 
      headers.map((header) => {
        const value = r[header];
        if (value === null || value === undefined) return '';
        if (Array.isArray(value)) return value.join('; ');
        if (typeof value === 'object') return JSON.stringify(value);
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
    const headers = ['ID', 'Site', 'Status', 'URL', 'Provider', 'Severity'];
    const rows = results.map((r) => [
      r.id?.slice(0, 8) || '',
      r.site || '',
      r.status || '',
      r.url || '',
      r.provider || '',
      r.severity || '',
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
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
