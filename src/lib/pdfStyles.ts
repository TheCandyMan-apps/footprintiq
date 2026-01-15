import type jsPDF from 'jspdf';

/**
 * Professional PDF styling constants and utilities
 * Provides consistent, enterprise-grade styling across all PDF exports
 */

// Professional color palette (muted, trustworthy)
export const PDF_COLORS = {
  // Primary brand colors
  primary: { r: 37, g: 99, b: 235 }, // Blue-600
  primaryDark: { r: 29, g: 78, b: 216 }, // Blue-700
  primaryLight: { r: 59, g: 130, b: 246 }, // Blue-500
  
  // Neutral colors
  slate900: { r: 15, g: 23, b: 42 },
  slate700: { r: 51, g: 65, b: 85 },
  slate600: { r: 71, g: 85, b: 105 },
  slate500: { r: 100, g: 116, b: 139 },
  slate400: { r: 148, g: 163, b: 184 },
  slate300: { r: 203, g: 213, b: 225 },
  slate200: { r: 226, g: 232, b: 240 },
  slate100: { r: 241, g: 245, b: 249 },
  slate50: { r: 248, g: 250, b: 252 },
  white: { r: 255, g: 255, b: 255 },
  
  // Semantic colors
  success: { r: 22, g: 163, b: 74 }, // Green-600
  warning: { r: 202, g: 138, b: 4 }, // Yellow-600
  danger: { r: 220, g: 38, b: 38 }, // Red-600
  info: { r: 37, g: 99, b: 235 }, // Blue-600
} as const;

// Severity color mapping
export const SEVERITY_COLORS = {
  critical: PDF_COLORS.danger,
  high: { r: 234, g: 88, b: 12 }, // Orange-600
  medium: PDF_COLORS.warning,
  low: { r: 37, g: 99, b: 235 }, // Blue-600
  info: PDF_COLORS.slate500,
  unknown: PDF_COLORS.slate400,
} as const;

// Typography settings
export const PDF_FONTS = {
  heading1: { size: 24, style: 'bold' as const },
  heading2: { size: 18, style: 'bold' as const },
  heading3: { size: 14, style: 'bold' as const },
  heading4: { size: 12, style: 'bold' as const },
  body: { size: 10, style: 'normal' as const },
  bodyBold: { size: 10, style: 'bold' as const },
  small: { size: 9, style: 'normal' as const },
  caption: { size: 8, style: 'normal' as const },
} as const;

// Spacing and margins
export const PDF_SPACING = {
  margin: 20,
  marginLarge: 30,
  marginSmall: 10,
  sectionGap: 20,
  lineHeight: 6,
  paragraphGap: 10,
} as const;

// Page dimensions (Letter size)
export const PAGE_WIDTH = 612; // 8.5 inches * 72
export const PAGE_HEIGHT = 792; // 11 inches * 72

export interface PDFBranding {
  companyName?: string;
  tagline?: string;
  logoUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  footerText?: string;
  websiteUrl?: string;
  contactEmail?: string;
}

/**
 * Convert hex color to RGB object
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : PDF_COLORS.primary;
}

/**
 * Apply text color from RGB object
 */
export function setColor(doc: jsPDF, color: { r: number; g: number; b: number }) {
  doc.setTextColor(color.r, color.g, color.b);
}

/**
 * Apply fill color from RGB object
 */
export function setFillColor(doc: jsPDF, color: { r: number; g: number; b: number }) {
  doc.setFillColor(color.r, color.g, color.b);
}

/**
 * Set font with predefined style
 */
export function setFont(doc: jsPDF, style: keyof typeof PDF_FONTS) {
  const font = PDF_FONTS[style];
  doc.setFontSize(font.size);
  doc.setFont('helvetica', font.style);
}

/**
 * Add professional cover page
 */
