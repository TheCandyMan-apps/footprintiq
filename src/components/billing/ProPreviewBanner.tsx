import { Clock, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProPreview } from "@/hooks/useProPreview";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useState } from "react";

interface ProPreviewBannerProps {
  className?: string;
  compact?: boolean;
}

/**
 * ProPreviewBanner - Shows trial status including time remaining and scans used.
 * Displays inline in billing section or dashboard.
 */
export function ProPreviewBanner({ className, compact = false }: ProPreviewBannerProps) {
  const { 
    isTrialActive, 
    timeRemaining, 
    trialScansUsed, 
    trialScansRemaining,
    trialEndsAt 
  } = useProPreview();
  const { workspace } = useWorkspace();
  const [isManaging, setIsManaging] = useState(false);

  if (!isTrialActive) return null;

  const handleManageSubscription = async () => {
    if (!workspace?.id) return;
    
    setIsManaging(true);
    try {
      const { data, error } = await supabase.functions.invoke('billing-portal', {
        body: { workspaceId: workspace.id },
      });
      
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Failed to open billing portal:', err);
    } finally {
      setIsManaging(false);
    }
  };

  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20",
        className
      )}>
        <Zap className="h-4 w-4 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-foreground">Pro Preview</span>
          <span className="text-sm text-muted-foreground ml-2">{timeRemaining}</span>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {trialScansUsed}/3 scans
        </span>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 p-4",
      className
    )}>
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Zap className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">Pro Preview Active</h3>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              Trial
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{timeRemaining}</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-foreground">{trialScansUsed}</span>
              <span>of 3 Pro scans used</span>
            </div>
          </div>
          
          {trialScansRemaining === 0 && (
            <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
              You've used all your trial scans. Upgrade to continue with Pro features.
            </p>
          )}
          
          <p className="mt-2 text-xs text-muted-foreground">
            Auto-converts to Pro when preview ends. Cancel anytime.
          </p>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleManageSubscription}
          disabled={isManaging}
          className="flex-shrink-0"
        >
          {isManaging ? "Loading..." : "Manage"}
        </Button>
      </div>
    </div>
  );
}

/**
 * TrialScansIndicator - Small inline indicator for scan count during trial.
 */
export function TrialScansIndicator({ className }: { className?: string }) {
  const { isTrialActive, trialScansUsed, trialScansRemaining } = useProPreview();

  if (!isTrialActive) return null;

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-xs",
      className
    )}>
      <Zap className="h-3 w-3 text-primary" />
      <span className="text-muted-foreground">
        <span className="font-medium text-foreground">{trialScansRemaining}</span> trial scans left
      </span>
    </div>
  );
}
