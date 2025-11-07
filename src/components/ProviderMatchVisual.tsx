import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProviderMatchVisualProps {
  providers: {
    name: string;
    matched: boolean;
    confidence?: number;
  }[];
  matchPercentage: number;
  className?: string;
}

export function ProviderMatchVisual({ 
  providers, 
  matchPercentage,
  className 
}: ProviderMatchVisualProps) {
  const matchedCount = providers.filter(p => p.matched).length;
  const totalCount = providers.length;

  return (
    <Card className={cn("p-4 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Provider Matches</h3>
        </div>
        <Badge variant={matchPercentage >= 60 ? "default" : "secondary"}>
          {matchedCount}/{totalCount} Providers
        </Badge>
      </div>

      {/* Match Percentage Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Match Rate</span>
          <span className="font-semibold">{matchPercentage}%</span>
        </div>
        <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className={cn(
              "absolute top-0 left-0 h-full transition-all",
              matchPercentage >= 75 ? "bg-emerald-500" :
              matchPercentage >= 50 ? "bg-green-500" :
              matchPercentage >= 25 ? "bg-yellow-500" :
              "bg-orange-500"
            )}
            style={{ width: `${matchPercentage}%` }}
          />
        </div>
      </div>

      {/* Provider List */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Sources Checked:</p>
        <div className="grid grid-cols-2 gap-2">
          {providers.map((provider, index) => (
            <div 
              key={index}
              className={cn(
                "flex items-center gap-2 p-2 rounded-md text-sm",
                provider.matched ? "bg-emerald-50 dark:bg-emerald-950/20" : "bg-muted"
              )}
            >
              {provider.matched ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
              <span className={cn(
                "truncate",
                provider.matched ? "text-foreground font-medium" : "text-muted-foreground"
              )}>
                {provider.name}
              </span>
              {provider.confidence !== undefined && provider.matched && (
                <span className="ml-auto text-xs text-muted-foreground">
                  {provider.confidence}%
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quality Indicator */}
      <div className={cn(
        "p-3 rounded-lg border",
        matchPercentage >= 75 ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900" :
        matchPercentage >= 50 ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900" :
        "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900"
      )}>
        <p className="text-sm">
          {matchPercentage >= 75 && "✓ High confidence - Multiple sources confirm this data"}
          {matchPercentage >= 50 && matchPercentage < 75 && "⚠ Moderate confidence - Data validated by some sources"}
          {matchPercentage < 50 && "⚠ Limited validation - Consider verifying with additional sources"}
        </p>
      </div>
    </Card>
  );
}
