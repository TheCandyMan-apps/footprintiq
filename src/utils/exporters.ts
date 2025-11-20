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

export function groupByStatus(rows: any[]) {
  const groups: Record<string, any[]> = {
    found: [],
    claimed: [],
    not_found: [],
    unknown: [],
  };

  for (const r of rows) {
    const status = (r.status || 'unknown').toLowerCase();
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(r);
  }

  return groups;
}
