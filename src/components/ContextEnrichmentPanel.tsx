import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ExternalLink, 
  Globe, 
  Clock, 
  Loader2, 
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Lock,
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTierGating } from "@/hooks/useTierGating";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";

export interface UrlOption {
  label: string;
  url: string;
}

interface ContextEnrichmentPanelProps {
  /** Single URL (backward compatible) */
  url?: string;
  /** Multiple URL options for user selection */
  urls?: UrlOption[];
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

export function ContextEnrichmentPanel({ url, urls, onEnrichmentComplete }: ContextEnrichmentPanelProps) {
  const { isFree, isLoading: tierLoading } = useTierGating();
  
  // Build URL options from props
  const urlOptions: UrlOption[] = urls?.length 
    ? urls 
    : url 
      ? [{ label: 'Source URL', url }] 
      : [];
  
  const [selectedUrl, setSelectedUrl] = useState<string>(urlOptions[0]?.url || '');
  const [state, setState] = useState<PanelState>('idle');
  const [enrichmentData, setEnrichmentData] = useState<EnrichmentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'raw'>('summary');
  const { toast } = useToast();

  // Don't render if no URLs available
  if (urlOptions.length === 0) return null;

  const handleEnrich = async () => {
    if (!selectedUrl || isFree) return;
    
    setState('loading');
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('firecrawl-enrich', {
        body: { url: selectedUrl },
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

  const hasMultipleUrls = urlOptions.length > 1;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4 space-y-3">
        {/* Header row with title and actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base font-medium">
              Context (Public Web)
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => window.open(selectedUrl, '_blank')}
              disabled={!selectedUrl}
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Open page
            </Button>
            {/* Fetch button - disabled for free users */}
            {!isFree ? (
              <Button
                variant={state === 'success' ? 'outline' : 'default'}
                size="sm"
                className="h-8"
                onClick={handleEnrich}
                disabled={state === 'loading' || !selectedUrl || tierLoading}
              >
                {state === 'loading' ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Fetching…
                  </>
                ) : state === 'success' ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    Refresh context
                  </>
                ) : (
                  <>
                    <Globe className="h-3.5 w-3.5 mr-1.5" />
                    Fetch context
                  </>
                )}
              </Button>
            ) : (
              <Badge variant="secondary" className="h-8 px-3 flex items-center gap-1.5 text-xs">
                <Lock className="h-3 w-3" />
                Pro Feature
              </Badge>
            )}
          </div>
        </div>

        {/* Explainer text */}
        <p className="text-sm text-muted-foreground">
          Use this to validate a match and reduce false positives.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* URL Selector or Display */}
        {hasMultipleUrls ? (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Select URL to enrich
            </label>
            <Select value={selectedUrl} onValueChange={setSelectedUrl}>
              <SelectTrigger className="w-full bg-muted/30 border-border">
                <SelectValue placeholder="Choose a URL" />
              </SelectTrigger>
              <SelectContent>
                {urlOptions.map((option, idx) => (
                  <SelectItem key={idx} value={option.url}>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[280px]">
                        {option.url}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border">
            <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm text-muted-foreground truncate flex-1">{selectedUrl}</span>
          </div>
        )}

        {/* Pro upgrade prompt for free users */}
        {isFree && (
          <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-3">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Fetch public page context to reduce false positives
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                    User-initiated only
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                    No monitoring or automated scraping
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                    Used to validate findings, not discover new targets
                  </li>
                </ul>
              </div>
            </div>
            <Button asChild size="sm" className="w-full">
              <Link to="/settings/billing">
                Upgrade to Pro
              </Link>
            </Button>
          </div>
        )}

        {/* Usage microcopy for Pro users */}
        {!isFree && state === 'idle' && (
          <p className="text-xs text-muted-foreground">
            Counts toward usage. Only runs when you click.
          </p>
        )}

        {/* Error State */}
        {state === 'error' && error && (
          <div className="flex items-start gap-3 p-4 bg-destructive/5 rounded-lg border border-destructive/20">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Couldn't fetch that page</p>
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
                  onClick={() => window.open(selectedUrl, '_blank')}
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
            {/* Last Fetched - Prominent display */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-foreground">Fetched on demand</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {formatDate(enrichmentData.fetchedAt)}
                </span>
              </div>
            </div>

            {/* Page Title & Description */}
            {enrichmentData.title && (
              <div className="space-y-1">
                <h4 className="font-medium text-foreground">{enrichmentData.title}</h4>
                {enrichmentData.description && (
                  <p className="text-sm text-muted-foreground">{enrichmentData.description}</p>
                )}
              </div>
            )}

            {/* Summary / Raw Toggle Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'summary' | 'raw')}>
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
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
                <ScrollArea className="h-48 rounded-lg border border-border bg-muted/20">
                  <div className="p-4">
                    <div className="prose prose-sm max-w-none dark:prose-invert text-xs font-mono">
                      <ReactMarkdown>{enrichmentData.markdown || "No content available."}</ReactMarkdown>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            {/* Ethical use footer for Pro users */}
            <p className="text-xs text-muted-foreground text-center pt-2">
              User-initiated retrieval • Public sources only • Evidence validation
            </p>
          </div>
        )}

        {/* Idle state hint for Pro users */}
        {!isFree && state === 'idle' && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Click "Fetch context" to retrieve public content from this page.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
