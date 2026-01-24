import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { mapWorkerError, type DiagnosticsInfo } from '@/lib/maigret/errorMapper';
import { TurnstileWidget, type TurnstileWidgetRef } from '@/components/security/TurnstileWidget';
import { useTurnstileRequired } from '@/hooks/useTurnstileRequired';

export function SimpleScanForm() {
  const [username, setUsername] = useState('');
  const [platforms, setPlatforms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);
  const { required: requiresTurnstile } = useTurnstileRequired();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous turnstile error
    setTurnstileError(null);
    
    if (!username.trim()) {
      toast.error('Username is required');
      return;
    }

    // Validate Turnstile token if required
    if (requiresTurnstile && !turnstileToken) {
      setTurnstileError('Please complete the verification to continue.');
      return;
    }

    // Check authentication first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const returnUrl = `/maigret/simple`;
      navigate(`/auth?redirect=${encodeURIComponent(returnUrl)}`);
      toast.error('Authentication Required', {
        description: 'Please log in to submit a scan',
      });
      return;
    }

    setIsLoading(true);
    
    // Generate client-side job ID for tracking
    const batchId = crypto.randomUUID();
    
    const baseRequestBody = {
      username: username.trim(),
      platforms: platforms ? platforms.split(',').map(p => p.trim()) : undefined,
      batch_id: batchId,
      timeout: 25, // 25s timeout for quick feedback
    };
    
    // Add turnstile token if present
    const requestBody = turnstileToken 
      ? { ...baseRequestBody, turnstile_token: turnstileToken }
      : baseRequestBody;

    const diagnostics: DiagnosticsInfo = {
      timestamp: new Date().toISOString(),
      request: {
        url: '/functions/v1/scan-start',
        method: 'POST',
        body: requestBody,
      },
    };

    try {
      const { data, error } = await supabase.functions.invoke('scan-start', {
        body: requestBody,
      });

      diagnostics.response = {
        status: error ? (error as any).status || 500 : 201,
        statusText: error ? 'Error' : 'Created',
        body: data || error,
      };

      // Resilient error handling: navigate to results page even on errors
      // The results page will poll maigret_results and show results when webhook completes
      if (error) {
        const mapped = mapWorkerError(error);
        console.warn('[SimpleScanForm] Worker response error, continuing with background polling:', mapped);
        
        toast.info('Slow worker response - continuing in background', {
          description: 'Redirecting to results page for polling...',
        });
        
        navigate(`/maigret/results/${batchId}`);
        return;
      }

      // Success: use job_id from response or fallback to batchId
      const jobId = data?.job_id || batchId;
      const statusCode = (diagnostics.response as any)?.status || 200;
      
      if (statusCode === 202) {
        toast.info('Scan queued successfully', {
          description: 'Worker is processing - results will appear shortly',
        });
      } else {
      toast.success('Scan started successfully!', {
          description: 'Redirecting to results...',
        });
      }
      
      // Reset Turnstile after successful scan
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      
      navigate(`/maigret/results/${jobId}`);
    } catch (err: any) {
      diagnostics.error = {
        message: err.message,
        type: err.name || 'Error',
      };
      
      // Reset Turnstile on error
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      
      const mapped = mapWorkerError(err);
      toast.error(mapped.title, {
        description: mapped.description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username to scan"
          disabled={isLoading}
        />
      </div>
      
      <div>
        <Label htmlFor="platforms">Platforms (optional)</Label>
        <Input
          id="platforms"
          value={platforms}
          onChange={(e) => setPlatforms(e.target.value)}
          placeholder="twitter, github, linkedin (comma-separated)"
          disabled={isLoading}
        />
        <p className="text-sm text-muted-foreground mt-1">
          Leave empty to scan all platforms
        </p>
      </div>

      {/* Turnstile verification for Free tier users */}
      {requiresTurnstile && (
        <div className="space-y-2">
          <TurnstileWidget
            ref={turnstileRef}
            onToken={(token) => {
              setTurnstileToken(token);
              setTurnstileError(null);
            }}
            onError={(error) => {
              setTurnstileToken(null);
              setTurnstileError(error);
            }}
            action="scan-start"
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

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Starting Scan...
          </>
        ) : (
          'Start Scan'
        )}
      </Button>
    </form>
  );
}
