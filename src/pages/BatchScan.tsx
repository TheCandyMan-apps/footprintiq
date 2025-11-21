import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { invokeWithRetry } from '@/lib/supabaseRetry';
import { Header } from '@/components/Header';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { BatchScanUploader } from '@/components/scan/BatchScanUploader';
import { toast } from 'sonner';
import { useWorkspace } from '@/hooks/useWorkspace';
import { CreditsBadge } from '@/components/workspace/CreditsBadge';
import { UpgradeModal } from '@/components/UpgradeModal';
import { 
  FileStack,
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock,
  AlertCircle,
  Loader2,
  Shield,
  Database,
  Globe,
  Search
} from 'lucide-react';

interface ParsedTarget {
  type: 'email' | 'username' | 'domain' | 'phone';
  value: string;
  row: number;
}

interface ScanResult {
  target: ParsedTarget;
  status: 'pending' | 'running' | 'completed' | 'failed';
  scanId?: string;
  error?: string;
}

const DEFAULT_PROVIDERS: Record<string, string[]> = {
  email: ['hibp', 'dehashed', 'clearbit', 'fullcontact'],
  username: ['dehashed', 'apify-social'],
  domain: ['urlscan', 'securitytrails', 'shodan', 'virustotal'],
  phone: ['fullcontact'],
};

const availableProviders = [
  { id: 'hibp', name: 'Have I Been Pwned', icon: Shield, types: ['email'] },
  { id: 'dehashed', name: 'DeHashed', icon: Database, types: ['email', 'username'] },
  { id: 'clearbit', name: 'Clearbit', icon: Globe, types: ['email', 'domain'] },
  { id: 'fullcontact', name: 'FullContact', icon: Database, types: ['email', 'phone', 'domain'] },
  { id: 'urlscan', name: 'URLScan.io', icon: Search, types: ['domain'] },
  { id: 'securitytrails', name: 'SecurityTrails', icon: Shield, types: ['domain'] },
  { id: 'shodan', name: 'Shodan', icon: Globe, types: ['domain'] },
  { id: 'virustotal', name: 'VirusTotal', icon: Shield, types: ['domain'] },
];

