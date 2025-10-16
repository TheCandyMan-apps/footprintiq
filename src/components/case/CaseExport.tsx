import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Case, exportCaseAsJSON } from "@/lib/case";
import { generateEvidencePack } from "@/lib/evidence/zip";
import { Download, FileJson, FileArchive } from "lucide-react";
import { toast } from "sonner";

interface CaseExportProps {
  caseData: Case;
}

export const CaseExport = ({ caseData }: CaseExportProps) => {
  const handleExportJSON = () => {
    try {
      const json = exportCaseAsJSON(caseData);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${caseData.name.replace(/\s+/g, "_")}_case.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Case exported as JSON");
    } catch (error) {
      console.error("Failed to export case:", error);
      toast.error("Failed to export case");
    }
  };

  const handleExportEvidencePack = async () => {
    try {
      const blob = await generateEvidencePack(caseData.findings, {
        generated: new Date().toISOString(),
        scanId: caseData.id,
        findingCount: caseData.findings.length,
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${caseData.name.replace(/\s+/g, "_")}_evidence_pack.zip`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success("Evidence Pack generated");
    } catch (error) {
      console.error("Failed to generate evidence pack:", error);
      toast.error("Failed to generate evidence pack");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Case</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <FileJson className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-sm">Case JSON</h4>
              <p className="text-xs text-muted-foreground">
                Export all findings, notes, and metadata as JSON
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={handleExportJSON}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          <div className="flex items-start gap-3">
            <FileArchive className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-sm">Evidence Pack</h4>
              <p className="text-xs text-muted-foreground">
                Complete ZIP with JSON, CSV, summary, and manifest
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportEvidencePack}
              disabled={caseData.findings.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Generate
            </Button>
          </div>

          <div className="mt-4 p-3 bg-muted rounded-lg text-xs text-muted-foreground">
            <p>
              <strong>Case Summary:</strong>
            </p>
            <p className="mt-1">
              {caseData.pinnedFindingIds.length} findings, {caseData.notes.length} notes
            </p>
            <p>Last updated: {new Date(caseData.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
