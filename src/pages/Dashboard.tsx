import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { SourceBreakdown } from '@/components/dashboard/SourceBreakdown';
import { AlertsTable } from '@/components/dashboard/AlertsTable';
import { AlertDrawer } from '@/components/dashboard/AlertDrawer';
import { RightRail } from '@/components/dashboard/RightRail';
import { useDashboardQuery } from '@/hooks/useDashboardQuery';
import { 
  Kpi, KpiSchema, 
  SeriesPoint, SeriesPointSchema,
  SourceBreakdown as SourceBreakdownType, SourceBreakdownSchema,
  AlertRow, AlertsResponseSchema,
  DateRange,
  getRoleCapabilities,
  UserRole,
} from '@/types/dashboard';
import {
  Activity,
  AlertTriangle,
  DollarSign,
  FileSearch,
  Search,
  TrendingUp,
  CalendarIcon,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { filters, updateFilters, getDateRange } = useDashboardQuery();

  // State
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole>('viewer');
  const [kpis, setKpis] = useState<Kpi | null>(null);
  const [trendData, setTrendData] = useState<SeriesPoint[]>([]);
  const [sourceData, setSourceData] = useState<SourceBreakdownType[]>([]);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AlertRow | null>(null);
  const [showForecast, setShowForecast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [customDateFrom, setCustomDateFrom] = useState<Date | undefined>();
  const [customDateTo, setCustomDateTo] = useState<Date | undefined>();

  const capabilities = useMemo(() => getRoleCapabilities(userRole), [userRole]);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);

      // Fetch user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (roleData?.role) {
        setUserRole(roleData.role as UserRole);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Fetch dashboard data
  useEffect(() => {
    if (!user) return;
    fetchDashboardData();
  }, [user, filters.dateRange, filters.from, filters.to]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { from, to } = getDateRange();
      const params = new URLSearchParams({
        from,
        to,
        workspace: user.id,
      });

      // Fetch all data in parallel
      const [kpisRes, trendRes, sourcesRes, alertsRes] = await Promise.all([
        supabase.functions.invoke('dashboard-kpis', {
          body: null,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
        supabase.functions.invoke('dashboard-trend', {
          body: null,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
        supabase.functions.invoke('dashboard-sources', {
          body: null,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
        supabase.functions.invoke('dashboard-alerts', {
          body: { filters: { from, to, workspace: user.id }, page: 0, limit: 100 },
        }),
      ]);

      // Validate and set KPIs
      if (!kpisRes.error && kpisRes.data) {
        const validated = KpiSchema.parse(kpisRes.data);
        setKpis(validated);
      }

      // Validate and set trend data
      if (!trendRes.error && trendRes.data) {
        const validated = trendRes.data.map((point: any) => SeriesPointSchema.parse(point));
        setTrendData(validated);
      }

      // Validate and set source data
      if (!sourcesRes.error && sourcesRes.data) {
        const validated = sourcesRes.data.map((item: any) => SourceBreakdownSchema.parse(item));
        setSourceData(validated);
      }

      // Validate and set alerts
      if (!alertsRes.error && alertsRes.data) {
        const validated = AlertsResponseSchema.parse(alertsRes.data);
        setAlerts(validated.rows);
      }
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

  const handleDateRangeChange = (range: DateRange) => {
    updateFilters({ dateRange: range });
  };

  const handleCustomDateApply = () => {
    if (customDateFrom && customDateTo) {
      updateFilters({
        dateRange: 'custom',
        from: customDateFrom.toISOString(),
        to: customDateTo.toISOString(),
      });
    }
  };

  const handleKpiClick = (kpiType: string) => {
    // Apply filter based on KPI clicked
    if (kpiType === 'high') {
      updateFilters({ severity: ['high', 'critical'] });
    }
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    toast({
      title: `Exporting as ${format.toUpperCase()}`,
      description: 'Your export will download shortly',
    });
  };

  const handleAlertExplain = async (alertId: string) => {
    toast({
      title: 'Generating explanation...',
      description: 'AI is analyzing this alert',
    });
  };

  const handleSearchFocus = (e: React.KeyboardEvent) => {
    if (e.key === '/' && e.target === document.body) {
      e.preventDefault();
      document.getElementById('global-search')?.focus();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleSearchFocus as any);
    return () => document.removeEventListener('keydown', handleSearchFocus as any);
  }, []);

  if (!user) return null;

  return (
    <>
      <SEO
        title="Enterprise Dashboard — FootprintIQ"
        description="Monitor your organization's digital footprint with real-time insights, AI-powered analysis, and comprehensive threat intelligence"
        canonical="https://footprintiq.app/dashboard"
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-1 flex">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-[1800px] mx-auto px-6 py-8 space-y-8">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                  <p className="text-muted-foreground">
                    Monitor your digital footprint and security posture
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Global Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="global-search"
                      placeholder="Search... (press /)"
                      className="pl-9 w-80"
                    />
                  </div>

                  {/* Date Range Selector */}
                  <Select value={filters.dateRange} onValueChange={handleDateRangeChange}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>

                  {filters.dateRange === 'custom' && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn('gap-2', !customDateFrom && 'text-muted-foreground')}>
                          <CalendarIcon className="w-4 h-4" />
                          {customDateFrom && customDateTo
                            ? `${format(customDateFrom, 'MMM d')} - ${format(customDateTo, 'MMM d')}`
                            : 'Pick dates'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-4" align="end">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">From</label>
                            <Calendar
                              mode="single"
                              selected={customDateFrom}
                              onSelect={setCustomDateFrom}
                              className="pointer-events-auto"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">To</label>
                            <Calendar
                              mode="single"
                              selected={customDateTo}
                              onSelect={setCustomDateTo}
                              className="pointer-events-auto"
                            />
                          </div>
                          <Button onClick={handleCustomDateApply} className="w-full">
                            Apply
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <KpiCard
                  title="Total Scans"
                  value={kpis?.scans || 0}
                  delta={kpis?.deltas.scans}
                  icon={Activity}
                  loading={loading}
                  help="Total number of scans completed in the selected period"
                />
                <KpiCard
                  title="Total Findings"
                  value={kpis?.findings || 0}
                  delta={kpis?.deltas.findings}
                  icon={FileSearch}
                  loading={loading}
                  help="All findings discovered across all providers"
                />
                <KpiCard
                  title="High Severity"
                  value={kpis?.high || 0}
                  delta={kpis?.deltas.high}
                  icon={AlertTriangle}
                  loading={loading}
                  onClick={() => handleKpiClick('high')}
                  help="Critical and high severity findings requiring immediate attention"
                />
                <KpiCard
                  title="Dark Web Hits"
                  value={kpis?.darkweb || 0}
                  delta={kpis?.deltas.darkweb}
                  icon={Eye}
                  loading={loading}
                  help="Mentions found on dark web forums and marketplaces"
                />
                <KpiCard
                  title="Success Rate"
                  value={kpis?.successRate || 0}
                  delta={kpis?.deltas.successRate}
                  icon={TrendingUp}
                  format="percent"
                  loading={loading}
                  help="Percentage of scans completed successfully"
                />
                <KpiCard
                  title="API Spend"
                  value={kpis?.spend || 0}
                  delta={kpis?.deltas.spend}
                  icon={DollarSign}
                  format="currency"
                  loading={loading}
                  help="Estimated API costs for the selected period"
                />
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Findings trend by severity level</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowForecast(!showForecast)}
                    >
                      {showForecast ? 'Hide' : 'Show'} Forecast
                    </Button>
                  </div>
                  <TrendChart data={trendData} showForecast={showForecast} loading={loading} />
                </div>

                <SourceBreakdown data={sourceData} loading={loading} />
              </div>

              {/* Alerts Table */}
              <AlertsTable
                data={alerts}
                loading={loading}
                onRowClick={setSelectedAlert}
                onExport={capabilities.canExport ? handleExport : undefined}
                canExport={capabilities.canExport}
              />
            </div>
          </div>

          {/* Right Rail */}
          <RightRail
            aiSummary="Recent scans show a 15% increase in exposed credentials. Two new high-severity findings detected on dark web forums. Recommend immediate password rotation for affected accounts."
            tasks={[
              { id: '1', title: 'Review high-severity alerts', priority: 'high', dueDate: 'Today' },
              { id: '2', title: 'Update monitoring schedules', priority: 'medium', dueDate: 'Tomorrow' },
            ]}
            notifications={[
              { id: '1', message: 'New dark web mention detected', time: '5 min ago', read: false },
              { id: '2', message: 'Weekly report ready', time: '1 hour ago', read: false },
            ]}
            loading={loading}
          />
        </main>

        {/* Alert Detail Drawer */}
        <AlertDrawer
          alert={selectedAlert}
          open={!!selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onExplain={handleAlertExplain}
          onAssign={capabilities.canAssign ? (id) => toast({ title: 'Assigned alert' }) : undefined}
          onAddToReport={(id) => toast({ title: 'Added to report' })}
          canAssign={capabilities.canAssign}
        />

        <Footer />
      </div>
    </>
  );
};

export default Dashboard;
