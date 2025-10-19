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
 * Generate comprehensive report with executive summary
 */
export async function generateComprehensiveReport(scan: any, dataSources: any[]): Promise<void> {
  const { jsPDF } = await import('jspdf');
  await import('jspdf-autotable');
  
  const doc = new jsPDF();
  let yPos = 20;

  // Title Page
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text('FootprintIQ', 105, yPos, { align: 'center' });
  yPos += 10;
  doc.setFontSize(18);
  doc.text('Comprehensive Digital Footprint Report', 105, yPos, { align: 'center' });
  yPos += 20;

  // Executive Summary
  doc.setFontSize(16);
  doc.text('Executive Summary', 14, yPos);
  yPos += 10;
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  
  const summaryText = `This report provides a comprehensive analysis of the digital footprint scan conducted on ${new Date(scan.created_at).toLocaleDateString()}. The scan identified ${scan.total_sources_found || 0} total exposures across ${dataSources.length} data sources.`;
  const splitSummary = doc.splitTextToSize(summaryText, 180);
  doc.text(splitSummary, 14, yPos);
  yPos += splitSummary.length * 7 + 10;

  // Risk Overview
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Risk Assessment', 14, yPos);
  yPos += 8;
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text(`Privacy Score: ${scan.privacy_score || 'N/A'}/100`, 14, yPos);
  yPos += 6;
  doc.text(`Critical Risk Items: ${scan.high_risk_count || 0}`, 14, yPos);
  yPos += 6;
  doc.text(`Medium Risk Items: ${scan.medium_risk_count || 0}`, 14, yPos);
  yPos += 6;
  doc.text(`Low Risk Items: ${scan.low_risk_count || 0}`, 14, yPos);
  yPos += 15;

  // Data Sources Table
  doc.addPage();
  yPos = 20;
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('Detailed Findings', 14, yPos);
  yPos += 10;

  const tableData = dataSources.map(source => [
    source.name || 'Unknown',
    source.category || 'N/A',
    source.risk_level || 'Unknown',
    source.data_found?.length || 0
  ]);

  (doc as any).autoTable({
    startY: yPos,
    head: [['Source', 'Category', 'Risk Level', 'Data Points']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 10 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Remediation Recommendations
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Remediation Recommendations', 14, yPos);
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  
  const recommendations = [
    '1. Review and remove high-risk exposures immediately',
    '2. Enable privacy settings on identified platforms',
    '3. Request data deletion from data brokers',
    '4. Monitor for new exposures regularly',
    '5. Implement strong privacy practices going forward'
  ];
  
  recommendations.forEach(rec => {
    const splitRec = doc.splitTextToSize(rec, 180);
    doc.text(splitRec, 14, yPos);
    yPos += splitRec.length * 6;
  });

  // Save
  doc.save(`footprintiq-report-${Date.now()}.pdf`);
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
