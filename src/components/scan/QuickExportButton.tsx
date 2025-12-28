import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Package, Loader2, Lock, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useResultsGating } from "@/components/billing/GatedContent";
import { useNavigate } from "react-router-dom";

interface QuickExportButtonProps {
  scanId: string;
  selectedItems?: string[];
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function QuickExportButton({ 
  scanId, 
  selectedItems = [], 
  variant = "default",
  size = "default" 
}: QuickExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { workspace } = useWorkspace();
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

    if (!workspace) {
      toast.error("Please select a workspace first");
      return;
    }

    setIsExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("quick-export-evidence", {
        body: { 
          scanId,
          selectedItems,
          workspaceId: workspace.id
        },
      });

      if (error) {
        if (error.message?.includes("insufficient_credits")) {
          toast.error("Insufficient credits. Need 10 credits for evidence export.");
        } else {
          throw error;
        }
        return;
      }

      // Convert base64 to blob
      const byteCharacters = atob(data.zipData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/zip" });

      // Download the ZIP
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `evidence-package-${scanId}-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Evidence package exported successfully (10 credits deducted)");
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error(error.message || "Failed to export evidence package");
    } finally {
      setIsExporting(false);
    }
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
        Export Evidence
        <span className="text-xs text-primary ml-1">Pro</span>
      </Button>
    );
  }

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant={variant}
      size={size}
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Package className="h-4 w-4" />
          Quick Export Evidence (10 credits)
        </>
      )}
    </Button>
  );
}
