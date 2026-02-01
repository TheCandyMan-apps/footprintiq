import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  PDF_COLORS,
  PDF_SPACING,
  SEVERITY_COLORS,
  PDFBranding,
  addCoverPage,
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

/**
 * Helper to extract site/platform from a finding
 */
function extractSite(result: any): string {
  // Check evidence array first
  if (result.evidence && Array.isArray(result.evidence)) {
    const siteEvidence = result.evidence.find((e: any) => e.key === 'site');
    if (siteEvidence?.value) return siteEvidence.value;
  }
  // Fallback to meta
  if (result.meta?.platform) return result.meta.platform;
  if (result.meta?.site) return result.meta.site;
  // Fallback to direct property
  if (result.site) return result.site;
  return 'Unknown';
}

/**
 * Helper to extract URL from a finding
 */
function extractUrl(result: any): string {
  // Check evidence array first
  if (result.evidence && Array.isArray(result.evidence)) {
    const urlEvidence = result.evidence.find((e: any) => e.key === 'url');
    if (urlEvidence?.value) return urlEvidence.value;
  }
  // Fallback to direct property
  if (result.url) return result.url;
  return '';
}

/**
 * Helper to derive status from a finding
 */
function deriveStatus(result: any): string {
  // Direct status field
  if (result.status) return result.status.toLowerCase();
  
  // For profile_presence kind, treat as "found"
  if (result.kind === 'profile_presence') return 'found';
  
  // Check evidence for status indicators
  if (result.evidence && Array.isArray(result.evidence)) {
    const existsEvidence = result.evidence.find((e: any) => e.key === 'exists');
    if (existsEvidence?.value === true) return 'found';
    if (existsEvidence?.value === false) return 'not_found';
  }
  
  // Check for explicit status in meta
  const meta = result.meta || result.metadata || {};
  if (meta.status) return meta.status.toLowerCase();
  if (meta.exists === true) return 'found';
  if (meta.exists === false) return 'not_found';
  
  return 'unknown';
}

