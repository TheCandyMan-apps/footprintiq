export function exportResultsToJSON(results: any[], jobId: string) {
  const json = JSON.stringify(results, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, `footprintiq_maigret_${jobId}.json`);
}

export function exportResultsToCSV(results: any[], jobId: string) {
  const headers = ['Line', 'Site', 'Status', 'URL'];
  const rows = results.map((r) => [
    r.line_no,
    r.ndjson?.site || '',
    r.ndjson?.status || '',
    r.ndjson?.url || '',
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  downloadBlob(blob, `footprintiq_maigret_${jobId}.csv`);
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
    const status = (r.ndjson?.status || 'unknown').toLowerCase();
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(r);
  }

  return groups;
}
