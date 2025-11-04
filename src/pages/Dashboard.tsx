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
  Zap,
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

        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-mesh border-b border-border/50">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          
          <div className="relative max-w-7xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm font-medium text-primary">Live Protection Active</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Security Dashboard
                </h1>
                <p className="text-lg text-muted-foreground">
                  Monitor your digital footprint and OSINT findings in real-time
                </p>
              </div>

              <div className="hidden md:flex gap-3">
                <Button
                  onClick={() => navigate('/graph')}
                  variant="outline"
                  className="shadow-lg hover:shadow-glow transition-all duration-300"
                >
                  <Network className="h-4 w-4 mr-2" />
                  Entity Graph
                </Button>
                <Button
                  onClick={() => navigate('/scan/advanced')}
                  variant="outline"
                  className="shadow-lg shadow-accent/20 hover:shadow-glow hover:border-accent transition-all duration-300"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Advanced Scan
                </Button>
                <Button
                  onClick={() => navigate('/scan')}
                  className="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start New Scan
                </Button>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="relative overflow-hidden group hover:shadow-elevated transition-all duration-300 border-border/50 hover:border-primary/30">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <FileSearch className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold bg-gradient-to-br from-foreground to-primary bg-clip-text text-transparent">
                    {stats.totalScans}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All-time scans completed
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden group hover:shadow-elevated transition-all duration-300 border-border/50 hover:border-destructive/30">
                <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium">High Risk Findings</CardTitle>
                  <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-destructive">
                    {stats.highRiskFindings}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Requires immediate attention
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden group hover:shadow-elevated transition-all duration-300 border-border/50 hover:border-accent/30">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium">Recent Scans</CardTitle>
                  <div className="p-2 rounded-lg bg-accent/10 text-accent">
                    <Clock className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold bg-gradient-to-br from-foreground to-accent bg-clip-text text-transparent">
                    {stats.recentFindings}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Started in last 24 hours
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Scans */}
            <Card className="border-border/50 shadow-card">
              <CardHeader className="border-b border-border/50 bg-gradient-to-r from-card to-card/50">
                <CardTitle className="text-xl">Recent Scans</CardTitle>
                <CardDescription>
                  Your latest OSINT investigations and their results
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading scans...
                  </div>
                ) : scans.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="relative inline-block mb-6">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                      <div className="relative p-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
                        <FileSearch className="h-12 w-12 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                      No scans yet
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Start your first OSINT scan to discover your digital footprint and protect your privacy
                    </p>
                    <Button 
                      onClick={() => navigate('/scan')}
                      className="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Your First Scan
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scans.map((scan) => (
                      <div
                        key={scan.id}
                        className="group relative flex items-center justify-between p-5 rounded-xl border border-border/50 hover:border-primary/30 bg-gradient-to-r from-card to-card/50 hover:shadow-glow transition-all duration-300 cursor-pointer hover:-translate-y-1"
                        onClick={() => navigate(`/results/${scan.id}`)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                        <div className="flex-1 relative z-10">
                          <div className="flex items-center gap-3 mb-2">
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
                          <p className="font-semibold text-lg mb-1">{getTarget(scan)}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            {format(new Date(scan.created_at), 'MMM d, yyyy h:mm a')}
                            {(scan.high_risk_count || 0) > 0 && (
                              <span className="ml-2 text-destructive">
                                • {scan.high_risk_count} high risk findings
                              </span>
                            )}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="relative z-10 hover:bg-primary/10 hover:text-primary transition-colors"
                        >
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
