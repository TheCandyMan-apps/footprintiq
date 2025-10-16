import { Finding } from "./ufm";
import { redactFindings } from "./redact";

/**
 * Export findings as JSON
 */
export function exportAsJSON(findings: Finding[], redactPII: boolean = true): void {
  const data = redactPII ? redactFindings(findings, true) : findings;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `footprintiq-scan-${Date.now()}.json`);
}

/**
 * Export findings as CSV
 * Flattens nested evidence into rows
 */
export function exportAsCSV(findings: Finding[], redactPII: boolean = true): void {
  const data = redactPII ? redactFindings(findings, true) : findings;
  
  const headers = [
    'ID',
    'Type',
    'Title',
    'Severity',
    'Confidence',
    'Provider',
    'Provider Category',
    'Impact',
    'Observed At',
    'Evidence Key',
    'Evidence Value',
    'Tags',
  ];
  
  const rows: string[][] = [];
  
  data.forEach((finding) => {
    if (finding.evidence.length === 0) {
      // No evidence - single row
      rows.push([
        finding.id,
        finding.type,
        finding.title,
        finding.severity,
        String(finding.confidence),
        finding.provider,
        finding.providerCategory,
        finding.impact,
        finding.observedAt,
        '',
        '',
        finding.tags.join('; '),
      ]);
    } else {
      // Multiple evidence items - one row per evidence
      finding.evidence.forEach((evidence) => {
        rows.push([
          finding.id,
          finding.type,
          finding.title,
          finding.severity,
          String(finding.confidence),
          finding.provider,
          finding.providerCategory,
          finding.impact,
          finding.observedAt,
          evidence.key,
          typeof evidence.value === 'string' ? evidence.value : JSON.stringify(evidence.value),
          finding.tags.join('; '),
        ]);
      });
    }
  });
  
  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  downloadBlob(blob, `footprintiq-scan-${Date.now()}.csv`);
}

/**
 * Export findings as PDF (TODO: implement with jspdf or pdfmake)
 */
export function exportAsPDF(findings: Finding[], redactPII: boolean = true): void {
  // TODO: Implement PDF generation
  // For now, show a placeholder
  alert('PDF export coming soon! Use JSON or CSV export for now.');
}

/**
 * Helper: Escape CSV field and prevent CSV injection
 */
function escapeCSV(field: string): string {
  // Prevent CSV injection by prefixing dangerous characters
  const dangerousChars = ['=', '+', '-', '@', '\t', '\r'];
  let sanitized = field;
  
  if (dangerousChars.some(char => sanitized.startsWith(char))) {
    sanitized = "'" + sanitized; // Prefix with single quote to neutralize formulas
  }
  
  // Escape quotes and wrap if contains special chars
  if (sanitized.includes(',') || sanitized.includes('"') || sanitized.includes('\n')) {
    return `"${sanitized.replace(/"/g, '""')}"`;
  }
  return sanitized;
}

/**
 * Helper: Download blob as file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
