import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, TrendingDown, CheckCircle2, XCircle, Clock, Database, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface BrokerStats {
  sourceName: string;
  total: number;
  completed: number;
  failed: number;
  pending: number;
  inProgress: number;
  successRate: number;
  avgCompletionTime?: number;
}

interface RemovalSuccessTrackerProps {
  userId?: string;
}

export const RemovalSuccessTracker = ({ userId }: RemovalSuccessTrackerProps) => {
  const { toast } = useToast();
  const [brokerStats, setBrokerStats] = useState<BrokerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallStats, setOverallStats] = useState({
    totalRequests: 0,
    completedRequests: 0,
    failedRequests: 0,
    pendingRequests: 0,
    overallSuccessRate: 0,
  });

  useEffect(() => {
    if (userId) {
      fetchRemovalStats();
    }
  }, [userId]);

  const fetchRemovalStats = async () => {
    try {
      setLoading(true);

      // Fetch all removal requests for this user
      const { data: requests, error } = await supabase
        .from('removal_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (error) throw error;

      if (!requests || requests.length === 0) {
        setBrokerStats([]);
        setOverallStats({
          totalRequests: 0,
          completedRequests: 0,
          failedRequests: 0,
          pendingRequests: 0,
          overallSuccessRate: 0,
        });
        setLoading(false);
        return;
      }

      // Group by source name and calculate stats
      const statsMap = new Map<string, BrokerStats>();

      requests.forEach((request) => {
        const sourceName = request.source_name;
        
        if (!statsMap.has(sourceName)) {
          statsMap.set(sourceName, {
            sourceName,
            total: 0,
            completed: 0,
            failed: 0,
            pending: 0,
            inProgress: 0,
            successRate: 0,
          });
        }

        const stats = statsMap.get(sourceName)!;
        stats.total++;

        switch (request.status) {
          case 'completed':
            stats.completed++;
            break;
          case 'failed':
            stats.failed++;
            break;
          case 'pending':
            stats.pending++;
            break;
          case 'in_progress':
            stats.inProgress++;
            break;
        }

        // Calculate success rate (completed / (completed + failed))
        const finalized = stats.completed + stats.failed;
        stats.successRate = finalized > 0 ? (stats.completed / finalized) * 100 : 0;
      });

      const statsArray = Array.from(statsMap.values()).sort((a, b) => b.total - a.total);
      setBrokerStats(statsArray);

      // Calculate overall stats
      const totalRequests = requests.length;
      const completedRequests = requests.filter(r => r.status === 'completed').length;
      const failedRequests = requests.filter(r => r.status === 'failed').length;
      const pendingRequests = requests.filter(r => r.status === 'pending').length;
      const finalized = completedRequests + failedRequests;
      const overallSuccessRate = finalized > 0 ? (completedRequests / finalized) * 100 : 0;

      setOverallStats({
        totalRequests,
        completedRequests,
        failedRequests,
        pendingRequests,
        overallSuccessRate,
      });

    } catch (error) {
      console.error('Error fetching removal stats:', error);
      toast({
        title: 'Error loading statistics',
        description: 'Failed to fetch removal success rates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-500';
    if (rate >= 50) return 'hsl(45 93% 47%)';
    return 'text-destructive';
  };

  const getSuccessRateBg = (rate: number) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 50) return 'bg-yellow-500';
    return 'bg-destructive';
  };

  const pieData = [
    { name: 'Completed', value: overallStats.completedRequests, color: 'hsl(var(--accent))' },
    { name: 'Failed', value: overallStats.failedRequests, color: 'hsl(var(--destructive))' },
    { name: 'Pending', value: overallStats.pendingRequests, color: 'hsl(var(--muted))' },
  ].filter(item => item.value > 0);

  const barData = brokerStats.slice(0, 10).map(stat => ({
    name: stat.sourceName.length > 15 ? stat.sourceName.substring(0, 15) + '...' : stat.sourceName,
    'Success Rate': stat.successRate,
    'Total': stat.total,
  }));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Removal Success Tracker</CardTitle>
          <CardDescription>Loading statistics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (brokerStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Removal Success Tracker
          </CardTitle>
          <CardDescription>Track your data removal success rates by broker</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No removal requests yet</p>
            <p className="text-sm">Submit removal requests to see statistics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Removal Success Tracker
        </CardTitle>
        <CardDescription>
          Track your data removal success rates across {brokerStats.length} data brokers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-secondary/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <Database className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{overallStats.totalRequests}</div>
                <div className="text-xs text-muted-foreground">Total Requests</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-accent" />
                <div className="text-2xl font-bold text-accent">{overallStats.completedRequests}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <XCircle className="w-8 h-8 mx-auto mb-2 text-destructive" />
                <div className="text-2xl font-bold text-destructive">{overallStats.failedRequests}</div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className={`text-2xl font-bold ${getSuccessRateColor(overallStats.overallSuccessRate)}`}>
                  {overallStats.overallSuccessRate.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Success Rate</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <Card className="bg-gradient-to-br from-background via-background to-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Request Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {pieData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-xs text-muted-foreground">{entry.name}: {entry.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart - Top Brokers */}
          <Card className="bg-gradient-to-br from-background via-background to-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Top Brokers by Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData}>
                  <XAxis 
                    dataKey="name" 
                    style={{ fontSize: '10px' }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    style={{ fontSize: '10px' }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="Success Rate" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Broker List */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Broker Performance Details</h3>
          {brokerStats.map((broker, index) => (
            <Card key={index} className="bg-secondary/30 hover:bg-secondary/50 transition-colors">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" />
                    <span className="font-medium">{broker.sourceName}</span>
                    <Badge variant="outline" className="text-xs">
                      {broker.total} requests
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${getSuccessRateColor(broker.successRate)}`}>
                      {broker.successRate.toFixed(1)}%
                    </span>
                    {broker.successRate >= 80 ? (
                      <TrendingUp className="w-4 h-4 text-accent" />
                    ) : broker.successRate >= 50 ? (
                      <Clock className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                </div>
                
                <Progress 
                  value={broker.successRate} 
                  className="h-2 mb-2"
                />
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <div className="flex gap-3">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-accent" />
                      {broker.completed} completed
                    </span>
                    <span className="flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-destructive" />
                      {broker.failed} failed
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      {broker.pending + broker.inProgress} pending
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
