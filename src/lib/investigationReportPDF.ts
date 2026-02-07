import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  PDF_COLORS,
  PDF_SPACING,
  SEVERITY_COLORS,
  PDFBranding,
  addPageHeader,
  addSectionHeader,
  addSubsectionHeader,
  addKeyValue,
  addStatCard,
  addPageFooters,
  addBulletList,
  checkPageBreak,
  getTableStyles,
  setFont,
  setColor,
  setFillColor,
  hexToRgb,
} from '@/lib/pdfStyles';
import { ScanJob, ScanResult, TabCounts } from '@/hooks/useScanResultsData';

interface InvestigationReportData {
  job: ScanJob;
  results: ScanResult[];
  grouped: {
    found: any[];
    claimed: any[];
    not_found: any[];
    unknown: any[];
  };
  tabCounts: TabCounts;
  breachResults: any[];
  geoLocations: Array<{
    ip: string;
    formatted: string;
    region: string;
    coordinates: { lat: number; lng: number };
  }>;
  providerEvents?: Array<{
    provider: string;
    event_type: string;
    message: string;
    result_count?: number;
    created_at: string;
  }>;
}

// ==================== HELPERS ====================

function extractSite(result: any): string {
  if (result.evidence && Array.isArray(result.evidence)) {
    const siteEvidence = result.evidence.find((e: any) => e.key === 'site');
    if (siteEvidence?.value) return siteEvidence.value;
  }
  if (result.meta?.platform) return result.meta.platform;
  if (result.meta?.site) return result.meta.site;
  if (result.site) return result.site;
  return 'Unknown';
}

function extractUrl(result: any): string {
  if (result.evidence && Array.isArray(result.evidence)) {
    const urlEvidence = result.evidence.find((e: any) => e.key === 'url');
    if (urlEvidence?.value) return urlEvidence.value;
  }
  if (result.url) return result.url;
  return '';
}

function deriveStatus(result: any): string {
  if (result.status) return result.status.toLowerCase();
  if (result.kind === 'profile_presence') return 'found';
  if (result.evidence && Array.isArray(result.evidence)) {
    const existsEvidence = result.evidence.find((e: any) => e.key === 'exists');
    if (existsEvidence?.value === true) return 'found';
    if (existsEvidence?.value === false) return 'not_found';
  }
  const meta = result.meta || result.metadata || {};
  if (meta.status) return meta.status.toLowerCase();
  if (meta.exists === true) return 'found';
  if (meta.exists === false) return 'not_found';
  return 'unknown';
}

/** Clean platform name by removing [+] prefix */
function cleanPlatformName(name: string): string {
  return name.replace(/^\[?\+?\]?\s*/g, '').trim();
}

/** Format duration in human-readable form */
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

/** Format date nicely */
function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

// ==================== COVER PAGE ====================

