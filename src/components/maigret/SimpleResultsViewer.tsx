import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Clock, ExternalLink, Sparkles } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MaigretPDFExport } from './MaigretPDFExport';

interface MaigretResult {
  id: string;
  job_id: string;
  username: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  summary: any;
  raw: any;
  created_at: string;
  updated_at: string;
}

export function SimpleResultsViewer({ jobId }: { jobId: string }) {
  const [result, setResult] = useState<MaigretResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      const { data, error } = await supabase
        .from('maigret_results')
        .select('*')
        .eq('job_id', jobId)
        .maybeSingle();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data) {
        setResult(data as MaigretResult);
        setLoading(false);
      }
    };

    fetchResult();

    const interval = setInterval(() => {
      if (result?.status === 'completed' || result?.status === 'failed') {
        clearInterval(interval);
        return;
      }
      fetchResult();
    }, 3000);

    return () => clearInterval(interval);
  }, [jobId, result?.status]);

  if (loading && !result) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <Loader2 className="h-12 w-12 animate-spin text-primary relative" />
        </div>
        <span className="text-lg font-medium bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Loading results...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No results found for job ID: {jobId}</p>
          <p className="text-sm text-muted-foreground mt-2">
            The scan may still be queued or the job ID is invalid.
          </p>
        </CardContent>
      </Card>
    );
  }

  const StatusIcon = {
    queued: Clock,
    running: Loader2,
    completed: CheckCircle,
    failed: XCircle,
  }[result.status];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Progress Indicator for In-Progress Scans */}
      {(result.status === 'queued' || result.status === 'running') && (
        <Card className="border-primary/50 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-sm animate-scale-in">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full animate-pulse" />
                <Loader2 className="h-6 w-6 animate-spin text-primary relative" />
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Scan in progress...
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {result.status === 'queued' 
                    ? 'Waiting in queue...' 
                    : 'Checking 300+ platforms for username presence...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header Card */}
      <Card className="border-border/50 bg-gradient-to-br from-card via-card to-card/50 shadow-lg animate-scale-in">
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                Scan Results: {result.username}
              </CardTitle>
              <CardDescription className="text-sm font-mono">
                Job ID: {result.job_id}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {result.status === 'completed' && result.summary && result.summary.length > 0 && (
                <MaigretPDFExport 
                  username={result.username}
                  summary={result.summary}
                  jobId={result.job_id}
                />
              )}
              <Badge 
                variant={result.status === 'completed' ? 'default' : result.status === 'failed' ? 'destructive' : 'secondary'}
                className="text-sm px-3 py-1 shadow-sm"
              >
                <StatusIcon className={`h-4 w-4 mr-1.5 ${result.status === 'running' ? 'animate-spin' : ''}`} />
                {result.status}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Created: {new Date(result.created_at).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Updated: {new Date(result.updated_at).toLocaleString()}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Results Card */}
      {result.summary && Array.isArray(result.summary) && result.summary.length > 0 && (
        <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg overflow-hidden animate-scale-in">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b border-primary/20">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Discovered Profiles
              <Badge variant="secondary" className="ml-2">
                {result.summary.length} found
              </Badge>
            </CardTitle>
            <CardDescription>
              Found username presence across multiple platforms
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="p-6 space-y-3">
                {result.summary.map((item: any, idx: number) => {
                  const getEvidenceValue = (evidence: any[], key: string) => {
                    const found = evidence?.find((e: any) => e.key === key);
                    return found?.value;
                  };
                  
                  const site = getEvidenceValue(item.evidence, 'site');
                  const url = getEvidenceValue(item.evidence, 'url');
                  const status = getEvidenceValue(item.evidence, 'status');
                  
                  return (
                    <div 
                      key={idx} 
                      className="group p-4 rounded-lg border border-border/50 bg-gradient-to-br from-card to-card/50 hover:border-primary/50 hover:shadow-md transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                          <span className="font-semibold text-base group-hover:text-primary transition-colors">
                            {site || 'Unknown Site'}
                          </span>
                        </div>
                        {status && (
                          <Badge variant="outline" className="text-xs font-mono">
                            {status}
                          </Badge>
                        )}
                      </div>
                      {url && (
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group/link"
                        >
                          <span className="break-all line-clamp-1">{url}</span>
                          <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {result.status === 'completed' && (!result.summary || result.summary.length === 0) && (
        <Card className="border-muted bg-gradient-to-br from-muted/50 to-transparent animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-muted-foreground" />
              No Results Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The scan completed successfully but no profiles were found for this username across the checked platforms.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Raw Data Collapsible */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full hover:bg-primary/10 transition-colors">
            View Raw JSON Data
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="animate-fade-in">
          <Card className="mt-4 border-border/50">
            <CardContent className="pt-6">
              <ScrollArea className="h-96">
                <pre className="text-xs p-4 bg-muted/50 rounded-lg font-mono border border-border/50">
                  {JSON.stringify(result.raw, null, 2)}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
