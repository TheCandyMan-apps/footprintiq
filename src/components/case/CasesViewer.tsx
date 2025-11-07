import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Image, FileText, MapPin, Shield, Sparkles, ExternalLink, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface ResultItem {
  type: 'image' | 'scan' | 'removal' | 'geo';
  data: any;
  timestamp: string;
  source?: string;
}

interface CaseData {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  results?: ResultItem[];
  created_at: string;
  updated_at: string;
}

interface CasesViewerProps {
  caseId: string;
}

export function CasesViewer({ caseId }: CasesViewerProps) {
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  useEffect(() => {
    loadCase();
  }, [caseId]);

  const loadCase = async () => {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('id', caseId)
        .single();

      if (error) throw error;
      
      // Type-safe conversion of results
      const caseData = data as any;
      setCaseData({
        ...caseData,
        results: (caseData.results || []) as ResultItem[]
      });
    } catch (error) {
      console.error("Error loading case:", error);
      toast.error("Failed to load case");
    } finally {
      setIsLoading(false);
    }
  };

  const generateAISummary = async () => {
    if (!caseData?.results || caseData.results.length === 0) {
      toast.error("No results to summarize");
      return;
    }

    setIsGeneratingSummary(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-analyst', {
        body: {
          prompt: `Analyze this investigation case and identify the top threats:
          
Case: ${caseData.title}
Description: ${caseData.description}
Results: ${JSON.stringify(caseData.results, null, 2)}

Provide a concise summary of:
1. Top threats discovered
2. Risk level assessment
3. Recommended next steps`,
          model: 'openai/gpt-5-mini'
        }
      });

      if (error) throw error;
      setAiSummary(data.response || data.message || "No summary available");
      toast.success("AI summary generated");
    } catch (error) {
      console.error("AI summary error:", error);
      toast.error("Failed to generate AI summary");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'scan': return <Shield className="w-4 h-4" />;
      case 'removal': return <FileText className="w-4 h-4" />;
      case 'geo': return <MapPin className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'image': return "bg-blue-500/10 text-blue-500";
      case 'scan': return "bg-red-500/10 text-red-500";
      case 'removal': return "bg-green-500/10 text-green-500";
      case 'geo': return "bg-purple-500/10 text-purple-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const renderResultContent = (result: ResultItem) => {
    switch (result.type) {
      case 'image':
        return (
          <div className="space-y-2">
            {result.data.matches?.slice(0, 3).map((match: any, idx: number) => (
              <div key={idx} className="flex gap-3 items-start p-2 rounded-lg bg-muted/50">
                <img
                  src={match.thumbnail_url}
                  alt={`Match ${idx + 1}`}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{match.domain}</p>
                  <p className="text-xs text-muted-foreground">
                    {match.match_percent}% match
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 mt-1"
                    onClick={() => window.open(match.url, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
            {result.data.matches?.length > 3 && (
              <p className="text-xs text-muted-foreground text-center">
                +{result.data.matches.length - 3} more matches
              </p>
            )}
          </div>
        );

      case 'scan':
        return (
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium">Findings:</span> {result.data.findingCount || 0}
            </p>
            <p className="text-sm">
              <span className="font-medium">Risk Score:</span> {result.data.riskScore || 'N/A'}
            </p>
            {result.data.criticalIssues && (
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">{result.data.criticalIssues} critical issues</span>
              </div>
            )}
          </div>
        );

      case 'removal':
        return (
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium">Status:</span> {result.data.status || 'Pending'}
            </p>
            <p className="text-sm">
              <span className="font-medium">Target:</span> {result.data.target || 'N/A'}
            </p>
            {result.data.completedAt && (
              <p className="text-xs text-muted-foreground">
                Completed {format(new Date(result.data.completedAt), 'PPp')}
              </p>
            )}
          </div>
        );

      case 'geo':
        return (
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium">Location:</span> {result.data.location || 'Unknown'}
            </p>
            <p className="text-sm">
              <span className="font-medium">IP:</span> {result.data.ip || 'N/A'}
            </p>
            {result.data.coordinates && (
              <p className="text-xs text-muted-foreground">
                {result.data.coordinates.lat}, {result.data.coordinates.lng}
              </p>
            )}
          </div>
        );

      default:
        return <p className="text-sm text-muted-foreground">No preview available</p>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Loading case...</p>
        </CardContent>
      </Card>
    );
  }

  if (!caseData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Case not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Case Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{caseData.title}</CardTitle>
              <CardDescription>{caseData.description}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant={caseData.priority === 'critical' ? 'destructive' : 'secondary'}>
                {caseData.priority}
              </Badge>
              <Badge variant="outline">{caseData.status}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Created {format(new Date(caseData.created_at), 'PPp')}
            </div>
            <Button
              onClick={generateAISummary}
              disabled={isGeneratingSummary || !caseData.results || caseData.results.length === 0}
              size="sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isGeneratingSummary ? 'Generating...' : 'AI Summary'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Summary */}
      {aiSummary && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Threat Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{aiSummary}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Investigation Timeline</CardTitle>
          <CardDescription>
            {caseData.results?.length || 0} results collected
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!caseData.results || caseData.results.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No results yet. Add findings to this case to see them here.
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {caseData.results.map((result, idx) => (
                  <div key={idx} className="relative pl-8 pb-4">
                    {/* Timeline Line */}
                    {idx < caseData.results!.length - 1 && (
                      <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
                    )}

                    {/* Timeline Dot */}
                    <div className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center ${getTypeColor(result.type)}`}>
                      {getTypeIcon(result.type)}
                    </div>

                    {/* Result Card */}
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">
                              {result.type}
                            </Badge>
                            {result.source && (
                              <span className="text-xs text-muted-foreground">
                                via {result.source}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(result.timestamp), 'PPp')}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {renderResultContent(result)}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
