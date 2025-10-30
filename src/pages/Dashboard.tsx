import { useState, useEffect, useMemo, useRef } from 'react';
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
import { SavedViewsDialog } from '@/components/dashboard/SavedViewsDialog';
import { ColumnChooser } from '@/components/dashboard/ColumnChooser';
import { DensityToggle } from '@/components/dashboard/DensityToggle';
import { KeyboardShortcutsDialog } from '@/components/dashboard/KeyboardShortcutsDialog';
import { useDashboardQuery } from '@/hooks/useDashboardQuery';
import { useGlobalShortcuts } from '@/hooks/useKeyboardShortcuts';
import { 
  Kpi, KpiSchema, 
  SeriesPoint, SeriesPointSchema,
  SourceBreakdown as SourceBreakdownType, SourceBreakdownSchema,
  AlertRow, AlertsResponseSchema,
  DateRange,
  getRoleCapabilities,
  UserRole,
  DashboardFilters,
} from '@/types/dashboard';
import { redactEntityName } from '@/lib/redact';
import {
  Activity,
  AlertTriangle,
  DollarSign,
  FileSearch,
  Search,
  TrendingUp,
  CalendarIcon,
  Eye,
  Download,
  Save,
  Filter,
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
  const [showSavedViews, setShowSavedViews] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState(['time', 'entity', 'provider', 'severity', 'confidence', 'category']);
  const [density, setDensity] = useState<'compact' | 'comfortable'>('comfortable');
  const [rightRailOpen, setRightRailOpen] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const capabilities = useMemo(() => getRoleCapabilities(userRole), [userRole]);

  // Global keyboard shortcuts
  useGlobalShortcuts({
    onSearch: () => searchInputRef.current?.focus(),
    onFilter: () => {}, // Could open filters panel
    onHelp: () => setShowKeyboardHelp(true),
    onGoTop: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
  });

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

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (!capabilities.canExport) {
      toast({
        title: 'Permission denied',
        description: 'You need analyst or admin role to export data',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dashboard-export`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ filters, format }),
        }
      );

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-export-${new Date().toISOString()}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export complete',
        description: `Your ${format.toUpperCase()} file is downloading`,
      });

      // Log audit event
      await supabase.functions.invoke('dashboard-audit', {
        body: {
          action: 'export',
          resource_type: 'dashboard',
          metadata: { format, filters },
        },
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleAlertExplain = async (alertId: string) => {
    toast({
      title: 'Generating explanation...',
      description: 'AI is analyzing this alert',
    });
  };

  const handleLoadSavedView = (view: any) => {
    updateFilters(view.filters);
    setSelectedColumns(view.columns);
    setDensity(view.density);
    toast({
      title: 'View loaded',
      description: `"${view.name}" has been applied`,
    });
  };

  const handleRowClick = async (alert: AlertRow) => {
    setSelectedAlert(alert);
    
    // Log audit event if viewing PII
    if (capabilities.canViewPII && userRole === 'analyst') {
      await supabase.functions.invoke('dashboard-audit', {
        body: {
          action: 'view_pii',
          resource_type: 'alert',
          resource_id: alert.id,
          metadata: { entity: alert.entity },
        },
      });
    }
  };

  // Redact alerts for viewers
  const processedAlerts = useMemo(() => {
    return alerts.map(alert => ({
      ...alert,
      entity: redactEntityName(alert.entity, userRole),
      description: userRole === 'viewer' ? 'Details redacted' : alert.description,
    }));
  }, [alerts, userRole]);

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
                  {/* Toolbar */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSavedViews(true)}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Views
                    </Button>

                    {capabilities.canExport && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport('csv')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    )}

                    <ColumnChooser
                      selectedColumns={selectedColumns}
                      onChange={setSelectedColumns}
                    />

                    <DensityToggle
                      density={density}
                      onChange={setDensity}
                    />
                  </div>

                  {/* Global Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      ref={searchInputRef}
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
                data={processedAlerts}
                loading={loading}
                onRowClick={handleRowClick}
                onExport={capabilities.canExport ? handleExport : undefined}
                canExport={capabilities.canExport}
                selectedColumns={selectedColumns}
                density={density}
              />
            </div>
          </div>

          {/* Right Rail */}
          {rightRailOpen && (
            <RightRail
              isOpen={rightRailOpen}
              onClose={() => setRightRailOpen(false)}
              filters={filters}
            />
          )}
          {!rightRailOpen && (
            <div className="w-12 border-l bg-card">
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-12"
                onClick={() => setRightRailOpen(true)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          )}
        </main>

        {/* Dialogs */}
        <AlertDrawer
          alert={selectedAlert}
          open={!!selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onExplain={handleAlertExplain}
          onAssign={capabilities.canAssign ? (id) => toast({ title: 'Assigned alert' }) : undefined}
          onAddToReport={(id) => toast({ title: 'Added to report' })}
          canAssign={capabilities.canAssign}
        />

        <SavedViewsDialog
          open={showSavedViews}
          onOpenChange={setShowSavedViews}
          currentFilters={filters}
          currentColumns={selectedColumns}
          currentDensity={density}
          onLoadView={handleLoadSavedView}
        />

        <KeyboardShortcutsDialog
          open={showKeyboardHelp}
          onOpenChange={setShowKeyboardHelp}
        />

        <Footer />
      </div>
    </>
  );
};

export default Dashboard;
