import { FootprintDNA } from '@/components/FootprintDNA';
import { FootprintDNASkeleton } from '@/components/FootprintDNASkeleton';
import { FootprintDNAModal } from '@/components/FootprintDNAModal';
import { RemovalQueue } from '@/components/RemovalQueue';
import { RemovalSuccessTracker } from '@/components/RemovalSuccessTracker';
import { DarkWebMonitorSettings } from '@/components/settings/DarkWebMonitorSettings';
import { InitializeDarkWebDemo } from '@/components/settings/InitializeDarkWebDemo';
import { StreakBadges } from '@/components/StreakBadges';
import { analyzeTrends } from '@/lib/trends';
import { BreachTrendChart } from '@/components/dashboard/BreachTrendChart';
import { ProviderHealthMap } from '@/components/dashboard/ProviderHealthMap';
import { IdentityRiskCard } from '@/components/dashboard/IdentityRiskCard';
import { RecentFindings } from '@/components/dashboard/RecentFindings';
import { CreditUsageMeter } from '@/components/dashboard/CreditUsageMeter';
import { RecommendedScans } from '@/components/dashboard/RecommendedScans';
import { PowerFeaturesCard } from '@/components/dashboard/PowerFeaturesCard';
import { SectionErrorBoundary } from '@/components/SectionErrorBoundary';
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
import { PremiumUpgradeCTA } from '@/components/upsell/PremiumUpgradeCTA';
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
import { GlassCard } from '@/components/dashboard/GlassCard';
import { CircularMetric } from '@/components/dashboard/CircularMetric';
import { EntityCard } from '@/components/dashboard/EntityCard';
import { NetworkPreview } from '@/components/dashboard/NetworkPreview';
import { SocialIntegrations } from '@/components/dashboard/SocialIntegrations';
import { ParticleBackground } from '@/components/dashboard/ParticleBackground';
import { GridOverlay } from '@/components/dashboard/GridOverlay';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useSubscription } from '@/hooks/useSubscription';
import { useLowCreditToast } from '@/hooks/useLowCreditToast';
import { useFeatureSuggestions } from '@/hooks/useFeatureSuggestions';
import { shouldAutoStartTour, getTourAutoStartDelay, markTourTriggered, markOnboardingShown } from '@/lib/tour/firstTime';
import { useTour } from '@/hooks/useTour';
import { TourHighlight } from '@/components/tour/TourHighlight';
import { TOURS } from '@/lib/tour/steps';
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
  const {
    isPremium
  } = useSubscription();

  // Show low-credit toasts for free users
  useLowCreditToast();

  // Tour system
  const tour = useTour(TOURS.onboarding);
  const {
    isActive: isTourActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    nextStep,
    prevStep,
    endTour
  } = tour;
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
  const [latestScanId, setLatestScanId] = useState<string | null>(null);
  const [isDNAModalOpen, setIsDNAModalOpen] = useState(false);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [isRescanning, setIsRescanning] = useState(false);
  const [scanSocialLinks, setScanSocialLinks] = useState<Record<string, any[]>>({});
  
  // Feature suggestions based on user behavior (will check after user is set)
  useFeatureSuggestions(user?.id);
  
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
        markTourTriggered();
        markOnboardingShown(); // ensure we only ever show once per browser/user
        const timer = setTimeout(() => {
          tour.startTour();
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

  // Set up real-time subscription for scan changes
  useEffect(() => {
    if (!user?.id) return;
    console.log('Setting up realtime subscription for scans');
    const channel = supabase.channel('dashboard-scans-changes').on('postgres_changes', {
      event: '*',
      // Listen to all events (INSERT, UPDATE, DELETE)
      schema: 'public',
      table: 'scans',
      filter: `user_id=eq.${user.id}`
    }, payload => {
      console.log('Scan change detected:', payload.eventType, payload);

      // Refresh dashboard data when scans change
      fetchDashboardData(user.id);

      // Show a toast notification for new scans
      if (payload.eventType === 'INSERT') {
        toast({
          title: 'New scan detected',
          description: 'Dashboard updating with latest data...'
        });
      } else if (payload.eventType === 'UPDATE') {
        toast({
          title: 'Scan updated',
          description: 'Dashboard refreshing...'
        });
      }
    }).subscribe(status => {
      console.log('Realtime subscription status:', status);
    });
    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, toast]);

  // Realtime subscription for DNA tiles
  useEffect(() => {
    if (!latestScanId) return;

    const channel = supabase
      .channel(`findings_${latestScanId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'findings',
        filter: `scan_id=eq.${latestScanId}`
      }, () => {
        // Refetch DNA metrics when new findings arrive
        if (user?.id) fetchDashboardData(user.id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [latestScanId, user?.id]);
  const fetchDashboardData = async (userId: string) => {
    setLoading(true);
    try {
      // Fetch recent scans for display (excluding archived)
      const {
        data: scansData,
        error: scansError
      } = await supabase.from('scans').select('*').eq('user_id', userId).is('archived_at', null).order('created_at', {
        ascending: false
      }).limit(10);
      if (scansError) throw scansError;
      setScans(scansData || []);

      // Get accurate total scan count
      const {
        count: totalCount
      } = await supabase.from('scans').select('*', {
        count: 'exact',
        head: true
      }).eq('user_id', userId).is('archived_at', null);

      // Get scans this month count
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const {
        count: monthCount
      } = await supabase.from('scans').select('*', {
        count: 'exact',
        head: true
      }).eq('user_id', userId).is('archived_at', null).gte('created_at', monthStart.toISOString());

      // Get recent (24h) scans count
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const {
        count: recentCount
      } = await supabase.from('scans').select('*', {
        count: 'exact',
        head: true
      }).eq('user_id', userId).is('archived_at', null).gte('created_at', dayAgo.toISOString());

      // Get aggregate high risk count from all scans with workspace filter
      const currentWorkspaceId = workspace?.id;
      const scanFilter = currentWorkspaceId 
        ? supabase.from('scans').select('high_risk_count').eq('workspace_id', currentWorkspaceId).is('archived_at', null)
        : supabase.from('scans').select('high_risk_count').eq('user_id', userId).is('archived_at', null);
      
      const { data: aggregateData } = await scanFilter;
      const totalHighRisk = aggregateData?.reduce((sum, scan) => sum + (scan.high_risk_count || 0), 0) || 0;
      
      // Get active watchlists count
      const { count: activeWatchlistsCount } = await supabase
        .from('watchlists')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_active', true);
      
      setStats({
        totalScans: totalCount || 0,
        highRiskFindings: totalHighRisk,
        recentFindings: recentCount || 0,
        scansThisMonth: monthCount || 0,
        avgScanTime: 2.4,
        activeMonitoring: activeWatchlistsCount || 0
      });

      // Calculate DNA metrics from all scans and their data sources
      if (scansData && scansData.length > 0) {
        // Get the most recent scan for DNA calculation
        const recentScan = scansData[0];
        setLatestScanId(recentScan.id);

        // Fetch findings for DNA metrics with workspace filter
        const findingsQuery = currentWorkspaceId
          ? supabase.from('findings').select('kind, severity, provider').eq('scan_id', recentScan.id).eq('workspace_id', currentWorkspaceId)
          : supabase.from('findings').select('kind, severity, provider').eq('scan_id', recentScan.id);
        
        const { data: dnaFindings } = await findingsQuery;

        if (dnaFindings && dnaFindings.length > 0) {
          // Enhanced keyword arrays for accurate categorization
          const BREACH_KEYWORDS = ['hibp', 'breach', 'leak', 'compromised', 'breach.hit', 'pwned', 'violation', 'exposed'];
          const BROKER_KEYWORDS = ['broker', 'people-search', 'background-check', 'data-aggregator', 'whitepages', 'spokeo', 'peoplesearch', 'pipl', 'radaris'];
          const DARK_WEB_KEYWORDS = ['dark', 'tor', 'onion', 'paste', 'intelx', 'dump', 'pastebin', 'leak'];
          const EXPOSURE_KEYWORDS = ['profile', 'presence', 'hit', 'found', 'account', 'social'];
          const EXPOSURE_PROVIDERS = ['maigret', 'sherlock', 'gosearch', 'holehe'];

          let breaches = 0, exposures = 0, dataBrokers = 0, darkWeb = 0;
          
          // Filter out provider_error findings for accurate counts
          const validFindings = dnaFindings.filter(f => {
            const kind = (f.kind || '').toLowerCase();
            return kind !== 'provider_error' && !kind.includes('error');
          });
          
          for (const f of validFindings) {
            const kind = (f.kind || '').toLowerCase();
            const provider = (f.provider || '').toLowerCase();
            
            // Breaches: findings with breach-related keywords
            if (BREACH_KEYWORDS.some(k => kind.includes(k) || provider.includes(k))) {
              breaches++;
              continue; // Count as breach, skip other categories
            }
            
            // Data Brokers: findings matching broker keywords
            if (BROKER_KEYWORDS.some(k => kind.includes(k) || provider.includes(k))) {
              dataBrokers++;
              continue;
            }
            
            // Dark Web: findings matching dark web keywords
            if (DARK_WEB_KEYWORDS.some(k => kind.includes(k) || provider.includes(k))) {
              darkWeb++;
              continue;
            }
            
            // Exposures: findings from OSINT providers OR containing exposure keywords
            // This should be the largest category for typical OSINT scans
            if (EXPOSURE_PROVIDERS.includes(provider) || 
                EXPOSURE_KEYWORDS.some(k => kind.includes(k))) {
              exposures++;
            }
          }

          // Calculate risk score (ensure it's an integer 0-100)
          const riskScore = Math.min(100, Math.max(0, Math.round(breaches * 15 + darkWeb * 10 + dataBrokers * 5 + exposures * 1)));
          setDnaMetrics({ 
            score: Math.max(0, 100 - riskScore), 
            breaches, 
            exposures, 
            dataBrokers, 
            darkWeb 
          });
        } else {
          // No findings - set all to 0
          setDnaMetrics({ score: 100, breaches: 0, exposures: 0, dataBrokers: 0, darkWeb: 0 });
        }

        // Fetch data sources for the recent scan
        const {
          data: sources
        } = await supabase.from('data_sources').select('*').eq('scan_id', recentScan.id);
        
        // Fetch social media links for recent scans
        const scanIds = scansData.slice(0, 3).map(s => s.id);
        const { data: allSources } = await supabase
          .from('data_sources')
          .select('scan_id, name, url, category')
          .in('scan_id', scanIds);
        
        // Group social links by scan_id
        const socialLinksMap: Record<string, any[]> = {};
        allSources?.forEach(source => {
          const isSocialMedia = 
            source.category?.toLowerCase().includes('social') ||
            source.name?.toLowerCase().match(/linkedin|twitter|facebook|instagram|github/);
          
          if (isSocialMedia && source.url) {
            if (!socialLinksMap[source.scan_id]) {
              socialLinksMap[source.scan_id] = [];
            }
            
            // Determine platform from name or URL
            let platform: 'linkedin' | 'twitter' | 'facebook' | 'web' = 'web';
            const lowerName = source.name?.toLowerCase() || '';
            const lowerUrl = source.url?.toLowerCase() || '';
            
            if (lowerName.includes('linkedin') || lowerUrl.includes('linkedin')) platform = 'linkedin';
            else if (lowerName.includes('twitter') || lowerUrl.includes('twitter') || lowerUrl.includes('x.com')) platform = 'twitter';
            else if (lowerName.includes('facebook') || lowerUrl.includes('facebook')) platform = 'facebook';
            
            socialLinksMap[source.scan_id].push({
              platform,
              url: source.url
            });
          }
        });
        setScanSocialLinks(socialLinksMap);
        // DNA metrics already calculated above (lines 277-341)
        // This duplicate calculation has been removed to prevent overwriting correct values

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
  
  const getEntityType = (scan: Scan) => {
    if (scan.email) return 'Email';
    if (scan.phone) return 'Phone';
    if (scan.username) return 'Username';
    return 'Unknown';
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
  const handleRescan = async () => {
    if (!user?.id) return;
    setIsRescanning(true);
    try {
      toast({
        title: 'Refreshing DNA metrics',
        description: 'Updating your Digital DNA data...'
      });
      await fetchDashboardData(user.id);
      toast({
        title: 'DNA metrics updated',
        description: 'Your Digital DNA has been refreshed with the latest data.'
      });
    } catch (error: any) {
      console.error('Rescan error:', error);
      toast({
        title: 'Error updating metrics',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsRescanning(false);
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
      <ParticleBackground />
      <GridOverlay />
      <InitializeDarkWebDemo />
      <SEO title="Dashboard — FootprintIQ" description="View your OSINT scans, findings, and entity relationships" canonical="https://footprintiq.app/dashboard" />
      <AnnouncementBar message="💡 Pro Tip: Use AI Analyst to get instant insights from your scan results." link="/ai-analyst" linkText="Try AI Analyst" storageKey="ai-analyst-dashboard-tip" variant="update" />
      <ScrollProgressBar />
      <div className="min-h-screen bg-background flex flex-col w-full animate-fadeIn relative z-10">
        <Header />

        {/* Hero Section */}
        <div data-tour="dashboard-hero" className="relative bg-gradient-to-br from-primary/10 via-background to-accent/5 p-8 rounded-2xl shadow-[var(--shadow-elevated)] mx-6 mt-6 animate-fade-in border border-primary/20 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 bg-grid-primary/[0.02] pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex items-center gap-6">
              {/* Logo Shield */}
              <div className="relative shrink-0 group">
                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
                
              </div>

              {/* Heading and Subtitle */}
              <div className="flex-1 min-w-0">
                <h1 className="font-bold bg-gradient-to-br from-primary via-primary to-accent bg-clip-text text-transparent whitespace-nowrap text-4xl text-center">
                  Your Intelligence Command Center
                </h1>
                <p className="text-muted-foreground/80 font-medium mt-2 whitespace-nowrap text-base text-center">
                  Real-time monitoring and threat intelligence at your fingertips
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-7xl mx-auto px-6 mt-6 mb-2">
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <Button onClick={() => navigate('/anomaly-history')} variant="outline" className="shadow-lg hover:shadow-glow transition-[var(--transition-smooth)]">
              <Zap className="h-4 w-4 mr-2" />
              Anomaly History
            </Button>
            <Button onClick={() => navigate('/graph')} variant="outline" className="shadow-lg hover:shadow-glow transition-[var(--transition-smooth)]">
              <Network className="h-4 w-4 mr-2" />
              Entity Graph
            </Button>
            <Button onClick={() => navigate('/scan/batch')} variant="outline" className="shadow-lg hover:shadow-glow transition-[var(--transition-smooth)]">
              <FileStack className="h-4 w-4 mr-2" />
              Batch Scan
            </Button>
            <Button data-tour="advanced-scan-btn" onClick={() => navigate('/scan/advanced')} variant="outline" className="shadow-lg shadow-accent/20 hover:shadow-glow hover:border-accent transition-[var(--transition-smooth)]">
              <Zap className="h-4 w-4 mr-2" />
              Advanced Scan
            </Button>
            <Button onClick={() => navigate('/scan')} className="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-[var(--transition-smooth)] hover:scale-105">
              <Play className="h-4 w-4 mr-2" />
              Start New Scan
            </Button>
          </div>
        </div>

        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
              {/* Premium Upgrade CTA for Free Users */}
              {!isPremium && <div className="mb-8">
                  <PremiumUpgradeCTA variant="banner" message="Upgrade to Pro for unlimited scans" feature="unlimited scans, advanced tools, and AI analysis" />
                </div>}
              
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
                <TabsContent value="overview" className="space-y-8">
                  {/* Circular Metrics Grid - OSINT Style */}
                  <div data-tour="stats-overview" className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Shield className="w-6 h-6 text-primary" />
                      OSINT Intelligence Dashboard
                    </h2>
                    
                    {/* Main Metrics with Glassmorphic Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <GlassCard delay={0} intensity="medium" glowColor="purple" className="p-6 flex items-center justify-center">
                        <CircularMetric value={dnaMetrics.score} max={100} label="Privacy Score" size="md" gradient />
                      </GlassCard>
                      
                      <GlassCard delay={0.1} intensity="medium" glowColor="pink" className="p-6 flex items-center justify-center">
                        <CircularMetric value={dnaMetrics.exposures} max={50} label="Exposures" size="md" gradient />
                      </GlassCard>
                      
                      <GlassCard delay={0.2} intensity="medium" glowColor="cyan" className="p-6 flex items-center justify-center">
                        <CircularMetric value={dnaMetrics.dataBrokers} max={30} label="Data Brokers" size="md" gradient />
                      </GlassCard>
                      
                      <GlassCard delay={0.3} intensity="medium" glowColor="purple" className="p-6 flex items-center justify-center">
                        <CircularMetric value={dnaMetrics.darkWeb} max={20} label="Dark Web" size="md" gradient />
                      </GlassCard>
                    </div>

                    {/* Entity Cards Section */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Recent Entities Discovered
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {scans.slice(0, 3).map((scan, index) => <div key={scan.id} style={{
                      animationDelay: `${0.4 + index * 0.1}s`
                    }}>
                            <EntityCard 
                              name={getTarget(scan)} 
                              subtitle={`Scanned ${format(new Date(scan.created_at), 'MMM d, yyyy')}`}
                              entityType={getEntityType(scan)}
                              lastUpdated={scan.completed_at ? format(new Date(scan.completed_at), 'MMM d, yyyy h:mm a') : undefined}
                              tags={[`${scan.high_risk_count || 0} High Risk`, `${scan.medium_risk_count || 0} Medium`, `Score: ${getRiskScore(scan)}`]} 
                              confidence={Math.round(getRiskScore(scan))}
                              socialLinks={scanSocialLinks[scan.id] || []}
                              onClick={() => navigate(`/results/${scan.id}`)}
                            />
                          </div>)}
                      </div>
                    </div>

                    {/* Data Visualization Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <NetworkPreview nodeCount={12} onClick={() => navigate('/graph')} />
                      
                      <GlassCard intensity="medium" glowColor="purple" className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Activity className="w-5 h-5 text-primary" />
                          Activity Overview
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Scans This Month</span>
                            <span className="text-lg font-bold text-primary">{stats.scansThisMonth}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">High Risk Findings</span>
                            <span className="text-lg font-bold text-destructive">{stats.highRiskFindings}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Total Scans</span>
                            <span className="text-lg font-bold text-accent">{stats.totalScans}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Active Monitoring</span>
                            <span className="text-lg font-bold text-success">{stats.activeMonitoring}</span>
                          </div>
                        </div>
                      </GlassCard>
                    </div>

                    {/* Social Integrations */}
                    <div className="mt-8">
                      <SocialIntegrations />
                    </div>

                    {/* Power Features Discovery */}
                    <div className="mt-8">
                      <PowerFeaturesCard />
                    </div>

                    {/* Dashboard v2 Enhancements */}
                    <div className="mt-8 space-y-6">
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Activity className="w-6 h-6 text-primary" />
                        Intelligence Analytics
                      </h2>

                      {/* Top Row: Breach Trend + Provider Health */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <SectionErrorBoundary section="Findings Activity Chart">
                          <BreachTrendChart workspaceId={workspace?.id} />
                        </SectionErrorBoundary>
                        <SectionErrorBoundary section="Provider Health Map">
                          <ProviderHealthMap workspaceId={workspace?.id} />
                        </SectionErrorBoundary>
                      </div>

                      {/* Middle Row: Identity Risk + Credit Usage */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <SectionErrorBoundary section="Identity Risk Score">
                          <IdentityRiskCard
                            riskScore={dnaMetrics.score}
                            breaches={dnaMetrics.breaches}
                            darkWeb={dnaMetrics.darkWeb}
                            dataBrokers={dnaMetrics.dataBrokers}
                            exposures={dnaMetrics.exposures}
                          />
                        </SectionErrorBoundary>
                        <SectionErrorBoundary section="Credit Usage Meter">
                          <CreditUsageMeter />
                        </SectionErrorBoundary>
                      </div>

                      {/* Bottom Row: Recent Findings + Recommended Scans */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <SectionErrorBoundary section="Recent Findings">
                          <RecentFindings workspaceId={workspace?.id} />
                        </SectionErrorBoundary>
                        <SectionErrorBoundary section="Recommended Scans">
                          <RecommendedScans />
                        </SectionErrorBoundary>
                      </div>
                    </div>
                  </div>

                  {/* Footprint DNA Card */}
                  {loading ? <div className="mb-8">
                      <FootprintDNASkeleton />
                    </div> : scans.length > 0 ? <div data-tour="digital-dna" className="mb-8">
                      <FootprintDNA score={dnaMetrics.score} breaches={dnaMetrics.breaches} exposures={dnaMetrics.exposures} dataBrokers={dnaMetrics.dataBrokers} darkWeb={dnaMetrics.darkWeb} trendData={trendData} onOpenDetails={() => setIsDNAModalOpen(true)} onRescan={handleRescan} isRescanning={isRescanning} />

                      <FootprintDNAModal open={isDNAModalOpen} onOpenChange={setIsDNAModalOpen} trendData={trendData} currentScore={dnaMetrics.score} />
                    </div> : null}

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
                      <SectionErrorBoundary section="Streak & Badges">
                        <StreakBadges userId={user?.id} />
                      </SectionErrorBoundary>
                    </div>

                    {/* Removal Queue & Success Tracker */}
                    <div className="md:col-span-2 space-y-6">
                      <SectionErrorBoundary section="Removal Queue">
                        <RemovalQueue userId={user.id} />
                      </SectionErrorBoundary>
                      <SectionErrorBoundary section="Removal Success Tracker">
                        <RemovalSuccessTracker userId={user.id} />
                      </SectionErrorBoundary>
                    </div>
                  </div>

                  {/* Dark Web Monitor Settings */}
                  <SectionErrorBoundary section="Dark Web Monitor">
                    <DarkWebMonitorSettings />
                  </SectionErrorBoundary>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">

                  {/* Threat Analytics */}
                  {loading ? <SkeletonThreatAnalytics /> : (
                    <SectionErrorBoundary section="Threat Analytics">
                      <ThreatAnalyticsPanel />
                    </SectionErrorBoundary>
                  )}
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
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => navigate(`/results/${scan.id}`)}
                                className="hover:bg-primary/10 hover:text-primary transition-colors"
                              >
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
        
        {/* Tour Highlight */}
        {isTourActive && currentStep && <TourHighlight step={currentStep} currentStepIndex={currentStepIndex} totalSteps={totalSteps} onNext={nextStep} onPrev={prevStep} onSkip={endTour} />}
      </div>
    </>;
};
export default Dashboard;