import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { trackPaymentError } from "@/lib/sentry";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";

interface AuditIssue {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  [key: string]: any;
}

interface AuditReport {
  timestamp: string;
  summary: {
    total_issues: number;
    critical: number;
    high: number;
    medium: number;
  };
  issues: AuditIssue[];
  stripe_stats: {
    total_payment_intents: number;
    failed_payments: number;
    total_events: number;
  };
  supabase_stats: {
    credits_transactions: number;
    paid_users: number;
  };
  rls_status: Record<string, string>;
}

export default function PaymentAudit() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [testingDecline, setTestingDecline] = useState(false);
  const { toast } = useToast();

  const runAudit = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('billing/payment-audit', {
        method: 'POST',
      });

      if (error) throw error;

      setReport(data);

      if (data.summary.total_issues === 0) {
        toast({
          title: "✅ Audit Complete",
          description: "0 critical glitches found. All payment systems operational.",
        });
      } else {
        toast({
          title: "⚠️ Issues Detected",
          description: `Found ${data.summary.total_issues} issues (${data.summary.critical} critical)`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Audit failed:', error);
      trackPaymentError(error instanceof Error ? error : 'Audit failed', {
        errorType: 'audit_failure',
      });
      toast({
        title: "Audit Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const simulateDecline = async () => {
    setTestingDecline(true);
    try {
      // Simulate a fake decline by creating a test payment error
      const { error } = await supabase
        .from('payment_errors')
        .insert({
          error_type: 'test_decline',
          error_message: 'Simulated card decline for testing',
          error_code: 'card_declined',
          stripe_error: {
            type: 'card_error',
            code: 'card_declined',
            decline_code: 'generic_decline',
          },
        });

      if (error) throw error;

      toast({
        title: "Test Decline Simulated",
        description: "Created a test payment decline. Run audit to see it.",
      });

      // Auto-run audit after 1 second
      setTimeout(() => runAudit(), 1000);
    } catch (error) {
      console.error('Test failed:', error);
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setTestingDecline(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <AdminBreadcrumb currentPage="Payment Audit" />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment System Audit</h1>
          <p className="text-muted-foreground">
            Comprehensive audit of Stripe and Supabase payment systems
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={simulateDecline}
            variant="outline"
            disabled={testingDecline || loading}
          >
            {testingDecline ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Simulating...
              </>
            ) : (
              'Simulate Decline'
            )}
          </Button>
          <Button onClick={runAudit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Audit...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Run Audit
              </>
            )}
          </Button>
        </div>
      </div>

      {report && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.summary.total_issues}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Critical</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {report.summary.critical}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">
                  {report.summary.high}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Medium Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">
                  {report.summary.medium}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Stripe Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Intents</span>
                  <span className="font-medium">{report.stripe_stats.total_payment_intents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Failed Payments</span>
                  <span className="font-medium">{report.stripe_stats.failed_payments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Webhook Events</span>
                  <span className="font-medium">{report.stripe_stats.total_events}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Supabase Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Credit Transactions</span>
                  <span className="font-medium">{report.supabase_stats.credits_transactions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid Users</span>
                  <span className="font-medium">{report.supabase_stats.paid_users}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>RLS Policy Status</CardTitle>
              <CardDescription>Row Level Security configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(report.rls_status).map(([table, status]) => (
                  <div key={table} className="flex items-center justify-between">
                    <span className="font-mono text-sm">{table}</span>
                    <Badge variant={status === 'RLS enabled' ? 'default' : 'destructive'}>
                      {status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {report.issues.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Detected Issues</CardTitle>
                <CardDescription>Issues requiring attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.issues.map((issue, idx) => (
                  <Alert key={idx} variant={issue.severity === 'critical' ? 'destructive' : 'default'}>
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(issue.severity)}
                      <div className="flex-1">
                        <AlertTitle className="flex items-center gap-2">
                          {issue.type.replace(/_/g, ' ').toUpperCase()}
                          <Badge variant={getSeverityColor(issue.severity)}>
                            {issue.severity}
                          </Badge>
                        </AlertTitle>
                        <AlertDescription className="mt-2 space-y-1">
                          {Object.entries(issue)
                            .filter(([key]) => !['type', 'severity'].includes(key))
                            .map(([key, value]) => (
                              <div key={key} className="text-sm">
                                <span className="font-medium">{key}:</span>{' '}
                                <span className="text-muted-foreground">
                                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </span>
                              </div>
                            ))}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>All Systems Operational</AlertTitle>
              <AlertDescription>
                No critical issues detected in payment systems. Last audited:{' '}
                {new Date(report.timestamp).toLocaleString()}
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
}
