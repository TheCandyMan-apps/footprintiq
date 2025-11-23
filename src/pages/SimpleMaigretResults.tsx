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
        .select('user_id, cached_from_scan_id')
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
      }
    };

    loadScanMetadata();
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
              onClick={() => navigate('/maigret/simple')}
              className="hover:bg-primary/10 transition-all hover:scale-105"
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

          {/* Footprint DNA Card */}
          <FootprintDNACard scanId={jobId} userId={scanUserId} />

          {/* Filters */}
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

          {/* AI Insights Panel */}
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
        </div>
      </main>
      <Footer />
    </div>
  );
}
