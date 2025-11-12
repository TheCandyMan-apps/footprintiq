import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileDown, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface MaigretPDFExportProps {
  username: string;
  summary: any[];
  jobId: string;
}

interface BrandingSettings {
  company_name?: string;
  company_tagline?: string;
  logo_url?: string | null;
  primary_color?: string;
  secondary_color?: string;
}

export function MaigretPDFExport({ username, summary, jobId }: MaigretPDFExportProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 99, g: 102, b: 241 };
  };

  const getEvidenceValue = (evidence: any[], key: string) => {
    const found = evidence?.find((e: any) => e.key === key);
    return found?.value || 'N/A';
  };

  const loadBrandingSettings = async (): Promise<BrandingSettings> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return {};

      const { data } = await supabase
        .from('pdf_branding_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      return data ? {
        company_name: data.company_name || undefined,
        company_tagline: data.company_tagline || undefined,
        logo_url: data.logo_url || null,
        primary_color: data.primary_color || undefined,
        secondary_color: data.secondary_color || undefined,
      } : {};
    } catch (error) {
      console.error('Error loading branding settings:', error);
      return {};
    }
  };

  const generatePDF = async () => {
    setLoading(true);
    try {
      const branding = await loadBrandingSettings();
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      const primaryColor = branding.primary_color 
        ? hexToRgb(branding.primary_color)
        : { r: 99, g: 102, b: 241 };
      
      const secondaryColor = branding.secondary_color
        ? hexToRgb(branding.secondary_color)
        : { r: 16, g: 185, b: 129 };
      
      let yPosition = 20;

      // Logo
      if (branding.logo_url) {
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
      if (branding.company_name) {
        doc.setFontSize(16);
        doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
        doc.text(branding.company_name, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 8;
      }

      // Company Tagline
      if (branding.company_tagline) {
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        const lines = doc.splitTextToSize(branding.company_tagline, pageWidth - 28);
        doc.text(lines, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += (lines.length * 4) + 6;
      }

      // Report Title
      doc.setFontSize(20);
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.text('Username OSINT Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;

      // Date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 12;

      // Username Section
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Target Username', 14, yPosition);
      yPosition += 8;

      doc.setFontSize(18);
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.text(username, 14, yPosition);
      yPosition += 12;

      // Summary Statistics
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Summary', 14, yPosition);
      yPosition += 8;

      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text(`Total Profiles Found: ${summary.length}`, 14, yPosition);
      yPosition += 7;
      doc.text(`Job ID: ${jobId}`, 14, yPosition);
      yPosition += 10;

      // Discovered Profiles Table
      if (summary.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Discovered Profiles', 14, yPosition);
        yPosition += 5;

        const tableData = summary.map(item => {
          const site = getEvidenceValue(item.evidence, 'site');
          const url = getEvidenceValue(item.evidence, 'url');
          const status = getEvidenceValue(item.evidence, 'status');
          
          return [
            site,
            url.length > 50 ? url.substring(0, 47) + '...' : url,
            status
          ];
        });

        (doc as any).autoTable({
          startY: yPosition,
          head: [['Platform', 'Profile URL', 'Status']],
          body: tableData,
          theme: 'striped',
          headStyles: { 
            fillColor: [primaryColor.r, primaryColor.g, primaryColor.b],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          styles: { 
            fontSize: 9,
            cellPadding: 3
          },
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 100 },
            2: { cellWidth: 30 }
          }
        });
      } else {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('No profiles found for this username.', 14, yPosition);
      }

      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
          `Page ${i} of ${pageCount} | Confidential Report`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save
      doc.save(`username-osint-${username}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "PDF Generated",
        description: "Your username scan report has been downloaded.",
      });
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Could not generate PDF report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={generatePDF} 
      disabled={loading}
      variant="outline"
      className="gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4" />
          Export PDF
        </>
      )}
    </Button>
  );
}
