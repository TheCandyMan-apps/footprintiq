import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CookieConsent } from "@/components/CookieConsent";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GlobalSearch } from "@/components/GlobalSearch";
import "@/lib/config"; // Validate env at boot
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ScanPage from "./pages/ScanPage";
import ResultsDetail from "./pages/ResultsDetail";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ResponsibleUse from "./pages/ResponsibleUse";
import DataSources from "./pages/DataSources";
import Support from "./pages/Support";
import SupportConfirmation from "./pages/SupportConfirmation";
import MyTickets from "./pages/MyTickets";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import UsernamePage from "./pages/UsernamePage";
import ApiDocs from "./pages/docs/ApiDocs";
import ApiDocsNew from "./pages/ApiDocs";
import DeveloperPortal from "./pages/DeveloperPortal";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import Teams from "./pages/Teams";
import TeamDetail from "./pages/TeamDetail";
import Workflows from "./pages/Workflows";
import Security from "./pages/Security";
import PluginMarketplace from "./pages/PluginMarketplace";
import PredictiveAnalytics from "./pages/PredictiveAnalytics";
import RoleManagement from "./pages/admin/RoleManagement";
import PersonaDnaLaunch from "./pages/blog/PersonaDnaLaunch";
import Analyst from "./pages/Analyst";
import Assistant from "./pages/Assistant";
import Cases from "./pages/Cases";
import CaseDetail from "./pages/CaseDetail";
import Monitoring from "./pages/Monitoring";
import Trends from "./pages/Trends";
import Reports from "./pages/Reports";
import PartnersIndex from "./pages/partners/Index";
import PartnerDashboard from "./pages/partners/Dashboard";
import GlobalIndex from "./pages/GlobalIndex";
import ResourcesIndex from "./pages/resources/Index";
import WebinarsPage from "./pages/resources/Webinars";
import Organization from "./pages/Organization";
import ThreatIntel from "./pages/ThreatIntel";
import Compliance from "./pages/Compliance";
import AutomatedRemoval from "./pages/AutomatedRemoval";
import Integrations from "./pages/Integrations";
import Analytics from "./pages/Analytics";
import RlsCheck from "./pages/admin/RlsCheck";
import Providers from "./pages/admin/Providers";
import Health from "./pages/admin/Health";
import Observability from "./pages/admin/Observability";
import Policies from "./pages/admin/Policies";
import AuditLogs from "./pages/admin/AuditLogs";
import Workspace from "./pages/Workspace";
import Workspaces from "./pages/Workspaces";
import Trust from "./pages/Trust";
import HowWeSourceData from "./pages/HowWeSourceData";
import Graph from "./pages/Graph";
import Search from "./pages/Search";
import AIAnalyst from "./pages/AIAnalyst";
import MonitorRunDetail from "./pages/MonitorRunDetail";
import WorkspaceAudit from "./pages/admin/WorkspaceAudit";
import Preferences from "./pages/Preferences";
import Timeline from "./pages/Timeline";
import Watchlists from "./pages/Watchlists";
import AnalystScoreboard from "./pages/AnalystScoreboard";
import HelpCenter from "./pages/HelpCenter";
import Onboarding from "./pages/Onboarding";
import Marketplace from "./pages/Marketplace";
import MarketplaceSubmit from "./pages/MarketplaceSubmit";
import MarketplacePlugin from "./pages/MarketplacePlugin";
import PersonaResolver from "./pages/PersonaResolver";
import ThreatForecast from "./pages/ThreatForecast";
import ClientPortal from "./pages/ClientPortal";
import Insights from "./pages/Insights";
import Automation from "./pages/Automation";
import Agents from "./pages/Agents";
import TrustAIAgents from "./pages/TrustAIAgents";
import MarketplaceReview from "./pages/admin/MarketplaceReview";
import QualityLab from "./pages/admin/QualityLab";
import ObservabilityDashboard from "./pages/admin/ObservabilityDashboard";
import CircuitBreakers from "./pages/admin/CircuitBreakers";
import CostTracking from "./pages/admin/CostTracking";
import AdminDashboard from "./pages/admin/Dashboard";
import OrganizationNew from "./pages/OrganizationNew";
import Performance from "./pages/admin/Performance";
import Subscription from "./pages/Subscription";
import EmbedWidget from "./pages/EmbedWidget";
import InstallApp from "./pages/InstallApp";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <ErrorBoundary>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <GlobalSearch />
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
        <CookieConsent />
      </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;