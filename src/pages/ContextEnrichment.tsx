import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Globe, 
  Clock, 
  Loader2, 
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Lock,
  Sparkles,
  ExternalLink,
  Copy,
  FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTierGating } from "@/hooks/useTierGating";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";

interface EnrichmentData {
  success: boolean;
  sourceUrl: string;
  fetchedAt: string;
  title: string;
  description: string;
  markdown: string;
  html: string;
  metadata: Record<string, unknown>;
}

type PageState = 'idle' | 'loading' | 'success' | 'error';

export default function ContextEnrichment() {
  const { isFree, isLoading: tierLoading } = useTierGating();
  const [url, setUrl] = useState("");
  const [state, setState] = useState<PageState>('idle');
  const [enrichmentData, setEnrichmentData] = useState<EnrichmentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'raw'>('summary');
  const { toast } = useToast();

  const handleEnrich = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isFree) return;
    
    setState('loading');
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('firecrawl-enrich', {
        body: { url: url.trim() },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to retrieve context');
      }

      setEnrichmentData(data);
      setState('success');
      
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

  const generateSummary = (markdown: string): string => {
    if (!markdown) return "No content available.";
    
    const cleanText = markdown
      .replace(/#{1,6}\s/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_`]/g, '')
      .replace(/\n+/g, ' ')
      .trim();
    
    const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
    return sentences.slice(0, 5).join(' ').trim() || cleanText.slice(0, 500) + '...';
  };

  const handleCopy = async () => {
    if (!enrichmentData?.markdown) return;
    await navigator.clipboard.writeText(enrichmentData.markdown);
    toast({ title: "Copied", description: "Content copied to clipboard" });
  };

  const handleReset = () => {
    setUrl("");
    setState('idle');
    setEnrichmentData(null);
    setError(null);
  };

  return (
    <>
      <Helmet>
        <title>Context Enrichment | FootprintIQ</title>
        <meta name="description" content="Fetch and analyze public web content for OSINT investigations. Validate findings and reduce false positives with context enrichment." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main id="main-content" className="flex-1 py-8 px-4 md:px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Page Header */}
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Globe className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">Context Enrichment</h1>
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Fetch public web content from any URL to support your OSINT investigations. 
                Use this to validate findings, gather context, and reduce false positives.
              </p>
              {!isFree && (
                <Badge variant="secondary" className="mt-2">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Pro Feature
                </Badge>
              )}
            </div>

            {/* URL Input Card */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  Fetch URL Content
                </CardTitle>
                <CardDescription>
                  Enter any public URL to extract its content for analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleEnrich} className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="url"
                    placeholder="https://example.com/profile"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 bg-muted/30"
                    disabled={state === 'loading' || isFree}
                  />
                  {!isFree ? (
                    <Button 
                      type="submit" 
                      disabled={state === 'loading' || !url.trim() || tierLoading}
                      className="min-w-[140px]"
                    >
                      {state === 'loading' ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Fetching…
                        </>
                      ) : (
                        <>
                          <Globe className="h-4 w-4 mr-2" />
                          Fetch Content
                        </>
                      )}
                    </Button>
                  ) : (
                    <Badge variant="secondary" className="h-10 px-4 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Pro Feature
                    </Badge>
                  )}
                </form>

                {/* Pro upgrade prompt for free users */}
                {isFree && (
                  <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-3">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-2">
                        <p className="text-sm font-medium text-foreground">
                          Unlock Context Enrichment with Pro
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                            Fetch content from any public URL
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                            Validate findings and reduce false positives
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                            Extract structured summaries for analysis
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

                {/* Usage note for Pro users */}
                {!isFree && state === 'idle' && (
                  <p className="text-xs text-muted-foreground">
                    User-initiated only • Counts toward usage • No automated scraping
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Error State */}
            {state === 'error' && error && (
              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Couldn't fetch that page</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        This site may block automated access, require login, or be temporarily unavailable.
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm" onClick={handleEnrich}>
                          Try again
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => window.open(url, '_blank')}>
                          <ExternalLink className="h-3.5 w-3.5 mr-1" />
                          Open URL
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleReset}>
                          Clear
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Success State - Results */}
            {state === 'success' && enrichmentData && (
              <Card className="border-border bg-card">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">{enrichmentData.title || 'Untitled Page'}</CardTitle>
                      {enrichmentData.description && (
                        <CardDescription>{enrichmentData.description}</CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={handleCopy}>
                        <Copy className="h-3.5 w-3.5 mr-1.5" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => window.open(enrichmentData.sourceUrl, '_blank')}>
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                        Open
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleEnrich}>
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Provenance Info */}
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

                  {/* Source URL */}
                  <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg border border-border">
                    <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-muted-foreground truncate flex-1">
                      {enrichmentData.sourceUrl}
                    </span>
                  </div>

                  {/* Content Tabs */}
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'summary' | 'raw')}>
                    <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                      <TabsTrigger value="summary">Summary</TabsTrigger>
                      <TabsTrigger value="raw">Raw Content</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="summary" className="mt-3">
                      <ScrollArea className="h-64 rounded-lg border border-border bg-background">
                        <div className="p-4">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {generateSummary(enrichmentData.markdown)}
                          </p>
                        </div>
                      </ScrollArea>
                    </TabsContent>
                    
                    <TabsContent value="raw" className="mt-3">
                      <ScrollArea className="h-64 rounded-lg border border-border bg-muted/20">
                        <div className="p-4">
                          <div className="prose prose-sm max-w-none dark:prose-invert text-sm">
                            <ReactMarkdown>{enrichmentData.markdown || "No content available."}</ReactMarkdown>
                          </div>
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-2">
                    <Button variant="outline" size="sm" onClick={handleReset}>
                      Enrich Another URL
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      User-initiated • Public sources only
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ethical Use Notice */}
            <Card className="border-border bg-muted/20">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Ethical Use Policy</p>
                    <p className="text-xs text-muted-foreground">
                      This tool fetches publicly accessible content only. It does not bypass paywalls, 
                      authentication, or access private data. Use responsibly for legitimate OSINT 
                      investigations, evidence validation, and security research.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}

// Shield icon used in ethical use notice
function Shield(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  );
}
