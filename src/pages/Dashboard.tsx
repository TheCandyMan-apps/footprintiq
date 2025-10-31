import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Network,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  FileSearch,
} from 'lucide-react';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type Scan = Database['public']['Tables']['scans']['Row'];

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalScans: 0,
    highRiskFindings: 0,
    recentFindings: 0,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
      fetchDashboardData(session.user.id);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchDashboardData = async (userId: string) => {
    setLoading(true);
    try {
      // Fetch recent scans
      const { data: scansData, error: scansError } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (scansError) throw scansError;
      setScans(scansData || []);

      // Calculate stats from scans
      const totalScans = scansData?.length || 0;
      const highRisk = scansData?.reduce((sum, scan) => sum + (scan.high_risk_count || 0), 0) || 0;
      
      // Count recent scans (last 24 hours)
      const recent = scansData?.filter(scan => {
        const createdDate = new Date(scan.created_at);
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return createdDate > dayAgo;
      }).length || 0;

      setStats({
        totalScans,
        highRiskFindings: highRisk,
        recentFindings: recent,
      });
    } catch (error: any) {
      console.error('Dashboard fetch error:', error);
      toast({
        title: 'Error loading dashboard',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTarget = (scan: Scan) => {
    return scan.email || scan.phone || scan.username || 'Unknown target';
  };

  const getRiskColor = (scan: Scan) => {
    const highRisk = scan.high_risk_count || 0;
    if (highRisk > 5) return 'destructive';
    if (highRisk > 0) return 'secondary';
    return 'default';
  };

  const getRiskScore = (scan: Scan) => {
    return scan.privacy_score || 0;
  };

  if (!user) return null;

  return (
    <>
      <SEO
        title="Dashboard — FootprintIQ"
        description="View your OSINT scans, findings, and entity relationships"
        canonical="https://footprintiq.app/dashboard"
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
            {/* Header with Actions */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-muted-foreground">
                  Monitor your digital footprint and OSINT findings
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => navigate('/graph')}
                  variant="outline"
                >
                  <Network className="h-4 w-4 mr-2" />
                  Entity Graph
                </Button>
                <Button
                  onClick={() => navigate('/scan')}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start New Scan
                </Button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
                  <FileSearch className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalScans}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All-time scans completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">High Risk Findings</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.highRiskFindings}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Requires immediate attention
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recent Scans</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.recentFindings}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Started in last 24 hours
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Scans */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Scans</CardTitle>
                <CardDescription>
                  Your latest OSINT investigations and their results
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading scans...
                  </div>
                ) : scans.length === 0 ? (
                  <div className="text-center py-12">
                    <FileSearch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No scans yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start your first OSINT scan to discover your digital footprint
                    </p>
                    <Button onClick={() => navigate('/scan')}>
                      <Play className="h-4 w-4 mr-2" />
                      Start Your First Scan
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scans.map((scan) => (
                      <div
                        key={scan.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/results/${scan.id}`)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <Badge variant="outline" className="capitalize">
                              {scan.scan_type}
                            </Badge>
                            <Badge variant="default">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                            {scan.privacy_score !== undefined && scan.privacy_score !== null && (
                              <Badge variant={getRiskColor(scan)}>
                                Privacy Score: {scan.privacy_score}
                              </Badge>
                            )}
                          </div>
                          <p className="font-medium">{getTarget(scan)}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(scan.created_at), 'MMM d, yyyy h:mm a')}
                            {(scan.high_risk_count || 0) > 0 && (
                              <span className="ml-2 text-destructive">
                                • {scan.high_risk_count} high risk findings
                              </span>
                            )}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Dashboard;