function addEnhancedCoverPage(
  doc: jsPDF,
  options: {
    title: string;
    subtitle?: string;
    target?: string;
    scanId?: string;
    date?: Date;
    branding?: PDFBranding;
    stats?: { accounts: number; breaches: number; locations: number; total: number };
    scanDuration?: string;
    scanStatus?: string;
  }
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const { title, subtitle, target, scanId, date = new Date(), branding, stats, scanDuration, scanStatus } = options;

  const primaryColor = branding?.primaryColor
    ? hexToRgb(branding.primaryColor)
    : PDF_COLORS.primary;

  // === GRADIENT HEADER ===
  const headerHeight = 180;

  // Dark base layer
  doc.setFillColor(
    Math.max(0, primaryColor.r - 20),
    Math.max(0, primaryColor.g - 20),
    Math.max(0, primaryColor.b - 20)
  );
  doc.rect(0, 0, pageWidth, headerHeight, 'F');

  // Main color layer
  setFillColor(doc, primaryColor);
  doc.rect(0, 0, pageWidth, headerHeight - 8, 'F');

  // Lighter accent strip at bottom of header
  doc.setFillColor(
    Math.min(255, primaryColor.r + 40),
    Math.min(255, primaryColor.g + 40),
    Math.min(255, primaryColor.b + 40)
  );
  doc.rect(0, headerHeight - 8, pageWidth, 8, 'F');

  // === SHIELD ICON ===
  let yPos = 45;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(1.8);
  const sx = PDF_SPACING.margin + 6;
  // Shield body
  doc.roundedRect(sx, yPos - 8, 22, 28, 6, 6, 'S');
  // Shield checkmark
  doc.line(sx + 6, yPos + 6, sx + 10, yPos + 11);
  doc.line(sx + 10, yPos + 11, sx + 16, yPos + 2);

  // Company name
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  setColor(doc, PDF_COLORS.white);
  doc.text(branding?.companyName || 'FootprintIQ', PDF_SPACING.margin + 38, yPos + 8);

  // Tagline
  yPos += 24;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(220, 230, 255);
  doc.text(branding?.tagline || 'Digital Footprint Intelligence', PDF_SPACING.margin + 38, yPos);

  // Main title
  yPos = 110;
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  setColor(doc, PDF_COLORS.white);
  doc.text(title, PDF_SPACING.margin, yPos);

  if (subtitle) {
    yPos += 22;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(210, 225, 255);
    doc.text(subtitle, PDF_SPACING.margin, yPos);
  }

  // === SCAN TARGET BOX ===
  yPos = headerHeight + 25;
  const boxHeight = 80;
  setFillColor(doc, PDF_COLORS.white);
  doc.setDrawColor(PDF_COLORS.slate200.r, PDF_COLORS.slate200.g, PDF_COLORS.slate200.b);
  doc.setLineWidth(0.75);
  doc.roundedRect(PDF_SPACING.margin, yPos, pageWidth - PDF_SPACING.margin * 2, boxHeight, 6, 6, 'FD');

  // Left accent bar on the target box
  setFillColor(doc, primaryColor);
  doc.roundedRect(PDF_SPACING.margin, yPos, 5, boxHeight, 3, 0, 'F');
  doc.rect(PDF_SPACING.margin + 3, yPos, 2, boxHeight, 'F');

  const boxX = PDF_SPACING.margin + 18;

  yPos += 18;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  setColor(doc, PDF_COLORS.slate400);
  doc.text('SCAN TARGET', boxX, yPos);

  yPos += 18;
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  setColor(doc, PDF_COLORS.slate900);
  doc.text(target || 'N/A', boxX, yPos);

  yPos += 20;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setColor(doc, PDF_COLORS.slate400);

  const detailParts: string[] = [];
  if (scanId) detailParts.push(`ID: ${scanId.substring(0, 8)}…`);
  if (scanStatus) detailParts.push(`Status: ${scanStatus.toUpperCase()}`);
  if (scanDuration) detailParts.push(`Duration: ${scanDuration}`);
  detailParts.push(`Generated: ${date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`);
  doc.text(detailParts.join('   •   '), boxX, yPos);

  // === STATS CARDS ===
  if (stats) {
    yPos = headerHeight + boxHeight + 45;
    const cardGap = 10;
    const cardWidth = (pageWidth - PDF_SPACING.margin * 2 - cardGap * 3) / 4;

    const statItems = [
      { label: 'Total Findings', value: stats.total, color: primaryColor },
      { label: 'Accounts', value: stats.accounts, color: PDF_COLORS.success },
      { label: 'Breaches', value: stats.breaches, color: stats.breaches > 0 ? PDF_COLORS.danger : PDF_COLORS.slate400 },
      { label: 'Locations', value: stats.locations, color: stats.locations > 0 ? PDF_COLORS.info : PDF_COLORS.slate400 },
    ];

    statItems.forEach((stat, index) => {
      const x = PDF_SPACING.margin + (cardWidth + cardGap) * index;

      // Card background
      setFillColor(doc, PDF_COLORS.slate50);
      doc.roundedRect(x, yPos, cardWidth, 62, 5, 5, 'F');

      // Top colored accent bar
      setFillColor(doc, stat.color);
      doc.roundedRect(x, yPos, cardWidth, 5, 5, 0, 'F');
      doc.rect(x, yPos + 3, cardWidth, 2, 'F');

      // Value
      doc.setFontSize(26);
      doc.setFont('helvetica', 'bold');
      setColor(doc, stat.color);
      doc.text(String(stat.value), x + cardWidth / 2, yPos + 35, { align: 'center' });

      // Label
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      setColor(doc, PDF_COLORS.slate500);
      doc.text(stat.label, x + cardWidth / 2, yPos + 52, { align: 'center' });
    });
  }

  // === RISK SCORE SECTION ===
  yPos = headerHeight + boxHeight + 130;
  const riskScore = stats ? Math.max(0, 100 - (stats.breaches * 5)) : 100;
  const riskColor = riskScore >= 80 ? PDF_COLORS.success : riskScore >= 60 ? PDF_COLORS.warning : PDF_COLORS.danger;
  const riskLabel = riskScore >= 80 ? 'Low Risk' : riskScore >= 60 ? 'Moderate Risk' : 'High Risk';

  const riskBoxWidth = (pageWidth - PDF_SPACING.margin * 2);
  setFillColor(doc, PDF_COLORS.slate50);
  doc.roundedRect(PDF_SPACING.margin, yPos, riskBoxWidth, 65, 5, 5, 'F');

  // Risk score circle-like display (left)
  const circleX = PDF_SPACING.margin + 50;
  const circleY = yPos + 33;

  // Outer ring
  doc.setDrawColor(riskColor.r, riskColor.g, riskColor.b);
  doc.setLineWidth(3);
  doc.circle(circleX, circleY, 22, 'S');

  // Score number inside
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  setColor(doc, riskColor);
  doc.text(String(riskScore), circleX, circleY + 3, { align: 'center' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  setColor(doc, PDF_COLORS.slate400);
  doc.text('/100', circleX, circleY + 12, { align: 'center' });

  // Risk label (right of circle)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  setColor(doc, riskColor);
  doc.text(riskLabel, PDF_SPACING.margin + 100, yPos + 28);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setColor(doc, PDF_COLORS.slate500);
  doc.text('Based on severity and breach count analysis', PDF_SPACING.margin + 100, yPos + 44);

  // === FOOTER ===
  // Confidential badge
  const footerY = pageHeight - 55;

  setFillColor(doc, { r: 254, g: 226, b: 226 });
  doc.setDrawColor(254, 202, 202);
  doc.setLineWidth(0.5);
  doc.roundedRect(PDF_SPACING.margin, footerY, 100, 18, 3, 3, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  setColor(doc, PDF_COLORS.danger);
  doc.text('CONFIDENTIAL', PDF_SPACING.margin + 12, footerY + 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  setColor(doc, PDF_COLORS.slate400);
  doc.text('For authorized use only', PDF_SPACING.margin + 108, footerY + 12);

  // Bottom accent bar
  setFillColor(doc, primaryColor);
  doc.rect(0, pageHeight - 6, pageWidth, 6, 'F');
}

// ==================== SEVERITY BREAKDOWN ====================

function addSeverityBreakdown(doc: jsPDF, severityCounts: Record<string, number>, yPos: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const totalBreaches = Object.values(severityCounts).reduce((a, b) => a + b, 0);

  if (totalBreaches === 0) return yPos;

  setFillColor(doc, PDF_COLORS.slate50);
  doc.roundedRect(PDF_SPACING.margin, yPos, pageWidth - PDF_SPACING.margin * 2, 75, 5, 5, 'F');

  yPos += 16;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  setColor(doc, PDF_COLORS.slate500);
  doc.text('SEVERITY DISTRIBUTION', PDF_SPACING.margin + 12, yPos);

  yPos += 20;

  const severities = [
    { key: 'critical', label: 'Critical', color: SEVERITY_COLORS.critical },
    { key: 'high', label: 'High', color: SEVERITY_COLORS.high },
    { key: 'medium', label: 'Medium', color: SEVERITY_COLORS.medium },
    { key: 'low', label: 'Low', color: SEVERITY_COLORS.low },
  ];

  const columnWidth = (pageWidth - PDF_SPACING.margin * 2 - 24) / 4;

  severities.forEach((sev, index) => {
    const x = PDF_SPACING.margin + 12 + columnWidth * index;
    const count = severityCounts[sev.key] || 0;

    // Colored pill badge
    const badgeWidth = 50;
    setFillColor(doc, sev.color);
    doc.roundedRect(x, yPos - 8, badgeWidth, 20, 4, 4, 'F');

    // Count inside badge
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    setColor(doc, PDF_COLORS.white);
    doc.text(String(count), x + 12, yPos + 4);

    // Label next to count
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(sev.label, x + 28, yPos + 4);

    // Label below
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    setColor(doc, PDF_COLORS.slate500);
    doc.text(`${Math.round((count / totalBreaches) * 100)}%`, x + badgeWidth / 2, yPos + 22, { align: 'center' });
  });

  return yPos + 45;
}

// ==================== MAIN EXPORT FUNCTION ====================

export async function generateInvestigationReport(data: InvestigationReportData): Promise<void> {
  const { job, results, grouped, tabCounts, breachResults, geoLocations, providerEvents = [] } = data;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const branding: PDFBranding = {
    companyName: 'FootprintIQ',
    tagline: 'Digital Footprint Intelligence',
    primaryColor: '#2563eb',
  };

  // Calculate duration
  let scanDuration: string | undefined;
  if (job.started_at && job.finished_at) {
    const seconds = Math.round((new Date(job.finished_at).getTime() - new Date(job.started_at).getTime()) / 1000);
    scanDuration = formatDuration(seconds);
  }

  // ==================== PAGE 1: COVER ====================
  addEnhancedCoverPage(doc, {
    title: 'Investigation Report',
    subtitle: 'Digital Footprint Analysis',
    target: job.username,
    scanId: job.id,
    date: new Date(),
    branding,
    stats: {
      total: results.length,
      accounts: tabCounts.accounts,
      breaches: tabCounts.breaches,
      locations: tabCounts.map,
    },
    scanDuration,
    scanStatus: job.status,
  });

  // ==================== PAGE 2: EXECUTIVE SUMMARY ====================
  doc.addPage();
  let yPos = addPageHeader(doc, 'Executive Summary', branding);

  // Scan details box
  const detailsBoxHeight = 110;
  setFillColor(doc, PDF_COLORS.slate50);
  doc.setDrawColor(PDF_COLORS.slate200.r, PDF_COLORS.slate200.g, PDF_COLORS.slate200.b);
  doc.setLineWidth(0.5);
  doc.roundedRect(PDF_SPACING.margin, yPos, pageWidth - PDF_SPACING.margin * 2, detailsBoxHeight, 5, 5, 'FD');

  yPos += 16;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  setColor(doc, PDF_COLORS.slate400);
  doc.text('SCAN DETAILS', PDF_SPACING.margin + 14, yPos);

  yPos += 16;
  const col1X = PDF_SPACING.margin + 14;
  const col1ValX = PDF_SPACING.margin + 80;
  const col2X = pageWidth / 2 + 10;
  const col2ValX = pageWidth / 2 + 76;

  // Row 1
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setColor(doc, PDF_COLORS.slate400);
  doc.text('Target:', col1X, yPos);
  doc.setFont('helvetica', 'bold');
  setColor(doc, PDF_COLORS.slate900);
  doc.text(job.username, col1ValX, yPos);

  setColor(doc, PDF_COLORS.slate400);
  doc.setFont('helvetica', 'normal');
  doc.text('Status:', col2X, yPos);
  const statusColor = job.status === 'completed' ? PDF_COLORS.success :
    job.status === 'failed' ? PDF_COLORS.danger : PDF_COLORS.warning;
  setFillColor(doc, statusColor);
  doc.roundedRect(col2ValX, yPos - 8, 65, 14, 3, 3, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  setColor(doc, PDF_COLORS.white);
  doc.text(job.status.toUpperCase(), col2ValX + 8, yPos + 1);

  // Row 2
  yPos += 20;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setColor(doc, PDF_COLORS.slate400);
  doc.text('Scan ID:', col1X, yPos);
  doc.setFont('helvetica', 'normal');
  setColor(doc, PDF_COLORS.slate700);
  doc.text(job.id.substring(0, 28) + '…', col1ValX, yPos);

  if (job.started_at) {
    setColor(doc, PDF_COLORS.slate400);
    doc.text('Started:', col2X, yPos);
    setColor(doc, PDF_COLORS.slate700);
    doc.text(formatDate(job.started_at), col2ValX, yPos);
  }

  // Row 3
  yPos += 20;
  if (job.finished_at) {
    setColor(doc, PDF_COLORS.slate400);
    doc.text('Completed:', col1X, yPos);
    setColor(doc, PDF_COLORS.slate700);
    doc.text(formatDate(job.finished_at), col1ValX, yPos);

    if (scanDuration) {
      setColor(doc, PDF_COLORS.slate400);
      doc.text('Duration:', col2X, yPos);
      doc.setFont('helvetica', 'bold');
      setColor(doc, PDF_COLORS.primary);
      doc.text(scanDuration, col2ValX, yPos);
    }
  }

  yPos += 40;

  // Results Summary
  yPos = addSectionHeader(doc, 'Results Summary', yPos);

  const summaryStats: Array<{ label: string; value: number; color: { r: number; g: number; b: number } }> = [
    { label: 'Found', value: grouped.found.length, color: PDF_COLORS.success },
    { label: 'Claimed', value: grouped.claimed.length, color: PDF_COLORS.info },
    { label: 'Not Found', value: grouped.not_found.length, color: PDF_COLORS.slate500 },
  ];
  if (grouped.unknown.length > 0) {
    summaryStats.push({ label: 'Unknown', value: grouped.unknown.length, color: PDF_COLORS.slate400 });
  }
  yPos = addStatCard(doc, summaryStats, yPos);

  // Add provider summary if available
  if (providerEvents.length > 0) {
    yPos += 10;
    yPos = addSubsectionHeader(doc, 'Providers Used', yPos);

    const providerMap = new Map<string, { results: number; status: string }>();
    providerEvents.forEach(event => {
      const existing = providerMap.get(event.provider) || { results: 0, status: 'pending' };
      if (event.event_type === 'success' || event.event_type === 'completed') {
        existing.status = 'success';
        existing.results = event.result_count || existing.results;
      } else if (event.event_type === 'failed') {
        existing.status = 'failed';
      }
      providerMap.set(event.provider, existing);
    });

    const providerItems = Array.from(providerMap.entries())
      .sort((a, b) => b[1].results - a[1].results)
      .map(([name, info]) => `${cleanPlatformName(name)}: ${info.results} result${info.results !== 1 ? 's' : ''} (${info.status})`);

    if (providerItems.length > 0) {
      yPos = addBulletList(doc, providerItems.slice(0, 8), yPos);
    }
  }

  // ==================== ACCOUNTS SECTION ====================
  if (results.length > 0) {
    doc.addPage();
    yPos = addPageHeader(doc, 'Account Discovery', branding);
    yPos = addSectionHeader(doc, 'Discovered Accounts', yPos);

    const foundAccounts = results.filter(r => {
      const status = deriveStatus(r);
      return status === 'found' || status === 'claimed';
    });

    if (foundAccounts.length > 0) {
      // Show more accounts per page (up to 80)
      const maxRows = 80;
      const tableData = foundAccounts.slice(0, maxRows).map(account => {
        const site = cleanPlatformName(extractSite(account));
        const url = extractUrl(account);
        const status = deriveStatus(account);
        return [
          site,
          status.charAt(0).toUpperCase() + status.slice(1),
          url ? (url.length > 50 ? url.substring(0, 47) + '...' : url) : '-',
        ];
      });

      autoTable(doc, {
        startY: yPos,
        head: [['Platform', 'Status', 'URL']],
        body: tableData,
        ...getTableStyles(),
        styles: {
          ...getTableStyles().styles,
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          ...getTableStyles().headStyles,
          fontSize: 8,
          cellPadding: 4,
        },
        bodyStyles: {
          ...getTableStyles().bodyStyles,
          fontSize: 8,
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 100, fontStyle: 'bold' },
          1: { cellWidth: 50 },
          2: { cellWidth: 'auto' },
        },
      });

      yPos = (doc as any).lastAutoTable.finalY + 12;

      if (foundAccounts.length > maxRows) {
        setFont(doc, 'small');
        setColor(doc, PDF_COLORS.slate500);
        doc.text(`… and ${foundAccounts.length - maxRows} more accounts`, PDF_SPACING.margin, yPos);
        yPos += 14;
      }
    } else {
      setFillColor(doc, PDF_COLORS.slate50);
      doc.roundedRect(PDF_SPACING.margin, yPos, pageWidth - PDF_SPACING.margin * 2, 40, 4, 4, 'F');
      setFont(doc, 'body');
      setColor(doc, PDF_COLORS.slate500);
      doc.text('No accounts discovered in this scan.', PDF_SPACING.margin + 15, yPos + 25);
      yPos += 55;
    }

    // Platform categories breakdown
    yPos = checkPageBreak(doc, yPos, 120);
    yPos = addSubsectionHeader(doc, 'Platform Categories', yPos);

    const categories: Record<string, number> = {};
    foundAccounts.forEach(account => {
      const platform = extractSite(account).toLowerCase();
      let category = 'Other';
      if (['facebook', 'twitter', 'instagram', 'tiktok', 'snapchat', 'linkedin', 'reddit', 'mastodon', 'x.com', 'truthsocial', 'threads'].some(s => platform.includes(s))) {
        category = 'Social Media';
      } else if (['github', 'gitlab', 'stackoverflow', 'behance', 'dribbble', 'codepen', 'bitbucket'].some(s => platform.includes(s))) {
        category = 'Professional';
      } else if (['youtube', 'twitch', 'spotify', 'soundcloud', 'vimeo', 'dailymotion', 'bandcamp'].some(s => platform.includes(s))) {
        category = 'Media & Entertainment';
      } else if (['steam', 'xbox', 'playstation', 'discord', 'roblox', 'nitrotype'].some(s => platform.includes(s))) {
        category = 'Gaming';
      } else if (['pinterest', 'tumblr', 'flickr', 'imgur', 'giphy', 'newgrounds'].some(s => platform.includes(s))) {
        category = 'Creative & Visual';
      } else if (['telegram', 'signal', 'whatsapp'].some(s => platform.includes(s))) {
        category = 'Messaging';
      }
      categories[category] = (categories[category] || 0) + 1;
    });

    const categoryEntries = Object.entries(categories).sort((a, b) => b[1] - a[1]);

    if (categoryEntries.length > 0) {
      // Visual category table instead of bullet list
      const catData = categoryEntries.map(([cat, count]) => [
        cat,
        `${count} account${count > 1 ? 's' : ''}`,
        `${Math.round((count / foundAccounts.length) * 100)}%`,
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Category', 'Count', 'Share']],
        body: catData,
        ...getTableStyles(),
        styles: {
          ...getTableStyles().styles,
          fontSize: 9,
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 160 },
          1: { cellWidth: 120 },
          2: { halign: 'right' as const, cellWidth: 'auto' },
        },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    // Email validation if present
    const emailResult = results.find(r => (r as any).kind === 'email_validation' || (r as any).type?.includes('email'));
    if (emailResult) {
      yPos = checkPageBreak(doc, yPos, 60);
      yPos += 10;
      yPos = addSubsectionHeader(doc, 'Email Validation', yPos);

      setFillColor(doc, PDF_COLORS.slate50);
      doc.roundedRect(PDF_SPACING.margin, yPos, pageWidth - PDF_SPACING.margin * 2, 35, 4, 4, 'F');

      setFont(doc, 'body');
      setColor(doc, PDF_COLORS.slate700);
      const meta = emailResult.meta as Record<string, any> | undefined;
      const deliverable = meta?.deliverable || emailResult.evidence?.find((e: any) => e.key === 'deliverable')?.value;
      doc.text(`Deliverable: ${deliverable !== undefined ? (deliverable ? 'Yes' : 'No') : 'Unknown'}`, PDF_SPACING.margin + 15, yPos + 22);
    }
  }

  // ==================== BREACHES SECTION ====================
  if (breachResults.length > 0) {
    doc.addPage();
    yPos = addPageHeader(doc, 'Security Findings', branding);
    yPos = addSectionHeader(doc, 'Breach Analysis', yPos);

    const severityCounts = {
      critical: breachResults.filter(b => b.severity === 'critical').length,
      high: breachResults.filter(b => b.severity === 'high').length,
      medium: breachResults.filter(b => b.severity === 'medium').length,
      low: breachResults.filter(b => b.severity === 'low').length,
    };

    yPos = addSeverityBreakdown(doc, severityCounts, yPos);
    yPos += 10;

    // Breach table
    const breachTableData = breachResults.slice(0, 30).map(breach => {
      const source = extractSite(breach) !== 'Unknown' ? cleanPlatformName(extractSite(breach)) : (breach.provider || 'Unknown');
      return [
        source,
        (breach.severity || 'unknown').toUpperCase(),
        breach.kind || 'breach.hit',
      ];
    });

    autoTable(doc, {
      startY: yPos,
      head: [['Source', 'Severity', 'Type']],
      body: breachTableData,
      ...getTableStyles(),
      didDrawCell: (data: any) => {
        if (data.column.index === 1 && data.section === 'body') {
          const severity = data.cell.raw.toLowerCase();
          const color = SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.unknown;
          doc.setFillColor(color.r, color.g, color.b);
          doc.roundedRect(data.cell.x + 3, data.cell.y + 3, data.cell.width - 6, data.cell.height - 6, 2, 2, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.text(data.cell.raw, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 2, { align: 'center' });
        }
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 25;

    // Recommendations
    yPos = checkPageBreak(doc, yPos, 150);
    yPos = addSectionHeader(doc, 'Recommended Actions', yPos);

    // Immediate actions box
    setFillColor(doc, { r: 254, g: 242, b: 242 });
    doc.roundedRect(PDF_SPACING.margin, yPos, pageWidth - PDF_SPACING.margin * 2, 85, 5, 5, 'F');
    setFillColor(doc, PDF_COLORS.danger);
    doc.rect(PDF_SPACING.margin, yPos, 4, 85, 'F');

    yPos += 16;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    setColor(doc, PDF_COLORS.danger);
    doc.text('Immediate Actions Required', PDF_SPACING.margin + 16, yPos);

    yPos += 14;
    const immediateActions = [
      'Change passwords for all affected accounts immediately',
      'Enable two-factor authentication (2FA) where available',
      'Review recent account activity for suspicious behavior',
    ];

    immediateActions.forEach(action => {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      setColor(doc, PDF_COLORS.slate700);
      doc.text('• ' + action, PDF_SPACING.margin + 16, yPos);
      yPos += 13;
    });

    yPos += 20;

    // Additional recommendations
    yPos = checkPageBreak(doc, yPos, 80);
    const additionalRecs = [
      'Monitor financial accounts for unauthorized transactions',
      'Consider using a password manager for unique passwords',
      'Request data deletion from data brokers if identified',
      'Set up dark web monitoring alerts for your email',
    ];
    yPos = addBulletList(doc, additionalRecs, yPos);
  }

  // ==================== TIMELINE SECTION ====================
  if (providerEvents.length > 0) {
    doc.addPage();
    yPos = addPageHeader(doc, 'Scan Timeline', branding);
    yPos = addSectionHeader(doc, 'Provider Execution', yPos);

    const timelineData = providerEvents.slice(0, 30).map(event => [
      cleanPlatformName(event.provider),
      event.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      String(event.result_count || 0),
      new Date(event.created_at).toLocaleTimeString(),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Provider', 'Event', 'Results', 'Time']],
      body: timelineData,
      ...getTableStyles(),
      columnStyles: {
        0: { fontStyle: 'bold' },
        2: { halign: 'center' as const },
        3: { halign: 'right' as const },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // ==================== GEOGRAPHIC SECTION ====================
  if (geoLocations.length > 0) {
    yPos = checkPageBreak(doc, yPos, 150);

    if (yPos < 50) {
      yPos = addPageHeader(doc, 'Geographic Analysis', branding);
    }

    yPos = addSectionHeader(doc, 'Geographic Distribution', yPos);

    const regionCounts: Record<string, number> = {};
    geoLocations.forEach(loc => {
      regionCounts[loc.region] = (regionCounts[loc.region] || 0) + 1;
    });

    // Region breakdown as table
    const regionData = Object.entries(regionCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([region, count]) => [region, String(count), `${Math.round((count / geoLocations.length) * 100)}%`]);

    if (regionData.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head: [['Region', 'Locations', 'Share']],
        body: regionData,
        ...getTableStyles(),
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { halign: 'center' as const },
          2: { halign: 'right' as const },
        },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    // Locations detail table
    yPos = checkPageBreak(doc, yPos, 80);
    yPos = addSubsectionHeader(doc, 'Location Details', yPos);

    const locationData = geoLocations.slice(0, 20).map(loc => [
      loc.ip,
      loc.formatted.length > 35 ? loc.formatted.substring(0, 32) + '...' : loc.formatted,
      loc.region,
      `${loc.coordinates.lat.toFixed(2)}, ${loc.coordinates.lng.toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Source', 'Location', 'Region', 'Coordinates']],
      body: locationData,
      ...getTableStyles(),
    });
  }

  // ==================== APPENDIX ====================
  doc.addPage();
  yPos = addPageHeader(doc, 'Appendix', branding);
  yPos = addSectionHeader(doc, 'Report Metadata', yPos);

  // Metadata box with proper spacing
  const metaBoxHeight = 100;
  setFillColor(doc, PDF_COLORS.slate50);
  doc.roundedRect(PDF_SPACING.margin, yPos, pageWidth - PDF_SPACING.margin * 2, metaBoxHeight, 5, 5, 'F');

  const metaCol1 = PDF_SPACING.margin + 14;
  const metaVal1 = PDF_SPACING.margin + 120;

  yPos += 20;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setColor(doc, PDF_COLORS.slate400);
  doc.text('Report Generated:', metaCol1, yPos);
  doc.setFont('helvetica', 'bold');
  setColor(doc, PDF_COLORS.slate700);
  doc.text(formatDate(new Date().toISOString()), metaVal1, yPos);

  yPos += 18;
  doc.setFont('helvetica', 'normal');
  setColor(doc, PDF_COLORS.slate400);
  doc.text('Report Version:', metaCol1, yPos);
  doc.setFont('helvetica', 'bold');
  setColor(doc, PDF_COLORS.slate700);
  doc.text('2.1', metaVal1, yPos);

  yPos += 18;
  doc.setFont('helvetica', 'normal');
  setColor(doc, PDF_COLORS.slate400);
  doc.text('Total Pages:', metaCol1, yPos);
  doc.setFont('helvetica', 'bold');
  setColor(doc, PDF_COLORS.slate700);
  doc.text(String(doc.getNumberOfPages()), metaVal1, yPos);

  yPos += 18;
  doc.setFont('helvetica', 'normal');
  setColor(doc, PDF_COLORS.slate400);
  doc.text('Classification:', metaCol1, yPos);
  doc.setFont('helvetica', 'bold');
  setColor(doc, PDF_COLORS.danger);
  doc.text('CONFIDENTIAL', metaVal1, yPos);

  yPos += 35;

  // Methodology section
  yPos = addSubsectionHeader(doc, 'Methodology', yPos);
  
  setFillColor(doc, PDF_COLORS.slate50);
  doc.roundedRect(PDF_SPACING.margin, yPos, pageWidth - PDF_SPACING.margin * 2, 65, 5, 5, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setColor(doc, PDF_COLORS.slate600);

  const methodologyText = 'This report was generated using FootprintIQ\'s automated OSINT pipeline, which scans publicly accessible sources including social media platforms, public records, and data breach databases. Multiple OSINT tools were used in parallel to maximize coverage and accuracy. Results are cross-validated and deduplicated before inclusion.';
  const methodLines = doc.splitTextToSize(methodologyText, pageWidth - PDF_SPACING.margin * 2 - 28);
  doc.text(methodLines, PDF_SPACING.margin + 14, yPos + 16);

  yPos += 85;

  // Legal Notice
  yPos = addSubsectionHeader(doc, 'Legal Notice', yPos);

  setFillColor(doc, PDF_COLORS.slate50);
  doc.roundedRect(PDF_SPACING.margin, yPos, pageWidth - PDF_SPACING.margin * 2, 70, 5, 5, 'F');

  // Legal accent bar
  setFillColor(doc, PDF_COLORS.warning);
  doc.rect(PDF_SPACING.margin, yPos, 4, 70, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setColor(doc, PDF_COLORS.slate600);

  const legalText = 'This report contains information gathered from publicly accessible sources only. FootprintIQ operates within legal and ethical boundaries, collecting only openly available data. This report is intended for authorized recipients only and should be handled in accordance with applicable privacy laws and regulations. The findings herein should be independently verified before taking any action.';
  const legalLines = doc.splitTextToSize(legalText, pageWidth - PDF_SPACING.margin * 2 - 30);
  doc.text(legalLines, PDF_SPACING.margin + 16, yPos + 16);

  // Add footers to all pages
  addPageFooters(doc, branding);

  // Save
  const filename = `footprintiq-investigation-${job.username}-${Date.now()}.pdf`;
  doc.save(filename);
}
