import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SelfTestConfigStatus } from './SelfTestConfigStatus';

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
      name: 'Step 0: Secret Configuration Check',
      description: 'Validate SELFTEST_KEY matches between frontend and backend',
      status: 'pending',
    },
    {
      name: 'Step 1: Health Check',
      description: 'Expects: Worker health diagnostics via edge function',
      status: 'pending',
    },
    {
      name: 'Step 2: Scan Initiation',
      description: 'POST /scan with username:"selftest" (expect status completed)',
      status: 'pending',
    },
    {
      name: 'Step 3: Results Verification',
      description: 'Verify last row in maigret_results for current user',
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

    // Step 0: Secret Configuration Check
    updateStep(0, { status: 'running' });
    try {
      const { data: configData, error: configError } = await supabase.functions.invoke('validate-selftest-key', {
        body: { test_key: 'test-key-12345' }
      });

      if (configError) throw configError;

      diag.push({
        step: 'Step 0: Secret Configuration Check',
        request: { endpoint: 'POST /validate-selftest-key', method: 'POST', body: { test_key: 'test-key-12345' } },
        response: { status: 200, body: configData },
      });

      if (!configData.valid) {
        const hint = `SELFTEST_KEY mismatch! Backend expects: ${configData.expected_key_prefix}, received: ${configData.received_key_prefix}. Update SELFTEST_KEY in backend to: test-key-12345`;
        updateStep(0, { 
          status: 'fail', 
          httpStatus: 200, 
          response: configData, 
          error: 'Configuration mismatch',
          hint 
        });
        setIsRunning(false);
        setDiagnostics(diag);
        toast({
          title: 'Configuration Error',
          description: 'SELFTEST_KEY validation failed - cannot proceed with tests',
          variant: 'destructive',
        });
        return; // Block remaining tests
      }

      updateStep(0, { 
        status: 'pass', 
        httpStatus: 200, 
        response: { valid: true, message: configData.message } 
      });
    } catch (err: any) {
      diag.push({
        step: 'Step 0: Secret Configuration Check',
        request: { endpoint: 'POST /validate-selftest-key', method: 'POST' },
        response: { error: err.message },
      });
      updateStep(0, { 
        status: 'fail', 
        error: err.message, 
        hint: 'Failed to validate configuration - check if validate-selftest-key function is deployed' 
      });
      setIsRunning(false);
      setDiagnostics(diag);
      toast({
        title: 'Configuration Check Failed',
        description: 'Could not validate SELFTEST_KEY',
        variant: 'destructive',
      });
      return; // Block remaining tests
    }

    // Step 1: Health Check - GET /healthz
    updateStep(1, { status: 'running' });
    try {
      const { data, error } = await supabase.functions.invoke('maigret-health-check');

      const isSuccess = !error && data?.status === 'healthy';
      const httpStatus = data?.statusCode || (error ? 503 : 200);

      diag.push({
        step: 'Step 1: Health Check',
        request: { endpoint: 'GET /healthz', method: 'GET' },
        response: { status: httpStatus, body: data || error },
      });

      if (isSuccess) {
        updateStep(1, { 
          status: 'pass', 
          httpStatus, 
          response: { 
            ok: data.ok || true,
            worker_url: data.worker_url,
            maigret_in_path: data.maigret_in_path,
            maigret_version: data.maigret_version,
          } 
        });
      } else {
        const hint = 'MAIGRET_WORKER_URL unreachable or health check not responding';
        updateStep(1, {
          status: 'fail', 
          httpStatus, 
          response: data || error, 
          error: error?.message || 'Health check failed',
          hint 
        });
      }
    } catch (err: any) {
      diag.push({
        step: 'Step 1: Health Check',
        request: { endpoint: 'GET /healthz', method: 'GET' },
        response: { error: err.message },
      });
      updateStep(1, {
        status: 'fail', 
        error: err.message, 
        hint: 'MAIGRET_WORKER_URL may be misconfigured' 
      });
    }

    // Step 2: Scan Initiation - POST /scan
    updateStep(2, { status: 'running' });
    const batchId = crypto.randomUUID();
    let jobId: string | null = null;

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
      const httpStatus = error ? (data?.status || 500) : 201;
      
      if (isSuccess) {
        jobId = data.job_id;
      }

      diag.push({
        step: 'Step 2: Scan Initiation',
        request: { endpoint: 'POST /scan', method: 'POST', body: { username: 'selftest', batch_id: batchId } },
        response: { status: httpStatus, body: data || error },
      });

      if (isSuccess) {
        updateStep(2, {
          status: 'pass', 
          httpStatus, 
          response: { job_id: data.job_id, status: data.status } 
        });
      } else {
        const hint = httpStatus === 401 || httpStatus === 403 
          ? 'WORKER_TOKEN mismatch between Supabase Edge and Cloud Run'
          : httpStatus === 404
          ? 'Worker route /scan not found - check MAIGRET_WORKER_SCAN_PATH'
          : httpStatus >= 500
          ? 'Worker crashed - check Cloud Run logs'
          : 'Scan initiation failed';
        
        updateStep(2, {
          status: 'fail', 
          httpStatus, 
          response: data || error, 
          error: error?.message || 'Scan initiation failed',
          hint 
        });
      }
    } catch (err: any) {
      diag.push({
        step: 'Step 2: Scan Initiation',
        request: { endpoint: 'POST /scan', method: 'POST', body: { username: 'selftest', batch_id: batchId } },
        response: { error: err.message },
      });
      updateStep(2, {
        status: 'fail', 
        error: err.message, 
        hint: 'Network error or invalid request' 
      });
    }

    // Step 3: Results Verification - Use service-role-backed function to bypass RLS
    updateStep(3, { status: 'running' });
    
    // Wait 2 seconds for webhook to process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      if (!jobId) {
        throw new Error('No job_id from Step 2 - cannot verify results');
      }

      const { data: resultsData, error } = await supabase.functions.invoke('selftest-results-check', {
        body: { job_id: jobId },
        headers: { 'X-Selftest-Key': 'test-key-12345' },
      });

      const hasResults = !error && resultsData?.found === true;

      diag.push({
        step: 'Step 3: Results Verification',
        request: { endpoint: 'POST /selftest-results-check', method: 'POST', body: { job_id: jobId } },
        response: { status: hasResults ? 200 : 404, body: resultsData || error },
      });

      if (hasResults) {
        updateStep(3, {
          status: 'pass', 
          httpStatus: 200, 
          response: { 
            verified: true,
            latest_result: resultsData.row
          } 
        });
      } else {
        const hint = 'No results found in maigret_results table. Check: (1) RESULTS_WEBHOOK_TOKEN mismatch preventing webhook delivery, (2) Worker not calling webhook, (3) scan-results function error';
        updateStep(3, {
          status: 'fail', 
          httpStatus: 404, 
          response: { verified: false, error: error?.message },
          error: 'No results found in database',
          hint 
        });
      }
    } catch (err: any) {
      diag.push({
        step: 'Step 3: Results Verification',
        request: { endpoint: 'POST /selftest-results-check', method: 'POST' },
        response: { error: err.message },
      });
      updateStep(3, {
        status: 'fail', 
        error: err.message, 
        hint: 'Database query failed - likely no job_id from Step 2' 
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
    <div className="space-y-6">
      <SelfTestConfigStatus />
      
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
    </div>
  );
}
