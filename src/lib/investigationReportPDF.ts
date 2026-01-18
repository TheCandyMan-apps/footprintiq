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
  addCoverPage(doc, {
    title: 'Investigation Report',
    subtitle: 'Digital Footprint Analysis',
    target: job.username,
    scanId: job.id,
    date: new Date(),
    branding,
  });

  // ==================== EXECUTIVE SUMMARY ====================
  doc.addPage();
  let yPos = addPageHeader(doc, 'Executive Summary', branding);

  // Summary stats
  yPos = addSectionHeader(doc, 'Scan Overview', yPos);
  
  yPos = addStatCard(doc, [
    { label: 'Total Results', value: results.length, color: PDF_COLORS.primary },
    { label: 'Accounts Found', value: tabCounts.accounts, color: PDF_COLORS.success },
    { label: 'Breaches', value: tabCounts.breaches, color: PDF_COLORS.danger },
    { label: 'Locations', value: tabCounts.map, color: PDF_COLORS.info },
  ], yPos);

  yPos += 10;

  // Scan details
  yPos = addSubsectionHeader(doc, 'Scan Details', yPos);
  yPos = addKeyValue(doc, 'Target Username', job.username, yPos);
  yPos = addKeyValue(doc, 'Scan Status', job.status, yPos);
  yPos = addKeyValue(doc, 'Scan ID', job.id.substring(0, 16) + '...', yPos);
  if (job.started_at) {
    yPos = addKeyValue(doc, 'Started', new Date(job.started_at).toLocaleString(), yPos);
  }
  if (job.finished_at) {
    yPos = addKeyValue(doc, 'Completed', new Date(job.finished_at).toLocaleString(), yPos);
  }

  yPos += 15;

  // Status breakdown
  yPos = addSubsectionHeader(doc, 'Results Breakdown', yPos);
  yPos = addKeyValue(doc, 'Found', String(grouped.found.length), yPos);
  yPos = addKeyValue(doc, 'Claimed', String(grouped.claimed.length), yPos);
  yPos = addKeyValue(doc, 'Not Found', String(grouped.not_found.length), yPos);
  if (grouped.unknown.length > 0) {
    yPos = addKeyValue(doc, 'Unknown', String(grouped.unknown.length), yPos);
  }

  // ==================== ACCOUNTS SECTION ====================
  if (results.length > 0) {
    doc.addPage();
    yPos = addPageHeader(doc, 'Account Discovery', branding);
    yPos = addSectionHeader(doc, 'Discovered Accounts', yPos);

    // Found accounts table
    const foundAccounts = results.filter(r => 
      r.status?.toLowerCase() === 'found' || r.status?.toLowerCase() === 'claimed'
    );

    if (foundAccounts.length > 0) {
      const tableData = foundAccounts.slice(0, 50).map(account => [
        account.site || 'Unknown',
        account.status || 'N/A',
        account.url ? (account.url.length > 40 ? account.url.substring(0, 40) + '...' : account.url) : '-',
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Platform', 'Status', 'URL']],
        body: tableData,
        ...getTableStyles(),
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 60 },
          2: { cellWidth: 'auto' },
        },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      if (foundAccounts.length > 50) {
        setFont(doc, 'small');
        setColor(doc, PDF_COLORS.slate500);
        doc.text(`... and ${foundAccounts.length - 50} more accounts`, PDF_SPACING.margin, yPos);
        yPos += 15;
      }
    } else {
      setFont(doc, 'body');
      setColor(doc, PDF_COLORS.slate500);
      doc.text('No accounts discovered in this scan.', PDF_SPACING.margin, yPos);
      yPos += 20;
    }

    // Platform categories breakdown
    yPos = checkPageBreak(doc, yPos, 100);
    yPos = addSubsectionHeader(doc, 'Platform Categories', yPos);

    const categories: Record<string, number> = {};
    foundAccounts.forEach(account => {
      const platform = (account.site || 'other').toLowerCase();
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
      .map(([cat, count]) => `${cat}: ${count} accounts`);

    if (categoryItems.length > 0) {
      yPos = addBulletList(doc, categoryItems, yPos);
    }
  }

  // ==================== BREACHES SECTION ====================
  if (breachResults.length > 0) {
    doc.addPage();
    yPos = addPageHeader(doc, 'Security Findings', branding);
    yPos = addSectionHeader(doc, 'Breach Analysis', yPos);

    // Severity breakdown
    const severityCounts = {
      critical: breachResults.filter(b => b.severity === 'critical').length,
      high: breachResults.filter(b => b.severity === 'high').length,
      medium: breachResults.filter(b => b.severity === 'medium').length,
      low: breachResults.filter(b => b.severity === 'low').length,
    };

    yPos = addStatCard(doc, [
      { label: 'Critical', value: severityCounts.critical, color: SEVERITY_COLORS.critical },
      { label: 'High', value: severityCounts.high, color: SEVERITY_COLORS.high },
      { label: 'Medium', value: severityCounts.medium, color: SEVERITY_COLORS.medium },
      { label: 'Low', value: severityCounts.low, color: SEVERITY_COLORS.low },
    ], yPos);

    yPos += 10;

    // Breach table
    const breachTableData = breachResults.slice(0, 25).map(breach => [
      breach.site || breach.provider || 'Unknown',
      (breach.severity || 'unknown').toUpperCase(),
      breach.kind || 'Breach',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Source', 'Severity', 'Type']],
      body: breachTableData,
      ...getTableStyles(),
    });

    yPos = (doc as any).lastAutoTable.finalY + 20;

    // Recommendations
    yPos = checkPageBreak(doc, yPos, 80);
    yPos = addSubsectionHeader(doc, 'Recommended Actions', yPos);
    
    const recommendations = [
      'Change passwords for all affected accounts immediately',
      'Enable two-factor authentication (2FA) where available',
      'Review account activity for suspicious actions',
      'Monitor financial accounts for unauthorized transactions',
      'Consider using a password manager for unique passwords',
      'Request data deletion from data brokers if identified',
    ];

    yPos = addBulletList(doc, recommendations, yPos);
  }

  // ==================== TIMELINE SECTION ====================
  if (providerEvents.length > 0) {
    doc.addPage();
    yPos = addPageHeader(doc, 'Scan Timeline', branding);
    yPos = addSectionHeader(doc, 'Provider Execution', yPos);

    const timelineData = providerEvents.slice(0, 30).map(event => [
      event.provider,
      event.event_type,
      String(event.result_count || 0),
      new Date(event.created_at).toLocaleTimeString(),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Provider', 'Event', 'Results', 'Time']],
      body: timelineData,
      ...getTableStyles(),
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
      .map(([region, count]) => `${region}: ${count} locations`);

    yPos = addBulletList(doc, regionItems, yPos);

    yPos += 10;

    // Locations table
    const locationData = geoLocations.slice(0, 20).map(loc => [
      loc.ip,
      loc.formatted,
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

  yPos = addKeyValue(doc, 'Report Generated', new Date().toISOString(), yPos);
  yPos = addKeyValue(doc, 'Report Version', '1.0', yPos);
  yPos = addKeyValue(doc, 'Total Pages', String(doc.getNumberOfPages()), yPos);
  yPos = addKeyValue(doc, 'Classification', 'CONFIDENTIAL', yPos);

  yPos += 20;

  yPos = addSubsectionHeader(doc, 'Legal Notice', yPos);
  setFont(doc, 'small');
  setColor(doc, PDF_COLORS.slate600);
  
  const legalText = 'This report contains information gathered from publicly accessible sources only. FootprintIQ operates within legal and ethical boundaries, collecting only openly available data. This report is intended for authorized recipients only and should be handled in accordance with applicable privacy laws and regulations.';
  
  const legalLines = doc.splitTextToSize(legalText, pageWidth - PDF_SPACING.margin * 2);
  doc.text(legalLines, PDF_SPACING.margin, yPos);

  // Add footers to all pages
  addPageFooters(doc, branding);

  // Save the PDF
  const filename = `footprintiq-investigation-${job.username}-${Date.now()}.pdf`;
  doc.save(filename);
}