export default function BatchScan() {
  const navigate = useNavigate();
  const { workspace, loading: workspaceLoading, refreshWorkspace } = useWorkspace();
  const [targets, setTargets] = useState<ParsedTarget[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<Record<string, string[]>>({});
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<'provider_blocked' | 'insufficient_credits' | 'batch_blocked'>('batch_blocked');

  // Initialize default providers for each type
  useEffect(() => {
    if (targets.length > 0) {
      const types = [...new Set(targets.map(t => t.type))];
      const defaults = types.reduce((acc, type) => ({
        ...acc,
        [type]: DEFAULT_PROVIDERS[type] || []
      }), {});
      setSelectedProviders(defaults);
    }
  }, [targets]);

  const toggleProvider = (type: string, providerId: string) => {
    setSelectedProviders(prev => {
      const current = prev[type] || [];
      const updated = current.includes(providerId)
        ? current.filter(p => p !== providerId)
        : [...current, providerId];
      return { ...prev, [type]: updated };
    });
  };

  const startBatchScan = async () => {
    if (targets.length === 0) {
      toast.error('No targets to scan');
      return;
    }

    if (!workspace?.id) {
      toast.error('No workspace selected');
      return;
    }

    setIsScanning(true);
    setResults(targets.map(target => ({ target, status: 'pending' })));
    setCurrentIndex(0);

    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      setCurrentIndex(i);
      
      // Update status to running
      setResults(prev => prev.map((r, idx) => 
        idx === i ? { ...r, status: 'running' } : r
      ));

      try {
        const providers = selectedProviders[target.type] || DEFAULT_PROVIDERS[target.type] || [];
        
        if (providers.length === 0) {
          throw new Error(`No providers configured for ${target.type}`);
        }

        const scanPayload: any = {
          workspace_id: workspace.id,
          type: target.type,
          providers,
        };

        // Set the target based on type
        scanPayload[target.type] = target.value;

        const { data, error } = await invokeWithRetry(() =>
          supabase.functions.invoke('scan-orchestrate', {
            body: scanPayload,
          })
        );

        if (error) throw error;

        // Update status to completed
        setResults(prev => prev.map((r, idx) => 
          idx === i ? { ...r, status: 'completed', scanId: data?.scan?.id } : r
        ));

        toast.success(`Completed scan ${i + 1}/${targets.length}: ${target.value}`);
        
        // Small delay between scans to avoid rate limiting
        if (i < targets.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error: any) {
        console.error(`Scan failed for ${target.value}:`, error);
        
        const errorMessage = error.message || 'Unknown error';
        
        // Check for specific monetization/plan errors
        if (errorMessage.includes('insufficient') || errorMessage.includes('credits')) {
          setUpgradeReason('insufficient_credits');
          setShowUpgradeModal(true);
          setIsScanning(false);
          toast.error('Insufficient credits for batch scan');
          break; // Stop batch scan
        } else if (errorMessage.includes('no_providers_available_for_tier') || 
                   errorMessage.includes('requires') || 
                   errorMessage.includes('blocked')) {
          setUpgradeReason('provider_blocked');
          setShowUpgradeModal(true);
          setIsScanning(false);
          toast.error('Provider access restricted');
          break; // Stop batch scan
        } else if (errorMessage.includes('batch') || errorMessage.includes('quota')) {
          setUpgradeReason('batch_blocked');
          setShowUpgradeModal(true);
          setIsScanning(false);
          toast.error('Batch scanning requires upgrade');
          break; // Stop batch scan
        }
        
        setResults(prev => prev.map((r, idx) => 
          idx === i ? { ...r, status: 'failed', error: error.message } : r
        ));
        
        toast.error(`Failed scan ${i + 1}/${targets.length}: ${target.value}`);
      }
    }

    setIsScanning(false);
    await refreshWorkspace();
    toast.success(`Batch scan completed: ${results.filter(r => r.status === 'completed').length}/${targets.length} successful`);
  };

  const getStatusIcon = (status: ScanResult['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'running': return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const uniqueTypes = [...new Set(targets.map(t => t.type))];
  const completedScans = results.filter(r => r.status === 'completed').length;
  const failedScans = results.filter(r => r.status === 'failed').length;

  return (
    <>
      <SEO
        title="Batch Scan — FootprintIQ"
        description="Upload CSV files and scan multiple targets at once"
        canonical="https://footprintiq.app/scan/batch"
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        
        <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <FileStack className="h-8 w-8 text-primary" />
                  Batch Scan
                </h1>
                <p className="text-muted-foreground mt-1">
                  Upload a CSV file with multiple targets and scan them all at once
                </p>
              </div>
              <CreditsBadge workspaceId={workspace?.id} />
            </div>

            {/* Upload Section */}
            {targets.length === 0 && (
              <BatchScanUploader 
                onTargetsParsed={setTargets}
                disabled={isScanning}
              />
            )}

            {/* Targets Summary */}
            {targets.length > 0 && !isScanning && results.length === 0 && (
              <Card className="group relative overflow-hidden rounded-lg bg-card p-6 shadow-card hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <CardTitle>Configure Providers</CardTitle>
                  <CardDescription>
                    Select which providers to use for each target type
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {uniqueTypes.map(type => {
                    const typeTargets = targets.filter(t => t.type === type);
                    const compatibleProviders = availableProviders.filter(p => p.types.includes(type));
                    
                    return (
                      <div key={type} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold capitalize flex items-center gap-2">
                            {type}
                            <Badge variant="outline">{typeTargets.length} targets</Badge>
                          </h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {compatibleProviders.map(provider => {
                            const Icon = provider.icon;
                            const isSelected = selectedProviders[type]?.includes(provider.id);
                            
                            return (
                              <div
                                key={provider.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                                  isSelected 
                                    ? 'border-primary bg-primary/10' 
                                    : 'border-border hover:border-primary/50'
                                }`}
                                onClick={() => toggleProvider(type, provider.id)}
                              >
                                <Checkbox 
                                  checked={isSelected}
                                  onCheckedChange={() => toggleProvider(type, provider.id)}
                                />
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{provider.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={startBatchScan}
                      className="flex-1"
                      size="lg"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Batch Scan ({targets.length} targets)
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setTargets([]);
                        setSelectedProviders({});
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Progress Section */}
            {isScanning && (
              <Card className="group relative overflow-hidden rounded-lg bg-card p-6 shadow-card">
                <CardHeader>
                  <CardTitle>Scanning Progress</CardTitle>
                  <CardDescription>
                    Processing {currentIndex + 1} of {targets.length} targets
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={(currentIndex / targets.length) * 100} />
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Completed: {completedScans}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span>Failed: {failedScans}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Pending: {targets.length - completedScans - failedScans}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Section */}
            {results.length > 0 && (
              <Card className="group relative overflow-hidden rounded-lg bg-card p-6 shadow-card">
                <CardHeader>
                  <CardTitle>Scan Results</CardTitle>
                  <CardDescription>
                    View the status of each target scan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {results.map((result, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {getStatusIcon(result.status)}
                          <div className="flex-1">
                            <p className="font-medium">{result.target.value}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {result.target.type}
                            </p>
                          </div>
                          {result.error && (
                            <p className="text-xs text-destructive">{result.error}</p>
                          )}
                        </div>
                        {result.scanId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/results/${result.scanId}`)}
                          >
                            View Results
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {!isScanning && (
                    <div className="flex gap-3 pt-4 border-t mt-4">
                      <Button
                        onClick={() => {
                          setTargets([]);
                          setResults([]);
                          setSelectedProviders({});
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        Start New Batch
                      </Button>
                      <Button
                        onClick={() => navigate('/dashboard')}
                        className="flex-1"
                      >
                        Go to Dashboard
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        reason={upgradeReason}
        blockedFeature={
          upgradeReason === 'provider_blocked' ? 'Advanced OSINT providers' :
          upgradeReason === 'batch_blocked' ? 'Batch scanning' :
          'Credits for scanning'
        }
      />
    </>
  );
}
