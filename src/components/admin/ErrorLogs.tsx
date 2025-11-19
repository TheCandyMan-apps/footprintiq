import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemError {
  id: string;
  error_code: string;
  error_message: string;
  function_name?: string;
  workspace_id?: string;
  user_id?: string;
  scan_id?: string;
  provider?: string;
  severity: 'info' | 'warn' | 'error' | 'critical';
  stack_trace?: string;
  metadata?: any;
  created_at: string;
}

export function ErrorLogs() {
  const [errors, setErrors] = useState<SystemError[]>([]);
  const [filteredErrors, setFilteredErrors] = useState<SystemError[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [functionFilter, setFunctionFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadErrors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [errors, severityFilter, functionFilter]);

  const loadErrors = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No session');
      }

      const params = new URLSearchParams();
      if (severityFilter !== 'all') params.set('severity', severityFilter);
      if (functionFilter !== 'all') params.set('function_name', functionFilter);

      const { data, error } = await supabase.functions.invoke('admin-get-errors', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error) throw error;
      setErrors((data?.errors || []) as SystemError[]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load error logs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = errors;

    if (severityFilter !== 'all') {
      filtered = filtered.filter(e => e.severity === severityFilter);
    }

    if (functionFilter !== 'all') {
      filtered = filtered.filter(e => e.function_name === functionFilter);
    }

    setFilteredErrors(filtered);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warn':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 text-red-500';
      case 'error':
        return 'bg-red-500/10 text-red-500';
      case 'warn':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'info':
        return 'bg-blue-500/10 text-blue-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const uniqueFunctions = Array.from(new Set(errors.map(e => e.function_name).filter(Boolean)));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Error Logs</CardTitle>
            <CardDescription>Recent system errors and warnings</CardDescription>
          </div>
          <Badge variant="outline">{filteredErrors.length} errors</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warn">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
          <Select value={functionFilter} onValueChange={setFunctionFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Function" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Functions</SelectItem>
              {uniqueFunctions.map(fn => (
                <SelectItem key={fn} value={fn!}>
                  {fn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Error List */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading errors...</div>
        ) : filteredErrors.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No errors found matching your filters
          </div>
        ) : (
          <div className="space-y-3">
            {filteredErrors.map(error => (
              <div
                key={error.id}
                className="flex items-start gap-3 p-4 border rounded-lg"
              >
                {getSeverityIcon(error.severity)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getSeverityColor(error.severity)} variant="outline">
                      {error.severity}
                    </Badge>
                    <span className="text-sm font-mono text-muted-foreground">
                      {error.error_code}
                    </span>
                    {error.function_name && (
                      <Badge variant="secondary">{error.function_name}</Badge>
                    )}
                    {error.provider && (
                      <Badge variant="outline">{error.provider}</Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium mb-1">{error.error_message}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(error.created_at)}
                  </p>
                  {error.metadata && Object.keys(error.metadata).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer hover:underline">
                        View metadata
                      </summary>
                      <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-x-auto">
                        {JSON.stringify(error.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}