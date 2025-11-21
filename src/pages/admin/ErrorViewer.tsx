import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, Info, RefreshCw, Download, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ErrorViewer() {
  const [filters, setFilters] = useState({
    severity: '',
    function_name: '',
    start_date: '',
    end_date: '',
  });
  const [limit] = useState(100);
  const [offset, setOffset] = useState(0);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-errors', filters, offset],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());
      
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.function_name) params.append('function_name', filters.function_name);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);

      const { data, error } = await supabase.functions.invoke('admin-get-errors', {
        method: 'GET',
      });

      if (error) throw error;
      return data;
    },
  });

  const deleteError = async (errorId: string) => {
    try {
      const { error } = await supabase
        .from('system_errors')
        .delete()
        .eq('id', errorId);

      if (error) throw error;
      
      toast.success('Error deleted');
      refetch();
    } catch (err) {
      toast.error('Failed to delete error');
      console.error(err);
    }
  };

  const exportToCSV = () => {
    if (!data?.errors) return;
    
    const csv = [
      ['Timestamp', 'Severity', 'Function', 'Error Code', 'Message'].join(','),
      ...data.errors.map((e: any) => [
        format(new Date(e.created_at), 'yyyy-MM-dd HH:mm:ss'),
        e.severity,
        e.function_name || '',
        e.error_code,
        `"${e.error_message.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `errors-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported to CSV');
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Error Viewer</h1>
          <p className="text-muted-foreground">Monitor and manage system errors</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {data?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Errors</CardDescription>
              <CardTitle className="text-3xl">{data.stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Last 24h</CardDescription>
              <CardTitle className="text-3xl">{data.stats.last24h}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Critical</CardDescription>
              <CardTitle className="text-3xl text-red-500">{data.stats.bySeverity.critical}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Errors</CardDescription>
              <CardTitle className="text-3xl text-orange-500">{data.stats.bySeverity.error}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={filters.severity} onValueChange={(v) => setFilters({ ...filters, severity: v })}>
              <SelectTrigger>
                <SelectValue placeholder="All Severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Function name..."
              value={filters.function_name}
              onChange={(e) => setFilters({ ...filters, function_name: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Top Error Codes */}
      {data?.topErrorCodes && data.topErrorCodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Error Codes (Last 24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.topErrorCodes.map((err: any) => (
                <Badge key={err.code} variant="outline">
                  {err.code} ({err.count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Errors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Error Log</CardTitle>
          <CardDescription>
            Showing {data?.errors?.length || 0} of {data?.total || 0} errors
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading errors...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">Failed to load errors</div>
          ) : !data?.errors?.length ? (
            <div className="text-center py-8 text-muted-foreground">No errors found</div>
          ) : (
            <div className="space-y-2">
              {data.errors.map((err: any) => (
                <div key={err.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getSeverityIcon(err.severity)}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{err.error_code}</Badge>
                          {err.function_name && (
                            <span className="text-sm text-muted-foreground">{err.function_name}</span>
                          )}
                        </div>
                        <p className="text-sm">{err.error_message}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(err.created_at), 'PPpp')}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteError(err.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {data && data.total > limit && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                {offset + 1} - {Math.min(offset + limit, data.total)} of {data.total}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= data.total}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
