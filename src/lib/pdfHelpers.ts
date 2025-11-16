import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface BrandingSettings {
  company_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  custom_footer: string | null;
  remove_branding: boolean | null;
}

/**
 * Convert hex color to RGB array for jsPDF
 */
export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
}

/**
 * Add page numbers to all pages in the PDF
 */
export function addPageNumbers(doc: jsPDF, branding?: BrandingSettings) {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    
    // Page number
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    // Company name in footer if configured
    if (branding?.company_name && !branding?.remove_branding) {
      doc.text(
        branding.company_name,
        15,
        pageHeight - 10
      );
    }

    // Generation date
    const date = new Date().toLocaleDateString();
    doc.text(
      `Generated: ${date}`,
      pageWidth - 15,
      pageHeight - 10,
      { align: 'right' }
    );
  }
}

/**
 * Add branded header to current page
 */
export function addBrandedHeader(
  doc: jsPDF,
  branding: BrandingSettings,
  title: string
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header background
  if (branding.primary_color) {
    const [r, g, b] = hexToRgb(branding.primary_color);
    doc.setFillColor(r, g, b);
    doc.rect(0, 0, pageWidth, 30, 'F');
  }

  // Title
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(title, pageWidth / 2, 20, { align: 'center' });

  // Reset colors
  doc.setTextColor(0, 0, 0);
}

/**
 * Wrap text to fit within specified width
 */
export function wrapText(
  doc: jsPDF,
  text: string,
  maxWidth: number
): string[] {
  return doc.splitTextToSize(text, maxWidth);
}

/**
 * Capture screenshot of HTML element
 */
export async function captureElementScreenshot(
  element: HTMLElement
): Promise<string> {
  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2,
    logging: false,
  });
  return canvas.toDataURL('image/png');
}

/**
 * Format provider timeline events for PDF table
 */
export interface ProviderEvent {
  provider: string;
  event: string;
  message?: string;
  result_count?: number;
  created_at: string;
}

export function formatProviderTimeline(events: ProviderEvent[]): any[] {
  const providerMap = new Map<string, {
    start?: Date;
    end?: Date;
    status: string;
    results: number;
  }>();

  events.forEach(event => {
    const key = event.provider;
    const existing = providerMap.get(key) || { 
      status: 'unknown', 
      results: 0 
    };

    if (event.event === 'start') {
      existing.start = new Date(event.created_at);
    } else if (event.event === 'success') {
      existing.end = new Date(event.created_at);
      existing.status = 'success';
      existing.results = event.result_count || 0;
    } else if (event.event === 'failed') {
      existing.end = new Date(event.created_at);
      existing.status = 'failed';
    }

    providerMap.set(key, existing);
  });

  return Array.from(providerMap.entries()).map(([provider, data]) => {
    const duration = data.start && data.end
      ? ((data.end.getTime() - data.start.getTime()) / 1000).toFixed(1) + 's'
      : 'N/A';

    return {
      provider,
      status: data.status,
      duration,
      results: data.results,
    };
  });
}

/**
 * Add a new page with header if content exceeds current page
 */
export function checkAddPage(doc: jsPDF, currentY: number, requiredSpace: number = 50): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  
  if (currentY + requiredSpace > pageHeight - 30) {
    doc.addPage();
    return 40; // Start position for new page
  }
  
  return currentY;
}
