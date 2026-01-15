import type jsPDF from 'jspdf';

// Re-export professional styles for convenience
export * from './pdfStyles';

export interface BrandingSettings {
  company_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  custom_footer: string | null;
  remove_branding: boolean | null;
}

/**
 * Convert hex color to RGB array for jsPDF (legacy format)
 */
export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [37, 99, 235]; // Default to professional blue
}

/**
 * Add page numbers to all pages in the PDF (professional style)
 */
export function addPageNumbers(doc: jsPDF, branding?: BrandingSettings) {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.line(20, pageHeight - 25, pageWidth - 20, pageHeight - 25);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // slate-400
    
    // Company name (left)
    if (branding?.company_name && !branding?.remove_branding) {
      doc.text(branding.company_name, 20, pageHeight - 15);
    } else {
      doc.text('FootprintIQ', 20, pageHeight - 15);
    }
    
    // Page number (center)
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 15, { align: 'center' });

    // Generation date (right)
    const date = new Date().toLocaleDateString();
    doc.text(date, pageWidth - 20, pageHeight - 15, { align: 'right' });
  }
}

/**
 * Add branded header to current page (professional style)
 */
export function addBrandedHeader(
  doc: jsPDF,
  branding: BrandingSettings,
  title: string
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const [r, g, b] = branding.primary_color 
    ? hexToRgb(branding.primary_color) 
    : [37, 99, 235]; // Professional blue default
  
  // Top accent bar (subtle)
  doc.setFillColor(r, g, b);
  doc.rect(0, 0, pageWidth, 4, 'F');

  // Title with professional styling
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85); // slate-700
  doc.text(title, 20, 24);
  
  // Company name (right aligned)
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(branding.company_name || 'FootprintIQ', pageWidth - 20, 24, { align: 'right' });
  
  // Header line
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(20, 32, pageWidth - 20, 32);
  
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
 * Capture screenshot of HTML element (lazy loads html2canvas)
 */
export async function captureElementScreenshot(
  element: HTMLElement
): Promise<string> {
  const html2canvas = (await import('html2canvas')).default;
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
  
  if (currentY + requiredSpace > pageHeight - 35) {
    doc.addPage();
    return 45; // Start position for new page (accounting for header space)
  }
  
  return currentY;
}

/**
 * Get professional table styles for autoTable
 */
export function getProfessionalTableStyles(primaryColor?: string) {
  const [r, g, b] = primaryColor ? hexToRgb(primaryColor) : [37, 99, 235];
  
  return {
    theme: 'plain' as const,
    headStyles: {
      fillColor: [r, g, b] as [number, number, number],
      textColor: [255, 255, 255] as [number, number, number],
      fontStyle: 'bold' as const,
      fontSize: 9,
      cellPadding: 5,
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 5,
      textColor: [51, 65, 85] as [number, number, number],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] as [number, number, number],
    },
    styles: {
      lineColor: [226, 232, 240] as [number, number, number],
      lineWidth: 0.25,
      font: 'helvetica',
    },
    margin: { left: 20, right: 20 },
  };
}
