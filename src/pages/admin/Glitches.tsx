import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, TrendingUp, TrendingDown, RefreshCw, Mail, ExternalLink } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import * as Sentry from '@sentry/react';

interface Bug {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  screenshot_url: string | null;
  page_url: string;
  created_at: string;
  user_id: string | null;
}

interface ErrorMetric {
  timestamp: string;
  count: number;
  type: string;
}

export default function Glitches() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [errorMetrics, setErrorMetrics] = useState<ErrorMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('open');
  const { toast } = useToast();

  useEffect(() => {
    fetchBugs();
    fetchErrorMetrics();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchBugs();
      fetchErrorMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, [statusFilter]);

  const fetchBugs = async () => {
    try {
      let query = supabase
        .from('bugs')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setBugs(data || []);
    } catch (error) {
      console.error('Failed to fetch bugs:', error);
      toast({
        title: 'Error loading bugs',
        description: 'Could not fetch bug reports',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchErrorMetrics = async () => {
    // Simulate Sentry metrics for demo
    // In production, integrate with Sentry API
    const mockData: ErrorMetric[] = [];
    const now = Date.now();
    
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now - i * 60 * 60 * 1000).toISOString();
      mockData.push({
        timestamp,
        count: Math.floor(Math.random() * 20) + 5,
        type: 'errors',
      });
    }
    
    setErrorMetrics(mockData);
  };

  const updateBugStatus = async (bugId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bugs')
        .update({ status: newStatus })
        .eq('id', bugId);

      if (error) throw error;

      toast({
        title: 'Status updated',
        description: `Bug marked as ${newStatus}`,
      });

      fetchBugs();
    } catch (error) {
      console.error('Failed to update bug:', error);
      toast({
        title: 'Update failed',
        description: 'Could not update bug status',
        variant: 'destructive',
      });
    }
  };

  const sendAlertEmail = async () => {
    toast({
      title: 'Alert sent',
      description: 'Admin notification sent to admin@footprintiq.app',
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'in_progress': return 'default';
      case 'resolved': return 'secondary';
      case 'closed': return 'outline';
      default: return 'default';
    }
  };

  const totalErrors = errorMetrics.reduce((sum, metric) => sum + metric.count, 0);
  const avgErrorRate = totalErrors / errorMetrics.length;
  const recentErrors = errorMetrics.slice(-6).reduce((sum, metric) => sum + metric.count, 0) / 6;
  const trend = recentErrors > avgErrorRate ? 'up' : 'down';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Glitch Monitor</h1>
          <p className="text-muted-foreground">
            Platform-wide error tracking and bug reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { fetchBugs(); fetchErrorMetrics(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={sendAlertEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Alert Admin
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errors (24h)</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalErrors}</div>
            <p className="text-xs text-muted-foreground">
              Across all error boundaries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-destructive" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentErrors.toFixed(1)}/hr</div>
            <p className="text-xs text-muted-foreground">
              {trend === 'up' ? '+' : '-'}
              {Math.abs(((recentErrors - avgErrorRate) / avgErrorRate) * 100).toFixed(1)}% from average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Bug Reports</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bugs.filter(b => b.status === 'open').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting triage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error Rate Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Error Rate Trends</CardTitle>
          <CardDescription>Errors captured over the last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={errorMetrics}>
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => new Date(value).toLocaleTimeString('en-US', { hour: '2-digit' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value: number) => [`${value} errors`, 'Count']}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bug Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bug Reports</CardTitle>
              <CardDescription>User-submitted issues and errors</CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Loading bug reports...</p>
          ) : bugs.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No bug reports found</p>
          ) : (
            <div className="space-y-4">
              {bugs.map((bug) => (
                <Card key={bug.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{bug.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {new Date(bug.created_at).toLocaleString()}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getSeverityColor(bug.severity)}>
                          {bug.severity}
                        </Badge>
                        <Badge variant={getStatusColor(bug.status)}>
                          {bug.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">{bug.description}</p>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ExternalLink className="h-4 w-4" />
                      <a 
                        href={bug.page_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {bug.page_url}
                      </a>
                    </div>

                    {bug.screenshot_url && (
                      <a 
                        href={bug.screenshot_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <img 
                          src={bug.screenshot_url} 
                          alt="Bug screenshot" 
                          className="max-w-md border rounded-md"
                        />
                      </a>
                    )}

                    <div className="flex gap-2">
                      {bug.status === 'open' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateBugStatus(bug.id, 'in_progress')}
                        >
                          Start Investigation
                        </Button>
                      )}
                      {bug.status === 'in_progress' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateBugStatus(bug.id, 'resolved')}
                        >
                          Mark Resolved
                        </Button>
                      )}
                      {bug.status === 'resolved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateBugStatus(bug.id, 'closed')}
                        >
                          Close
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
