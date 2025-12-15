import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SimpleResultsViewer } from '@/components/maigret/SimpleResultsViewer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ResultsFilters } from '@/components/maigret/ResultsFilters';
import { FootprintDNACard } from '@/components/FootprintDNACard';
import AIInsightsPanel from '@/components/AIInsightsPanel';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IdentityStrengthScore } from '@/components/intelligence/IdentityStrengthScore';
import { UsernameUniquenessScore } from '@/components/intelligence/UsernameUniquenessScore';
import { FootprintClusterMap } from '@/components/intelligence/FootprintClusterMap';
import { CategoryDistributionChart } from '@/components/intelligence/CategoryDistributionChart';
import { ConfidenceDistributionChart } from '@/components/intelligence/ConfidenceDistributionChart';
import { RiskBreakdownChart } from '@/components/intelligence/RiskBreakdownChart';
import { CollapsibleSection } from '@/components/intelligence/CollapsibleSection';
import { RequestStatusDistribution } from '@/components/scan/RequestStatusDistribution';
import { ProviderStatusPanel } from '@/components/maigret/ProviderStatusPanel';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CatfishDetection } from '@/components/CatfishDetection';
import { ScanSummary } from '@/components/ScanSummary';
import { ArtifactDownloadCard } from '@/components/scan/ArtifactDownloadCard';
import { useArtifactGeneration } from '@/hooks/useArtifactGeneration';
import { Finding, Severity } from '@/lib/ufm';

