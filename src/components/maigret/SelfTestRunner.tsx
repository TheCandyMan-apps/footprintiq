import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TestStep {
  name: string;
  description: string;
  status: 'pending' | 'running' | 'pass' | 'fail';
  httpStatus?: number;
  response?: any;
  error?: string;
  hint?: string;
}

export function SelfTestRunner() {
  const [steps, setSteps] = useState<TestStep[]>([
    {
      name: 'Health Check',
      description: 'Cloud Run /healthz (token check)',
      status: 'pending',
    },
    {
      name: 'Scan Start',
      description: 'Edge /scan-start (Edge→Worker)',
      status: 'pending',
    },
    {
      name: 'Webhook Write',
      description: 'Edge /scan-results (webhook write)',
      status: 'pending',
    },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [diagnostics, setDiagnostics] = useState<any[]>([]);

  const getErrorHint = (status: number, step: string): string => {
    if (status === 401 || status === 403) {
      if (step === 'webhook') {
        return 'RESULTS_WEBHOOK_TOKEN mismatch (Edge vs Cloud Run).';
      }
      return 'WORKER_TOKEN mismatch (Edge vs Cloud Run).';
    }
    if (status === 404) {
      return 'Worker route missing (/scan).';
    }
    if (status >= 500) {
      return 'Worker crashed, check Cloud Run logs.';
    }
    if (status === 0) {
      return 'MAIGRET_WORKER_URL may be wrong.';
    }
    if (step === 'webhook' && status === 400) {
      return 'Invalid webhook payload or database write failure.';
    }
    return 'Unexpected error.';
  };

  const updateStep = (index: number, updates: Partial<TestStep>) => {
    setSteps(prev => {
      const newSteps = [...prev];
      newSteps[index] = { ...newSteps[index], ...updates };
      return newSteps;
    });
  };

  const truncateResponse = (obj: any): string => {
    const json = JSON.stringify(obj, null, 2);
    if (json.length > 400) {
      return json.substring(0, 397) + '...';
    }
    return json;
  };

  const runTests = async () => {
    setIsRunning(true);
    const diag: any[] = [];

    // Reset steps
    setSteps(prev => prev.map(s => ({ ...s, status: 'pending', httpStatus: undefined, response: undefined, error: undefined, hint: undefined })));

    // Step 1: Health Check
    updateStep(0, { status: 'running' });
    try {
      const { data, error } = await supabase.functions.invoke('maigret-health-check', {
        body: {},
      });

      const isSuccess = !error && data?.status === 'healthy';
      const httpStatus = data?.statusCode || (error ? 503 : 200);

      diag.push({
        step: 'Health Check',
        request: { endpoint: '/maigret-health-check', method: 'GET' },
        response: { status: httpStatus, body: data || error },
      });

      if (isSuccess) {
        updateStep(0, { 
          status: 'pass', 
          httpStatus, 
          response: data 
        });
      } else {
        const hint = getErrorHint(httpStatus, 'health');
        updateStep(0, { 
          status: 'fail', 
          httpStatus, 
          response: data || error, 
          error: error?.message || 'Health check failed',
          hint 
        });
      }
    } catch (err: any) {
      diag.push({
        step: 'Health Check',
        request: { endpoint: '/maigret-health-check', method: 'GET' },
        response: { error: err.message },
      });
      updateStep(0, { 
        status: 'fail', 
        error: err.message, 
        hint: getErrorHint(0, 'health') 
      });
    }

    // Step 2: Scan Start
    updateStep(1, { status: 'running' });
    const batchId = crypto.randomUUID();
    try {
      const { data, error } = await supabase.functions.invoke('scan-start', {
        body: {
          username: 'selftest',
          batch_id: batchId,
        },
        headers: {
          'X-Selftest-Key': 'test-key-12345',
        },
      });

      const isSuccess = !error && data?.job_id;
      const httpStatus = error ? 500 : 201;

      diag.push({
        step: 'Scan Start',
        request: { endpoint: '/scan-start', method: 'POST', body: { username: 'selftest', batch_id: batchId } },
        response: { status: httpStatus, body: data || error },
      });

      if (isSuccess) {
        updateStep(1, { 
          status: 'pass', 
          httpStatus, 
          response: data 
        });
      } else {
        const hint = getErrorHint(httpStatus, 'scan');
        updateStep(1, { 
          status: 'fail', 
          httpStatus, 
          response: data || error, 
          error: error?.message || 'Scan start failed',
          hint 
        });
      }
    } catch (err: any) {
      diag.push({
        step: 'Scan Start',
        request: { endpoint: '/scan-start', method: 'POST', body: { username: 'selftest', batch_id: batchId } },
        response: { error: err.message },
      });
      updateStep(1, { 
        status: 'fail', 
        error: err.message, 
        hint: getErrorHint(0, 'scan') 
      });
    }

    // Step 3: Webhook Write
    updateStep(2, { status: 'running' });
    try {
      const { data, error } = await supabase.functions.invoke('selftest-webhook', {
        body: {},
        headers: {
          'X-Selftest-Key': 'test-key-12345',
        },
      });

      const isSuccess = !error && data?.ok;
      const httpStatus = data?.status || (error ? 500 : 200);

      diag.push({
        step: 'Webhook Write',
        request: { endpoint: '/selftest-webhook', method: 'POST', headers: { 'X-Selftest-Key': '[REDACTED]' } },
        response: { status: httpStatus, body: data || error },
      });

      if (isSuccess) {
        updateStep(2, { 
          status: 'pass', 
          httpStatus, 
          response: data 
        });
      } else {
        const hint = getErrorHint(httpStatus, 'webhook');
        updateStep(2, { 
          status: 'fail', 
          httpStatus, 
          response: data || error, 
          error: error?.message || 'Webhook write failed',
          hint 
        });
      }
    } catch (err: any) {
      diag.push({
        step: 'Webhook Write',
        request: { endpoint: '/selftest-webhook', method: 'POST', headers: { 'X-Selftest-Key': '[REDACTED]' } },
        response: { error: err.message },
      });
      updateStep(2, { 
        status: 'fail', 
        error: err.message, 
        hint: getErrorHint(0, 'webhook') 
      });
    }

    setDiagnostics(diag);
    setIsRunning(false);
  };

  const copyDiagnostics = () => {
    const text = JSON.stringify(diagnostics, null, 2);
    navigator.clipboard.writeText(text);
    toast({
      title: 'Diagnostics Copied',
      description: 'Test diagnostics copied to clipboard',
    });
  };

  const passedCount = steps.filter(s => s.status === 'pass').length;
  const failedCount = steps.filter(s => s.status === 'fail').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simple Maigret Pipeline Self-Test</CardTitle>
        <CardDescription>
          End-to-end validation of the Maigret integration
        </CardDescription>
        
        {(passedCount > 0 || failedCount > 0) && (
          <div className="flex gap-2 mt-4">
            <Badge variant="default" className="bg-green-500">
              {passedCount} Passed
            </Badge>
            {failedCount > 0 && (
              <Badge variant="destructive">
                {failedCount} Failed
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Button
            onClick={runTests}
            disabled={isRunning}
          >
            {isRunning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Run Self-Test
          </Button>
          
          {diagnostics.length > 0 && (
            <Button
              variant="outline"
              onClick={copyDiagnostics}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Diagnostics
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {step.status === 'running' && (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  )}
                  {step.status === 'pass' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {step.status === 'fail' && (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  {step.status === 'pending' && (
                    <div className="h-5 w-5 rounded-full border-2 border-muted" />
                  )}
                  <div>
                    <div className="font-medium">{step.name}</div>
                    <div className="text-sm text-muted-foreground">{step.description}</div>
                  </div>
                </div>
                
                {step.httpStatus !== undefined && (
                  <Badge variant={step.status === 'pass' ? 'default' : 'destructive'}>
                    HTTP {step.httpStatus}
                  </Badge>
                )}
              </div>

              {step.hint && (
                <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-2 rounded">
                  💡 {step.hint}
                </div>
              )}

              {step.response && (
                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                  {truncateResponse(step.response)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
