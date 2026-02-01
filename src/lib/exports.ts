import { Finding } from "./ufm";
import { redactFindings } from "./redact";
import { exportReactPDF } from "./pdf-export";

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
    const evidence = finding.evidence || [];
    if (evidence.length === 0) {
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
        (finding.tags || []).join('; '),
      ]);
    } else {
      // Multiple evidence items - one row per evidence
      evidence.forEach((ev) => {
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
        ev.key,
          typeof ev.value === 'string' ? ev.value : JSON.stringify(ev.value),
          (finding.tags || []).join('; '),
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
 * Export findings as PDF using @react-pdf/renderer with professional formatting
 */
export async function exportAsPDF(
  findings: Finding[], 
  redactPII: boolean = true,
  scanTarget?: string,
  scanId?: string
): Promise<void> {
  // Use the new React PDF implementation with enhanced formatting
  return exportReactPDF(findings, redactPII, scanTarget, scanId);
}

/**
 * LEGACY: Export findings as PDF using jsPDF (kept for compatibility)
 * @deprecated Use exportAsPDF instead which uses @react-pdf/renderer
 */
export async function exportAsPDFLegacy(findings: Finding[], redactPII: boolean = true): Promise<void> {
  try {
    console.log(`[Export] Starting PDF generation for ${findings.length} findings`);
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    
    const data = redactPII ? redactFindings(findings, true) : findings;
    const doc = new jsPDF();
      let pageNumber = 1;

      // Helper function to add header and footer
      const addHeaderFooter = (pageNum: number) => {
        // Header
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('FootprintIQ - Digital Footprint Analysis Report', 14, 10);
        doc.line(14, 12, 196, 12);

        // Footer
        doc.setFontSize(8);
        doc.text(`Page ${pageNum}`, 105, 285, { align: 'center' });
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 285);
        doc.text('Confidential', 196, 285, { align: 'right' });
      };

      // Cover Page
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 210, 80, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(32);
      doc.setFont(undefined, 'bold');
      doc.text('FootprintIQ', 105, 35, { align: 'center' });
      
      doc.setFontSize(18);
      doc.setFont(undefined, 'normal');
      doc.text('Digital Footprint Analysis Report', 105, 50, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Executive Summary', 14, 100);
      
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.text(`Report Date: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, 14, 110);
      doc.text(`Total Findings: ${data.length}`, 14, 118);

      // Severity breakdown with visual indicators
      const critical = data.filter(f => f.severity === 'critical').length;
      const high = data.filter(f => f.severity === 'high').length;
      const medium = data.filter(f => f.severity === 'medium').length;
      const low = data.filter(f => f.severity === 'low').length;
      const info = data.filter(f => f.severity === 'info').length;

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Severity Distribution', 14, 135);
      
      let yPos = 145;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      
      // Critical
      doc.setFillColor(220, 38, 38);
      doc.circle(18, yPos - 2, 2, 'F');
      doc.text(`Critical: ${critical} findings`, 25, yPos);
      yPos += 8;
      
      // High
      doc.setFillColor(234, 88, 12);
      doc.circle(18, yPos - 2, 2, 'F');
      doc.text(`High: ${high} findings`, 25, yPos);
      yPos += 8;
      
      // Medium
      doc.setFillColor(250, 204, 21);
      doc.circle(18, yPos - 2, 2, 'F');
      doc.text(`Medium: ${medium} findings`, 25, yPos);
      yPos += 8;
      
      // Low
      doc.setFillColor(59, 130, 246);
      doc.circle(18, yPos - 2, 2, 'F');
      doc.text(`Low: ${low} findings`, 25, yPos);
      yPos += 8;
      
      // Info
      doc.setFillColor(148, 163, 184);
      doc.circle(18, yPos - 2, 2, 'F');
      doc.text(`Info: ${info} findings`, 25, yPos);
      yPos += 15;

      // Risk Score calculation
      const riskScore = Math.max(0, 100 - (critical * 15 + high * 10 + medium * 5 + low * 2));
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Overall Risk Score', 14, yPos);
      yPos += 10;
      
      doc.setFontSize(24);
      const scoreColor = riskScore >= 80 ? [34, 197, 94] : riskScore >= 60 ? [250, 204, 21] : [220, 38, 38];
      doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      doc.text(`${riskScore}/100`, 14, yPos);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(riskScore >= 80 ? 'Low Risk' : riskScore >= 60 ? 'Medium Risk' : 'High Risk', 45, yPos - 4);

      // New page for findings summary
      doc.addPage();
      addHeaderFooter(++pageNumber);
      
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Findings Summary', 14, 25);

      // Prepare detailed table data
      const tableData = data.map(finding => [
        finding.severity.toUpperCase(),
        finding.type,
        finding.title.substring(0, 40) + (finding.title.length > 40 ? '...' : ''),
        finding.provider,
        finding.confidence.toFixed(1) + '%',
        new Date(finding.observedAt).toLocaleDateString()
      ]);

      // Add comprehensive table
      autoTable(doc, {
        startY: 32,
        head: [['Severity', 'Type', 'Finding', 'Source', 'Confidence', 'Date']],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [37, 99, 235],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'left'
        },
        styles: { 
          fontSize: 8,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 24, fontStyle: 'bold' },
          1: { cellWidth: 28 },
          2: { cellWidth: 50 },
          3: { cellWidth: 30 },
          4: { cellWidth: 22, halign: 'center' },
          5: { cellWidth: 24, halign: 'center' }
        },
        didDrawPage: (data: any) => {
          if (data.pageNumber > 1) {
            addHeaderFooter(pageNumber + data.pageNumber - 1);
          }
        }
      });

      pageNumber += Math.floor((doc as any).lastAutoTable.finalY / 297);

      // Detailed findings section
      doc.addPage();
      addHeaderFooter(++pageNumber);
      
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Detailed Findings', 14, 25);
      
      let detailYPos = 35;
      
      data.forEach((finding, index) => {
        // Check if we need a new page
        if (detailYPos > 250) {
          doc.addPage();
          addHeaderFooter(++pageNumber);
          detailYPos = 20;
        }

        // Finding header with severity indicator
        const severityColors: Record<string, number[]> = {
          critical: [220, 38, 38],
          high: [234, 88, 12],
          medium: [250, 204, 21],
          low: [59, 130, 246],
          info: [148, 163, 184]
        };
        
        const color = severityColors[finding.severity] || [100, 100, 100];
        doc.setFillColor(color[0], color[1], color[2]);
        doc.roundedRect(14, detailYPos - 5, 182, 8, 1, 1, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(`${index + 1}. ${finding.title}`, 16, detailYPos);
        detailYPos += 10;

        // Reset text color
        doc.setTextColor(0, 0, 0);
        
        // Metadata box
        doc.setFillColor(249, 250, 251);
        doc.rect(14, detailYPos, 182, 18, 'F');
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text(`Provider: ${finding.provider}`, 16, detailYPos + 5);
        doc.text(`Type: ${finding.type}`, 16, detailYPos + 10);
        doc.text(`Confidence: ${finding.confidence.toFixed(1)}%`, 16, detailYPos + 15);
        doc.text(`Observed: ${new Date(finding.observedAt).toLocaleString()}`, 100, detailYPos + 5);
        doc.text(`Category: ${finding.providerCategory}`, 100, detailYPos + 10);
        const tags = finding.tags || [];
        if (tags.length > 0) {
          doc.text(`Tags: ${tags.slice(0, 3).join(', ')}`, 100, detailYPos + 15);
        }
        detailYPos += 23;

        // Description
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.text('Description:', 16, detailYPos);
        detailYPos += 5;
        doc.setFont(undefined, 'normal');
        const splitDescription = doc.splitTextToSize(finding.description, 178);
        doc.text(splitDescription, 16, detailYPos);
        detailYPos += splitDescription.length * 4.5 + 5;

        // Impact
        if (finding.impact) {
          doc.setFont(undefined, 'bold');
          doc.text('Impact:', 16, detailYPos);
          detailYPos += 5;
          doc.setFont(undefined, 'normal');
          const splitImpact = doc.splitTextToSize(finding.impact, 178);
          doc.text(splitImpact, 16, detailYPos);
          detailYPos += splitImpact.length * 4.5 + 5;
        }

        // Evidence
        const evidenceItems = finding.evidence || [];
        if (evidenceItems.length > 0) {
          doc.setFont(undefined, 'bold');
          doc.text('Evidence:', 16, detailYPos);
          detailYPos += 5;
          doc.setFont(undefined, 'normal');
          doc.setFontSize(8);
          
          evidenceItems.slice(0, 5).forEach(ev => {
            const evidenceText = `• ${ev.key}: ${typeof ev.value === 'string' ? ev.value : JSON.stringify(ev.value)}`;
            const splitEvidence = doc.splitTextToSize(evidenceText, 174);
            doc.text(splitEvidence, 18, detailYPos);
            detailYPos += splitEvidence.length * 4 + 1;
          });
          
          if (evidenceItems.length > 5) {
            doc.text(`... and ${evidenceItems.length - 5} more evidence items`, 18, detailYPos);
            detailYPos += 5;
          }
          detailYPos += 3;
          doc.setFontSize(9);
        }

        // Remediation
        const remediation = finding.remediation || [];
        if (remediation.length > 0) {
          doc.setFont(undefined, 'bold');
          doc.text('Recommended Actions:', 16, detailYPos);
          detailYPos += 5;
          doc.setFont(undefined, 'normal');
          
          remediation.forEach((step, stepIndex) => {
            const stepText = `${stepIndex + 1}. ${step}`;
            const splitStep = doc.splitTextToSize(stepText, 174);
            doc.text(splitStep, 18, detailYPos);
            detailYPos += splitStep.length * 4.5 + 2;
          });
        }

        detailYPos += 8;
        
        // Separator line
        if (detailYPos < 250) {
          doc.setDrawColor(226, 232, 240);
          doc.line(14, detailYPos, 196, detailYPos);
          detailYPos += 10;
        }
      });

      // Final page - recommendations
      doc.addPage();
      addHeaderFooter(++pageNumber);
      
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Overall Recommendations', 14, 25);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      yPos = 35;
      
      const recommendations = [
        {
          title: 'Immediate Actions',
          items: [
            'Address all critical and high severity findings within 48 hours',
            'Review and verify all exposed personal information',
            'Enable two-factor authentication on all identified accounts',
            'Update privacy settings on social media platforms'
          ]
        },
        {
          title: 'Short-term Actions (1-2 weeks)',
          items: [
            'Request data removal from identified data brokers',
            'Review and update passwords for all exposed accounts',
            'Set up monitoring alerts for future exposures',
            'Document all remediation actions taken'
          ]
        },
        {
          title: 'Long-term Strategy',
          items: [
            'Implement regular privacy audits (quarterly recommended)',
            'Maintain minimal digital footprint practices',
            'Use privacy-focused tools and services',
            'Stay informed about data privacy best practices'
          ]
        }
      ];

      recommendations.forEach(section => {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(section.title, 14, yPos);
        yPos += 8;
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        section.items.forEach(item => {
          const splitItem = doc.splitTextToSize(`• ${item}`, 178);
          doc.text(splitItem, 18, yPos);
          yPos += splitItem.length * 5 + 2;
        });
        yPos += 8;
      });

    // Save the PDF
    doc.save(`footprintiq-scan-${Date.now()}.pdf`);
    console.log('[Export] PDF generated successfully');
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to generate PDF report: ${errorMsg}. Please try CSV export instead.`);
  }
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
 * Generate comprehensive report with executive summary for case management
 */
export async function generateComprehensiveReport(scan: any, dataSources: any[]): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  
  const doc = new jsPDF();
  let pageNumber = 1;

  // Helper function to add header and footer
  const addHeaderFooter = (pageNum: number) => {
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('FootprintIQ - Comprehensive Investigation Report', 14, 10);
    doc.line(14, 12, 196, 12);
    
    doc.setFontSize(8);
    doc.text(`Page ${pageNum}`, 105, 285, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 285);
    doc.text('Confidential', 196, 285, { align: 'right' });
  };

  // Cover Page with branding
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 100, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(36);
  doc.setFont(undefined, 'bold');
  doc.text('FootprintIQ', 105, 40, { align: 'center' });
  
  doc.setFontSize(20);
  doc.setFont(undefined, 'normal');
  doc.text('Comprehensive Investigation Report', 105, 55, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }), 105, 70, { align: 'center' });

  // Report metadata
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Report Overview', 14, 120);
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  let yPos = 132;
  
  doc.text(`Scan ID: ${scan.id || 'N/A'}`, 14, yPos);
  yPos += 7;
  doc.text(`Scan Date: ${new Date(scan.created_at).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, 14, yPos);
  yPos += 7;
  doc.text(`Target Email: ${scan.email ? '***@' + scan.email.split('@')[1] : 'Not specified'}`, 14, yPos);
  yPos += 7;
  doc.text(`Data Sources Analyzed: ${dataSources.length}`, 14, yPos);
  yPos += 7;
  doc.text(`Total Exposures Found: ${scan.total_sources_found || 0}`, 14, yPos);
  yPos += 20;

  // Executive Summary
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Executive Summary', 14, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  const summaryText = `This comprehensive report presents findings from a digital footprint investigation conducted on ${new Date(scan.created_at).toLocaleDateString()}. The analysis identified ${scan.total_sources_found || 0} distinct exposures across ${dataSources.length} data sources. ${scan.breach_count ? `The investigation revealed ${scan.breach_count} data breach exposures, ` : ''}requiring immediate attention and remediation.`;
  const splitSummary = doc.splitTextToSize(summaryText, 180);
  doc.text(splitSummary, 14, yPos);
  yPos += splitSummary.length * 6 + 15;

  // Risk Assessment Section
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Risk Assessment', 14, yPos);
  yPos += 10;

  // Privacy Score with visual bar
  const privacyScore = scan.privacy_score || 0;
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text(`Privacy Score: ${privacyScore}/100`, 14, yPos);
  
  // Draw score bar
  const barWidth = 100;
  const barHeight = 8;
  const barX = 70;
  const barY = yPos - 5;
  
  // Background bar
  doc.setFillColor(229, 231, 235);
  doc.roundedRect(barX, barY, barWidth, barHeight, 2, 2, 'F');
  
  // Score bar with color based on score
  const scoreColor = privacyScore >= 70 ? [34, 197, 94] : privacyScore >= 40 ? [250, 204, 21] : [220, 38, 38];
  doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.roundedRect(barX, barY, (privacyScore / 100) * barWidth, barHeight, 2, 2, 'F');
  
  yPos += 12;

  // Risk metrics grid
  doc.setFontSize(10);
  const metrics = [
    { label: 'Critical Risk Items', value: scan.high_risk_count || 0, color: [220, 38, 38] },
    { label: 'Medium Risk Items', value: scan.medium_risk_count || 0, color: [250, 204, 21] },
    { label: 'Low Risk Items', value: scan.low_risk_count || 0, color: [59, 130, 246] },
    { label: 'Data Breaches', value: scan.breach_count || 0, color: [168, 85, 247] }
  ];

  metrics.forEach((metric, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = 14 + (col * 95);
    const y = yPos + (row * 20);
    
    doc.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
    doc.circle(x + 2, y - 2, 2, 'F');
    doc.setTextColor(0, 0, 0);
    doc.text(`${metric.label}: ${metric.value}`, x + 8, y);
  });

  // New page for data sources
  doc.addPage();
  addHeaderFooter(++pageNumber);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('Data Sources Analysis', 14, 25);
  yPos = 35;

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('The following data sources were analyzed during this investigation:', 14, yPos);
  yPos += 10;

  // Data sources table with enhanced information
  const tableData = dataSources.map(source => [
    source.name || 'Unknown',
    source.category || 'N/A',
    source.risk_level || 'Unknown',
    String(source.data_found?.length || 0),
    source.last_seen ? new Date(source.last_seen).toLocaleDateString() : 'N/A'
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Source', 'Category', 'Risk Level', 'Data Points', 'Last Seen']],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [37, 99, 235],
      fontSize: 9,
      fontStyle: 'bold'
    },
    styles: { 
      fontSize: 8,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 40 },
      2: { cellWidth: 30 },
      3: { cellWidth: 28, halign: 'center' },
      4: { cellWidth: 30, halign: 'center' }
    },
    didDrawPage: (data: any) => {
      if (data.pageNumber > 1) {
        addHeaderFooter(pageNumber + data.pageNumber - 1);
      }
    }
  });

  pageNumber += Math.floor((doc as any).lastAutoTable.finalY / 297);
  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Detailed findings per source
  if (yPos > 240) {
    doc.addPage();
    addHeaderFooter(++pageNumber);
    yPos = 25;
  }

  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Detailed Source Information', 14, yPos);
  yPos += 10;

  dataSources.forEach((source, index) => {
    if (yPos > 250) {
      doc.addPage();
      addHeaderFooter(++pageNumber);
      yPos = 25;
    }

    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(`${index + 1}. ${source.name || 'Unknown Source'}`, 14, yPos);
    yPos += 7;

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(`Category: ${source.category || 'N/A'}`, 18, yPos);
    yPos += 5;
    doc.text(`Risk Level: ${source.risk_level || 'Unknown'}`, 18, yPos);
    yPos += 5;
    
    if (source.description) {
      const splitDesc = doc.splitTextToSize(`Description: ${source.description}`, 174);
      doc.text(splitDesc, 18, yPos);
      yPos += splitDesc.length * 5 + 3;
    }

    if (source.data_found && source.data_found.length > 0) {
      doc.text(`Exposed Data (${source.data_found.length} items):`, 18, yPos);
      yPos += 5;
      
      source.data_found.slice(0, 8).forEach((item: string) => {
        const itemText = doc.splitTextToSize(`• ${item}`, 170);
        doc.text(itemText, 22, yPos);
        yPos += itemText.length * 4.5 + 1;
      });

      if (source.data_found.length > 8) {
        doc.setFont(undefined, 'italic');
        doc.text(`... and ${source.data_found.length - 8} more items`, 22, yPos);
        doc.setFont(undefined, 'normal');
        yPos += 5;
      }
    }
    yPos += 8;
  });

  // Remediation section
  doc.addPage();
  addHeaderFooter(++pageNumber);
  
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('Remediation Plan', 14, 25);
  yPos = 37;

  const remediationSections = [
    {
      priority: 'Immediate Actions (Next 24-48 Hours)',
      color: [220, 38, 38],
      actions: [
        'Review all critical risk items and data breaches identified in this report',
        'Change passwords for all compromised accounts using strong, unique passwords',
        'Enable two-factor authentication (2FA) on all identified accounts',
        'Contact financial institutions if payment information was exposed',
        'File identity theft reports if sensitive information was compromised'
      ]
    },
    {
      priority: 'Short-term Actions (Next 1-2 Weeks)',
      color: [250, 204, 21],
      actions: [
        'Request data removal from identified data broker websites',
        'Review and tighten privacy settings on all social media platforms',
        'Set up credit monitoring and fraud alerts with credit bureaus',
        'Audit and close unused online accounts',
        'Document all remediation steps taken for future reference'
      ]
    },
    {
      priority: 'Long-term Strategy (Ongoing)',
      color: [37, 99, 235],
      actions: [
        'Conduct quarterly privacy audits and footprint scans',
        'Implement privacy-first practices for all online activities',
        'Use password managers and VPN services',
        'Stay informed about data breaches affecting your accounts',
        'Minimize data sharing and use privacy-focused alternatives when possible'
      ]
    }
  ];

  remediationSections.forEach(section => {
    if (yPos > 250) {
      doc.addPage();
      addHeaderFooter(++pageNumber);
      yPos = 25;
    }

    doc.setFillColor(section.color[0], section.color[1], section.color[2]);
    doc.circle(16, yPos - 2, 2.5, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(section.priority, 22, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    section.actions.forEach((action, index) => {
      const actionText = `${index + 1}. ${action}`;
      const splitAction = doc.splitTextToSize(actionText, 174);
      doc.text(splitAction, 18, yPos);
      yPos += splitAction.length * 5 + 3;
    });
    yPos += 8;
  });

  // Final notes
  if (yPos > 240) {
    doc.addPage();
    addHeaderFooter(++pageNumber);
    yPos = 25;
  }

  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Important Notes', 14, yPos);
  yPos += 10;

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  const notes = [
    'This report contains sensitive personal information and should be stored securely.',
    'Remediation effectiveness depends on timely action and consistent follow-through.',
    'Some data removal requests may take several weeks or months to process.',
    'Regular monitoring is essential to maintain digital privacy and security.',
    'For assistance with remediation, contact FootprintIQ support or consult a privacy professional.'
  ];

  notes.forEach(note => {
    const splitNote = doc.splitTextToSize(`• ${note}`, 178);
    doc.text(splitNote, 18, yPos);
    yPos += splitNote.length * 5 + 4;
  });

  // Save
  doc.save(`footprintiq-comprehensive-report-${Date.now()}.pdf`);
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
