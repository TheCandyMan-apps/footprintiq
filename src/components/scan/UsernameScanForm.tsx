import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMaigretEntitlement } from '@/hooks/useMaigretEntitlement';
import { Loader2, Info, Bug } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUsernameScan } from '@/hooks/useUsernameScan';
import { UsernameScanDebug } from './UsernameScanDebug';
import { ScanProgressDialog } from './ScanProgressDialog';
import { checkAndRefreshSession } from '@/lib/auth/sessionRefresh';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useActiveScanContext } from '@/contexts/ActiveScanContext';

const ARTIFACT_OPTIONS = [
  { id: 'html', label: 'HTML' },
  { id: 'pdf', label: 'PDF' },
  { id: 'csv', label: 'CSV' },
  { id: 'txt', label: 'TXT' },
  { id: 'xmind', label: 'XMind' },
];

export function UsernameScanForm() {
  const [username, setUsername] = useState('');
  const [tags, setTags] = useState('');
  const [allSites, setAllSites] = useState(false);
  const [artifacts, setArtifacts] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { entitlement, isPremium, loading: entitlementLoading } = useMaigretEntitlement();
  const { startTracking } = useActiveScanContext();
  const { 
    isScanning, 
    debugLogs, 
    debugMode, 
    setDebugMode, 
    startScan, 
    clearLogs 
  } = useUsernameScan();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast({
        title: 'Username Required',
        description: 'Please enter a username to scan',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      // Pre-scan session check
      const sessionCheck = await checkAndRefreshSession();
      
      if (!sessionCheck.valid) {
        toast({
          title: 'Session Expired',
          description: 'Please log in again',
          variant: 'destructive',
        });
        navigate('/auth');
        return;
      }
      
      if (sessionCheck.refreshed) {
        toast({
          title: 'Session Refreshed',
          description: 'Your session has been renewed—retry scan',
        });
      }

      // Use enhanced scan hook
      const data = await startScan({
        username: username.trim(),
        tags: tags.trim() || undefined,
        allSites: allSites,
        artifacts: isPremium ? artifacts : [],
        debugMode,
      });

      const jobId = data?.jobId;

      // Open progress dialog and start floating tracker
      if (jobId) {
        setCurrentScanId(jobId);
        setProgressDialogOpen(true);
        
        // Start floating tracker
        startTracking({
          scanId: jobId,
          type: 'username',
          target: username.trim(),
          startedAt: new Date().toISOString(),
        });
      }

      toast({
        title: 'Scan Started',
        description: `Scan queued for username "${username}"`,
      });

      // Reset form
      setUsername('');
      setTags('');
      setArtifacts([]);
    } catch (error: any) {
      console.error('Scan error:', error);
      toast({
        title: 'Scan Failed',
        description: error.message || 'Failed to start scan',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (entitlementLoading) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="p-6 md:p-8">
          <CardTitle className="text-2xl font-semibold">New Username Scan</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Search for profiles across social media and websites
            {entitlement && (
              <span className="ml-2 text-xs font-medium text-primary">
                {entitlement.plan.toUpperCase()} Plan
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8 pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Debug Mode Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Bug className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="debug-mode" className="text-sm font-medium cursor-pointer">
                  Debug Mode
                </Label>
                <span className="text-xs px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">Beta</span>
              </div>
              <Switch
                id="debug-mode"
                checked={debugMode}
                onCheckedChange={setDebugMode}
              />
            </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={submitting}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (optional)</Label>
            <Input
              id="tags"
              placeholder="investigation, case-123"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={submitting}
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">Comma-separated tags for organization</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Scan All Sites</Label>
              <p className="text-sm text-muted-foreground">
                Include all available sites (may take longer)
              </p>
              {allSites && !isPremium && (
                <Alert className="mt-2">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    May run longer; capped by your plan timeout
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <Switch
              checked={allSites}
              onCheckedChange={setAllSites}
              disabled={submitting}
            />
          </div>

          <div className="space-y-3">
            <Label>Export Artifacts</Label>
            <TooltipProvider>
              <div className="space-y-2">
                {ARTIFACT_OPTIONS.map((option) => (
                  <Tooltip key={option.id}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={option.id}
                          checked={artifacts.includes(option.id)}
                          onCheckedChange={(checked) => {
                            if (!isPremium) return;
                            setArtifacts(
                              checked
                                ? [...artifacts, option.id]
                                : artifacts.filter((a) => a !== option.id)
                            );
                          }}
                          disabled={!isPremium || submitting}
                        />
                        <label
                          htmlFor={option.id}
                          className={`text-sm font-medium leading-none ${
                            !isPremium
                              ? 'cursor-not-allowed opacity-50'
                              : 'cursor-pointer'
                          }`}
                        >
                          {option.label}
                        </label>
                      </div>
                    </TooltipTrigger>
                    {!isPremium && (
                      <TooltipContent>
                        <p>Available on Premium</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
            {artifacts.length > 2 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Multiple artifacts will increase scan time
                </AlertDescription>
              </Alert>
            )}
          </div>

          {!isPremium && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Upgrade to Premium for artifact exports, longer timeouts, bulk scanning, and
                scheduling
              </AlertDescription>
            </Alert>
          )}

          {entitlement && (
            <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
              <p>Daily limit: {entitlement.dailyJobs} scans</p>
              <p>Timeout: {Math.floor(entitlement.timeout / 60)} minutes</p>
            </div>
          )}

          <Button type="submit" disabled={submitting || isScanning} className="w-full h-11">
            {(submitting || isScanning) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting Scan...
              </>
            ) : (
              'Run Scan'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>

    {/* Debug Console */}
    {debugMode && <UsernameScanDebug logs={debugLogs} onClear={clearLogs} />}

    {/* Progress Dialog */}
    <ScanProgressDialog
      open={progressDialogOpen}
      onOpenChange={setProgressDialogOpen}
      scanId={currentScanId}
      onComplete={() => {
        if (currentScanId) {
          navigate(`/scan/usernames/${currentScanId}`);
        }
      }}
    />
    </>
  );
}
