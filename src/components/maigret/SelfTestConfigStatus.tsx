import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ValidationResult {
  valid: boolean;
  expected_key_prefix?: string;
  received_key_prefix?: string;
  message: string;
  error?: string;
}

export function SelfTestConfigStatus() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid' | 'error'>('idle');
  const [result, setResult] = useState<ValidationResult | null>(null);

  const validateConfig = async () => {
    setStatus('checking');
    
    try {
      const { data, error } = await supabase.functions.invoke('validate-selftest-key', {
        body: { test_key: 'test-key-12345' }
      });

      if (error) throw error;

      setResult(data);
      setStatus(data.valid ? 'valid' : 'invalid');
    } catch (error) {
      console.error('Config validation error:', error);
      setStatus('error');
      setResult({ 
        valid: false, 
        message: error.message || 'Failed to validate configuration',
        error: error.message 
      });
    }
  };

  useEffect(() => {
    validateConfig();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
      case 'valid':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'invalid':
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Validating SELFTEST_KEY configuration...';
      case 'valid':
        return '✓ SELFTEST_KEY configured correctly';
      case 'invalid':
        return '✗ SELFTEST_KEY mismatch detected';
      case 'error':
        return '⚠ Configuration check failed';
      default:
        return 'Configuration not checked yet';
    }
  };

  return (
    <Card className="p-4 mb-6 border-border bg-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          {getStatusIcon()}
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-foreground">
              {getStatusText()}
            </h3>
            {result && (
              <p className="text-sm text-muted-foreground mt-1">
                {result.message}
              </p>
            )}
            {status === 'invalid' && result && (
              <div className="mt-2 p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-sm font-medium text-destructive mb-1">
                  Fix Required:
                </p>
                <p className="text-sm text-muted-foreground">
                  Update SELFTEST_KEY in Supabase Edge Functions to: <code className="bg-muted px-1 py-0.5 rounded">test-key-12345</code>
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Backend expects: {result.expected_key_prefix}<br />
                  Frontend sends: {result.received_key_prefix}
                </p>
              </div>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={validateConfig}
          disabled={status === 'checking'}
        >
          {status === 'checking' ? 'Checking...' : 'Revalidate'}
        </Button>
      </div>
    </Card>
  );
}
