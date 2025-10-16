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
 * Export findings as PDF using jsPDF
 */
export function exportAsPDF(findings: Finding[], redactPII: boolean = true): void {
  import('jspdf').then(({ jsPDF }) => {
    import('jspdf-autotable').then((autoTable) => {
      const data = redactPII ? redactFindings(findings, true) : findings;
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('FootprintIQ Scan Report', 14, 22);
      
      // Add metadata
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);
      doc.text(`Total Findings: ${data.length}`, 14, 38);
      
      // Group findings by severity
      const critical = data.filter(f => f.severity === 'critical').length;
      const high = data.filter(f => f.severity === 'high').length;
      const medium = data.filter(f => f.severity === 'medium').length;
      const low = data.filter(f => f.severity === 'low').length;
      
      doc.text(`Critical: ${critical} | High: ${high} | Medium: ${medium} | Low: ${low}`, 14, 44);
      
      // Prepare table data
      const tableData = data.map(finding => [
        finding.severity.toUpperCase(),
        finding.type,
        finding.title,
        finding.provider,
        finding.confidence.toFixed(2),
        finding.observedAt.split('T')[0]
      ]);
      
      // Add table
      (doc as any).autoTable({
        startY: 50,
        head: [['Severity', 'Type', 'Title', 'Provider', 'Confidence', 'Date']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 22 },
          1: { cellWidth: 28 },
          2: { cellWidth: 55 },
          3: { cellWidth: 30 },
          4: { cellWidth: 22 },
          5: { cellWidth: 25 }
        }
      });
      
      // Add detailed findings on new pages
      let yPos = (doc as any).lastAutoTable.finalY + 20;
      
      data.forEach((finding, index) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`${index + 1}. ${finding.title}`, 14, yPos);
        yPos += 7;
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        const splitDescription = doc.splitTextToSize(finding.description, 180);
        doc.text(splitDescription, 14, yPos);
        yPos += splitDescription.length * 5 + 3;
        
        doc.text(`Impact: ${finding.impact}`, 14, yPos);
        yPos += 6;
        
        if (finding.remediation.length > 0) {
          doc.text('Remediation:', 14, yPos);
          yPos += 5;
          finding.remediation.forEach(step => {
            const splitStep = doc.splitTextToSize(`• ${step}`, 175);
            doc.text(splitStep, 18, yPos);
            yPos += splitStep.length * 5;
          });
        }
        
        yPos += 8;
      });
      
      // Save the PDF
      doc.save(`footprintiq-scan-${Date.now()}.pdf`);
    });
  });
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
