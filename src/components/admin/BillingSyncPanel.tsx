import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, UserX, Loader2, Ban } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BackfillResult {
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  email: string;
  status: 'synced' | 'created' | 'updated' | 'error' | 'no_user';
  message: string;
  workspaceId?: string;
}

interface BackfillResponse {
  results: BackfillResult[];
  summary: {
    total: number;
    synced: number;
    created: number;
    updated: number;
    errors: number;
    noUser: number;
  };
  dryRun: boolean;
}

export function BillingSyncPanel() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BackfillResult[] | null>(null);
  const [summary, setSummary] = useState<BackfillResponse['summary'] | null>(null);
  const [isDryRun, setIsDryRun] = useState(true);

  const runBackfill = async (dryRun: boolean) => {
    setLoading(true);
    setIsDryRun(dryRun);

    try {
      const { data, error } = await supabase.functions.invoke('admin-backfill-subscriptions', {
        body: { dryRun },
      });

      if (error) throw error;

      const response = data as BackfillResponse;
      setResults(response.results);
      setSummary(response.summary);

      if (dryRun) {
        toast.info(`Found ${response.summary.total} subscriptions to review`);
      } else {
        toast.success(`Synced ${response.summary.created + response.summary.updated} subscriptions`);
      }
    } catch (error) {
      console.error('Backfill error:', error);
      toast.error('Failed to run backfill: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: BackfillResult['status']) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'created':
      case 'updated':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'no_user':
        return <UserX className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: BackfillResult['status']) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      synced: 'secondary',
      created: 'default',
      updated: 'default',
      error: 'destructive',
      no_user: 'outline',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const needsSync = results?.filter(r => r.status === 'created' || r.status === 'updated') || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Billing Sync
        </CardTitle>
        <CardDescription>
          Sync Stripe subscriptions with database. Fixes users who paid but didn't get activated due to webhook failures.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={() => runBackfill(true)}
            disabled={loading}
            variant="outline"
          >
            {loading && isDryRun ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Scan for Mismatches
          </Button>
          {needsSync.length > 0 && (
            <Button
              onClick={() => runBackfill(false)}
              disabled={loading}
              variant="default"
            >
              {loading && !isDryRun ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Sync All ({needsSync.length})
            </Button>
          )}
        </div>

        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
            <div className="p-2 rounded-md bg-muted">
              <div className="font-medium">Total</div>
              <div className="text-2xl font-bold">{summary.total}</div>
            </div>
            <div className="p-2 rounded-md bg-green-500/10 text-green-700 dark:text-green-400">
              <div className="font-medium">Already Synced</div>
              <div className="text-2xl font-bold">{summary.synced}</div>
            </div>
            <div className="p-2 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400">
              <div className="font-medium">Need Sync</div>
              <div className="text-2xl font-bold">{summary.created + summary.updated}</div>
            </div>
            <div className="p-2 rounded-md bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
              <div className="font-medium">No User</div>
              <div className="text-2xl font-bold">{summary.noUser}</div>
            </div>
            <div className="p-2 rounded-md bg-red-500/10 text-red-700 dark:text-red-400">
              <div className="font-medium">Errors</div>
              <div className="text-2xl font-bold">{summary.errors}</div>
            </div>
          </div>
        )}

        {results && results.length > 0 && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Stripe Customer</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      {getStatusBadge(result.status)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{result.email}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {result.stripeCustomerId.slice(0, 20)}...
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{result.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {results?.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p>All subscriptions are synced!</p>
          </div>
        )}

        {!results && !loading && (
          <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
            <AlertTriangle className="h-8 w-8" />
            <p>Click "Scan for Mismatches" to check for unsynced subscriptions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
