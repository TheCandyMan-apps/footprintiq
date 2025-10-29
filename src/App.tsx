import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CookieConsent } from "@/components/CookieConsent";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GlobalSearch } from "@/components/GlobalSearch";
import { lazy, Suspense } from "react";
import { LoadingState } from "@/components/ui/loading-state";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import "@/lib/config"; // Validate env at boot

// Critical pages (loaded immediately)
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Lazy-loaded pages (loaded on demand)
const ScanPage = lazy(() => import("./pages/ScanPage"));
const ResultsDetail = lazy(() => import("./pages/ResultsDetail"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const ResponsibleUse = lazy(() => import("./pages/ResponsibleUse"));
const DataSources = lazy(() => import("./pages/DataSources"));
const Support = lazy(() => import("./pages/Support"));
const SupportConfirmation = lazy(() => import("./pages/SupportConfirmation"));
const MyTickets = lazy(() => import("./pages/MyTickets"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const UsernamePage = lazy(() => import("./pages/UsernamePage"));
const ApiDocs = lazy(() => import("./pages/docs/ApiDocs"));
const ApiDocsNew = lazy(() => import("./pages/ApiDocs"));
const DeveloperPortal = lazy(() => import("./pages/DeveloperPortal"));
const ExecutiveDashboard = lazy(() => import("./pages/ExecutiveDashboard"));
const AdvancedAnalytics = lazy(() => import("./pages/AdvancedAnalytics"));
const Teams = lazy(() => import("./pages/Teams"));
const TeamDetail = lazy(() => import("./pages/TeamDetail"));
const Workflows = lazy(() => import("./pages/Workflows"));
const Security = lazy(() => import("./pages/Security"));
const PluginMarketplace = lazy(() => import("./pages/PluginMarketplace"));
const PredictiveAnalytics = lazy(() => import("./pages/PredictiveAnalytics"));
const RoleManagement = lazy(() => import("./pages/admin/RoleManagement"));
const PersonaDnaLaunch = lazy(() => import("./pages/blog/PersonaDnaLaunch"));
const Analyst = lazy(() => import("./pages/Analyst"));
const Assistant = lazy(() => import("./pages/Assistant"));
const Cases = lazy(() => import("./pages/Cases"));
const CaseDetail = lazy(() => import("./pages/CaseDetail"));
const Monitoring = lazy(() => import("./pages/Monitoring"));
const Trends = lazy(() => import("./pages/Trends"));
const Reports = lazy(() => import("./pages/Reports"));
const PartnersIndex = lazy(() => import("./pages/partners/Index"));
const PartnerDashboard = lazy(() => import("./pages/partners/Dashboard"));
const GlobalIndex = lazy(() => import("./pages/GlobalIndex"));
const ResourcesIndex = lazy(() => import("./pages/resources/Index"));
const WebinarsPage = lazy(() => import("./pages/resources/Webinars"));
const Organization = lazy(() => import("./pages/Organization"));
const ThreatIntel = lazy(() => import("./pages/ThreatIntel"));
const Compliance = lazy(() => import("./pages/Compliance"));
const AutomatedRemoval = lazy(() => import("./pages/AutomatedRemoval"));
const Integrations = lazy(() => import("./pages/Integrations"));
const Analytics = lazy(() => import("./pages/Analytics"));
const RlsCheck = lazy(() => import("./pages/admin/RlsCheck"));
const Providers = lazy(() => import("./pages/admin/Providers"));
const Health = lazy(() => import("./pages/admin/Health"));
const Observability = lazy(() => import("./pages/admin/Observability"));
const Policies = lazy(() => import("./pages/admin/Policies"));
const AuditLogs = lazy(() => import("./pages/admin/AuditLogs"));
const Workspace = lazy(() => import("./pages/Workspace"));
const Workspaces = lazy(() => import("./pages/Workspaces"));
const Trust = lazy(() => import("./pages/Trust"));
const HowWeSourceData = lazy(() => import("./pages/HowWeSourceData"));
const Graph = lazy(() => import("./pages/Graph"));
const Search = lazy(() => import("./pages/Search"));
const AIAnalyst = lazy(() => import("./pages/AIAnalyst"));
const MonitorRunDetail = lazy(() => import("./pages/MonitorRunDetail"));
const WorkspaceAudit = lazy(() => import("./pages/admin/WorkspaceAudit"));
const Preferences = lazy(() => import("./pages/Preferences"));
const Timeline = lazy(() => import("./pages/Timeline"));
const Watchlists = lazy(() => import("./pages/Watchlists"));
const AnalystScoreboard = lazy(() => import("./pages/AnalystScoreboard"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const MarketplaceSubmit = lazy(() => import("./pages/MarketplaceSubmit"));
const MarketplacePlugin = lazy(() => import("./pages/MarketplacePlugin"));
const PersonaResolver = lazy(() => import("./pages/PersonaResolver"));
const ThreatForecast = lazy(() => import("./pages/ThreatForecast"));
const ClientPortal = lazy(() => import("./pages/ClientPortal"));
const Insights = lazy(() => import("./pages/Insights"));
const Automation = lazy(() => import("./pages/Automation"));
const Agents = lazy(() => import("./pages/Agents"));
const TrustAIAgents = lazy(() => import("./pages/TrustAIAgents"));
const MarketplaceReview = lazy(() => import("./pages/admin/MarketplaceReview"));
const QualityLab = lazy(() => import("./pages/admin/QualityLab"));
const ObservabilityDashboard = lazy(() => import("./pages/admin/ObservabilityDashboard"));
const CircuitBreakers = lazy(() => import("./pages/admin/CircuitBreakers"));
const CostTracking = lazy(() => import("./pages/admin/CostTracking"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const OrganizationNew = lazy(() => import("./pages/OrganizationNew"));
const Performance = lazy(() => import("./pages/admin/Performance"));
const Subscription = lazy(() => import("./pages/Subscription"));
const EmbedWidget = lazy(() => import("./pages/EmbedWidget"));
const InstallApp = lazy(() => import("./pages/InstallApp"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppContent() {
  return (
    <>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RouterContent />
      </BrowserRouter>
    </>
  );
}

function RouterContent() {
  useKeyboardShortcuts();
  
  return (
    <>
      <GlobalSearch />
      <Suspense fallback={<LoadingState />}>
        <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/results/:scanId" element={<ResultsDetail />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/responsible-use" element={<ResponsibleUse />} />
          <Route path="/data-sources" element={<DataSources />} />
          <Route path="/how-we-source-data" element={<DataSources />} />
          <Route path="/support" element={<Support />} />
          <Route path="/support/confirmation" element={<SupportConfirmation />} />
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/persona-dna-and-evidence-packs" element={<PersonaDnaLaunch />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/usernames" element={<UsernamePage />} />
          <Route path="/docs/api" element={<ApiDocs />} />
          <Route path="/api" element={<ApiDocsNew />} />
          <Route path="/developers" element={<DeveloperPortal />} />
          <Route path="/analyst" element={<Analyst />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/cases/:caseId" element={<CaseDetail />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/partners" element={<PartnersIndex />} />
          <Route path="/partners/dashboard" element={<PartnerDashboard />} />
          <Route path="/global-index" element={<GlobalIndex />} />
          <Route path="/resources" element={<ResourcesIndex />} />
          <Route path="/resources/webinars" element={<WebinarsPage />} />
          <Route path="/organization" element={<Organization />} />
          <Route path="/threat-intel" element={<ThreatIntel />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/automated-removal" element={<AutomatedRemoval />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/analytics/executive" element={<ExecutiveDashboard />} />
          <Route path="/analytics/advanced" element={<AdvancedAnalytics />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/teams/:teamId" element={<TeamDetail />} />
            <Route path="/workflows" element={<Workflows />} />
            <Route path="/security" element={<Security />} />
            <Route path="/plugins" element={<PluginMarketplace />} />
            <Route path="/predictive-analytics" element={<PredictiveAnalytics />} />
            <Route path="/admin/roles" element={<RoleManagement />} />
          <Route path="/admin/rls-check" element={<RlsCheck />} />
          <Route path="/admin/providers" element={<Providers />} />
          <Route path="/admin/health" element={<Health />} />
          <Route path="/admin/observability" element={<Observability />} />
          <Route path="/admin/policies" element={<Policies />} />
          <Route path="/admin/audit-logs" element={<AuditLogs />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/workspaces" element={<Workspaces />} />
          <Route path="/trust" element={<Trust />} />
          <Route path="/how-we-source-data" element={<HowWeSourceData />} />
          <Route path="/graph" element={<Graph />} />
          <Route path="/search" element={<Search />} />
          <Route path="/ai-analyst" element={<AIAnalyst />} />
          <Route path="/monitoring/:runId" element={<MonitorRunDetail />} />
          <Route path="/preferences" element={<Preferences />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/watchlists" element={<Watchlists />} />
          <Route path="/analyst-scoreboard" element={<AnalystScoreboard />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/submit" element={<MarketplaceSubmit />} />
          <Route path="/marketplace/plugin/:pluginId" element={<MarketplacePlugin />} />
          <Route path="/admin/marketplace/review" element={<MarketplaceReview />} />
          <Route path="/admin/quality-lab" element={<QualityLab />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/observability" element={<ObservabilityDashboard />} />
          <Route path="/admin/circuit-breakers" element={<CircuitBreakers />} />
          <Route path="/admin/cost-tracking" element={<CostTracking />} />
          <Route path="/admin/workspace-audit" element={<WorkspaceAudit />} />
          <Route path="/admin/performance" element={<Performance />} />
        
          {/* AI Fusion & Predictive Routes */}
          <Route path="/persona-resolver" element={<PersonaResolver />} />
          <Route path="/threat-forecast" element={<ThreatForecast />} />
          <Route path="/clients/:clientId" element={<ClientPortal />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/automation" element={<Automation />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/trust/ai-agents" element={<TrustAIAgents />} />
          <Route path="/integrations" element={<div className="container mx-auto py-8"><h1 className="text-3xl">Integrations coming soon</h1></div>} />
        
          {/* Workspace & Collaboration Routes */}
          <Route path="/workspaces" element={<OrganizationNew />} />
          
          {/* Embeddable Widget */}
          <Route path="/embed/widget" element={<EmbedWidget />} />
          <Route path="/install" element={<InstallApp />} />
          
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </Suspense>
            <CookieConsent />
          </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;