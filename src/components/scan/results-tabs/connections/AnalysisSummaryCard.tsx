import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Sparkles, ChevronDown, AlertTriangle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface AnalysisSummaryCardProps {
  scanId: string;
  className?: string;
}

interface AnalysisJson {
  summary?: string;
  traits?: string[];
  risks?: string[];
  [key: string]: any;
}

export function AnalysisSummaryCard({ scanId, className }: AnalysisSummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showRisks, setShowRisks] = useState(false);

  const { data: scan, isLoading } = useQuery({
    queryKey: ['scan-analysis', scanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scans')
        .select('analysis_json, analysis_status')
        .eq('id', scanId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!scanId,
    staleTime: 60000, // Cache for 1 minute
  });

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('px-3 py-2 bg-muted/30 border-b border-border', className)}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Loading analysis...</span>
        </div>
      </div>
    );
  }

  // No analysis available
  const analysisJson = scan?.analysis_json as AnalysisJson | null;
  const analysisStatus = scan?.analysis_status;
  
  if (!analysisJson || analysisStatus !== 'completed') {
    return (
      <div className={cn('px-3 py-2 bg-muted/20 border-b border-border', className)}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="w-3.5 h-3.5" />
          <span>
            {analysisStatus === 'processing' 
              ? 'Analysis in progress...' 
              : 'Analysis unavailable for this scan'}
          </span>
        </div>
      </div>
    );
  }

  const { summary, traits, risks } = analysisJson;

  // No meaningful content
  if (!summary && (!traits || traits.length === 0)) {
    return null;
  }

  return (
    <div className={cn('border-b border-border bg-gradient-to-r from-primary/5 via-transparent to-transparent', className)}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger className="flex items-center gap-2 w-full px-3 py-2 hover:bg-muted/30 transition-colors">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground">What stands out</span>
          <ChevronDown className={cn(
            'w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform duration-200',
            isExpanded && 'rotate-180'
          )} />
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-2">
            {/* Summary */}
            {summary && (
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
                {summary}
              </p>
            )}
            
            {/* Traits */}
            {traits && traits.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {traits.slice(0, 6).map((trait, i) => (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className="text-[10px] h-5 px-1.5 bg-background/50"
                  >
                    {trait}
                  </Badge>
                ))}
                {traits.length > 6 && (
                  <Badge 
                    variant="outline" 
                    className="text-[10px] h-5 px-1.5 bg-muted/50 text-muted-foreground"
                  >
                    +{traits.length - 6} more
                  </Badge>
                )}
              </div>
            )}
            
            {/* Risks (collapsible) */}
            {risks && risks.length > 0 && (
              <Collapsible open={showRisks} onOpenChange={setShowRisks}>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-[10px] text-destructive/80 hover:text-destructive gap-1"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    {risks.length} potential risk{risks.length > 1 ? 's' : ''}
                    <ChevronDown className={cn(
                      'w-3 h-3 transition-transform',
                      showRisks && 'rotate-180'
                    )} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ul className="mt-1.5 space-y-1 pl-1">
                    {risks.map((risk, i) => (
                      <li key={i} className="text-[10px] text-destructive/70 flex items-start gap-1.5">
                        <span className="mt-0.5">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export default AnalysisSummaryCard;
