import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { SovereigntyRequest } from '@/hooks/useSovereignty';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SovereigntyPdfExportProps {
  requests: SovereigntyRequest[];
  stats: {
    total: number;
    active: number;
    completed: number;
    rejected: number;
    pending: number;
    overdue: number;
    successRate: number;
  };
  score: number;
}

const JURISDICTION_LABELS: Record<string, string> = {
  gdpr: 'GDPR',
  ccpa: 'CCPA',
  uk_sds: 'UK SDS',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  acknowledged: 'Acknowledged',
  processing: 'Processing',
  completed: 'Removed',
  rejected: 'Rejected',
  expired: 'Expired',
};

export function SovereigntyPdfExport({ requests, stats, score }: SovereigntyPdfExportProps) {
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    setGenerating(true);
    try {
      const doc = new jsPDF();
      const now = format(new Date(), 'MMMM d, yyyy');
      const pageWidth = doc.internal.pageSize.getWidth();

      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Sovereignty Report', pageWidth / 2, 25, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120);
      doc.text(`Generated ${now} by FootprintIQ`, pageWidth / 2, 32, { align: 'center' });
      doc.setTextColor(0);

      // Score section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Sovereignty Score', 14, 48);

      doc.setFontSize(32);
      doc.text(`${score}`, 14, 64);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('/ 100', 38, 64);

      // Stats summary
      const statsY = 78;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary', 14, statsY);

      const statPairs = [
        ['Total Requests', stats.total],
        ['Active', stats.active],
        ['Completed', stats.completed],
        ['Pending', stats.pending],
        ['Overdue', stats.overdue],
        ['Rejected', stats.rejected],
        ['Success Rate', `${stats.successRate}%`],
      ];

      autoTable(doc, {
        startY: statsY + 4,
        head: [['Metric', 'Value']],
        body: statPairs.map(([k, v]) => [String(k), String(v)]),
        theme: 'grid',
        headStyles: { fillColor: [55, 65, 81] },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      });

      // Jurisdiction breakdown
      const jurisdictions = ['gdpr', 'ccpa', 'uk_sds'] as const;
      const jurisdictionData = jurisdictions.map((j) => {
        const jReqs = requests.filter((r) => r.jurisdiction === j);
        const completed = jReqs.filter((r) => r.status === 'completed').length;
        const total = jReqs.length;
        return [
          JURISDICTION_LABELS[j],
          String(total),
          String(completed),
          total > 0 ? `${Math.round((completed / total) * 100)}%` : '—',
        ];
      });

      const afterStats = (doc as any).lastAutoTable?.finalY || statsY + 60;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Jurisdiction Breakdown', 14, afterStats + 12);

      autoTable(doc, {
        startY: afterStats + 16,
        head: [['Jurisdiction', 'Total', 'Completed', 'Success Rate']],
        body: jurisdictionData,
        theme: 'grid',
        headStyles: { fillColor: [55, 65, 81] },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      });

      // Request list
      if (requests.length > 0) {
        const afterJurisdiction = (doc as any).lastAutoTable?.finalY || afterStats + 60;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('All Requests', 14, afterJurisdiction + 12);

        const requestRows = requests.map((r) => [
          r.target_entity,
          JURISDICTION_LABELS[r.jurisdiction] || r.jurisdiction,
          STATUS_LABELS[r.status] || r.status,
          r.submitted_at ? format(new Date(r.submitted_at), 'MMM d, yyyy') : '—',
          r.deadline_at ? format(new Date(r.deadline_at), 'MMM d, yyyy') : '—',
        ]);

        autoTable(doc, {
          startY: afterJurisdiction + 16,
          head: [['Entity', 'Jurisdiction', 'Status', 'Submitted', 'Deadline']],
          body: requestRows,
          theme: 'grid',
          headStyles: { fillColor: [55, 65, 81] },
          styles: { fontSize: 9 },
          margin: { left: 14, right: 14 },
        });
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `FootprintIQ Sovereignty Report — Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      doc.save(`sovereignty-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={generate} disabled={generating} className="gap-2">
      {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {generating ? 'Generating…' : 'Export PDF'}
    </Button>
  );
}
