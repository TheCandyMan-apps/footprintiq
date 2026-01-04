import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useResultsGating } from "@/components/billing/GatedContent";
import { useNavigate } from "react-router-dom";

interface ExportEnrichedButtonProps {
  scanId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

interface Finding {
  id: string;
  platform: string;
  username: string;
  url: string | null;
  confidence: number;
  severity: string;
  page_type: string;
  provider: string;
  kind: string;
  bio: string | null;
  full_name: string | null;
  created_at: string;
}

interface ScanData {
  id: string;
  target: string;
  scan_type: string;
  status: string;
  privacy_score: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  created_at: string;
  completed_at: string;
}

interface Enrichment {
  context: string | null;
  attack_vectors: string[];
  remediation_steps: string[];
}

interface ExportData {
  scan: ScanData;
  findings: Finding[];
  enrichments: Record<string, Enrichment>;
  branding: {
    company_name: string;
    primary_color: string;
    secondary_color: string;
    tagline: string;
    footer_text: string;
  } | null;
  profile_count: number;
  finding_count: number;
  enrichment_count: number;
  credits_spent: number;
}

// Severity color mapping
const severityColors: Record<string, { r: number; g: number; b: number; hex: string }> = {
  critical: { r: 220, g: 38, b: 38, hex: '#dc2626' },
  high: { r: 234, g: 88, b: 12, hex: '#ea580c' },
  medium: { r: 202, g: 138, b: 4, hex: '#ca8a04' },
  low: { r: 37, g: 99, b: 235, hex: '#2563eb' },
  info: { r: 100, g: 116, b: 139, hex: '#64748b' }
};

function getSeverityColor(severity: string) {
  return severityColors[severity?.toLowerCase()] || severityColors.info;
}

export function ExportEnrichedButton({ scanId, variant = "default", size = "default" }: ExportEnrichedButtonProps) {
  const { workspace } = useWorkspace();
  const [isExporting, setIsExporting] = useState(false);
  const { canExportDetails } = useResultsGating();
  const navigate = useNavigate();

  const handleExport = async () => {
    if (!canExportDetails) {
      toast.error("Export requires Pro plan", {
        action: {
          label: "Upgrade",
          onClick: () => navigate("/settings/billing"),
        },
      });
      return;
    }

    if (!workspace?.id) {
      toast.error("No workspace selected");
      return;
    }

    setIsExporting(true);

    try {
      console.log('[Export] Fetching enriched report data for scan:', scanId);
      
      const { data, error } = await supabase.functions.invoke('export-enriched-report', {
        body: {
          scanId,
          workspaceId: workspace.id
        }
      });

      if (error) throw error;

      if (data.error) {
        if (data.error === 'insufficient_credits') {
          toast.error(`Insufficient credits. Need 10 credits, have ${data.balance}`);
        } else {
          toast.error(`Export failed: ${data.error}`);
        }
        return;
      }

      console.log('[Export] Received data:', {
        findings: data.findings?.length || 0,
        enrichments: Object.keys(data.enrichments || {}).length
      });
      
      generateProfessionalPDF(data as ExportData, scanId);

      toast.success(`Report exported successfully! (10 credits used)`, {
        description: `${data.finding_count} findings exported`
      });

    } catch (error: any) {
      console.error('[Export] Error:', error);
      toast.error(`Failed to export report: ${error.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const generateProfessionalPDF = (data: ExportData, scanId: string) => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    
    const primaryColor = data.branding?.primary_color || '#3b82f6';
    const companyName = data.branding?.company_name || 'FootprintIQ';

    // Helper to check page break
    const checkPageBreak = (yPos: number, needed: number = 30): number => {
      if (yPos + needed > pageHeight - 25) {
        pdf.addPage();
        return 20;
      }
      return yPos;
    };

    // ========== PAGE 1: COVER & EXECUTIVE SUMMARY ==========
    
    // Header bar
    pdf.setFillColor(59, 130, 246);
    pdf.rect(0, 0, pageWidth, 50, 'F');
    
    // Logo/Company name
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text(companyName, margin, 22);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text('OSINT Intelligence Platform', margin, 32);
    
    // Report title
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Digital Footprint Intelligence Report', margin, 45);

    let yPos = 65;

    // Report metadata box
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(226, 232, 240);
    pdf.roundedRect(margin, yPos - 5, contentWidth, 40, 3, 3, 'FD');
    
    pdf.setTextColor(71, 85, 105);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const leftCol = margin + 5;
    const rightCol = pageWidth / 2 + 5;
    
    pdf.text(`Target: ${data.scan.target}`, leftCol, yPos + 5);
    pdf.text(`Scan Type: ${data.scan.scan_type.toUpperCase()}`, leftCol, yPos + 12);
    pdf.text(`Status: ${data.scan.status.toUpperCase()}`, leftCol, yPos + 19);
    pdf.text(`Scan ID: ${scanId.slice(0, 8)}...`, leftCol, yPos + 26);
    
    pdf.text(`Generated: ${new Date().toLocaleString()}`, rightCol, yPos + 5);
    pdf.text(`Scanned: ${new Date(data.scan.created_at).toLocaleDateString()}`, rightCol, yPos + 12);
    pdf.text(`Total Findings: ${data.findings.length}`, rightCol, yPos + 19);
    pdf.text(`Enrichments: ${data.enrichment_count}`, rightCol, yPos + 26);

    yPos += 50;

    // Privacy Score Section
    pdf.setTextColor(31, 41, 55);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Privacy Score', margin, yPos);
    yPos += 8;

    const score = data.scan.privacy_score || 0;
    const scoreColor = score >= 70 ? { r: 22, g: 163, b: 74 } : score >= 40 ? { r: 202, g: 138, b: 4 } : { r: 220, g: 38, b: 38 };
    
    // Score gauge background
    pdf.setFillColor(229, 231, 235);
    pdf.roundedRect(margin, yPos, 100, 12, 2, 2, 'F');
    
    // Score gauge fill
    pdf.setFillColor(scoreColor.r, scoreColor.g, scoreColor.b);
    pdf.roundedRect(margin, yPos, Math.max(score, 2), 12, 2, 2, 'F');
    
    // Score text
    pdf.setTextColor(scoreColor.r, scoreColor.g, scoreColor.b);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${score}/100`, margin + 110, yPos + 10);
    
    // Score interpretation
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const scoreLabel = score >= 70 ? 'Low Exposure Risk' : score >= 40 ? 'Moderate Exposure Risk' : 'High Exposure Risk';
    pdf.text(scoreLabel, margin + 140, yPos + 10);

    yPos += 25;

    // Risk Distribution Section
    pdf.setTextColor(31, 41, 55);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Risk Distribution', margin, yPos);
    yPos += 10;

    // Count by severity
    const severityCounts = data.findings.reduce((acc, f) => {
      const sev = f.severity?.toLowerCase() || 'info';
      acc[sev] = (acc[sev] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Draw risk bars
    const riskItems = [
      { label: 'Critical', count: severityCounts.critical || 0, color: severityColors.critical },
      { label: 'High', count: severityCounts.high || 0, color: severityColors.high },
      { label: 'Medium', count: severityCounts.medium || 0, color: severityColors.medium },
      { label: 'Low', count: severityCounts.low || 0, color: severityColors.low },
      { label: 'Info', count: severityCounts.info || 0, color: severityColors.info }
    ];

    const maxCount = Math.max(...riskItems.map(r => r.count), 1);
    
    riskItems.forEach((item, idx) => {
      const barY = yPos + (idx * 10);
      
      // Label
      pdf.setTextColor(71, 85, 105);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(item.label, margin, barY + 4);
      
      // Bar background
      pdf.setFillColor(229, 231, 235);
      pdf.rect(margin + 25, barY, 80, 6, 'F');
      
      // Bar fill
      if (item.count > 0) {
        pdf.setFillColor(item.color.r, item.color.g, item.color.b);
        pdf.rect(margin + 25, barY, (item.count / maxCount) * 80, 6, 'F');
      }
      
      // Count
      pdf.setTextColor(31, 41, 55);
      pdf.text(String(item.count), margin + 110, barY + 4);
    });

    yPos += 60;

    // Quick Stats Cards
    pdf.setTextColor(31, 41, 55);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Quick Statistics', margin, yPos);
    yPos += 10;

    const cardWidth = (contentWidth - 10) / 3;
    const stats = [
      { label: 'Total Platforms', value: new Set(data.findings.map(f => f.platform)).size },
      { label: 'High Confidence', value: data.findings.filter(f => f.confidence >= 80).length },
      { label: 'Profile Pages', value: data.findings.filter(f => f.page_type !== 'search').length }
    ];

    stats.forEach((stat, idx) => {
      const cardX = margin + (idx * (cardWidth + 5));
      
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(226, 232, 240);
      pdf.roundedRect(cardX, yPos, cardWidth, 25, 2, 2, 'FD');
      
      pdf.setTextColor(59, 130, 246);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(String(stat.value), cardX + cardWidth / 2, yPos + 12, { align: 'center' });
      
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(stat.label, cardX + cardWidth / 2, yPos + 20, { align: 'center' });
    });

    yPos += 40;

    // ========== PAGE 2+: DETAILED FINDINGS TABLE ==========
    pdf.addPage();
    yPos = 20;

    // Section header
    pdf.setFillColor(59, 130, 246);
    pdf.rect(0, 0, pageWidth, 25, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Detailed Findings', margin, 16);
    
    yPos = 35;

    // Prepare table data
    const tableData = data.findings
      .sort((a, b) => b.confidence - a.confidence)
      .map(f => {
        const sevColor = getSeverityColor(f.severity);
        return [
          f.platform,
          f.username,
          f.url ? (f.url.length > 40 ? f.url.substring(0, 40) + '...' : f.url) : 'N/A',
          `${f.confidence}%`,
          f.severity.toUpperCase(),
          f.page_type || 'profile'
        ];
      });

    if (tableData.length > 0) {
      autoTable(pdf, {
        startY: yPos,
        head: [['Platform', 'Username', 'URL', 'Confidence', 'Severity', 'Type']],
        body: tableData,
        theme: 'striped',
        headStyles: { 
          fillColor: [59, 130, 246],
          fontSize: 9,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 8
        },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 25 },
          2: { cellWidth: 55 },
          3: { cellWidth: 20, halign: 'center' },
          4: { cellWidth: 20, halign: 'center' },
          5: { cellWidth: 20, halign: 'center' }
        },
        margin: { left: margin, right: margin },
        didParseCell: (data) => {
          // Color code severity column
          if (data.section === 'body' && data.column.index === 4) {
            const severity = String(data.cell.raw).toLowerCase();
            const color = getSeverityColor(severity);
            data.cell.styles.textColor = [color.r, color.g, color.b];
            data.cell.styles.fontStyle = 'bold';
          }
          // Color code confidence
          if (data.section === 'body' && data.column.index === 3) {
            const conf = parseInt(String(data.cell.raw));
            if (conf >= 80) {
              data.cell.styles.textColor = [22, 163, 74];
            } else if (conf >= 50) {
              data.cell.styles.textColor = [202, 138, 4];
            } else {
              data.cell.styles.textColor = [100, 116, 139];
            }
          }
        }
      });

      yPos = (pdf as any).lastAutoTable.finalY + 15;
    } else {
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(11);
      pdf.text('No findings to display.', margin, yPos);
      yPos += 20;
    }

    // ========== AI ENRICHMENTS SECTION ==========
    const enrichedFindings = data.findings.filter(f => data.enrichments[f.id]);
    
    if (enrichedFindings.length > 0) {
      yPos = checkPageBreak(yPos, 60);
      
      if (yPos < 30) {
        // New page header
        pdf.setFillColor(99, 102, 241);
        pdf.rect(0, 0, pageWidth, 25, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('AI Enrichment Analysis', margin, 16);
        yPos = 35;
      } else {
        pdf.setTextColor(31, 41, 55);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('AI Enrichment Analysis', margin, yPos);
        yPos += 10;
      }

      enrichedFindings.slice(0, 10).forEach(finding => {
        yPos = checkPageBreak(yPos, 50);
        
        const enrichment = data.enrichments[finding.id];
        const sevColor = getSeverityColor(finding.severity);
        
        // Finding header with colored border
        pdf.setDrawColor(sevColor.r, sevColor.g, sevColor.b);
        pdf.setLineWidth(1);
        pdf.line(margin, yPos, margin, yPos + 8);
        
        pdf.setTextColor(31, 41, 55);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${finding.platform} - @${finding.username}`, margin + 3, yPos + 5);
        
        pdf.setTextColor(sevColor.r, sevColor.g, sevColor.b);
        pdf.setFontSize(8);
        pdf.text(finding.severity.toUpperCase(), margin + 120, yPos + 5);
        
        yPos += 12;

        // Context
        if (enrichment.context) {
          pdf.setTextColor(71, 85, 105);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          
          const contextLines = pdf.splitTextToSize(`Context: ${enrichment.context}`, contentWidth - 5);
          pdf.text(contextLines, margin + 3, yPos);
          yPos += contextLines.length * 4 + 3;
        }

        // Attack vectors
        if (enrichment.attack_vectors?.length > 0) {
          yPos = checkPageBreak(yPos, 20);
          pdf.setTextColor(220, 38, 38);
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Attack Vectors:', margin + 3, yPos);
          yPos += 4;
          
          pdf.setFont('helvetica', 'normal');
          enrichment.attack_vectors.slice(0, 3).forEach(av => {
            const lines = pdf.splitTextToSize(`• ${av}`, contentWidth - 10);
            pdf.text(lines, margin + 5, yPos);
            yPos += lines.length * 3.5;
          });
          yPos += 2;
        }

        // Remediation steps
        if (enrichment.remediation_steps?.length > 0) {
          yPos = checkPageBreak(yPos, 20);
          pdf.setTextColor(22, 163, 74);
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Remediation:', margin + 3, yPos);
          yPos += 4;
          
          pdf.setFont('helvetica', 'normal');
          enrichment.remediation_steps.slice(0, 3).forEach((step, idx) => {
            const lines = pdf.splitTextToSize(`${idx + 1}. ${step}`, contentWidth - 10);
            pdf.text(lines, margin + 5, yPos);
            yPos += lines.length * 3.5;
          });
        }

        yPos += 8;
      });
    }

    // ========== RECOMMENDATIONS PAGE ==========
    pdf.addPage();
    
    // Header
    pdf.setFillColor(34, 197, 94);
    pdf.rect(0, 0, pageWidth, 25, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Recommendations & Next Steps', margin, 16);
    
    yPos = 35;

    // Generate recommendations based on findings
    const recommendations = generateRecommendations(data);
    
    recommendations.forEach((rec, idx) => {
      yPos = checkPageBreak(yPos, 25);
      
      // Recommendation card
      pdf.setFillColor(240, 253, 244);
      pdf.setDrawColor(34, 197, 94);
      pdf.roundedRect(margin, yPos - 3, contentWidth, 18, 2, 2, 'FD');
      
      pdf.setTextColor(22, 101, 52);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${idx + 1}. ${rec.title}`, margin + 3, yPos + 4);
      
      pdf.setTextColor(34, 87, 54);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      const descLines = pdf.splitTextToSize(rec.description, contentWidth - 10);
      pdf.text(descLines[0] || '', margin + 3, yPos + 11);
      
      yPos += 22;
    });

    // ========== ADD PAGE FOOTERS ==========
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      
      // Footer line
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.5);
      pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      
      // Footer text
      pdf.setFontSize(8);
      pdf.setTextColor(156, 163, 175);
      pdf.text(
        `${companyName} Intelligence Report | Confidential | Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      
      pdf.text(
        new Date().toLocaleDateString(),
        pageWidth - margin,
        pageHeight - 10,
        { align: 'right' }
      );
    }

    // Download PDF
    pdf.save(`osint-report-${scanId.slice(0, 8)}.pdf`);
    console.log('[Export] Professional PDF generated successfully');
  };

  // Show gated state for free users
  if (!canExportDetails) {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={() => navigate("/settings/billing")}
        className="gap-2 text-muted-foreground"
      >
        <Lock className="h-4 w-4" />
        Export Report
        <span className="text-xs text-primary ml-1">Pro</span>
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={isExporting}
      className="gap-2"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      {isExporting ? "Exporting..." : "Export Report (10 credits)"}
    </Button>
  );
}

// Generate smart recommendations based on scan results
function generateRecommendations(data: ExportData): { title: string; description: string }[] {
  const recs: { title: string; description: string }[] = [];
  
  const highConfidenceCount = data.findings.filter(f => f.confidence >= 80).length;
  const searchResults = data.findings.filter(f => f.page_type === 'search').length;
  const socialPlatforms = new Set(data.findings.map(f => f.platform.toLowerCase()));
  
  if (highConfidenceCount > 5) {
    recs.push({
      title: 'Review High-Confidence Profiles',
      description: `${highConfidenceCount} profiles were found with high confidence. Review each to verify ownership and assess privacy settings.`
    });
  }
  
  if (data.scan.privacy_score < 50) {
    recs.push({
      title: 'Improve Privacy Score',
      description: 'Your digital footprint shows significant exposure. Consider making profiles private or removing unused accounts.'
    });
  }
  
  if (socialPlatforms.has('facebook') || socialPlatforms.has('instagram')) {
    recs.push({
      title: 'Audit Social Media Privacy Settings',
      description: 'Major social platforms detected. Review friend lists, post visibility, and tagged photo settings.'
    });
  }
  
  if (data.findings.some(f => f.severity === 'high' || f.severity === 'critical')) {
    recs.push({
      title: 'Address High-Risk Findings Immediately',
      description: 'Critical or high-severity findings require immediate attention. These may expose sensitive information.'
    });
  }
  
  if (searchResults > data.findings.length * 0.3) {
    recs.push({
      title: 'Investigate Search Results',
      description: `${searchResults} findings are search-page mentions. These may indicate data broker listings that should be removed.`
    });
  }
  
  recs.push({
    title: 'Set Up Continuous Monitoring',
    description: 'Schedule regular scans to detect new exposures and track changes to your digital footprint over time.'
  });
  
  recs.push({
    title: 'Document and Track Remediation',
    description: 'Use the case management feature to track which findings have been addressed and monitor progress.'
  });
  
  return recs.slice(0, 7);
}
