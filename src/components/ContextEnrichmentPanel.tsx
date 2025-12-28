import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ExternalLink, 
  Globe, 
  Clock, 
  Loader2, 
  AlertCircle,
  RefreshCw,
  CheckCircle2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface ContextEnrichmentPanelProps {
  url: string;
  onEnrichmentComplete?: (data: EnrichmentData) => void;
}

export interface EnrichmentData {
  success: boolean;
  sourceUrl: string;
  fetchedAt: string;
  title: string;
  description: string;
  markdown: string;
  html: string;
  metadata: Record<string, unknown>;
}

type PanelState = 'idle' | 'loading' | 'success' | 'error';

export function ContextEnrichmentPanel({ url, onEnrichmentComplete }: ContextEnrichmentPanelProps) {
  const [state, setState] = useState<PanelState>('idle');
  const [enrichmentData, setEnrichmentData] = useState<EnrichmentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'raw'>('summary');
  const { toast } = useToast();

  // Don't render if no URL provided
  if (!url) return null;

  const handleEnrich = async () => {
    setState('loading');
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('firecrawl-enrich', {
        body: { url },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to retrieve context');
      }

      setEnrichmentData(data);
      setState('success');
      onEnrichmentComplete?.(data);
      
      toast({
        title: "Context Retrieved",
        description: "Public content has been fetched for review.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to retrieve context';
      setError(errorMessage);
      setState('error');
      toast({
        title: "Retrieval Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  };

  // Generate a simple summary from markdown (first 2-3 sentences)
  const generateSummary = (markdown: string): string => {
    if (!markdown) return "No content available.";
    
    const cleanText = markdown
      .replace(/#{1,6}\s/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_`]/g, '')
      .replace(/\n+/g, ' ')
      .trim();
    
    const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
    return sentences.slice(0, 3).join(' ').trim() || cleanText.slice(0, 300) + '...';
  };

  const getButtonContent = () => {
    switch (state) {
      case 'loading':
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Fetching…
          </>
        );
      case 'success':
        return (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh context
          </>
        );
      case 'error':
        return (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </>
        );
      default:
        return (
          <>
            <Globe className="mr-2 h-4 w-4" />
            Fetch public context
          </>
        );
    }
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base font-medium">
              Context (Public Web)
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-xs font-normal text-muted-foreground border-border">
            Fetched on demand
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Fetch public page context to validate the result and reduce false positives.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Source URL Display */}
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
          <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-muted-foreground truncate flex-1">{url}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => window.open(url, '_blank')}
          >
            Open
          </Button>
        </div>

        {/* Fetch Button - Always visible for retry/refresh */}
        {state !== 'success' && (
          <>
            <Button 
              onClick={handleEnrich} 
              disabled={state === 'loading'}
              className="w-full"
              variant={state === 'error' ? 'destructive' : 'outline'}
            >
              {getButtonContent()}
            </Button>
            
            {/* Safety/clarity text */}
            <p className="text-xs text-muted-foreground text-center">
              Only runs when you click. FootprintIQ fetches content only from the URL you provide and does not crawl beyond it.
            </p>
          </>
        )}

        {/* Error State */}
        {state === 'error' && error && (
          <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Couldn't fetch that page</p>
              <p className="text-sm text-muted-foreground mt-1">
                This site may block automated access, require login, or be temporarily unavailable.
              </p>
              <div className="flex gap-2 mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleEnrich}
                >
                  Try again
                </Button>
                <Button
                  variant="ghost" 
                  size="sm" 
                  onClick={() => window.open(url, '_blank')}
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  Open URL
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Success State - Enrichment Results */}
        {state === 'success' && enrichmentData && (
          <div className="space-y-4">
            {/* Fetch Indicator */}
            <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-accent/30">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">Fetched on demand</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Fetched: {formatDate(enrichmentData.fetchedAt)}
              </div>
            </div>

            {/* Page Title & Description */}
            {enrichmentData.title && (
              <div className="space-y-1">
                <h4 className="font-medium">{enrichmentData.title}</h4>
                {enrichmentData.description && (
                  <p className="text-sm text-muted-foreground">{enrichmentData.description}</p>
                )}
              </div>
            )}

            {/* Refresh button */}
            <Button 
              onClick={handleEnrich} 
              variant="outline"
              size="sm"
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh context
            </Button>

            {/* Summary / Raw Toggle Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'summary' | 'raw')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="raw">Raw</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="mt-3">
                <ScrollArea className="h-48 rounded-lg border border-border bg-background">
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {generateSummary(enrichmentData.markdown)}
                    </p>
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="raw" className="mt-3">
                <ScrollArea className="h-48 rounded-lg border border-border bg-muted/30">
                  <div className="p-4">
                    <div className="prose prose-sm max-w-none dark:prose-invert text-xs font-mono">
                      <ReactMarkdown>{enrichmentData.markdown || "No content available."}</ReactMarkdown>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            {/* Safety text */}
            <p className="text-xs text-muted-foreground text-center">
              Only runs when you click. FootprintIQ fetches content only from the URL you provide and does not crawl beyond it.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
