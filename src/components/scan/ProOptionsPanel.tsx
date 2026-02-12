import { Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  type DetectedType, 
  type EnhancerKey, 
  ENHANCERS_BY_TYPE 
} from "@/lib/scan/unifiedScanTypes";

interface ProOptionsPanelProps {
  detectedType: DetectedType;
  isFree: boolean;
  selectedEnhancers: EnhancerKey[];
  onChangeEnhancer: (key: EnhancerKey, enabled: boolean) => void;
  onRequestUpgrade: () => void;
}

export function ProOptionsPanel({
  detectedType,
  isFree,
  selectedEnhancers,
  onChangeEnhancer,
  onRequestUpgrade,
}: ProOptionsPanelProps) {
  const enhancers = ENHANCERS_BY_TYPE[detectedType];
  
  if (!enhancers || enhancers.length === 0) {
    return null;
  }

  const handleRowClick = (key: EnhancerKey, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFree) {
      // Free users clicking locked options opens upgrade modal
      onRequestUpgrade();
      return;
    }
    
    // Pro users can toggle
    const isSelected = selectedEnhancers.includes(key);
    onChangeEnhancer(key, !isSelected);
  };

  return (
    <div className="space-y-3 animate-in fade-in-50 slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        <span>Enhance this scan</span>
      </div>
      
      <div className="space-y-2">
        {enhancers.map((enhancer) => {
          const isSelected = selectedEnhancers.includes(enhancer.key);
          const isLocked = isFree;
          
          return (
            <button
              key={enhancer.key}
              type="button"
              onClick={(e) => handleRowClick(enhancer.key, e)}
              className={cn(
                "w-full flex items-start gap-3 p-3 rounded-lg border transition-all text-left",
                isLocked 
                  ? "border-border/50 bg-muted/30 cursor-pointer hover:border-primary/30 hover:bg-muted/50" 
                  : isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border bg-secondary/50 hover:border-primary/50 hover:bg-secondary"
              )}
              aria-disabled={isLocked}
            >
              {/* Checkbox area */}
              <div className={cn(
                "mt-0.5 flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                isLocked
                  ? "border-muted-foreground/30 bg-muted/50"
                  : isSelected
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/50"
              )}>
                {isLocked ? (
                  <Lock className="h-2.5 w-2.5 text-muted-foreground/50" />
                ) : isSelected ? (
                  <svg className="h-2.5 w-2.5 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : null}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-sm font-medium",
                    isLocked ? "text-muted-foreground" : "text-foreground"
                  )}>
                    {enhancer.label}
                  </span>
                  {isLocked && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-primary/20 text-primary border border-primary/30">
                      <Lock className="h-2.5 w-2.5" />
                      PRO
                    </span>
                  )}
                </div>
                <p className={cn(
                  "text-xs mt-0.5",
                  isLocked ? "text-muted-foreground/70" : "text-muted-foreground"
                )}>
                  {enhancer.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Upgrade footer for Free users */}
      {isFree && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRequestUpgrade();
          }}
          className="w-full text-center py-3 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Switch to Pro Intelligence for deeper sources, confidence signals, and full correlation.
        </button>
      )}
    </div>
  );
}