export function addCoverPage(
  doc: jsPDF,
  options: {
    title: string;
    subtitle?: string;
    target?: string;
    scanId?: string;
    date?: Date;
    branding?: PDFBranding;
  }
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const { title, subtitle, target, scanId, date = new Date(), branding } = options;
  
  // Determine primary color
  const primaryColor = branding?.primaryColor 
    ? hexToRgb(branding.primaryColor) 
    : PDF_COLORS.primary;
  
  // Top accent bar
  setFillColor(doc, primaryColor);
  doc.rect(0, 0, pageWidth, 6, 'F');
  
  // Company name / Logo area
  let yPos = 60;
  
  setFont(doc, 'heading2');
  setColor(doc, PDF_COLORS.slate700);
  doc.text(branding?.companyName || 'FootprintIQ', pageWidth / 2, yPos, { align: 'center' });
  
  if (branding?.tagline) {
    yPos += 12;
    setFont(doc, 'small');
    setColor(doc, PDF_COLORS.slate500);
    doc.text(branding.tagline, pageWidth / 2, yPos, { align: 'center' });
  }
  
  // Divider line
  yPos += 30;
  doc.setDrawColor(PDF_COLORS.slate200.r, PDF_COLORS.slate200.g, PDF_COLORS.slate200.b);
  doc.setLineWidth(0.5);
  doc.line(PDF_SPACING.marginLarge, yPos, pageWidth - PDF_SPACING.marginLarge, yPos);
  
  // Main title
  yPos += 50;
  setFont(doc, 'heading1');
  setColor(doc, PDF_COLORS.slate900);
  doc.text(title, pageWidth / 2, yPos, { align: 'center' });
  
  if (subtitle) {
    yPos += 15;
    setFont(doc, 'heading3');
    setColor(doc, PDF_COLORS.slate600);
    doc.text(subtitle, pageWidth / 2, yPos, { align: 'center' });
  }
  
  // Target information box
  yPos += 50;
  const boxWidth = 160;
  const boxX = (pageWidth - boxWidth) / 2;
  
  setFillColor(doc, PDF_COLORS.slate50);
  doc.roundedRect(boxX, yPos, boxWidth, 60, 3, 3, 'F');
  
  yPos += 15;
  setFont(doc, 'caption');
  setColor(doc, PDF_COLORS.slate500);
  doc.text('SCAN TARGET', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 12;
  setFont(doc, 'heading3');
  setColor(doc, PDF_COLORS.slate900);
  doc.text(target || 'N/A', pageWidth / 2, yPos, { align: 'center' });
  
  if (scanId) {
    yPos += 18;
    setFont(doc, 'caption');
    setColor(doc, PDF_COLORS.slate400);
    doc.text(`ID: ${scanId.substring(0, 8)}...`, pageWidth / 2, yPos, { align: 'center' });
  }
  
  // Footer area
  const footerY = pageHeight - 60;
  
  setFont(doc, 'small');
  setColor(doc, PDF_COLORS.slate500);
  doc.text(`Generated: ${date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, pageWidth / 2, footerY, { align: 'center' });
  
  // Confidential notice
  setFont(doc, 'caption');
  setColor(doc, PDF_COLORS.slate400);
  doc.text('CONFIDENTIAL — For authorized use only', pageWidth / 2, footerY + 15, { align: 'center' });
  
  // Bottom accent bar
  setFillColor(doc, primaryColor);
  doc.rect(0, pageHeight - 6, pageWidth, 6, 'F');
}

/**
 * Add section header with accent line
 */
export function addSectionHeader(
  doc: jsPDF,
  title: string,
  yPos: number,
  options?: { primaryColor?: { r: number; g: number; b: number } }
) {
  const color = options?.primaryColor || PDF_COLORS.primary;
  
  // Accent bar
  setFillColor(doc, color);
  doc.rect(PDF_SPACING.margin, yPos - 3, 4, 14, 'F');
  
  // Title
  setFont(doc, 'heading2');
  setColor(doc, PDF_COLORS.slate900);
  doc.text(title, PDF_SPACING.margin + 10, yPos + 7);
  
  return yPos + 25;
}

/**
 * Add subsection header
 */
export function addSubsectionHeader(doc: jsPDF, title: string, yPos: number) {
  setFont(doc, 'heading3');
  setColor(doc, PDF_COLORS.slate700);
  doc.text(title, PDF_SPACING.margin, yPos);
  
  return yPos + 12;
}

/**
 * Add key-value pair with label and value
 */
export function addKeyValue(
  doc: jsPDF,
  label: string,
  value: string,
  yPos: number,
  options?: { indent?: number }
) {
  const indent = options?.indent || 0;
  
  setFont(doc, 'small');
  setColor(doc, PDF_COLORS.slate500);
  doc.text(label + ':', PDF_SPACING.margin + indent, yPos);
  
  setFont(doc, 'bodyBold');
  setColor(doc, PDF_COLORS.slate900);
  doc.text(value, PDF_SPACING.margin + indent + 70, yPos);
  
  return yPos + PDF_SPACING.lineHeight + 2;
}

/**
 * Add statistics card row
 */
export function addStatCard(
  doc: jsPDF,
  stats: Array<{ label: string; value: string | number; color?: { r: number; g: number; b: number } }>,
  yPos: number
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const cardWidth = (pageWidth - PDF_SPACING.margin * 2 - 10 * (stats.length - 1)) / stats.length;
  
  stats.forEach((stat, index) => {
    const x = PDF_SPACING.margin + (cardWidth + 10) * index;
    
    // Card background
    setFillColor(doc, PDF_COLORS.slate50);
    doc.roundedRect(x, yPos, cardWidth, 40, 2, 2, 'F');
    
    // Value
    setFont(doc, 'heading2');
    setColor(doc, stat.color || PDF_COLORS.primary);
    doc.text(String(stat.value), x + cardWidth / 2, yPos + 18, { align: 'center' });
    
    // Label
    setFont(doc, 'caption');
    setColor(doc, PDF_COLORS.slate500);
    doc.text(stat.label, x + cardWidth / 2, yPos + 32, { align: 'center' });
  });
  
  return yPos + 50;
}

/**
 * Add professional page footer to all pages
 */
export function addPageFooters(doc: jsPDF, branding?: PDFBranding) {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(PDF_COLORS.slate200.r, PDF_COLORS.slate200.g, PDF_COLORS.slate200.b);
    doc.setLineWidth(0.5);
    doc.line(PDF_SPACING.margin, pageHeight - 25, pageWidth - PDF_SPACING.margin, pageHeight - 25);
    
    // Left: Company name
    setFont(doc, 'caption');
    setColor(doc, PDF_COLORS.slate400);
    doc.text(branding?.companyName || 'FootprintIQ', PDF_SPACING.margin, pageHeight - 15);
    
    // Center: Page number
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
    
    // Right: Date
    doc.text(new Date().toLocaleDateString(), pageWidth - PDF_SPACING.margin, pageHeight - 15, { align: 'right' });
  }
}

/**
 * Add page header for non-cover pages
 */
export function addPageHeader(doc: jsPDF, title: string, branding?: PDFBranding) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const primaryColor = branding?.primaryColor 
    ? hexToRgb(branding.primaryColor) 
    : PDF_COLORS.primary;
  
  // Top accent line
  setFillColor(doc, primaryColor);
  doc.rect(0, 0, pageWidth, 3, 'F');
  
  // Header text
  setFont(doc, 'heading4');
  setColor(doc, PDF_COLORS.slate700);
  doc.text(title, PDF_SPACING.margin, 20);
  
  // Company name (right aligned)
  setFont(doc, 'caption');
  setColor(doc, PDF_COLORS.slate400);
  doc.text(branding?.companyName || 'FootprintIQ', pageWidth - PDF_SPACING.margin, 20, { align: 'right' });
  
  // Header line
  doc.setDrawColor(PDF_COLORS.slate200.r, PDF_COLORS.slate200.g, PDF_COLORS.slate200.b);
  doc.setLineWidth(0.5);
  doc.line(PDF_SPACING.margin, 28, pageWidth - PDF_SPACING.margin, 28);
  
  return 40; // Return starting Y position for content
}

/**
 * Check if content fits on current page, add new page if needed
 */
export function checkPageBreak(doc: jsPDF, currentY: number, requiredSpace: number = 50): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  
  if (currentY + requiredSpace > pageHeight - 35) {
    doc.addPage();
    return 40; // Start position for new page
  }
  
  return currentY;
}

/**
 * Get professional table styles for autoTable
 */
export function getTableStyles(primaryColor?: { r: number; g: number; b: number }) {
  const color = primaryColor || PDF_COLORS.primary;
  
  return {
    theme: 'plain' as const,
    headStyles: {
      fillColor: [color.r, color.g, color.b] as [number, number, number],
      textColor: [255, 255, 255] as [number, number, number],
      fontStyle: 'bold' as const,
      fontSize: 9,
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 4,
      textColor: [51, 65, 85] as [number, number, number], // slate-700
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] as [number, number, number], // slate-50
    },
    styles: {
      lineColor: [226, 232, 240] as [number, number, number], // slate-200
      lineWidth: 0.25,
    },
    margin: { left: PDF_SPACING.margin, right: PDF_SPACING.margin },
  };
}

/**
 * Add a professional bullet list
 */
export function addBulletList(
  doc: jsPDF,
  items: string[],
  startY: number,
  options?: { indent?: number; maxWidth?: number }
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const indent = options?.indent || 0;
  const maxWidth = options?.maxWidth || (pageWidth - PDF_SPACING.margin * 2 - indent - 15);
  
  let yPos = startY;
  
  setFont(doc, 'body');
  setColor(doc, PDF_COLORS.slate700);
  
  items.forEach((item) => {
    yPos = checkPageBreak(doc, yPos, 15);
    
    // Bullet point
    setFillColor(doc, PDF_COLORS.primary);
    doc.circle(PDF_SPACING.margin + indent + 3, yPos - 2, 1.5, 'F');
    
    // Text (with wrapping)
    const lines = doc.splitTextToSize(item, maxWidth);
    lines.forEach((line: string) => {
      doc.text(line, PDF_SPACING.margin + indent + 10, yPos);
      yPos += PDF_SPACING.lineHeight;
    });
    
    yPos += 2;
  });
  
  return yPos;
}

/**
 * Add a severity badge
 */
export function addSeverityBadge(
  doc: jsPDF,
  severity: keyof typeof SEVERITY_COLORS,
  x: number,
  y: number
) {
  const color = SEVERITY_COLORS[severity] || SEVERITY_COLORS.unknown;
  const label = severity.toUpperCase();
  
  setFont(doc, 'caption');
  const textWidth = doc.getTextWidth(label);
  
  // Badge background
  setFillColor(doc, color);
  doc.roundedRect(x, y - 5, textWidth + 8, 10, 2, 2, 'F');
  
  // Badge text
  setColor(doc, PDF_COLORS.white);
  doc.text(label, x + 4, y + 2);
  
  return x + textWidth + 12;
}