/**
 * Add enhanced cover page with gradient header
 */
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
  }
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const { title, subtitle, target, scanId, date = new Date(), branding, stats } = options;
  
  const primaryColor = branding?.primaryColor 
    ? hexToRgb(branding.primaryColor) 
    : PDF_COLORS.primary;
  
  // Gradient-like header (multiple rectangles for effect)
  const headerHeight = 160;
  setFillColor(doc, primaryColor);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');
  
  // Lighter accent line at bottom of header
  doc.setFillColor(
    Math.min(255, primaryColor.r + 30),
    Math.min(255, primaryColor.g + 30),
    Math.min(255, primaryColor.b + 30)
  );
  doc.rect(0, headerHeight - 4, pageWidth, 4, 'F');
  
  // Logo/Brand area
  let yPos = 40;
  
  // Shield icon (simplified)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(2);
  // Draw a simple shield shape
  const shieldX = PDF_SPACING.margin + 5;
  doc.roundedRect(shieldX, yPos - 10, 24, 30, 4, 4, 'S');
  doc.line(shieldX + 8, yPos + 5, shieldX + 12, yPos + 10);
  doc.line(shieldX + 12, yPos + 10, shieldX + 18, yPos);
  
  // Company name
  setFont(doc, 'heading1');
  setColor(doc, PDF_COLORS.white);
  doc.text(branding?.companyName || 'FootprintIQ', PDF_SPACING.margin + 40, yPos + 8);
  
  // Tagline
  yPos += 25;
  setFont(doc, 'body');
  doc.setTextColor(255, 255, 255, 0.8);
  doc.text(branding?.tagline || 'Digital Footprint Intelligence', PDF_SPACING.margin + 40, yPos);
  
  // Main title
  yPos = 100;
  setFont(doc, 'heading1');
  setColor(doc, PDF_COLORS.white);
  doc.text(title, PDF_SPACING.margin, yPos);
  
  if (subtitle) {
    yPos += 20;
    setFont(doc, 'heading3');
    doc.setTextColor(255, 255, 255, 0.9);
    doc.text(subtitle, PDF_SPACING.margin, yPos);
  }
  
  // Content area below header
  yPos = headerHeight + 30;
  
  // Target information box
  setFillColor(doc, PDF_COLORS.slate50);
  doc.setDrawColor(PDF_COLORS.slate200.r, PDF_COLORS.slate200.g, PDF_COLORS.slate200.b);
  doc.setLineWidth(1);
  doc.roundedRect(PDF_SPACING.margin, yPos, pageWidth - PDF_SPACING.margin * 2, 70, 6, 6, 'FD');
  
  yPos += 18;
  setFont(doc, 'caption');
  setColor(doc, PDF_COLORS.slate500);
  doc.text('SCAN TARGET', PDF_SPACING.margin + 15, yPos);
  
  yPos += 14;
  setFont(doc, 'heading2');
  setColor(doc, PDF_COLORS.slate900);
  doc.text(target || 'N/A', PDF_SPACING.margin + 15, yPos);
  
  yPos += 18;
  setFont(doc, 'small');
  setColor(doc, PDF_COLORS.slate500);
  doc.text(`ID: ${scanId ? scanId.substring(0, 8) + '...' : 'N/A'}`, PDF_SPACING.margin + 15, yPos);
  doc.text(`Generated: ${date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, pageWidth / 2, yPos);
  
  // Stats grid
  if (stats) {
    yPos = headerHeight + 120;
    
    const cardWidth = (pageWidth - PDF_SPACING.margin * 2 - 30) / 4;
    const statItems = [
      { label: 'Total Findings', value: stats.total, color: primaryColor },
      { label: 'Accounts', value: stats.accounts, color: PDF_COLORS.success },
      { label: 'Breaches', value: stats.breaches, color: PDF_COLORS.danger },
      { label: 'Locations', value: stats.locations, color: PDF_COLORS.info },
    ];
    
    statItems.forEach((stat, index) => {
      const x = PDF_SPACING.margin + (cardWidth + 10) * index;
      
      // Card with left accent
      setFillColor(doc, PDF_COLORS.slate50);
      doc.roundedRect(x, yPos, cardWidth, 55, 4, 4, 'F');
      
      // Left accent bar
      setFillColor(doc, stat.color);
      doc.rect(x, yPos, 4, 55, 'F');
      
      // Value
      setFont(doc, 'heading1');
      setColor(doc, stat.color);
      doc.text(String(stat.value), x + 12, yPos + 28);
      
      // Label
      setFont(doc, 'caption');
      setColor(doc, PDF_COLORS.slate500);
      doc.text(stat.label, x + 12, yPos + 45);
    });
  }
  
  // Risk Score section
  yPos = headerHeight + 200;
  
  // Calculate risk score
  const riskScore = stats ? Math.max(0, 100 - (stats.breaches * 5)) : 100;
  const riskColor = riskScore >= 80 ? PDF_COLORS.success : riskScore >= 60 ? PDF_COLORS.warning : PDF_COLORS.danger;
  const riskLabel = riskScore >= 80 ? 'Low Risk' : riskScore >= 60 ? 'Moderate Risk' : 'High Risk';
  
  setFillColor(doc, PDF_COLORS.slate50);
  doc.roundedRect(PDF_SPACING.margin, yPos, pageWidth - PDF_SPACING.margin * 2, 60, 6, 6, 'F');
  
  // Left section - Score
  setFont(doc, 'heading1');
  setColor(doc, riskColor);
  doc.text(`${riskScore}`, PDF_SPACING.margin + 20, yPos + 35);
  
  setFont(doc, 'body');
  setColor(doc, PDF_COLORS.slate500);
  doc.text('/100', PDF_SPACING.margin + 55, yPos + 35);
  
  // Right section - Label and description
  setFont(doc, 'heading3');
  setColor(doc, riskColor);
  doc.text(riskLabel, PDF_SPACING.margin + 120, yPos + 25);
  
  setFont(doc, 'small');
  setColor(doc, PDF_COLORS.slate500);
  doc.text('Based on severity and breach count analysis', PDF_SPACING.margin + 120, yPos + 42);
  
  // Footer
  const footerY = pageHeight - 50;
  
  // Confidential badge
  setFillColor(doc, { r: 254, g: 226, b: 226 }); // red-100
  doc.roundedRect(PDF_SPACING.margin, footerY, 85, 18, 3, 3, 'F');
  
  setFont(doc, 'caption');
  setColor(doc, PDF_COLORS.danger);
  doc.text('CONFIDENTIAL', PDF_SPACING.margin + 10, footerY + 12);
  
  setFont(doc, 'small');
  setColor(doc, PDF_COLORS.slate400);
  doc.text('For authorized use only', PDF_SPACING.margin + 95, footerY + 12);
  
  // Bottom accent bar
  setFillColor(doc, primaryColor);
  doc.rect(0, pageHeight - 6, pageWidth, 6, 'F');
}

/**
 * Add severity breakdown visual
 */
function addSeverityBreakdown(doc: jsPDF, severityCounts: Record<string, number>, yPos: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const totalBreaches = Object.values(severityCounts).reduce((a, b) => a + b, 0);
  
  if (totalBreaches === 0) return yPos;
  
  // Container
  setFillColor(doc, PDF_COLORS.slate50);
  doc.roundedRect(PDF_SPACING.margin, yPos, pageWidth - PDF_SPACING.margin * 2, 70, 4, 4, 'F');
  
  yPos += 15;
  setFont(doc, 'small');
  setColor(doc, PDF_COLORS.slate500);
  doc.text('SEVERITY DISTRIBUTION', PDF_SPACING.margin + 10, yPos);
  
  yPos += 15;
  
  const severities = [
    { key: 'critical', label: 'Critical', color: SEVERITY_COLORS.critical },
    { key: 'high', label: 'High', color: SEVERITY_COLORS.high },
    { key: 'medium', label: 'Medium', color: SEVERITY_COLORS.medium },
    { key: 'low', label: 'Low', color: SEVERITY_COLORS.low },
  ];
  
  const columnWidth = (pageWidth - PDF_SPACING.margin * 2 - 20) / 4;
  
  severities.forEach((sev, index) => {
    const x = PDF_SPACING.margin + 10 + columnWidth * index;
    const count = severityCounts[sev.key] || 0;
    
    // Colored dot
    setFillColor(doc, sev.color);
    doc.circle(x + 4, yPos, 4, 'F');
    
    // Count
    setFont(doc, 'heading3');
    setColor(doc, PDF_COLORS.slate900);
    doc.text(String(count), x + 15, yPos + 3);
    
    // Label
    setFont(doc, 'caption');
    setColor(doc, PDF_COLORS.slate500);
    doc.text(sev.label, x + 15, yPos + 15);
  });
  
  return yPos + 50;
}

/**
 * Generate a comprehensive PDF investigation report
 */
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

  // ==================== COVER PAGE ====================
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
  });

  // ==================== EXECUTIVE SUMMARY ====================
  doc.addPage();
  let yPos = addPageHeader(doc, 'Executive Summary', branding);

  // Scan details box
  setFillColor(doc, PDF_COLORS.slate50);
  doc.roundedRect(PDF_SPACING.margin, yPos, pageWidth - PDF_SPACING.margin * 2, 90, 4, 4, 'F');
  
  yPos += 15;
  setFont(doc, 'small');
  setColor(doc, PDF_COLORS.slate500);
  doc.text('SCAN DETAILS', PDF_SPACING.margin + 10, yPos);
  
  yPos += 12;
  
  // Two-column layout for details
  const col1X = PDF_SPACING.margin + 10;
  const col2X = pageWidth / 2;
  
  setFont(doc, 'caption');
  setColor(doc, PDF_COLORS.slate400);
  doc.text('Target:', col1X, yPos);
  setFont(doc, 'bodyBold');
  setColor(doc, PDF_COLORS.slate900);
  doc.text(job.username, col1X + 50, yPos);
  
  setFont(doc, 'caption');
  setColor(doc, PDF_COLORS.slate400);
  doc.text('Status:', col2X, yPos);
  
  // Status badge
  const statusColor = job.status === 'completed' ? PDF_COLORS.success : 
                      job.status === 'failed' ? PDF_COLORS.danger : PDF_COLORS.warning;
  setFillColor(doc, statusColor);
  doc.roundedRect(col2X + 40, yPos - 7, 60, 12, 2, 2, 'F');
  setFont(doc, 'caption');
  setColor(doc, PDF_COLORS.white);
  doc.text(job.status.toUpperCase(), col2X + 48, yPos);
  
  yPos += 16;
  
  setFont(doc, 'caption');
  setColor(doc, PDF_COLORS.slate400);
  doc.text('Scan ID:', col1X, yPos);
  setFont(doc, 'body');
  setColor(doc, PDF_COLORS.slate700);
  doc.text(job.id.substring(0, 24) + '...', col1X + 50, yPos);
  
  if (job.started_at) {
    setFont(doc, 'caption');
    setColor(doc, PDF_COLORS.slate400);
    doc.text('Started:', col2X, yPos);
    setFont(doc, 'body');
    setColor(doc, PDF_COLORS.slate700);
    doc.text(new Date(job.started_at).toLocaleString(), col2X + 40, yPos);
  }
  
  yPos += 16;
  
  if (job.finished_at) {
    setFont(doc, 'caption');
    setColor(doc, PDF_COLORS.slate400);
    doc.text('Completed:', col1X, yPos);
    setFont(doc, 'body');
    setColor(doc, PDF_COLORS.slate700);
    doc.text(new Date(job.finished_at).toLocaleString(), col1X + 50, yPos);
    
    // Duration calculation
    if (job.started_at) {
      const duration = Math.round((new Date(job.finished_at).getTime() - new Date(job.started_at).getTime()) / 1000);
      setFont(doc, 'caption');
      setColor(doc, PDF_COLORS.slate400);
      doc.text('Duration:', col2X, yPos);
      setFont(doc, 'body');
      setColor(doc, PDF_COLORS.slate700);
      doc.text(`${duration}s`, col2X + 40, yPos);
    }
  }

  yPos += 35;

  // Results breakdown
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

  // ==================== ACCOUNTS SECTION ====================
  if (results.length > 0) {
    doc.addPage();
    yPos = addPageHeader(doc, 'Account Discovery', branding);
    yPos = addSectionHeader(doc, 'Discovered Accounts', yPos);

    // Found accounts table
    const foundAccounts = results.filter(r => {
      const status = deriveStatus(r);
      return status === 'found' || status === 'claimed';
    });

    if (foundAccounts.length > 0) {
      const tableData = foundAccounts.slice(0, 40).map(account => {
        const site = extractSite(account);
        const url = extractUrl(account);
        const status = deriveStatus(account);
        return [
          site,
          status.charAt(0).toUpperCase() + status.slice(1),
          url ? (url.length > 35 ? url.substring(0, 35) + '...' : url) : '-',
        ];
      });

      autoTable(doc, {
        startY: yPos,
        head: [['Platform', 'Status', 'URL']],
        body: tableData,
        ...getTableStyles(),
        columnStyles: {
          0: { cellWidth: 120, fontStyle: 'bold' },
          1: { cellWidth: 60 },
          2: { cellWidth: 'auto' },
        },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      if (foundAccounts.length > 40) {
        setFont(doc, 'small');
        setColor(doc, PDF_COLORS.slate500);
        doc.text(`... and ${foundAccounts.length - 40} more accounts`, PDF_SPACING.margin, yPos);
        yPos += 15;
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
      
      if (['facebook', 'twitter', 'instagram', 'tiktok', 'snapchat', 'linkedin', 'reddit', 'mastodon'].some(s => platform.includes(s))) {
        category = 'Social Media';
      } else if (['github', 'gitlab', 'stackoverflow', 'behance', 'dribbble'].some(s => platform.includes(s))) {
        category = 'Professional';
      } else if (['youtube', 'twitch', 'spotify', 'soundcloud', 'vimeo'].some(s => platform.includes(s))) {
        category = 'Media & Entertainment';
      } else if (['steam', 'xbox', 'playstation', 'discord', 'roblox'].some(s => platform.includes(s))) {
        category = 'Gaming';
      }
      
      categories[category] = (categories[category] || 0) + 1;
    });

    const categoryItems = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, count]) => `${cat}: ${count} account${count > 1 ? 's' : ''}`);

    if (categoryItems.length > 0) {
      yPos = addBulletList(doc, categoryItems, yPos);
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

    // Severity breakdown visual
    const severityCounts = {
      critical: breachResults.filter(b => b.severity === 'critical').length,
      high: breachResults.filter(b => b.severity === 'high').length,
      medium: breachResults.filter(b => b.severity === 'medium').length,
      low: breachResults.filter(b => b.severity === 'low').length,
    };

    yPos = addSeverityBreakdown(doc, severityCounts, yPos);
    yPos += 10;

    // Breach table
    const breachTableData = breachResults.slice(0, 20).map(breach => {
      const source = extractSite(breach) !== 'Unknown' ? extractSite(breach) : (breach.provider || 'Unknown');
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
        // Color-code severity cells
        if (data.column.index === 1 && data.section === 'body') {
          const severity = data.cell.raw.toLowerCase();
          const color = SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.unknown;
          doc.setFillColor(color.r, color.g, color.b);
          doc.roundedRect(data.cell.x + 2, data.cell.y + 2, data.cell.width - 4, data.cell.height - 4, 2, 2, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8);
          doc.text(data.cell.raw, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 2, { align: 'center' });
        }
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 25;

    // Recommendations
    yPos = checkPageBreak(doc, yPos, 150);
    yPos = addSectionHeader(doc, 'Recommended Actions', yPos);
    
    // Immediate actions box
    setFillColor(doc, { r: 254, g: 242, b: 242 }); // red-50
    doc.roundedRect(PDF_SPACING.margin, yPos, pageWidth - PDF_SPACING.margin * 2, 80, 4, 4, 'F');
    
    // Red accent bar
    setFillColor(doc, PDF_COLORS.danger);
    doc.rect(PDF_SPACING.margin, yPos, 4, 80, 'F');
    
    yPos += 15;
    setFont(doc, 'heading4');
    setColor(doc, PDF_COLORS.danger);
    doc.text('🚨 Immediate Actions Required', PDF_SPACING.margin + 15, yPos);
    
    yPos += 12;
    const immediateActions = [
      'Change passwords for all affected accounts immediately',
      'Enable two-factor authentication (2FA) where available',
      'Review recent account activity for suspicious behavior',
    ];
    
    immediateActions.forEach(action => {
      setFont(doc, 'body');
      setColor(doc, PDF_COLORS.slate700);
      doc.text('• ' + action, PDF_SPACING.margin + 15, yPos);
      yPos += 12;
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

    const timelineData = providerEvents.slice(0, 25).map(event => [
      event.provider,
      event.event_type.replace(/_/g, ' '),
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
        2: { halign: 'center' },
        3: { halign: 'right' },
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

    // Region breakdown
    const regionCounts: Record<string, number> = {};
    geoLocations.forEach(loc => {
      regionCounts[loc.region] = (regionCounts[loc.region] || 0) + 1;
    });

    yPos = addSubsectionHeader(doc, 'Regions', yPos);
    
    const regionItems = Object.entries(regionCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([region, count]) => `${region}: ${count} location${count > 1 ? 's' : ''}`);

    yPos = addBulletList(doc, regionItems, yPos);

    yPos += 10;

    // Locations table
    const locationData = geoLocations.slice(0, 15).map(loc => [
      loc.ip,
      loc.formatted.length > 30 ? loc.formatted.substring(0, 30) + '...' : loc.formatted,
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

  // Metadata box
  setFillColor(doc, PDF_COLORS.slate50);
  doc.roundedRect(PDF_SPACING.margin, yPos, pageWidth - PDF_SPACING.margin * 2, 80, 4, 4, 'F');
  
  yPos += 15;
  yPos = addKeyValue(doc, 'Report Generated', new Date().toISOString(), yPos);
  yPos = addKeyValue(doc, 'Report Version', '2.0', yPos);
  yPos = addKeyValue(doc, 'Total Pages', String(doc.getNumberOfPages()), yPos);
  yPos = addKeyValue(doc, 'Classification', 'CONFIDENTIAL', yPos);

  yPos += 25;

  yPos = addSubsectionHeader(doc, 'Legal Notice', yPos);
  
  setFillColor(doc, PDF_COLORS.slate50);
  doc.roundedRect(PDF_SPACING.margin, yPos, pageWidth - PDF_SPACING.margin * 2, 60, 4, 4, 'F');
  
  setFont(doc, 'small');
  setColor(doc, PDF_COLORS.slate600);
  
  const legalText = 'This report contains information gathered from publicly accessible sources only. FootprintIQ operates within legal and ethical boundaries, collecting only openly available data. This report is intended for authorized recipients only and should be handled in accordance with applicable privacy laws and regulations.';
  
  const legalLines = doc.splitTextToSize(legalText, pageWidth - PDF_SPACING.margin * 2 - 20);
  doc.text(legalLines, PDF_SPACING.margin + 10, yPos + 15);

  // Add footers to all pages
  addPageFooters(doc, branding);

  // Save the PDF
  const filename = `footprintiq-investigation-${job.username}-${Date.now()}.pdf`;
  doc.save(filename);
}
