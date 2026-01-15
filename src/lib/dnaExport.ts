import type { jsPDF as JsPDFType } from 'jspdf';
import { TrendDataPoint } from './trends';

export interface BrandingSettings {
  company_name?: string;
  company_tagline?: string;
  logo_url?: string | null;
  primary_color?: string;
  secondary_color?: string;
}

export type PDFTemplate = 'executive' | 'technical' | 'compliance';

export const exportDNAasCSV = (trendData: TrendDataPoint[], currentScore: number) => {
  const headers = ['Date', 'Privacy Score', 'Total Sources', 'High Risk', 'Medium Risk', 'Low Risk'];
  
  const rows = trendData.map(point => [
    point.date,
    point.privacyScore.toString(),
    point.totalSources.toString(),
    point.highRiskCount.toString(),
    point.mediumRiskCount.toString(),
    point.lowRiskCount.toString()
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `digital-dna-report-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportDNAasPDF = async (
  trendData: TrendDataPoint[], 
  currentScore: number,
  branding?: BrandingSettings,
  template: PDFTemplate = 'technical'
) => {
  try {
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Helper to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 99, g: 102, b: 241 };
  };
  
  const primaryColor = branding?.primary_color 
    ? hexToRgb(branding.primary_color)
    : { r: 99, g: 102, b: 241 };
  
  const secondaryColor = branding?.secondary_color
    ? hexToRgb(branding.secondary_color)
    : { r: 16, g: 185, b: 129 };
  
  let yPosition = 20;
  
  // Logo (if provided) - with timeout and fallback
  if (branding?.logo_url) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      // Create timeout promise (5 seconds)
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Logo load timeout after 5s')), 5000)
      );
      
      // Create load promise
      const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load logo'));
        img.src = branding.logo_url!;
      });
      
      // Race between load and timeout
      const loadedImg = await Promise.race([loadPromise, timeoutPromise]);
      doc.addImage(loadedImg, 'PNG', 14, yPosition, 30, 30);
      yPosition += 35;
    } catch (error) {
      console.warn('Logo failed to load, continuing without it:', error);
      // Continue PDF generation without logo - no re-throw
    }
  }
  
  // Company Name
  if (branding?.company_name) {
    doc.setFontSize(16);
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.text(branding.company_name, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
  }
  
  // Company Tagline
  if (branding?.company_tagline) {
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const lines = doc.splitTextToSize(branding.company_tagline, pageWidth - 28);
    doc.text(lines, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += (lines.length * 4) + 6;
  }
  
  // Title with template type
  doc.setFontSize(20);
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  const templateTitles = {
    executive: 'Executive Summary Report',
    technical: 'Technical Analysis Report',
    compliance: 'Compliance Assessment Report'
  };
  doc.text(templateTitles[template], pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;
  
  // Date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;
  
  // Current Score Section
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Current Privacy Score', 14, yPosition);
  yPosition += 15;
  
  doc.setFontSize(32);
  const scoreColor = currentScore < 40 
    ? secondaryColor
    : currentScore <= 70 
    ? { r: 234, g: 179, b: 8 }
    : { r: 239, g: 68, b: 68 };
  doc.setTextColor(scoreColor.r, scoreColor.g, scoreColor.b);
  doc.text(`${currentScore}/100`, 14, yPosition);
  yPosition += 8;
  
  // Risk Assessment
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const riskText = currentScore < 40 
    ? 'Low risk - Your digital footprint is well protected' 
    : currentScore <= 70 
    ? 'Medium risk - Some areas need attention' 
    : 'High risk - Immediate action recommended';
  doc.text(riskText, 14, yPosition);
  yPosition += 17;
  
  // Summary Statistics (all templates)
  if (trendData.length > 0) {
    const latest = trendData[trendData.length - 1];
    const earliest = trendData[0];
    const scoreChange = latest.privacyScore - earliest.privacyScore;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Summary Statistics', 14, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    
    if (template === 'executive') {
      // Executive: Only key metrics
      doc.text(`Score Change: ${scoreChange > 0 ? '+' : ''}${scoreChange}`, 14, yPosition);
      yPosition += 7;
      doc.text(`Critical Issues: ${latest.highRiskCount}`, 14, yPosition);
      yPosition += 7;
      doc.text(`Data Points Analyzed: ${latest.totalSources}`, 14, yPosition);
      yPosition += 8;
    } else if (template === 'compliance') {
      // Compliance: Risk-focused metrics
      doc.text(`Total Data Points: ${trendData.length}`, 14, yPosition);
      yPosition += 7;
      doc.text(`Risk Trend: ${scoreChange > 0 ? 'Increasing' : scoreChange < 0 ? 'Decreasing' : 'Stable'}`, 14, yPosition);
      yPosition += 7;
      doc.text(`High Risk Items: ${latest.highRiskCount} (Requires Immediate Action)`, 14, yPosition);
      yPosition += 7;
      doc.text(`Medium Risk Items: ${latest.mediumRiskCount} (Monitor Closely)`, 14, yPosition);
      yPosition += 7;
      doc.text(`Low Risk Items: ${latest.lowRiskCount} (Acceptable Risk Level)`, 14, yPosition);
      yPosition += 8;
    } else {
      // Technical: All metrics
      doc.text(`Total Data Points: ${trendData.length}`, 14, yPosition);
      yPosition += 7;
      doc.text(`Score Change: ${scoreChange > 0 ? '+' : ''}${scoreChange}`, 14, yPosition);
      yPosition += 7;
      doc.text(`Latest High Risk: ${latest.highRiskCount}`, 14, yPosition);
      yPosition += 7;
      doc.text(`Latest Medium Risk: ${latest.mediumRiskCount}`, 14, yPosition);
      yPosition += 7;
      doc.text(`Latest Total Sources: ${latest.totalSources}`, 14, yPosition);
      yPosition += 8;
    }
  }
  
  // Add compliance statement for compliance template
  if (template === 'compliance') {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Compliance Assessment', 14, yPosition);
    yPosition += 8;
    
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const complianceText = [
      'This report provides a comprehensive assessment of digital privacy risks and compliance status.',
      'All findings have been categorized according to industry-standard risk levels.',
      'Immediate action is recommended for high-risk items to maintain compliance posture.',
      ''
    ];
    complianceText.forEach(line => {
      doc.text(line, 14, yPosition);
      yPosition += 5;
    });
    yPosition += 5;
  }

  // Historical Data Table
  if (trendData.length > 0) {
    // Skip detailed table for executive template
    if (template === 'executive') {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Recent Trend Summary', 14, yPosition);
      yPosition += 5;
      
      // Show only last 5 data points for executive
      const recentData = trendData.slice(-5).map(point => [
        point.date,
        point.privacyScore.toString(),
        point.highRiskCount.toString()
      ]);
      
      (doc as any).autoTable({
        startY: yPosition,
        head: [['Date', 'Score', 'Critical Issues']],
        body: recentData,
        theme: 'striped',
        headStyles: { 
          fillColor: [primaryColor.r, primaryColor.g, primaryColor.b]
        },
        styles: { fontSize: 9 }
      });
    } else {
      // Full table for technical and compliance
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Historical Trend Data', 14, yPosition);
      yPosition += 5;
      
      const tableData = trendData.map(point => [
        point.date,
        point.privacyScore.toString(),
        point.totalSources.toString(),
        point.highRiskCount.toString(),
        point.mediumRiskCount.toString(),
        point.lowRiskCount.toString()
      ]);
      
      (doc as any).autoTable({
        startY: yPosition,
        head: [['Date', 'Score', 'Sources', 'High Risk', 'Med Risk', 'Low Risk']],
        body: tableData,
        theme: 'striped',
        headStyles: { 
          fillColor: [primaryColor.r, primaryColor.g, primaryColor.b]
        },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 20 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 }
        }
      });
    }
  }
  
  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
    // Save
    doc.save(`digital-dna-report-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('PDF generation failed:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to generate ${template} PDF report: ${errorMsg}`);
  }
};
