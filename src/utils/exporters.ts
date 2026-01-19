export function exportResultsToJSON(results: any[], jobId: string) {
  const json = JSON.stringify(results, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, `footprintiq_scan_${jobId}.json`);
}

export function exportResultsToCSV(results: any[], jobId: string) {
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
