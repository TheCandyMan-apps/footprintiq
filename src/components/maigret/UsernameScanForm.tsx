import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMaigretEntitlement } from '@/hooks/useMaigretEntitlement';
import { Loader2, Info, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TurnstileWidget, type TurnstileWidgetRef } from '@/components/security/TurnstileWidget';
import { useTurnstileRequired } from '@/hooks/useTurnstileRequired';

const ARTIFACT_OPTIONS = [
  { id: 'html', label: 'HTML' },
  { id: 'pdf', label: 'PDF' },
  { id: 'csv', label: 'CSV' },
  { id: 'txt', label: 'TXT' },
  { id: 'xmind', label: 'XMind' },
];

interface UsernameScanFormProps {
  onScanStarted?: (jobId: string) => void;
}

export function UsernameScanForm({ onScanStarted }: UsernameScanFormProps) {
  const [username, setUsername] = useState('');
  const [tags, setTags] = useState('');
  const [allSites, setAllSites] = useState(false);
  const [artifacts, setArtifacts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { entitlement, isPremium, loading: entitlementLoading } = useMaigretEntitlement();
  
  // Turnstile state
  const turnstileRef = useRef<TurnstileWidgetRef>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
  const { required: requiresTurnstile } = useTurnstileRequired();

  const handleTurnstileToken = useCallback((token: string) => {
    setTurnstileToken(token);
    setTurnstileError(null);
  }, []);

  const handleTurnstileError = useCallback((error: string) => {
    setTurnstileToken(null);
    setTurnstileError(error);
  }, []);

  const resetTurnstile = useCallback(() => {
    setTurnstileToken(null);
    turnstileRef.current?.reset();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous turnstile error
    setTurnstileError(null);
    
    if (!username.trim()) {
      toast({
        title: 'Username Required',
        description: 'Please enter a username to scan',
        variant: 'destructive',
      });
      return;
    }

    // Validate Turnstile token if required
    if (requiresTurnstile && !turnstileToken) {
      setTurnstileError('Please complete the verification to continue.');
      return;
    }

    setLoading(true);
    try {
      const baseBody = {
        username: username.trim(),
        tags: tags.trim() || undefined,
        all_sites: allSites,
        artifacts: isPremium ? artifacts : [],
      };
      
      // Add turnstile token if present
      const requestBody = turnstileToken
        ? { ...baseBody, turnstile_token: turnstileToken }
        : baseBody;
      
      const { data, error } = await supabase.functions.invoke('enqueue-maigret-scan', {
        body: requestBody,
      });

      if (error) throw error;

      toast({
        title: 'Scan Started',
        description: `Username scan for "${username}" has been queued`,
      });

      if (data?.jobId && onScanStarted) {
        onScanStarted(data.jobId);
      }

      // Reset form and Turnstile
      setUsername('');
      setTags('');
      setArtifacts([]);
      resetTurnstile();
    } catch (error: any) {
      console.error('Scan error:', error);
      toast({
        title: 'Scan Failed',
        description: error.message || 'Failed to start scan',
        variant: 'destructive',
      });
      // Reset Turnstile on error
      resetTurnstile();
    } finally {
      setLoading(false);
    }
  };

  if (entitlementLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Username Scan</CardTitle>
        <CardDescription>
          Search for profiles across social media and websites
          {entitlement && (
            <span className="ml-2 text-xs font-medium text-primary">
              {entitlement.plan.toUpperCase()} Plan
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (optional)</Label>
            <Input
              id="tags"
              placeholder="investigation, case-123"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Scan All Sites</Label>
              <p className="text-sm text-muted-foreground">
                Include all available sites (may take longer)
              </p>
            </div>
            <Switch
              checked={allSites}
              onCheckedChange={setAllSites}
              disabled={loading}
            />
          </div>

          {isPremium && (
            <div className="space-y-2">
              <Label>Export Artifacts</Label>
              <div className="space-y-2">
                {ARTIFACT_OPTIONS.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={artifacts.includes(option.id)}
                      onCheckedChange={(checked) => {
                        setArtifacts(
                          checked
                            ? [...artifacts, option.id]
                            : artifacts.filter((a) => a !== option.id)
                        );
                      }}
                      disabled={loading}
                    />
                    <label
                      htmlFor={option.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
              {artifacts.length > 2 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Multiple artifacts will increase scan time
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {!isPremium && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Pro Intelligence includes exportable reports, extended timeouts, bulk scanning, and
                monitoring automation
              </AlertDescription>
            </Alert>
          )}

          {entitlement && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Daily limit: {entitlement.dailyJobs} scans</p>
              <p>Timeout: {Math.floor(entitlement.timeout / 60)} minutes</p>
            </div>
          )}

          {/* Turnstile verification for Free tier users */}
          {requiresTurnstile && (
            <div className="space-y-2">
              <TurnstileWidget
                ref={turnstileRef}
                onToken={handleTurnstileToken}
                onError={handleTurnstileError}
                action="maigret-scan"
                inline
              />
              {turnstileError && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{turnstileError}</span>
                </div>
              )}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting Scan...
              </>
            ) : (
              'Start Scan'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
