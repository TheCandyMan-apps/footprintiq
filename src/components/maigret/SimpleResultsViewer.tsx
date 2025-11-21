import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Clock, ExternalLink, Sparkles, Info, AlertTriangle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MaigretPDFExport } from './MaigretPDFExport';
import { detectScanPipeline } from '@/utils/scanPipeline';

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

interface SherlockFinding {
  id: string;
  scan_id: string;
  provider: string;
  kind: string;
  severity: string;
  confidence: number;
  evidence: any; // Json type from database
  observed_at: string;
  workspace_id: string;
  meta: any;
  created_at: string;
}

interface SimpleResultsViewerProps {
  jobId: string;
  searchQuery?: string;
  selectedProviders?: string[];
  onProvidersDetected?: (providers: string[], stats: Record<string, number>) => void;
}

export function SimpleResultsViewer({ 
  jobId, 
  searchQuery = '', 
  selectedProviders = [],
  onProvidersDetected 
}: SimpleResultsViewerProps) {
  const [result, setResult] = useState<MaigretResult | null>(null);
  const [scanData, setScanData] = useState<{ status: string } | null>(null);
  const [sherlockFindings, setSherlockFindings] = useState<SherlockFinding[]>([]);
  const [sherlockLoading, setSherlockLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [pipeline, setPipeline] = useState<'simple' | 'advanced' | null>(null);
  
  // Provider status tracking
  const [maigretStatus, setMaigretStatus] = useState<'has_results' | 'empty_results' | 'error' | 'not_run'>('not_run');
  const [sherlockStatus, setSherlockStatus] = useState<'has_results' | 'empty_results' | 'error' | 'not_run'>('not_run');
  const [gosearchStatus, setGosearchStatus] = useState<'has_results' | 'empty_results' | 'error' | 'not_run'>('not_run');

  // Update provider stats when Sherlock findings load
  useEffect(() => {
    if (!sherlockLoading && result && onProvidersDetected) {
      const providerCounts: Record<string, number> = {};
      const providerSet = new Set<string>();
      
      // Add Maigret results
      providerSet.add('maigret');
      if (result.summary && Array.isArray(result.summary)) {
        result.summary.forEach((item: any) => {
          const provider = item.provider || 'maigret';
          providerCounts[provider] = (providerCounts[provider] || 0) + 1;
        });
      }
      
      // Add Sherlock results (exclude provider errors)
      const actualSherlockFindings = sherlockFindings.filter(f => f.kind !== 'provider_error');
      if (actualSherlockFindings.length > 0) {
        providerSet.add('sherlock');
        providerCounts['sherlock'] = actualSherlockFindings.length;
      }
      
      onProvidersDetected(Array.from(providerSet), providerCounts);
    }
  }, [sherlockLoading, sherlockFindings.length, result, onProvidersDetected]);

  // Fetch Sherlock findings from the findings table
  useEffect(() => {
    if (!result?.username) return;

    const fetchSherlockFindings = async () => {
      try {
        // First, try to find the scan_id from the scans table using username
        const { data: scan } = await supabase
          .from('scans')
          .select('id')
          .eq('username', result.username)
          .eq('scan_type', 'username')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (scan) {
          // Load Sherlock and GoSearch findings from findings table
          const { data: findings, error } = await supabase
            .from('findings')
            .select('*')
            .eq('scan_id', scan.id)
            .in('provider', ['sherlock', 'gosearch']);

          if (error) {
            console.warn('[Sherlock/GoSearch] Error loading findings:', error);
          } else if (findings) {
            setSherlockFindings(findings as SherlockFinding[]);
            
            // Detect Sherlock status
            const sherlockFindingsData = findings.filter(f => f.provider === 'sherlock');
            if (sherlockFindingsData.some((f: any) => f.kind === 'provider.empty_results')) {
              setSherlockStatus('empty_results');
            } else if (sherlockFindingsData.some((f: any) => f.kind === 'provider_error')) {
              setSherlockStatus('error');
            } else if (sherlockFindingsData.filter((f: any) => f.kind === 'presence.hit').length > 0) {
              setSherlockStatus('has_results');
            }
            
            // Detect GoSearch status
            const gosearchFindingsData = findings.filter(f => f.provider === 'gosearch');
            if (gosearchFindingsData.some((f: any) => f.kind === 'provider.empty_results')) {
              setGosearchStatus('empty_results');
            } else if (gosearchFindingsData.some((f: any) => f.kind === 'provider_error')) {
              setGosearchStatus('error');
            } else if (gosearchFindingsData.filter((f: any) => f.kind === 'presence.hit').length > 0) {
              setGosearchStatus('has_results');
            }
            
            // Debug: Log provider errors if any
            const providerErrors = findings.filter((f: any) => f.kind === 'provider_error');
            if (providerErrors.length > 0) {
              console.log('[Providers] Provider errors detected:', providerErrors.length, 'out of', findings.length, 'total findings');
            }
          }
        }
      } catch (err) {
        console.warn('[Sherlock] Failed to load findings:', err);
      } finally {
        setSherlockLoading(false);
      }
    };

    fetchSherlockFindings();
  }, [result?.username]);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        // Step 1: Detect which pipeline was used for this scan
        const detectedPipeline = await detectScanPipeline(jobId);
        console.log(`[SimpleResultsViewer] Detected pipeline for ${jobId}:`, detectedPipeline);
        setPipeline(detectedPipeline);

        if (detectedPipeline === 'advanced') {
          // Advanced pipeline: Query findings table
          const { data: scan, error: scanError } = await supabase
            .from('scans')
            .select('*')
            .eq('id', jobId)
            .maybeSingle();

          if (scanError) {
            setError(scanError.message);
            setLoading(false);
            return;
          }

          if (scan) {
            setScanData(scan);

            // Get Maigret findings from findings table
            const { data: findings, error: findingsError } = await supabase
              .from('findings')
              .select('*')
              .eq('scan_id', jobId)
              .eq('provider', 'maigret');

            if (findingsError) {
              console.error('[SimpleResultsViewer] Error loading findings:', findingsError);
            }

            // Transform findings into MaigretResult format
            const transformedResult: MaigretResult = {
              id: jobId,
              job_id: jobId,
              username: scan.username || '',
              status: scan.status === 'completed' ? 'completed' : scan.status === 'error' ? 'failed' : scan.status as any,
              summary: findings
                ?.filter((f: any) => f.provider === 'maigret' && f.kind === 'profile_presence')
                .map((f: any) => {
                  // Extract fields from evidence array (each evidence is {key, value})
                  const siteEvidence = Array.isArray(f.evidence) ? f.evidence.find((e: any) => e.key === 'site') : null;
                  const urlEvidence = Array.isArray(f.evidence) ? f.evidence.find((e: any) => e.key === 'url') : null;
                  const confidenceEvidence = Array.isArray(f.evidence) ? f.evidence.find((e: any) => e.key === 'confidence') : null;
                  
                  return {
                    site: siteEvidence?.value || f.meta?.site || 'Unknown Site',
                    url: urlEvidence?.value || f.meta?.url,
                    status: 'found',
                    provider: f.provider,
                    confidence: confidenceEvidence?.value || f.confidence || f.meta?.confidence
                  };
                }) || [],
              raw: findings || [],
              created_at: scan.created_at,
              updated_at: scan.completed_at || scan.created_at
            };

            setResult(transformedResult);
            setLoading(false);
            
            // Detect provider statuses
            if (findings) {
              // Detect Maigret status
              const maigretFindings = findings.filter((f: any) => f.provider === 'maigret');
              if (maigretFindings.some((f: any) => f.kind === 'provider.empty_results')) {
                setMaigretStatus('empty_results');
              } else if (maigretFindings.some((f: any) => f.kind === 'provider_error')) {
                setMaigretStatus('error');
              } else if (maigretFindings.length > 0) {
                setMaigretStatus('has_results');
              }
            }

            // Detect providers and calculate stats
            if (findings && findings.length > 0 && onProvidersDetected) {
              const providerCounts: Record<string, number> = {};
              const providerSet = new Set<string>();
              
              providerSet.add('maigret');
              findings.forEach((f: any) => {
                const provider = f.provider || 'maigret';
                providerCounts[provider] = (providerCounts[provider] || 0) + 1;
              });
              
              onProvidersDetected(Array.from(providerSet), providerCounts);
            }
          } else {
            setLoading(false);
          }
        } else {
          // Simple pipeline: Query maigret_results table
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
            
            // Detect providers and calculate stats
            if (data.summary && Array.isArray(data.summary) && onProvidersDetected) {
              const providerCounts: Record<string, number> = {};
              const providerSet = new Set<string>();
              
              providerSet.add('maigret');
              data.summary.forEach((item: any) => {
                const provider = item.provider || 'maigret';
                providerCounts[provider] = (providerCounts[provider] || 0) + 1;
              });
              
              onProvidersDetected(Array.from(providerSet), providerCounts);
            }
          }

          // Fetch scan status from scans table
          const { data: scan, error: scanError } = await supabase
            .from('scans')
            .select('status')
            .eq('id', jobId)
            .maybeSingle();

          if (!scanError && scan) {
            setScanData(scan);
          }
        }
      } catch (err) {
        console.error('[SimpleResultsViewer] Error fetching results:', err);
        setError(err instanceof Error ? err.message : 'Failed to load results');
        setLoading(false);
      }
    };

    fetchResult();

    const interval = setInterval(() => {
      // Stop polling after final status or timeout (20 polls = 60 seconds)
      if (result?.status === 'completed' || result?.status === 'failed' || pollCount >= 20) {
        clearInterval(interval);
        if (pollCount >= 20 && !result) {
          setTimedOut(true);
          setLoading(false);
        }
        return;
      }
      setPollCount(prev => prev + 1);
      fetchResult();
    }, 3000);

    return () => clearInterval(interval);
  }, [jobId, result?.status, pollCount]);

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
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Error Loading Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (timedOut && !result) {
    return (
      <Card className="border-yellow-500/50 bg-yellow-50/5">
        <CardHeader>
          <CardTitle className="text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Scan Timeout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The scan is taking longer than expected. This could mean:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
            <li>The scan is still processing in the background</li>
            <li>The worker may be experiencing high load</li>
            <li>The username may not exist on any platforms</li>
          </ul>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Check Again
            </Button>
            <Button variant="ghost" onClick={() => window.history.back()}>
              Back to Scanner
            </Button>
          </div>
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
        <CardContent className="space-y-4">
          <p>No results found for job ID: {jobId}</p>
          <p className="text-sm text-muted-foreground mt-2">
            The scan may still be queued or the job ID is invalid.
          </p>
          <Button variant="outline" onClick={() => window.history.back()}>
            Back to Scanner
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Handle failed scans - prioritize scan status over maigret_results status
  const isScanFailed = scanData?.status === 'error' || (scanData?.status !== 'completed' && result.status === 'failed');
  
  if (isScanFailed) {
    const errorMessage = result.raw?.error || 'Scan failed due to an unknown error';
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Scan Failed
          </CardTitle>
          <CardDescription>Job ID: {result.job_id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm font-mono text-destructive">{errorMessage}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Username: <span className="font-medium">{result.username}</span>
          </p>
          <div className="flex gap-2">
            <Button 
              variant="default" 
              onClick={() => window.history.back()}
            >
              Try Again
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </div>
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

  const badgeVariant = (() => {
    const status = result.status as 'queued' | 'running' | 'completed' | 'failed';
    if (status === 'completed') return 'default';
    if (status === 'failed') return 'destructive';
    return 'secondary';
  })();

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
                variant={badgeVariant}
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

      {/* Provider Breakdown */}
      {result.status === 'completed' && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">Results by provider:</span>
          
          {/* Maigret Badge */}
          <Badge 
            variant={maigretStatus === 'error' ? 'destructive' : 'outline'} 
            className={`gap-1.5 ${maigretStatus === 'empty_results' ? 'border-blue-500/50 bg-blue-500/5' : ''}`}
          >
            <span className="font-semibold">Maigret</span>
            <span className="text-muted-foreground">{result.summary?.length || 0}</span>
            {maigretStatus === 'error' && <AlertTriangle className="w-3 h-3 ml-1" />}
            {maigretStatus === 'empty_results' && <Info className="w-3 h-3 ml-1 text-blue-500" />}
          </Badge>
          
          {/* Sherlock Badge */}
          <Badge 
            variant={sherlockStatus === 'error' ? 'destructive' : 'outline'} 
            className={`gap-1.5 ${sherlockStatus === 'empty_results' ? 'border-blue-500/50 bg-blue-500/5' : ''}`}
          >
            <span className="font-semibold">Sherlock</span>
            <span className="text-muted-foreground">
              {sherlockLoading ? '...' : sherlockFindings.filter(f => f.kind === 'presence.hit' && f.provider === 'sherlock').length}
            </span>
            {sherlockStatus === 'error' && <AlertTriangle className="w-3 h-3 ml-1" />}
            {sherlockStatus === 'empty_results' && <Info className="w-3 h-3 ml-1 text-blue-500" />}
          </Badge>
          
          {/* GoSearch Badge (if used) */}
          {gosearchStatus !== 'not_run' && (
            <Badge 
              variant={gosearchStatus === 'error' ? 'destructive' : 'outline'} 
              className={`gap-1.5 ${gosearchStatus === 'empty_results' ? 'border-blue-500/50 bg-blue-500/5' : ''}`}
            >
              <span className="font-semibold">GoSearch</span>
              <span className="text-muted-foreground">
                {sherlockLoading ? '...' : sherlockFindings.filter(f => f.kind === 'presence.hit' && f.provider === 'gosearch').length}
              </span>
              {gosearchStatus === 'error' && <AlertTriangle className="w-3 h-3 ml-1" />}
              {gosearchStatus === 'empty_results' && <Info className="w-3 h-3 ml-1 text-blue-500" />}
            </Badge>
          )}
        </div>
      )}

      {/* Maigret Empty Results Info Card */}
      {result.status === 'completed' && maigretStatus === 'empty_results' && (
        <Card className="border-blue-500/20 bg-gradient-to-br from-card via-card to-blue-500/5 shadow-lg animate-scale-in">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-transparent border-b border-blue-500/20">
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Maigret - No Matches Found
              <Badge variant="secondary" className="ml-2">0 results</Badge>
            </CardTitle>
            <CardDescription>
              Maigret completed successfully but didn't find this username on checked platforms
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  Maigret searched across 300+ platforms but couldn't confirm any matching profiles for this username.
                </p>
                <p className="text-muted-foreground">This could mean:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground">
                  <li>The username doesn't exist on major platforms checked by Maigret</li>
                  <li>The username uses different variations or spelling</li>
                  <li>Privacy settings prevent profile detection</li>
                  <li>Some platforms may require manual verification</li>
                </ul>
                <div className="pt-2 mt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground/75">
                    💡 Tip: Check Sherlock and GoSearch results below for potential matches on different platforms.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Maigret Provider Error Card */}
      {result.status === 'completed' && maigretStatus === 'error' && (
        <Card className="border-yellow-500/50 bg-gradient-to-br from-card via-card to-yellow-500/5 shadow-lg animate-scale-in">
          <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-transparent border-b border-yellow-500/20">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Maigret Scan Issue
              <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-700">Issue Detected</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  Maigret encountered an issue while scanning for this username. This is usually temporary.
                </p>
                <p className="font-medium text-foreground">What you can do:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground">
                  <li>Try running the scan again in a few minutes</li>
                  <li>Check if the username contains special characters</li>
                  <li>Review Sherlock and GoSearch results for alternative findings</li>
                </ul>
                <div className="pt-3 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                    Retry Scan
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sherlock Empty Results Info Card */}
      {result.status === 'completed' && sherlockStatus === 'empty_results' && (
        <Card className="border-blue-500/20 bg-gradient-to-br from-card via-card to-blue-500/5 shadow-lg animate-scale-in">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-transparent border-b border-blue-500/20">
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Sherlock - No Matches Found
              <Badge variant="secondary" className="ml-2">0 results</Badge>
            </CardTitle>
            <CardDescription>
              Sherlock completed successfully but didn't find this username on checked platforms
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  Sherlock searched across 400+ social networks but couldn't confirm any matching profiles.
                </p>
                <p className="text-muted-foreground">This could mean:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground">
                  <li>The username is not registered on popular social platforms</li>
                  <li>Profile privacy settings prevent detection</li>
                  <li>The username uses different formatting or special characters</li>
                </ul>
                <div className="pt-2 mt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground/75">
                    💡 Tip: Check other provider results (Maigret, GoSearch) for potential matches.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sherlock Provider Error Card */}
      {result.status === 'completed' && sherlockStatus === 'error' && (
        <Card className="border-yellow-500/50 bg-gradient-to-br from-card via-card to-yellow-500/5 shadow-lg animate-scale-in">
          <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-transparent border-b border-yellow-500/20">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Sherlock Scan Issue
              <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-700">Issue Detected</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  Sherlock encountered an issue while scanning. This is usually temporary.
                </p>
                <p className="font-medium text-foreground">What you can do:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground">
                  <li>Try running the scan again in a few minutes</li>
                  <li>Check other provider results (Maigret, GoSearch)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* GoSearch Empty Results Info Card */}
      {result.status === 'completed' && gosearchStatus === 'empty_results' && (
        <Card className="border-blue-500/20 bg-gradient-to-br from-card via-card to-blue-500/5 shadow-lg animate-scale-in">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-transparent border-b border-blue-500/20">
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              GoSearch - No Matches Found
              <Badge variant="secondary" className="ml-2">0 results</Badge>
            </CardTitle>
            <CardDescription>
              GoSearch completed successfully but didn't find this username
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  GoSearch checked its database but didn't find any matches for this username.
                </p>
                <div className="pt-2 mt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground/75">
                    💡 This provider focuses on specific platforms and may have different coverage than Maigret or Sherlock.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* GoSearch Timeout/Error Card */}
      {result.status === 'completed' && gosearchStatus === 'error' && (
        <Card className="border-orange-500/50 bg-gradient-to-br from-card via-card to-orange-500/5 shadow-lg animate-scale-in">
          <CardHeader className="bg-gradient-to-r from-orange-500/10 to-transparent border-b border-orange-500/20">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              GoSearch Timeout
              <Badge variant="outline" className="ml-2 bg-orange-100 text-orange-700">Scan Incomplete</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  GoSearch exceeded the time limit while performing a deep search across 300+ platforms.
                </p>
                <p className="font-medium text-foreground">Why this happens:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground">
                  <li>GoSearch performs comprehensive searches that can take 1-2 minutes</li>
                  <li>High server load or rate limiting can slow down requests</li>
                  <li>Popular usernames trigger more verification steps</li>
                </ul>
                <p className="font-medium text-foreground mt-3">What to do:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground">
                  <li>Try running the scan again - it may complete faster</li>
                  <li>Check Maigret and Sherlock results for coverage</li>
                  <li>Consider using advanced filters to narrow the search</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Maigret Results Card */}
      {result.summary && Array.isArray(result.summary) && result.summary.length > 0 && (
        <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg overflow-hidden animate-scale-in">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b border-primary/20">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Maigret Results
              <Badge variant="secondary" className="ml-2">
                {result.summary.length} found
              </Badge>
            </CardTitle>
            <CardDescription>
              Found username presence across multiple platforms via Maigret
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="p-6 space-y-3">
                {result.summary
                  .filter((item: any) => {
                    // Use direct properties from transformed data
                    const site = item.site;
                    const url = item.url;
                    const provider = item.provider || 'maigret';
                    
                    // Filter by search query
                    if (searchQuery) {
                      const searchLower = searchQuery.toLowerCase();
                      const matchesSite = site ? site.toLowerCase().includes(searchLower) : false;
                      const matchesUrl = url ? url.toLowerCase().includes(searchLower) : false;
                      if (!matchesSite && !matchesUrl) return false;
                    }
                    
                    // Filter by selected providers
                    if (selectedProviders.length > 0 && !selectedProviders.includes(provider)) {
                      return false;
                    }
                    
                    return true;
                  })
                  .map((item: any, idx: number) => {
                  // Use direct properties from transformed data
                  const site = item.site;
                  const url = item.url;
                  const status = item.status;
                  const provider = item.provider || 'maigret';
                  
                  // Provider badge colors
                  const providerColors = {
                    maigret: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
                    sherlock: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
                    whatsmyname: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
                    gosearch: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
                  };
                  
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
                          {provider && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${providerColors[provider as keyof typeof providerColors] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'}`}
                            >
                              {provider}
                            </Badge>
                          )}
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

      {/* Sherlock (WhatsMyName) Results Card */}
      {result.status === 'completed' && !sherlockLoading && (
        <Card className="border-purple-500/20 bg-gradient-to-br from-card via-card to-purple-500/5 shadow-lg overflow-hidden animate-scale-in">
          <CardHeader className="bg-gradient-to-r from-purple-500/10 to-transparent border-b border-purple-500/20">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Sherlock (WhatsMyName) Results
              <Badge variant="secondary" className="ml-2">
                {sherlockFindings.filter(f => f.kind !== 'provider_error').length} found
              </Badge>
            </CardTitle>
            <CardDescription>
              Username presence detected via Sherlock OSINT tool
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {sherlockFindings.filter(f => f.kind !== 'provider_error').length === 0 ? (
              <div className="p-6 text-center">
                <Info className="w-8 h-8 mx-auto mb-3 text-muted-foreground/60" />
                <p className="text-sm text-muted-foreground">
                  Sherlock checked its site list for this username but didn't find confirmed profiles.
                </p>
                <p className="text-xs text-muted-foreground/75 mt-2">
                  This can be normal, as each provider covers different sites. Maigret may still find matches on different platforms.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="p-6 space-y-3">
                  {sherlockFindings
                    .filter((finding) => {
                      // Exclude provider errors from display
                      if (finding.kind === 'provider_error') return false;
                      
                      const getEvidenceValue = (evidence: any, key: string) => {
                        if (!evidence || !Array.isArray(evidence)) return null;
                        const found = evidence.find((e: any) => e.key === key);
                        return found?.value;
                      };
                      
                      const site = getEvidenceValue(finding.evidence, 'site');
                      const url = getEvidenceValue(finding.evidence, 'url');
                      
                      // Filter by search query
                      if (searchQuery) {
                        const searchLower = searchQuery.toLowerCase();
                        const matchesSite = site ? site.toLowerCase().includes(searchLower) : false;
                        const matchesUrl = url ? url.toLowerCase().includes(searchLower) : false;
                        if (!matchesSite && !matchesUrl) return false;
                      }
                      
                      // Filter by selected providers
                      if (selectedProviders.length > 0 && !selectedProviders.includes('sherlock')) {
                        return false;
                      }
                      
                      return true;
                    })
                    .map((finding, idx) => {
                    const getEvidenceValue = (evidence: any, key: string) => {
                      if (!evidence || !Array.isArray(evidence)) return null;
                      const found = evidence.find((e: any) => e.key === key);
                      return found?.value;
                    };
                    
                    const site = getEvidenceValue(finding.evidence, 'site');
                    const url = getEvidenceValue(finding.evidence, 'url');
                    const status = getEvidenceValue(finding.evidence, 'status');
                    
                    // Check if this is an error finding
                    const isError = finding.kind === 'provider_error';
                    
                    return (
                      <div 
                        key={finding.id}
                        className={`group p-4 rounded-lg border ${
                          isError 
                            ? 'border-yellow-500/50 bg-yellow-50/5'
                            : 'border-border/50 bg-gradient-to-br from-card to-card/50'
                        } hover:border-purple-500/50 hover:shadow-md transition-all duration-300 hover:scale-[1.02] animate-fade-in`}
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${isError ? 'bg-yellow-500' : 'bg-purple-500'} animate-pulse`} />
                            <span className="font-semibold text-base group-hover:text-purple-500 transition-colors">
                              {site || 'Unknown Site'}
                            </span>
                            <Badge 
                              variant="outline" 
                              className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                            >
                              whatsmyname
                            </Badge>
                          </div>
                          {status && (
                            <Badge variant="outline" className="text-xs font-mono">
                              {status}
                            </Badge>
                          )}
                          {isError && (
                            <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                              provider error
                            </Badge>
                          )}
                        </div>
                        {url && (
                          <a 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-purple-500 transition-colors group/link"
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
            )}
          </CardContent>
        </Card>
      )}

      {result.status === 'completed' && 
       (!result.summary || result.summary.length === 0) && 
       sherlockFindings.filter(f => f.kind === 'presence.hit').length === 0 &&
       maigretStatus !== 'error' &&
       sherlockStatus !== 'error' &&
       gosearchStatus !== 'error' && (
        <Card className="border-muted bg-gradient-to-br from-muted/50 to-transparent animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-muted-foreground" />
              Comprehensive Scan Complete - Low Digital Footprint
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              All providers (Maigret, Sherlock, GoSearch) completed their scans successfully, but no public profiles were found for this username.
            </p>
            <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
              <p className="text-sm font-medium mb-2">Excellent Privacy Profile! 🎉</p>
              <p className="text-xs text-muted-foreground">
                A minimal digital footprint reduces exposure to data breaches, identity theft, and online tracking.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/scan/usernames'}>
                Try Different Username
              </Button>
            </div>
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
