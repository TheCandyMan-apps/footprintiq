import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Play, CheckCircle2, XCircle, AlertTriangle, Clock, Brain, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function Audit() {
  const [runningAudit, setRunningAudit] = useState(false);
  const [analyzingWithAI, setAnalyzingWithAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const queryClient = useQueryClient();

  // Fetch recent audit runs
  const { data: auditRuns, isLoading } = useQuery({
    queryKey: ['audit-runs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_suite_runs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  // Fetch latest audit results
  const { data: latestResults } = useQuery({
    queryKey: ['latest-audit-results', auditRuns?.[0]?.id],
    queryFn: async () => {
      if (!auditRuns?.[0]?.id) return null;

      const { data, error } = await supabase
        .from('audit_results')
        .select('*')
        .eq('test_suite_run_id', auditRuns[0].id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!auditRuns?.[0]?.id,
  });

  // AI Analysis mutation
  const analyzeWithAI = useMutation({
    mutationFn: async () => {
      if (!latestResults || !latestRun) {
        throw new Error('No audit data available for analysis');
      }

      setAnalyzingWithAI(true);
      
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('ai-glitch-detection', {
        body: {
          logs: latestResults,
          auditRun: latestRun
        }
      });

      if (analysisError) throw analysisError;

      // If should alert, send email
      if (analysisData.metadata.should_alert) {
        const failureRate = analysisData.metadata.failure_rate;
        
        await supabase.functions.invoke('send-glitch-alert', {
          body: {
            auditRun: latestRun,
            analysis: analysisData.analysis,
            failureRate
          }
        });

        toast.warning(`Alert sent to admin@footprintiq.app (${failureRate.toFixed(1)}% failure rate)`);
      }

      return analysisData;
    },
    onSuccess: (data) => {
      setAiAnalysis(data);
      setShowAnalysis(true);
      toast.success('AI analysis complete');
    },
    onError: (error: Error) => {
      toast.error(`AI analysis failed: ${error.message}`);
    },
    onSettled: () => {
      setAnalyzingWithAI(false);
    },
  });

  // Run audit mutation
  const runAudit = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('audit-scans', {});
      
      if (error) throw error;
      return data;
    },
    onMutate: () => {
      setRunningAudit(true);
      toast.info('Starting audit suite...');
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['audit-runs'] });
      queryClient.invalidateQueries({ queryKey: ['latest-audit-results'] });
      
      const successRate = data.success_rate;
      
      if (successRate >= 95) {
        toast.success(`✅ Audit passed! ${successRate}% success rate`);
      } else if (successRate >= 90) {
        toast.warning(`⚠️ Audit passed with warnings: ${successRate}% success rate`);
      } else {
        toast.error(`❌ Audit failed: ${successRate}% success rate`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Audit failed: ${error.message}`);
    },
    onSettled: () => {
      setRunningAudit(false);
    },
  });

  const latestRun = auditRuns?.[0];

  // Calculate statistics
  const categoryStats = latestResults?.reduce((acc, result) => {
    const category = result.test_category;
    if (!acc[category]) {
      acc[category] = { pass: 0, fail: 0, warning: 0 };
    }
    acc[category][result.status]++;
    return acc;
  }, {} as Record<string, { pass: number; fail: number; warning: number }>);

  const chartData = categoryStats
    ? Object.entries(categoryStats).map(([category, stats]) => ({
        category,
        passed: stats.pass,
        failed: stats.fail,
        warnings: stats.warning,
      }))
    : [];

  const statusData = latestRun
    ? [
        { name: 'Passed', value: latestRun.passed, color: 'hsl(var(--success))' },
        { name: 'Failed', value: latestRun.failed, color: 'hsl(var(--destructive))' },
        { name: 'Warnings', value: latestRun.warnings, color: 'hsl(var(--warning))' },
      ]
    : [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Glitch Audit System</h1>
          <p className="text-muted-foreground mt-2">
            Automated testing for premium reliability and error-free operation
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => analyzeWithAI.mutate()}
            disabled={analyzingWithAI || !latestResults || latestResults.length === 0}
            variant="outline"
            size="lg"
          >
            {analyzingWithAI ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                AI Analysis
              </>
            )}
          </Button>
          <Button
            onClick={() => runAudit.mutate()}
            disabled={runningAudit}
            size="lg"
          >
            {runningAudit ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Audit...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Audit Suite
              </>
            )}
          </Button>
        </div>
      </div>

      {/* AI Analysis Section */}
      {aiAnalysis && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <CardTitle>AI Glitch Detection Analysis</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {aiAnalysis.metadata.should_alert && (
                  <Badge variant="destructive" className="gap-1">
                    <Mail className="h-3 w-3" />
                    Alert Sent
                  </Badge>
                )}
                <Badge variant="outline">
                  Analyzed {new Date(aiAnalysis.metadata.analyzed_at).toLocaleString()}
                </Badge>
              </div>
            </div>
            <CardDescription>
              AI-powered pattern detection and recommendations using Grok
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiAnalysis.analysis.risk_assessment && (
              <div className={`p-4 rounded-lg border-l-4 ${
                aiAnalysis.analysis.risk_assessment === 'critical' ? 'bg-destructive/10 border-destructive' :
                aiAnalysis.analysis.risk_assessment === 'high' ? 'bg-warning/10 border-warning' :
                aiAnalysis.analysis.risk_assessment === 'medium' ? 'bg-yellow-500/10 border-yellow-500' :
                'bg-success/10 border-success'
              }`}>
                <p className="font-semibold">
                  Risk Assessment: {aiAnalysis.analysis.risk_assessment.toUpperCase()}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Failure Rate: {aiAnalysis.metadata.failure_rate.toFixed(2)}%
                </p>
              </div>
            )}

            {aiAnalysis.analysis.priority_issues && aiAnalysis.analysis.priority_issues.length > 0 && (
              <Collapsible defaultOpen>
                <CollapsibleTrigger className="flex items-center gap-2 font-semibold text-lg hover:underline">
                  🚨 Priority Issues ({aiAnalysis.analysis.priority_issues.length})
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2">
                  {aiAnalysis.analysis.priority_issues.map((issue: any, idx: number) => (
                    <div key={idx} className="p-3 bg-destructive/10 rounded border-l-4 border-destructive">
                      <p className="font-medium">{issue.description}</p>
                      <Badge variant="destructive" className="mt-1">{issue.severity}</Badge>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {aiAnalysis.analysis.patterns && aiAnalysis.analysis.patterns.length > 0 && (
              <Collapsible>
                <CollapsibleTrigger className="flex items-center gap-2 font-semibold text-lg hover:underline">
                  📊 Detected Patterns ({aiAnalysis.analysis.patterns.length})
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2">
                  {aiAnalysis.analysis.patterns.map((pattern: any, idx: number) => (
                    <div key={idx} className="p-3 bg-accent rounded">
                      <p>{pattern.description}</p>
                      <Badge variant="outline" className="mt-1">{pattern.severity}</Badge>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {aiAnalysis.analysis.anomalies && aiAnalysis.analysis.anomalies.length > 0 && (
              <Collapsible>
                <CollapsibleTrigger className="flex items-center gap-2 font-semibold text-lg hover:underline">
                  ⚠️ Anomalies ({aiAnalysis.analysis.anomalies.length})
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2">
                  {aiAnalysis.analysis.anomalies.map((anomaly: any, idx: number) => (
                    <div key={idx} className="p-3 bg-warning/10 rounded border-l-4 border-warning">
                      <p>{anomaly.description}</p>
                      <p className="text-sm text-muted-foreground mt-1">Impact: {anomaly.impact}</p>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {aiAnalysis.analysis.fixes && aiAnalysis.analysis.fixes.length > 0 && (
              <Collapsible>
                <CollapsibleTrigger className="flex items-center gap-2 font-semibold text-lg hover:underline">
                  🔧 Suggested Fixes ({aiAnalysis.analysis.fixes.length})
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-3">
                  {aiAnalysis.analysis.fixes.map((fix: any, idx: number) => (
                    <div key={idx} className="p-4 bg-primary/5 rounded border">
                      <p className="font-medium mb-2">{idx + 1}. {fix.description}</p>
                      {fix.steps && fix.steps.length > 0 && (
                        <ol className="list-decimal list-inside space-y-1 text-sm">
                          {fix.steps.map((step: string, stepIdx: number) => (
                            <li key={stepIdx} className="text-muted-foreground">{step}</li>
                          ))}
                        </ol>
                      )}
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {aiAnalysis.analysis.raw_analysis && !aiAnalysis.analysis.patterns && (
              <div className="p-4 bg-muted rounded">
                <p className="font-semibold mb-2">Raw Analysis:</p>
                <pre className="text-sm whitespace-pre-wrap">{aiAnalysis.analysis.raw_analysis}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Latest Run Summary */}
      {latestRun && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latestRun.success_rate?.toFixed(1)}%
              </div>
              <Progress value={latestRun.success_rate || 0} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tests Passed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {latestRun.passed}
              </div>
              <p className="text-xs text-muted-foreground">
                out of {latestRun.total_tests} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tests Failed</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {latestRun.failed}
              </div>
              <p className="text-xs text-muted-foreground">
                requires attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latestRun.duration_ms ? `${(latestRun.duration_ms / 1000).toFixed(1)}s` : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                execution time
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {latestResults && latestResults.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Test Results by Category</CardTitle>
              <CardDescription>Pass/fail breakdown across test categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="passed" fill="hsl(var(--success))" name="Passed" />
                  <Bar dataKey="failed" fill="hsl(var(--destructive))" name="Failed" />
                  <Bar dataKey="warnings" fill="hsl(var(--warning))" name="Warnings" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Overall Test Status</CardTitle>
              <CardDescription>Distribution of test outcomes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Results Details */}
      <Card>
        <CardHeader>
          <CardTitle>Latest Test Results</CardTitle>
          <CardDescription>Detailed breakdown of each test scenario</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : latestResults && latestResults.length > 0 ? (
            <div className="space-y-3">
              {latestResults.map((result) => (
                <div
                  key={result.id}
                  className="flex items-start justify-between border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {result.status === 'pass' && <CheckCircle2 className="h-4 w-4 text-success" />}
                      {result.status === 'fail' && <XCircle className="h-4 w-4 text-destructive" />}
                      {result.status === 'warning' && <AlertTriangle className="h-4 w-4 text-warning" />}
                      <span className="font-medium">{result.test_name}</span>
                      <Badge variant="outline">{result.test_category}</Badge>
                      <Badge
                        variant={
                          result.severity === 'critical'
                            ? 'destructive'
                            : result.severity === 'high'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {result.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Expected: {result.expected_behavior}
                    </p>
                    <p className="text-sm">
                      Actual: {result.actual_behavior}
                    </p>
                    {result.error_message && (
                      <p className="text-sm text-destructive">
                        Error: {result.error_message}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {result.duration_ms}ms
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No audit results yet. Run your first audit to see results.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit History */}
      <Card>
        <CardHeader>
          <CardTitle>Audit History</CardTitle>
          <CardDescription>Past audit runs and their outcomes</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : auditRuns && auditRuns.length > 0 ? (
            <div className="space-y-2">
              {auditRuns.map((run) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between border rounded-lg p-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        run.status === 'completed'
                          ? 'default'
                          : run.status === 'running'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {run.status}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(run.created_at).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {run.passed}/{run.total_tests} passed ({run.success_rate?.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {run.duration_ms ? `${(run.duration_ms / 1000).toFixed(1)}s` : 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No audit history available.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