export default function SimpleMaigretResults() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  const [providerStats, setProviderStats] = useState<Record<string, number>>({});
  const [scanUserId, setScanUserId] = useState<string | undefined>(undefined);
  const [totalFindings, setTotalFindings] = useState(0);
  const [providerStatuses, setProviderStatuses] = useState<Record<string, string>>({});
  const [isCached, setIsCached] = useState(false);
  const [cachedFromScanId, setCachedFromScanId] = useState<string | null>(null);
  const [gosearchPending, setGosearchPending] = useState(false);
  const [findingsForExport, setFindingsForExport] = useState<Finding[]>([]);

  // Artifact generation hook
  const { artifacts, isGenerating, generateArtifacts } = useArtifactGeneration(jobId);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        const returnUrl = `/maigret/results/${jobId}`;
        navigate(`/auth?redirect=${encodeURIComponent(returnUrl)}`);
        return;
      }
      
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [jobId, navigate]);

  // Load scan metadata for FootprintDNA and AI Insights
  useEffect(() => {
    const loadScanMetadata = async () => {
      if (!jobId) return;
      
      const { data: scan } = await supabase
        .from('scans')
        .select('user_id, cached_from_scan_id, gosearch_pending')
        .eq('id', jobId)
        .maybeSingle();
      
      if (scan) {
        setScanUserId(scan.user_id);
        
        // Check if scan was served from cache
        if (scan.cached_from_scan_id) {
          setIsCached(true);
          setCachedFromScanId(scan.cached_from_scan_id);
          console.log('[SimpleMaigretResults] Scan served from cache:', scan.cached_from_scan_id);
        }
        
        // Check if GoSearch is pending
        if (scan.gosearch_pending) {
          setGosearchPending(true);
          console.log('[SimpleMaigretResults] GoSearch running asynchronously');
        }
      }
    };

    loadScanMetadata();
    
    // Poll for gosearch_pending status if it's true
    let pollInterval: NodeJS.Timeout | null = null;
    
    const startPolling = async () => {
      const { data: scan } = await supabase
        .from('scans')
        .select('gosearch_pending')
        .eq('id', jobId)
        .maybeSingle();
      
      if (scan && !scan.gosearch_pending) {
        setGosearchPending(false);
        if (pollInterval) {
          clearInterval(pollInterval);
        }
      }
    };
    
    if (gosearchPending) {
      pollInterval = setInterval(startPolling, 5000); // Poll every 5 seconds
    }
    
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [jobId, gosearchPending]);

  // Load findings for ScanSummary and Evidence Pack
  useEffect(() => {
    const loadFindings = async () => {
      if (!jobId) return;
      
      const { data: findings, error } = await supabase
        .from('findings')
        .select('*')
        .eq('scan_id', jobId);
      
      if (error) {
        console.error('[SimpleMaigretResults] Error loading findings:', error);
        return;
      }
      
      if (findings && findings.length > 0) {
        // Convert database findings to Finding format for ScanSummary
        const converted: Finding[] = findings.map(f => {
          // Parse evidence array format
          const evidenceArray = Array.isArray(f.evidence) 
            ? (f.evidence as Array<{key?: string; value?: string}>).map((e) => ({ 
                key: e?.key || '', 
                value: e?.value || '' 
              }))
            : [];
          
          // Map severity
          const severityMap: Record<string, Severity> = {
            'critical': 'critical',
            'high': 'high', 
            'medium': 'medium',
            'low': 'low',
            'info': 'info'
          };
          
          // Extract title from meta or evidence
          const meta = f.meta as Record<string, any> | null;
          const title = meta?.site || meta?.platform || evidenceArray.find(e => e.key === 'site')?.value || 'Finding';
          const description = meta?.url || evidenceArray.find(e => e.key === 'url')?.value || '';
          
          // Map kind to valid type, default to 'social_media' for profile_presence
          const typeMapping: Record<string, Finding['type']> = {
            'profile_presence': 'social_media',
            'presence.hit': 'social_media',
            'breach': 'breach',
            'identity': 'identity',
          };
          const type = typeMapping[f.kind] || 'social_media';
          
          return {
            id: f.id,
            type,
            title,
            description,
            severity: severityMap[f.severity || 'info'] || 'info',
            confidence: f.confidence || 0.5,
            timestamp: f.created_at || new Date().toISOString(),
            evidence: evidenceArray,
            source: f.provider || 'unknown',
            tags: [],
          };
        });
        
        setFindingsForExport(converted);
      }
    };
    
    loadFindings();
  }, [jobId]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Checking authentication...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!jobId) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <p>Invalid job ID</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-4 animate-fade-in">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/scan/advanced')}
              className="hover:bg-primary/10 transition-all hover:scale-105"
              aria-label="Return to advanced scanner"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Scanner
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 blur-3xl -z-10" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Username Scan Results
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Detailed OSINT analysis across 300+ platforms
              </p>
            </div>
          </div>

          {/* Cache Notice */}
          {isCached && (
            <Alert className="border-primary/20 bg-primary/5">
              <Clock className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                These results were returned from cache (last scan within 7 days). 
                Results are still valid for footprint presence analysis. 
                {cachedFromScanId && (
                  <span className="text-xs text-muted-foreground ml-2">
                    Original scan ID: {cachedFromScanId.slice(0, 8)}...
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          {/* GoSearch Pending Notice */}
          {gosearchPending && (
            <Alert className="border-blue-500/20 bg-blue-500/5 animate-pulse">
              <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
              <AlertDescription className="text-sm font-medium">
                <span className="text-blue-600 dark:text-blue-400">GoSearch is still running in the background</span>
                <br />
                <span className="text-muted-foreground text-xs">
                  Results will appear automatically when ready (usually 1-3 minutes). No need to refresh the page.
                </span>
              </AlertDescription>
            </Alert>
          )}

          {/* Footprint DNA Card */}
          <ErrorBoundary fallback={<Skeleton className="h-48 w-full" />}>
            <FootprintDNACard scanId={jobId} userId={scanUserId} />
          </ErrorBoundary>

          {/* Charts Section - New visualizations */}
          <CollapsibleSection 
            title="Analytics & Distribution" 
            defaultOpen={true}
            badge={<Badge variant="secondary" className="text-xs">New</Badge>}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ErrorBoundary fallback={<Skeleton className="h-64 w-full" />}>
                <CategoryDistributionChart scanId={jobId} />
              </ErrorBoundary>
              <ErrorBoundary fallback={<Skeleton className="h-64 w-full" />}>
                <ConfidenceDistributionChart scanId={jobId} />
              </ErrorBoundary>
            </div>
            <div className="mt-6">
              <ErrorBoundary fallback={<Skeleton className="h-32 w-full" />}>
                <RiskBreakdownChart scanId={jobId} />
              </ErrorBoundary>
            </div>
          </CollapsibleSection>

          {/* Intelligence Layer - Username Scan Tiles */}
          <CollapsibleSection title="Intelligence Metrics" defaultOpen={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ErrorBoundary fallback={<Skeleton className="h-64 w-full" />}>
                <IdentityStrengthScore scanId={jobId} />
              </ErrorBoundary>
              <ErrorBoundary fallback={<Skeleton className="h-64 w-full" />}>
                <UsernameUniquenessScore scanId={jobId} />
              </ErrorBoundary>
              <ErrorBoundary fallback={<Skeleton className="h-64 w-full" />}>
                <FootprintClusterMap scanId={jobId} />
              </ErrorBoundary>
            </div>
          </CollapsibleSection>

          {/* Request Status Distribution */}
          <CollapsibleSection title="Request Status" defaultOpen={false}>
            <ErrorBoundary fallback={<Skeleton className="h-48 w-full" />}>
              <RequestStatusDistribution scanId={jobId} />
            </ErrorBoundary>
          </CollapsibleSection>

          {/* Provider Status Panel */}
          <CollapsibleSection title="Provider Status" defaultOpen={false}>
            <ErrorBoundary fallback={<Skeleton className="h-48 w-full" />}>
              <ProviderStatusPanel scanId={jobId} />
            </ErrorBoundary>
          </CollapsibleSection>

          {/* Filters */}
          <CollapsibleSection title="Search & Filters" defaultOpen={true}>
            <ResultsFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedProviders={selectedProviders}
              onProviderToggle={(provider) => {
                setSelectedProviders(prev =>
                  prev.includes(provider)
                    ? prev.filter(p => p !== provider)
                    : [...prev, provider]
                );
              }}
              availableProviders={availableProviders}
              providerStats={providerStats}
            />
          </CollapsibleSection>

          <ErrorBoundary fallback={<Skeleton className="h-96 w-full" />}>
            <SimpleResultsViewer 
              jobId={jobId}
              searchQuery={searchQuery}
              selectedProviders={selectedProviders}
              onProvidersDetected={(providers, stats) => {
                setAvailableProviders(providers);
                setProviderStats(stats);
                
                // Calculate total findings for AI Insights
                const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
                setTotalFindings(total);
              }}
              onProviderStatusesDetected={(statuses) => {
                setProviderStatuses(statuses);
              }}
            />
          </ErrorBoundary>

          {/* AI Insights Panel */}
          <CollapsibleSection title="AI Insights" defaultOpen={true}>
            <ErrorBoundary fallback={<Skeleton className="h-64 w-full" />}>
              <AIInsightsPanel 
                scanData={{
                  jobId: jobId,
                  scanType: 'username',
                  exposures: totalFindings,
                  presence: (providerStats.maigret || 0) + (providerStats.sherlock || 0) + (providerStats.gosearch || 0) + (providerStats['apify-social'] || 0),
                  providers: {
                    maigret: providerStats.maigret || 0,
                    sherlock: providerStats.sherlock || 0,
                    gosearch: providerStats.gosearch || 0,
                    apifySocial: providerStats['apify-social'] || 0
                  },
                  statuses: providerStatuses
                }}
              />
            </ErrorBoundary>
          </CollapsibleSection>

          {/* Catfish Detection */}
          <CollapsibleSection title="Catfish Detection" defaultOpen={false}>
            <ErrorBoundary fallback={<Skeleton className="h-64 w-full" />}>
              <CatfishDetection scanId={jobId} />
            </ErrorBoundary>
          </CollapsibleSection>

          {/* Export Artifacts */}
          <CollapsibleSection title="Export Artifacts" defaultOpen={false}>
            <ErrorBoundary fallback={<Skeleton className="h-48 w-full" />}>
              <ArtifactDownloadCard 
                artifacts={artifacts}
                isGenerating={isGenerating}
                onRegenerate={() => generateArtifacts(['csv', 'json', 'html', 'txt'])}
              />
            </ErrorBoundary>
          </CollapsibleSection>

          {/* Scan Summary with Evidence Pack */}
          {findingsForExport.length > 0 && (
            <CollapsibleSection title="Summary & Evidence Pack" defaultOpen={true}>
              <ErrorBoundary fallback={<Skeleton className="h-64 w-full" />}>
                <ScanSummary 
                  findings={findingsForExport}
                  scanId={jobId}
                  isPro={true}
                />
              </ErrorBoundary>
            </CollapsibleSection>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
