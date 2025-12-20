import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  FileJson, 
  FileText, 
  FileSpreadsheet, 
  Package,
  Network 
} from "lucide-react";
import { 
  type PlanTier, 
  hasCapability 
} from "@/lib/billing/planCapabilities";
import { LockedExportButton } from "./LockedExportButton";
import { QuickExportButton } from "@/components/scan/QuickExportButton";
import { exportAsJSON, exportAsCSV, exportAsPDF } from "@/lib/exports";
import { useToast } from "@/hooks/use-toast";
import type { Finding } from "@/lib/ufm";

interface PhoneExportOptionsProps {
  scanId: string;
  findings: Finding[];
  userPlan: PlanTier;
  phone: string;
  redactPII?: boolean;
}

export function PhoneExportOptions({ 
  scanId, 
  findings, 
  userPlan, 
  phone,
  redactPII = true 
}: PhoneExportOptionsProps) {
  const { toast } = useToast();
  
  const canExportPdfCsv = hasCapability(userPlan, 'exportsPdfCsv');
  const canExportEvidencePack = hasCapability(userPlan, 'evidencePack');
  const canExportIdentityGraph = hasCapability(userPlan, 'identityGraph');

  const handleJsonExport = () => {
    exportAsJSON(findings, redactPII);
    toast({ 
      title: "JSON Exported", 
      description: "Phone intelligence data downloaded." 
    });
  };

  const handlePdfExport = async () => {
    try {
      await exportAsPDF(findings, redactPII);
      toast({ 
        title: "PDF Exported", 
        description: "Phone intelligence report downloaded." 
      });
    } catch {
      toast({ 
        title: "Export Failed", 
        description: "Could not generate PDF.", 
        variant: "destructive" 
      });
    }
  };

  const handleCsvExport = () => {
    exportAsCSV(findings, redactPII);
    toast({ 
      title: "CSV Exported", 
      description: "Phone intelligence data downloaded." 
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Download className="h-4 w-4 text-primary" />
          Export Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Free: JSON always available */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={handleJsonExport}
        >
          <FileJson className="h-4 w-4 mr-2" />
          Export JSON
        </Button>
        
        {/* Pro+: PDF */}
        {canExportPdfCsv ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={handlePdfExport}
          >
            <FileText className="h-4 w-4 mr-2" />
            Export PDF Report
          </Button>
        ) : (
          <LockedExportButton 
            label="PDF Report" 
            requiredTier="pro" 
            icon={<FileText className="h-4 w-4 mr-2" />}
          />
        )}
        
        {/* Pro+: CSV */}
        {canExportPdfCsv ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={handleCsvExport}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        ) : (
          <LockedExportButton 
            label="CSV Export" 
            requiredTier="pro"
            icon={<FileSpreadsheet className="h-4 w-4 mr-2" />}
          />
        )}
        
        {/* Business: Evidence Pack */}
        {canExportEvidencePack ? (
          <QuickExportButton 
            scanId={scanId} 
            variant="outline" 
            size="sm"
          />
        ) : (
          <LockedExportButton 
            label="Evidence Pack" 
            requiredTier="business"
            icon={<Package className="h-4 w-4 mr-2" />}
          />
        )}
        
        {/* Business: Identity Graph - placeholder for now */}
        {canExportIdentityGraph ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => toast({ 
              title: "Coming Soon", 
              description: "Identity Graph export will be available soon." 
            })}
          >
            <Network className="h-4 w-4 mr-2" />
            Include Identity Graph
          </Button>
        ) : (
          <LockedExportButton 
            label="Identity Graph" 
            requiredTier="business"
            icon={<Network className="h-4 w-4 mr-2" />}
          />
        )}
      </CardContent>
    </Card>
  );
}
