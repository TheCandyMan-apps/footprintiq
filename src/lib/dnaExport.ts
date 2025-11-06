import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { TrendDataPoint } from './trends';

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

export const exportDNAasPDF = async (trendData: TrendDataPoint[], currentScore: number) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(99, 102, 241); // primary color
  doc.text('Digital DNA Report', pageWidth / 2, 20, { align: 'center' });
  
  // Date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: 'center' });
  
  // Current Score Section
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Current Privacy Score', 14, 45);
  
  doc.setFontSize(32);
  const scoreColor = currentScore < 40 ? [16, 185, 129] : currentScore <= 70 ? [234, 179, 8] : [239, 68, 68];
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.text(`${currentScore}/100`, 14, 60);
  
  // Risk Assessment
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const riskText = currentScore < 40 
    ? 'Low risk - Your digital footprint is well protected' 
    : currentScore <= 70 
    ? 'Medium risk - Some areas need attention' 
    : 'High risk - Immediate action recommended';
  doc.text(riskText, 14, 68);
  
  // Summary Statistics
  if (trendData.length > 0) {
    const latest = trendData[trendData.length - 1];
    const earliest = trendData[0];
    const scoreChange = latest.privacyScore - earliest.privacyScore;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Summary Statistics', 14, 85);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Total Data Points: ${trendData.length}`, 14, 93);
    doc.text(`Score Change: ${scoreChange > 0 ? '+' : ''}${scoreChange}`, 14, 100);
    doc.text(`Latest High Risk: ${latest.highRiskCount}`, 14, 107);
    doc.text(`Latest Medium Risk: ${latest.mediumRiskCount}`, 14, 114);
    doc.text(`Latest Total Sources: ${latest.totalSources}`, 14, 121);
  }
  
  // Historical Data Table
  if (trendData.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Historical Trend Data', 14, 135);
    
    const tableData = trendData.map(point => [
      point.date,
      point.privacyScore.toString(),
      point.totalSources.toString(),
      point.highRiskCount.toString(),
      point.mediumRiskCount.toString(),
      point.lowRiskCount.toString()
    ]);
    
    (doc as any).autoTable({
      startY: 140,
      head: [['Date', 'Score', 'Sources', 'High Risk', 'Med Risk', 'Low Risk']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
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
