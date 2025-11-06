import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UsernameScanComparison } from '@/lib/usernameScanComparison';

export const exportComparisonToPDF = (comparison: UsernameScanComparison) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Title
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text('Username Scan Comparison Report', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Scan Information
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(`Report Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Scan Details Box
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('Scan 1:', 15, yPos);
  doc.setFont(undefined, 'bold');
  doc.text(comparison.scan1Username, 35, yPos);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(new Date(comparison.scan1Date).toLocaleString(), 35, yPos + 5);
  
  yPos += 15;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('Scan 2:', 15, yPos);
  doc.setFont(undefined, 'bold');
  doc.text(comparison.scan2Username, 35, yPos);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(new Date(comparison.scan2Date).toLocaleString(), 35, yPos + 5);
  
  yPos += 20;

  // Summary Statistics
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Summary Statistics', 15, yPos);
  yPos += 10;

  const summaryData = [
    ['Metric', 'Count', 'Description'],
    ['New Sites', comparison.newSites.length.toString(), 'Sites found in second scan only'],
    ['Removed Sites', comparison.removedSites.length.toString(), 'Sites found in first scan only'],
    ['Common Sites', comparison.commonSites.length.toString(), 'Sites found in both scans'],
    ['Status Changes', comparison.statusChanges.length.toString(), 'Sites with different statuses'],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [summaryData[0]],
    body: summaryData.slice(1),
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 15, right: 15 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Detailed Statistics Comparison
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.text('Detailed Statistics', 15, yPos);
  yPos += 10;

  const statsData = [
    ['Metric', comparison.scan1Username, comparison.scan2Username, 'Change'],
    [
      'Total Sites',
      comparison.scan1Stats.total.toString(),
      comparison.scan2Stats.total.toString(),
      (comparison.scan2Stats.total - comparison.scan1Stats.total).toString(),
    ],
    [
      'Found',
      comparison.scan1Stats.found.toString(),
      comparison.scan2Stats.found.toString(),
      (comparison.scan2Stats.found - comparison.scan1Stats.found).toString(),
    ],
    [
      'Claimed',
      comparison.scan1Stats.claimed.toString(),
      comparison.scan2Stats.claimed.toString(),
      (comparison.scan2Stats.claimed - comparison.scan1Stats.claimed).toString(),
    ],
    [
      'Not Found',
      comparison.scan1Stats.notFound.toString(),
      comparison.scan2Stats.notFound.toString(),
      (comparison.scan2Stats.notFound - comparison.scan1Stats.notFound).toString(),
    ],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [statsData[0]],
    body: statsData.slice(1),
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 15, right: 15 },
    columnStyles: {
      3: { textColor: [0, 0, 0], fontStyle: 'bold' },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // New Sites Details
  if (comparison.newSites.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(34, 197, 94); // Green
    doc.text(`New Sites Found (${comparison.newSites.length})`, 15, yPos);
    yPos += 10;

    const newSitesData = comparison.newSites.map((site) => [
      site.site,
      site.status || 'unknown',
      site.url || 'N/A',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Site', 'Status', 'URL']],
      body: newSitesData,
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94] },
      margin: { left: 15, right: 15 },
      styles: { fontSize: 8 },
      columnStyles: {
        2: { cellWidth: 80 },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Status Changes Details
  if (comparison.statusChanges.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(245, 158, 11); // Amber
    doc.text(`Status Changes (${comparison.statusChanges.length})`, 15, yPos);
    yPos += 10;

    const statusChangesData = comparison.statusChanges.map((change: any) => [
      change.site,
      change.oldStatus || 'unknown',
      change.newStatus || 'unknown',
      change.url || 'N/A',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Site', 'Old Status', 'New Status', 'URL']],
      body: statusChangesData,
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11] },
      margin: { left: 15, right: 15 },
      styles: { fontSize: 8 },
      columnStyles: {
        3: { cellWidth: 70 },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Removed Sites Details
  if (comparison.removedSites.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(239, 68, 68); // Red
    doc.text(`Removed Sites (${comparison.removedSites.length})`, 15, yPos);
    yPos += 10;

    const removedSitesData = comparison.removedSites.map((site) => [
      site.site,
      site.status || 'unknown',
      site.url || 'N/A',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Site', 'Status', 'URL']],
      body: removedSitesData,
      theme: 'grid',
      headStyles: { fillColor: [239, 68, 68] },
      margin: { left: 15, right: 15 },
      styles: { fontSize: 8 },
      columnStyles: {
        2: { cellWidth: 80 },
      },
    });
  }

  // Add visual chart representation
  doc.addPage();
  yPos = 20;
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Visual Comparison', 15, yPos);
  yPos += 15;

  // Draw simple bar chart for statistics comparison
  const chartStartY = yPos;
  const chartHeight = 80;
  const barWidth = 30;
  const spacing = 10;
  const maxValue = Math.max(
    comparison.scan1Stats.total,
    comparison.scan2Stats.total,
    comparison.scan1Stats.found,
    comparison.scan2Stats.found
  );

  const drawBar = (x: number, y: number, height: number, color: [number, number, number], label: string, value: number) => {
    doc.setFillColor(...color);
    doc.rect(x, y - height, barWidth, height, 'F');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(label, x + barWidth / 2, y + 5, { align: 'center' });
    doc.text(value.toString(), x + barWidth / 2, y - height - 2, { align: 'center' });
  };

  let xPos = 20;

  // Total Sites
  doc.setFontSize(10);
  doc.text('Total Sites', xPos, chartStartY - 5);
  const scan1TotalHeight = (comparison.scan1Stats.total / maxValue) * chartHeight;
  const scan2TotalHeight = (comparison.scan2Stats.total / maxValue) * chartHeight;
  drawBar(xPos, chartStartY + chartHeight, scan1TotalHeight, [59, 130, 246], 'Scan 1', comparison.scan1Stats.total);
  drawBar(xPos + barWidth + spacing, chartStartY + chartHeight, scan2TotalHeight, [139, 92, 246], 'Scan 2', comparison.scan2Stats.total);

  xPos += (barWidth * 2) + spacing * 3 + 20;

  // Found
  doc.text('Found', xPos, chartStartY - 5);
  const scan1FoundHeight = (comparison.scan1Stats.found / maxValue) * chartHeight;
  const scan2FoundHeight = (comparison.scan2Stats.found / maxValue) * chartHeight;
  drawBar(xPos, chartStartY + chartHeight, scan1FoundHeight, [34, 197, 94], 'Scan 1', comparison.scan1Stats.found);
  drawBar(xPos + barWidth + spacing, chartStartY + chartHeight, scan2FoundHeight, [74, 222, 128], 'Scan 2', comparison.scan2Stats.found);

  xPos += (barWidth * 2) + spacing * 3 + 20;

  // Claimed
  doc.text('Claimed', xPos, chartStartY - 5);
  const scan1ClaimedHeight = (comparison.scan1Stats.claimed / maxValue) * chartHeight;
  const scan2ClaimedHeight = (comparison.scan2Stats.claimed / maxValue) * chartHeight;
  drawBar(xPos, chartStartY + chartHeight, scan1ClaimedHeight, [59, 130, 246], 'Scan 1', comparison.scan1Stats.claimed);
  drawBar(xPos + barWidth + spacing, chartStartY + chartHeight, scan2ClaimedHeight, [96, 165, 250], 'Scan 2', comparison.scan2Stats.claimed);

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `FootprintIQ - Username Scan Comparison | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const filename = `scan_comparison_${comparison.scan1Username}_vs_${comparison.scan2Username}_${Date.now()}.pdf`;
  doc.save(filename);
};
