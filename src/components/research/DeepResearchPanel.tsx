import { useState } from "react";
import { Search, Globe, Loader2, ExternalLink, ChevronDown, ChevronUp, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { toast } from "sonner";

interface ResearchResult {
  query: string;
  content: string;
  citations: string[];
}

interface ResearchResponse {
  target: string;
  type: string;
  depth: string;
  results: ResearchResult[];
  totalCitations: number;
  creditsUsed: number;
}

const RESEARCH_TYPES = [
  { value: 'username', label: 'Username', description: 'Search for username presence across platforms' },
  { value: 'email', label: 'Email', description: 'Search for email in breaches and registrations' },
  { value: 'phone', label: 'Phone', description: 'Search for phone number exposure' },
  { value: 'domain', label: 'Domain', description: 'Research domain and organization' },
  { value: 'person', label: 'Person', description: 'Research a person by name' },
];

const DEPTH_OPTIONS = [
  { value: 'quick', label: 'Quick', credits: 3, description: 'Fast overview with 2 queries' },
  { value: 'standard', label: 'Standard', credits: 5, description: 'Balanced research with 4 queries' },
  { value: 'deep', label: 'Deep', credits: 10, description: 'Comprehensive analysis with 8 queries' },
];

export function DeepResearchPanel() {
  const { workspace } = useWorkspace();
  const [target, setTarget] = useState('');
  const [type, setType] = useState('username');
  const [depth, setDepth] = useState('standard');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ResearchResponse | null>(null);
  const [expandedResults, setExpandedResults] = useState<Record<number, boolean>>({});

  const selectedDepth = DEPTH_OPTIONS.find(d => d.value === depth);

  const handleResearch = async () => {
    if (!target.trim()) {
      toast.error('Please enter a target to research');
      return;
    }

    if (!workspace?.id) {
      toast.error('No workspace selected');
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('perplexity-research', {
        body: {
          target: target.trim(),
          type,
          depth,
          workspaceId: workspace.id,
        }
      });

      if (error) throw error;

      if (data.error) {
        if (data.error === 'insufficient_credits') {
          toast.error(`Insufficient credits. Need ${selectedDepth?.credits} credits, have ${data.balance}`);
        } else {
          toast.error(`Research failed: ${data.error}`);
        }
        return;
      }

      setResults(data);
      toast.success(`Research complete! (${data.creditsUsed} credits used)`);
    } catch (error: any) {
      console.error('Research error:', error);
      toast.error('Failed to perform research');
    } finally {
      setIsLoading(false);
    }
  };

  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const toggleResult = (index: number) => {
    setExpandedResults(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Research Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Deep Research
          </CardTitle>
          <CardDescription>
            AI-powered research with real-time web intelligence from Perplexity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="target">Target</Label>
              <Input
                id="target"
                placeholder="Enter username, email, phone, or name..."
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Research Type</Label>
              <Select value={type} onValueChange={setType} disabled={isLoading}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESEARCH_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <div className="flex flex-col">
                        <span>{t.label}</span>
                        <span className="text-xs text-muted-foreground">{t.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Research Depth</Label>
            <div className="grid grid-cols-3 gap-3">
              {DEPTH_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDepth(option.value)}
                  disabled={isLoading}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    depth === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{option.label}</span>
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Coins className="h-3 w-3" />
                      {option.credits}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleResearch}
            disabled={!target.trim() || isLoading}
            className="w-full gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Researching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Start Research ({selectedDepth?.credits} credits)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Research Results</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {results.totalCitations} sources
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Coins className="h-3 w-3" />
                  {results.creditsUsed} credits
                </Badge>
              </div>
            </div>
            <CardDescription>
              {results.depth} research on "{results.target}" ({results.type})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {results.results.map((result, index) => (
                  <Collapsible
                    key={index}
                    open={expandedResults[index] !== false}
                    onOpenChange={() => toggleResult(index)}
                  >
                    <Card className="border-muted">
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-2 text-left">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{result.query}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {result.citations.length} sources
                            </Badge>
                            {expandedResults[index] !== false ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="px-4 pb-4 space-y-3">
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {result.content}
                          </p>
                          
                          {result.citations.length > 0 && (
                            <div className="pt-2 border-t">
                              <p className="text-xs font-medium text-muted-foreground mb-2">Sources:</p>
                              <div className="flex flex-wrap gap-1">
                                {result.citations.slice(0, 6).map((url, cidx) => (
                                  <a
                                    key={cidx}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded transition-colors"
                                  >
                                    <img 
                                      src={`https://www.google.com/s2/favicons?domain=${extractDomain(url)}&sz=16`}
                                      alt=""
                                      className="w-3 h-3"
                                    />
                                    <span className="truncate max-w-[100px]">{extractDomain(url)}</span>
                                    <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                                  </a>
                                ))}
                                {result.citations.length > 6 && (
                                  <span className="text-xs text-muted-foreground px-2 py-1">
                                    +{result.citations.length - 6} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}