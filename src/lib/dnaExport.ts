import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { TrendDataPoint } from './trends';

export interface BrandingSettings {
  company_name?: string;
  company_tagline?: string;
  logo_url?: string | null;
  primary_color?: string;
  secondary_color?: string;
}

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
  branding?: BrandingSettings
) => {
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
  
  // Logo (if provided)
  if (branding?.logo_url) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = branding.logo_url!;
      });
      doc.addImage(img, 'PNG', 14, yPosition, 30, 30);
      yPosition += 35;
    } catch (error) {
      console.error('Error loading logo:', error);
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
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.text('Digital DNA Report', pageWidth / 2, yPosition, { align: 'center' });
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
  
  // Summary Statistics
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
  
  // Historical Data Table
  if (trendData.length > 0) {
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
};
