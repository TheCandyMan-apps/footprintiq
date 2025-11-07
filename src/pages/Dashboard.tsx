import { FootprintDNA } from '@/components/FootprintDNA';
import { FootprintDNAModal } from '@/components/FootprintDNAModal';
import { RemovalQueue } from '@/components/RemovalQueue';
import { RemovalSuccessTracker } from '@/components/RemovalSuccessTracker';
import { DarkWebMonitorSettings } from '@/components/settings/DarkWebMonitorSettings';
import { InitializeDarkWebDemo } from '@/components/settings/InitializeDarkWebDemo';
import { StreakBadges } from '@/components/StreakBadges';
import { analyzeTrends } from '@/lib/trends';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { ScrollProgressBar } from '@/components/ScrollProgressBar';
import { ScrollToTop } from '@/components/ScrollToTop';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { ScheduledScansManager } from '@/components/ScheduledScansManager';
import { WebhookIntegrations } from '@/components/WebhookIntegrations';
import { ArchivedScans } from '@/components/ArchivedScans';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ThreatAnalyticsPanel } from '@/components/ThreatAnalyticsPanel';
import { SkeletonStatCard, SkeletonRecentScans } from '@/components/dashboard/SkeletonCard';
import { SkeletonThreatAnalytics } from '@/components/analytics/SkeletonAnalytics';
import { useWorkspace } from '@/hooks/useWorkspace';
import { shouldAutoStartTour, getTourAutoStartDelay, markTourTriggered } from '@/lib/tour/firstTime';
import { Play, Network, AlertTriangle, CheckCircle2, Clock, Eye, FileSearch, Zap, Shield, FileStack, TrendingUp, Activity, Users, Target, Webhook, Archive, X } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, ResponsiveContainer, LineChart, Line, XAxis, YAxis } from 'recharts';
import type { Database } from '@/integrations/supabase/types';
type Scan = Database['public']['Tables']['scans']['Row'];
const Dashboard = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    workspace
  } = useWorkspace();
  const [user, setUser] = useState<any>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScans, setSelectedScans] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({
    totalScans: 0,
    highRiskFindings: 0,
    recentFindings: 0,
    scansThisMonth: 0,
    avgScanTime: 0,
    activeMonitoring: 0
  });
  const [dnaMetrics, setDnaMetrics] = useState({
    score: 0,
    breaches: 0,
    exposures: 0,
    dataBrokers: 0,
    darkWeb: 0
  });
  const [isDNAModalOpen, setIsDNAModalOpen] = useState(false);
  const [trendData, setTrendData] = useState<any[]>([]);
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
      fetchDashboardData(session.user.id);

      // Check if this is a first-time user and should auto-start tour
      if (shouldAutoStartTour()) {
        markTourTriggered(); // Mark as triggered to prevent multiple redirects
        const timer = setTimeout(() => {
          navigate('/onboarding?tour=onboarding');
        }, getTourAutoStartDelay());
        return () => clearTimeout(timer);
      }
    };
    checkAuth();
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  const fetchDashboardData = async (userId: string) => {
    setLoading(true);
    try {
      // Fetch recent scans (excluding archived)
      const {
        data: scansData,
        error: scansError
      } = await supabase.from('scans').select('*').eq('user_id', userId).is('archived_at', null).order('created_at', {
        ascending: false
      }).limit(10);
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

      // Count scans this month
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const scansThisMonth = scansData?.filter(scan => new Date(scan.created_at) >= monthStart).length || 0;
      setStats({
        totalScans,
        highRiskFindings: highRisk,
        recentFindings: recent,
        scansThisMonth,
        avgScanTime: 2.4,
        // Mock for now
        activeMonitoring: 8 // Mock for now
      });

      // Calculate DNA metrics from all scans and their data sources
      if (scansData && scansData.length > 0) {
        // Get the most recent scan for DNA calculation
        const recentScan = scansData[0];

        // Fetch data sources for the recent scan
        const {
          data: sources
        } = await supabase.from('data_sources').select('*').eq('scan_id', recentScan.id);
        const breachCount = sources?.filter(s => s.category?.toLowerCase().includes('breach') || s.name?.toLowerCase().includes('breach')).length || 0;
        const dataBrokersCount = sources?.filter(s => s.category?.toLowerCase().includes('broker') || s.category?.toLowerCase().includes('people')).length || 0;
        const darkWebCount = sources?.filter(s => s.category?.toLowerCase().includes('dark') || s.name?.toLowerCase().includes('dark')).length || 0;
        setDnaMetrics({
          score: recentScan.privacy_score || 0,
          breaches: breachCount,
          exposures: (recentScan.high_risk_count || 0) + (recentScan.medium_risk_count || 0),
          dataBrokers: dataBrokersCount,
          darkWeb: darkWebCount
        });

        // Fetch trend data for this user
        const trends = await analyzeTrends(userId, 30);
        setTrendData(trends);
      }
    } catch (error: any) {
      console.error('Dashboard fetch error:', error);
      toast({
        title: 'Error loading dashboard',
        description: error.message,
        variant: 'destructive'
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
  const handleArchiveScan = async (scanId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const {
        error
      } = await supabase.from('scans').update({
        archived_at: new Date().toISOString()
      }).eq('id', scanId);
      if (error) throw error;
      toast({
        title: 'Scan archived',
        description: 'The scan has been moved to archives'
      });

      // Refresh dashboard data
      if (user) {
        fetchDashboardData(user.id);
      }
    } catch (error: any) {
      console.error('Archive scan error:', error);
      toast({
        title: 'Error archiving scan',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  const handleBulkArchive = async () => {
    if (selectedScans.size === 0) return;
    try {
      const {
        error
      } = await supabase.from('scans').update({
        archived_at: new Date().toISOString()
      }).in('id', Array.from(selectedScans));
      if (error) throw error;
      toast({
        title: `${selectedScans.size} scans archived`,
        description: 'The selected scans have been moved to archives'
      });
      setSelectedScans(new Set());

      // Refresh dashboard data
      if (user) {
        fetchDashboardData(user.id);
      }
    } catch (error: any) {
      console.error('Bulk archive error:', error);
      toast({
        title: 'Error archiving scans',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  const toggleScanSelection = (scanId: string) => {
    const newSelected = new Set(selectedScans);
    if (newSelected.has(scanId)) {
      newSelected.delete(scanId);
    } else {
      newSelected.add(scanId);
    }
    setSelectedScans(newSelected);
  };
  const toggleSelectAll = () => {
    if (selectedScans.size === scans.length) {
      setSelectedScans(new Set());
    } else {
      setSelectedScans(new Set(scans.map(s => s.id)));
    }
  };

  // Mock data for mini charts
  const monthlyTrendData = [{
    name: 'W1',
    value: 12
  }, {
    name: 'W2',
    value: 19
  }, {
    name: 'W3',
    value: 15
  }, {
    name: 'W4',
    value: stats.scansThisMonth || 8
  }];
  const riskTrendData = [{
    name: 'M1',
    value: 5
  }, {
    name: 'M2',
    value: 8
  }, {
    name: 'M3',
    value: 3
  }, {
    name: 'M4',
    value: stats.highRiskFindings > 10 ? 12 : 6
  }];
  const activityData = [{
    name: 'Mon',
    value: 4
  }, {
    name: 'Tue',
    value: 7
  }, {
    name: 'Wed',
    value: 5
  }, {
    name: 'Thu',
    value: 9
  }, {
    name: 'Fri',
    value: 6
  }, {
    name: 'Sat',
    value: 3
  }, {
    name: 'Sun',
    value: stats.recentFindings || 2
  }];
  if (!user) return null;
  return <>
      <InitializeDarkWebDemo />
      <SEO title="Dashboard — FootprintIQ" description="View your OSINT scans, findings, and entity relationships" canonical="https://footprintiq.app/dashboard" />
      <AnnouncementBar message="💡 Pro Tip: Use AI Analyst to get instant insights from your scan results." link="/ai-analyst" linkText="Try AI Analyst" storageKey="ai-analyst-dashboard-tip" variant="update" />
      <ScrollProgressBar />
      <div className="min-h-screen bg-background flex flex-col w-full animate-fadeIn">
        <Header />

        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-primary/20 to-background p-8 rounded-xl shadow-[var(--shadow-elevated)] mx-6 mt-6 animate-fade-in border border-primary/10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start justify-between gap-8">
              <div className="flex items-start gap-4 flex-1">
                {/* Digital Footprint Shield Icon */}
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-primary/20 rounded-lg blur-xl animate-pulse" />
                  <svg className="relative w-16 h-16 text-primary" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M32 4L8 16V28C8 42 18 54 32 60C46 54 56 42 56 28V16L32 4Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
                    <path d="M32 20V32M32 40H32.02" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="24" cy="48" r="2" fill="currentColor" fillOpacity="0.6" />
                    <circle cx="40" cy="48" r="2" fill="currentColor" fillOpacity="0.6" />
                    <circle cx="32" cy="52" r="2" fill="currentColor" fillOpacity="0.6" />
                  </svg>
                </div>

                {/* Heading and Subtitle */}
                <div className="space-y-2 transition-[var(--transition-smooth)]">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm font-medium text-primary">Live Protection Active</span>
                  </div>
                  <h1 className="text-3xl font-bold text-primary">FootprintIQ Dashboard</h1>
                  <p className="text-lg text-muted-foreground">
                    Monitor and protect your digital presence
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="hidden md:flex gap-3">
                <Button onClick={() => navigate('/graph')} variant="outline" className="shadow-lg hover:shadow-glow transition-[var(--transition-smooth)]">
                  <Network className="h-4 w-4 mr-2" />
                  Entity Graph
                </Button>
                <Button onClick={() => navigate('/scan/batch')} variant="outline" className="shadow-lg hover:shadow-glow transition-[var(--transition-smooth)]">
                  <FileStack className="h-4 w-4 mr-2" />
                  Batch Scan
                </Button>
                <Button onClick={() => navigate('/scan/advanced')} variant="outline" className="shadow-lg shadow-accent/20 hover:shadow-glow hover:border-accent transition-[var(--transition-smooth)]">
                  <Zap className="h-4 w-4 mr-2" />
                  Advanced Scan
                </Button>
                <Button onClick={() => navigate('/scan')} className="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-[var(--transition-smooth)] hover:scale-105">
                  <Play className="h-4 w-4 mr-2" />
                  Start New Scan
                </Button>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-6 mb-8">
                  <TabsTrigger value="overview" className="relative data-[state=active]:text-primary transition-smooth hover:text-primary/80 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-300">
                    <Activity className="h-4 w-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="relative data-[state=active]:text-primary transition-smooth hover:text-primary/80 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-300">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger value="scans" className="relative data-[state=active]:text-primary transition-smooth hover:text-primary/80 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-300">
                    <FileSearch className="h-4 w-4 mr-2" />
                    Recent Scans
                  </TabsTrigger>
                  <TabsTrigger value="scheduled" className="relative data-[state=active]:text-primary transition-smooth hover:text-primary/80 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-300">
                    <Clock className="h-4 w-4 mr-2" />
                    Scheduled
                  </TabsTrigger>
                  <TabsTrigger value="webhooks" className="relative data-[state=active]:text-primary transition-smooth hover:text-primary/80 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-300">
                    <Webhook className="h-4 w-4 mr-2" />
                    Webhooks
                  </TabsTrigger>
                  <TabsTrigger value="archived" className="relative data-[state=active]:text-primary transition-smooth hover:text-primary/80 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-300">
                    <Archive className="h-4 w-4 mr-2" />
                    Archived
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  {/* Enhanced Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Scans This Month */}
                    <div className="flex items-center gap-4 p-4 bg-secondary rounded-md hover:bg-secondary/80 transition-smooth group">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                        <Target className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Scans This Month</p>
                        <p className="text-2xl font-bold animate-pulse text-accent">{stats.scansThisMonth}</p>
                      </div>
                      <div className="w-20 h-12">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={monthlyTrendData}>
                            <Bar dataKey="value" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* High Risk Findings */}
                    <div className="flex items-center gap-4 p-4 bg-secondary rounded-md hover:bg-secondary/80 transition-smooth group">
                      <div className="p-3 rounded-lg bg-destructive/10 text-destructive group-hover:scale-110 transition-transform duration-300">
                        <AlertTriangle className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">High Risk Findings</p>
                        <p className="text-2xl font-bold animate-pulse text-destructive">{stats.highRiskFindings}</p>
                      </div>
                      <div className="w-20 h-12">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={riskTrendData}>
                            <Bar dataKey="value" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Total Scans */}
                    <div className="flex items-center gap-4 p-4 bg-secondary rounded-md hover:bg-secondary/80 transition-smooth group">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                        <FileSearch className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Total Scans</p>
                        <p className="text-2xl font-bold text-accent">{stats.totalScans}</p>
                      </div>
                      <div className="w-20 h-12">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={activityData}>
                            <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Weekly Activity */}
                    <div className="flex items-center gap-4 p-4 bg-secondary rounded-md hover:bg-secondary/80 transition-smooth group">
                      <div className="p-3 rounded-lg bg-accent/10 text-accent group-hover:scale-110 transition-transform duration-300">
                        <Activity className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Recent Activity</p>
                        <p className="text-2xl font-bold animate-pulse text-accent">{stats.recentFindings}</p>
                      </div>
                      <div className="w-20 h-12">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={activityData}>
                            <Line type="monotone" dataKey="value" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Avg Scan Time */}
                    <div className="flex items-center gap-4 p-4 bg-secondary rounded-md hover:bg-secondary/80 transition-smooth group">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Avg Scan Time</p>
                        <p className="text-2xl font-bold text-accent">{stats.avgScanTime}s</p>
                      </div>
                      <div className="w-20 h-12">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[{
                        v: 2.1
                      }, {
                        v: 2.4
                      }, {
                        v: 2.2
                      }, {
                        v: 2.4
                      }]}>
                            <Bar dataKey="v" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Active Monitoring */}
                    <div className="flex items-center gap-4 p-4 bg-secondary rounded-md hover:bg-secondary/80 transition-smooth group">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                        <Shield className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Active Monitoring</p>
                        <p className="text-2xl font-bold animate-pulse text-accent">{stats.activeMonitoring}</p>
                      </div>
                      <div className="w-20 h-12">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[{
                        v: 6
                      }, {
                        v: 7
                      }, {
                        v: 8
                      }, {
                        v: 8
                      }]}>
                            <Bar dataKey="v" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Footprint DNA Card */}
                  {scans.length > 0 && <div className="mb-8">
                      <FootprintDNA score={dnaMetrics.score} breaches={dnaMetrics.breaches} exposures={dnaMetrics.exposures} dataBrokers={dnaMetrics.dataBrokers} darkWeb={dnaMetrics.darkWeb} trendData={trendData} onOpenDetails={() => setIsDNAModalOpen(true)} />

                      <FootprintDNAModal open={isDNAModalOpen} onOpenChange={setIsDNAModalOpen} trendData={trendData} currentScore={dnaMetrics.score} />
                    </div>}

                  {/* Quick Actions */}
                  <Card className="group relative overflow-hidden rounded-lg bg-card p-6 shadow-card hover:shadow-glow transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        Quick Actions
                      </CardTitle>
                      <CardDescription>Start scanning or manage your security</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button onClick={() => navigate('/scan')} className="w-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105">
                          <Play className="h-4 w-4 mr-2" />
                          Quick Scan
                        </Button>
                        <Button onClick={() => navigate('/scan/batch')} variant="outline" className="w-full shadow-lg hover:shadow-glow transition-all duration-300">
                          <FileStack className="h-4 w-4 mr-2" />
                          Batch Scan
                        </Button>
                        <Button onClick={() => navigate('/graph')} variant="outline" className="w-full shadow-lg hover:shadow-glow transition-all duration-300">
                          <Network className="h-4 w-4 mr-2" />
                          View Graph
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Two Column Layout for Streak & Removal Queue */}
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Streak & Badges Sidebar */}
                    <div className="md:col-span-1">
                      <StreakBadges userId={user?.id} />
                    </div>

                    {/* Removal Queue & Success Tracker */}
                    <div className="md:col-span-2 space-y-6">
                      <RemovalQueue userId={user.id} />
                      <RemovalSuccessTracker userId={user.id} />
                    </div>
                  </div>

                  {/* Dark Web Monitor Settings */}
                  <DarkWebMonitorSettings />
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">

                  {/* Threat Analytics */}
                  {loading ? <SkeletonThreatAnalytics /> : <ThreatAnalyticsPanel />}
                </TabsContent>

                {/* Scans Tab */}
                <TabsContent value="scans" className="space-y-6">
            {loading ? <SkeletonRecentScans /> : <Card className="group relative overflow-hidden rounded-lg bg-card p-6 shadow-card hover:shadow-glow hover:scale-105 transition-all duration-500">
              <CardHeader className="border-b border-border/50 bg-gradient-to-r from-card to-card/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                    <FileSearch className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Recent Scans</CardTitle>
                    <CardDescription>
                      Your latest OSINT investigations and their results
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Bulk Actions Bar */}
                {selectedScans.size > 0 && <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        {selectedScans.size} scan{selectedScans.size !== 1 ? 's' : ''} selected
                      </span>
                      <Button variant="outline" size="sm" onClick={() => setSelectedScans(new Set())}>
                        <X className="h-4 w-4 mr-2" />
                        Clear
                      </Button>
                    </div>
                    <Button variant="default" size="sm" onClick={handleBulkArchive}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive Selected
                    </Button>
                  </div>}

                {scans.length === 0 ? <div className="text-center py-16">
                    <div className="relative inline-block mb-6">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                      <div className="relative p-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 group-hover:border-primary/50 transition-colors">
                        <Shield className="h-12 w-12 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                      Scan Your Digital Footprint
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Start your first OSINT scan to discover your digital footprint and protect your privacy across the web
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={() => navigate('/scan')} className="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105">
                        <Play className="h-4 w-4 mr-2" />
                        Quick Scan
                      </Button>
                      <Button onClick={() => navigate('/scan/advanced')} variant="outline" className="shadow-lg hover:shadow-glow transition-all duration-300">
                        <Zap className="h-4 w-4 mr-2" />
                        Advanced Scan
                      </Button>
                    </div>
                  </div> : <div className="space-y-3">
                    {/* Select All */}
                    <div className="flex items-center gap-3 px-4 py-2 border-b">
                      <Checkbox checked={selectedScans.size === scans.length && scans.length > 0} onCheckedChange={toggleSelectAll} />
                      <span className="text-sm text-muted-foreground">
                        Select all {scans.length} scans
                      </span>
                    </div>

                    {scans.map(scan => <div key={scan.id} className="group relative overflow-hidden rounded-lg bg-card p-6 shadow-card hover:shadow-glow hover:scale-105 transition-all duration-500">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <Checkbox checked={selectedScans.has(scan.id)} onCheckedChange={() => toggleScanSelection(scan.id)} onClick={e => e.stopPropagation()} />
                              <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => navigate(`/results/${scan.id}`)}>
                              <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                                <Shield className="h-5 w-5" />
                              </div>
                              <div className="space-y-1">
                                <p className="font-semibold text-lg">{getTarget(scan)}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-2">
                                  <Clock className="h-3 w-3" />
                                  {format(new Date(scan.created_at), 'MMM d, yyyy h:mm a')}
                                </p>
                              </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary transition-colors">
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                  <Button variant="ghost" size="sm" onClick={e => handleArchiveScan(scan.id, e)} className="hover:bg-muted transition-colors" title="Archive scan">
                    <Archive className="h-4 w-4" />
                  </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="capitalize">
                              <FileSearch className="h-3 w-3 mr-1" />
                              {scan.scan_type}
                            </Badge>
                            <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/30">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                            {scan.privacy_score !== undefined && scan.privacy_score !== null && <Badge variant={getRiskColor(scan)}>
                                Privacy Score: {scan.privacy_score}
                              </Badge>}
                            {(scan.high_risk_count || 0) > 0 && <Badge variant="destructive" className="animate-pulse">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {scan.high_risk_count} high risk
                              </Badge>}
                          </div>
                        </div>
                      </div>)}
                  </div>}
                  </CardContent>
                </Card>}
              </TabsContent>

              {/* Scheduled Scans Tab */}
              <TabsContent value="scheduled" className="space-y-6">
                {workspace?.id && <ScheduledScansManager workspaceId={workspace.id} />}
              </TabsContent>

              {/* Webhooks Tab */}
              <TabsContent value="webhooks" className="space-y-6">
                <WebhookIntegrations />
              </TabsContent>

              {/* Archived Tab */}
              <TabsContent value="archived" className="space-y-6">
                <ArchivedScans />
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <Footer />
        
        {/* Scroll to Top Button */}
        <ScrollToTop />
      </div>
    </>;
};
export default Dashboard;