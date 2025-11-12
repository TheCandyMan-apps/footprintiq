import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

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
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading results...</span>
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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Scan Results: {result.username}</CardTitle>
              <CardDescription>Job ID: {result.job_id}</CardDescription>
            </div>
            <Badge variant={result.status === 'completed' ? 'default' : result.status === 'failed' ? 'destructive' : 'secondary'}>
              <StatusIcon className={`h-4 w-4 mr-1 ${result.status === 'running' ? 'animate-spin' : ''}`} />
              {result.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Created:</strong> {new Date(result.created_at).toLocaleString()}
            </div>
            <div>
              <strong>Updated:</strong> {new Date(result.updated_at).toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {result.summary && Array.isArray(result.summary) && result.summary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Summary ({result.summary.length} results)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {result.summary.map((item: any, idx: number) => {
                const getEvidenceValue = (evidence: any[], key: string) => {
                  const found = evidence?.find((e: any) => e.key === key);
                  return found?.value;
                };
                
                const site = getEvidenceValue(item.evidence, 'site');
                const url = getEvidenceValue(item.evidence, 'url');
                const status = getEvidenceValue(item.evidence, 'status');
                
                return (
                  <div key={idx} className="border-b pb-2 last:border-0">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{site || 'Unknown Site'}</div>
                      {status && (
                        <Badge variant="outline" className="text-xs">
                          {status}
                        </Badge>
                      )}
                    </div>
                    {url && (
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline break-all"
                      >
                        {url}
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {result.status === 'completed' && (!result.summary || result.summary.length === 0) && (
        <Card>
          <CardHeader>
            <CardTitle>No Results Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The scan completed but no profiles were found for this username.
            </p>
          </CardContent>
        </Card>
      )}

      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full">
            View Raw JSON
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-2">
            <CardContent className="pt-6">
              <pre className="text-xs overflow-auto max-h-96 p-4 bg-muted rounded">
                {JSON.stringify(result.raw, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
