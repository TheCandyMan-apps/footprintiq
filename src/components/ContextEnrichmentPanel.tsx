import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ExternalLink, 
  FileText, 
  Clock, 
  Loader2, 
  AlertCircle,
  Eye,
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

export function ContextEnrichmentPanel({ url, onEnrichmentComplete }: ContextEnrichmentPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [enrichmentData, setEnrichmentData] = useState<EnrichmentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRawContent, setShowRawContent] = useState(false);
  const { toast } = useToast();

  const handleEnrich = async () => {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please provide a URL to retrieve context from.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
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
      onEnrichmentComplete?.(data);
      
      toast({
        title: "Context Retrieved",
        description: "Public content has been retrieved for review.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to retrieve context';
      setError(errorMessage);
      toast({
        title: "Retrieval Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-500" />
            <CardTitle className="text-base font-medium text-slate-900">
              Contextual Enrichment
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-xs font-normal text-slate-500 border-slate-200">
            User-Initiated
          </Badge>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Retrieve publicly available content to support interpretation
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Source URL Display */}
        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <ExternalLink className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <span className="text-sm text-slate-600 truncate flex-1">{url}</span>
        </div>

        {/* Fetch Button */}
        {!enrichmentData && !error && (
          <Button 
            onClick={handleEnrich} 
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Retrieving Public Content...
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Retrieve Context
              </>
            )}
          </Button>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Unable to retrieve content</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleEnrich}
                className="mt-3"
                disabled={isLoading}
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Enrichment Results */}
        {enrichmentData && (
          <div className="space-y-4">
            {/* Fetch Indicator */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Fetched on demand</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-green-600">
                <Clock className="h-3.5 w-3.5" />
                {formatDate(enrichmentData.fetchedAt)}
              </div>
            </div>

            {/* Page Title & Description */}
            {enrichmentData.title && (
              <div className="space-y-1">
                <h4 className="font-medium text-slate-900">{enrichmentData.title}</h4>
                {enrichmentData.description && (
                  <p className="text-sm text-slate-500">{enrichmentData.description}</p>
                )}
              </div>
            )}

            {/* View Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="content-view"
                  checked={showRawContent}
                  onCheckedChange={setShowRawContent}
                />
                <Label htmlFor="content-view" className="text-sm text-slate-600">
                  {showRawContent ? "Raw Content" : "Summary View"}
                </Label>
              </div>
            </div>

            {/* Content Display */}
            <ScrollArea className="h-64 rounded-lg border border-slate-200 bg-white">
              <div className="p-4">
                {showRawContent ? (
                  <div className="prose prose-sm max-w-none prose-slate">
                    <ReactMarkdown>{enrichmentData.markdown || "No content available."}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-sm text-slate-600 leading-relaxed">
                    <p className="font-medium text-slate-700 mb-2">Content Summary</p>
                    <p>{generateSummary(enrichmentData.markdown)}</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Disclaimer */}
            <p className="text-xs text-slate-400 text-center">
              This content was retrieved from a publicly accessible source at the user's request.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
