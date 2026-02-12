import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { CookieConsent } from "@/components/consent/CookieConsent";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GlobalSearch } from "@/components/GlobalSearch";
import { SkipLink } from "@/components/SkipLink";
import { lazy, Suspense, useEffect } from "react";
import { LoadingState } from "@/components/LoadingState";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useAccessibility } from "@/hooks/useAccessibility";
import { useGoogleAnalytics } from "@/hooks/useGoogleAnalytics";
import { useTheme } from "next-themes";
import { HelmetProvider } from 'react-helmet-async';
import { PageTransition } from "@/components/PageTransition";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { MobileCTABar } from "@/components/MobileCTABar";
import { FloatingProgressTracker } from "@/components/FloatingProgressTracker";
import { ActiveScanProvider } from "@/contexts/ActiveScanContext";
import { ProUnlockWrapper } from "@/components/billing/ProUnlockWrapper";
import "@/lib/config"; // Validate env at boot

// Critical pages (loaded immediately for LCP optimization)
import Index from "./pages/Index";
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
import NotFound from "./pages/NotFound";

// Lazy-loaded pages (loaded on demand)
const ScanPage = lazy(() => import("./pages/ScanPage"));
const ResultsDetail = lazy(() => import("./pages/ResultsDetail"));
const AnomalyHistory = lazy(() => import("./pages/AnomalyHistory"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const ResponsibleUse = lazy(() => import("./pages/ResponsibleUse"));
const DataSources = lazy(() => import("./pages/DataSources"));
const Support = lazy(() => import("./pages/Support"));
const SupportConfirmation = lazy(() => import("./pages/SupportConfirmation"));
const MyTickets = lazy(() => import("./pages/MyTickets"));
const IntelligenceDashboard = lazy(() => import("./pages/IntelligenceDashboard"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const UsernamePage = lazy(() => import("./pages/UsernamePage"));
const EmailBreachCheckPage = lazy(() => import("./pages/EmailBreachCheckPage"));
const UsernameSearchToolsPage = lazy(() => import("./pages/UsernameSearchToolsPage"));
const EmailBreachToolsPage = lazy(() => import("./pages/EmailBreachToolsPage"));
const ApiDocsOld = lazy(() => import("./pages/docs/ApiDocs"));
const DeveloperPortal = lazy(() => import("./pages/DeveloperPortal"));
const ExecutiveDashboard = lazy(() => import("./pages/ExecutiveDashboard"));
const AdvancedAnalytics = lazy(() => import("./pages/AdvancedAnalytics"));
const Teams = lazy(() => import("./pages/Teams"));
const TeamDetail = lazy(() => import("./pages/TeamDetail"));
const Workflows = lazy(() => import("./pages/Workflows"));
const WorkflowNew = lazy(() => import("./pages/WorkflowNew"));
const Security = lazy(() => import("./pages/Security"));
const PluginMarketplace = lazy(() => import("./pages/PluginMarketplace"));
const PredictiveAnalytics = lazy(() => import("./pages/PredictiveAnalytics"));
const RoleManagement = lazy(() => import("./pages/admin/RoleManagement"));
const PersonaDnaLaunch = lazy(() => import("./pages/blog/PersonaDnaLaunch"));
const WhatIsOsintRisk = lazy(() => import("./pages/blog/WhatIsOsintRisk"));
const AiInOsint2025 = lazy(() => import("./pages/blog/AiInOsint2025"));
const OsintAiEra2026 = lazy(() => import("./pages/blog/OsintAiEra2026"));
const BuyCreditsPage = lazy(() => import("./pages/BuyCreditsPage"));
const DarkWebMonitoringBlog = lazy(() => import("./pages/blog/DarkWebMonitoringExplained"));
const WhatIsDigitalFootprint = lazy(() => import("./pages/blog/WhatIsDigitalFootprint"));
const CheckEmailBreach = lazy(() => import("./pages/blog/CheckEmailBreach"));
const OsintBeginnersGuide = lazy(() => import("./pages/blog/OsintBeginnersGuide"));
const RemoveDataBrokers = lazy(() => import("./pages/blog/RemoveDataBrokers"));
const SocialMediaPrivacy = lazy(() => import("./pages/blog/SocialMediaPrivacy"));
const PhoneNumberPrivacy = lazy(() => import("./pages/blog/PhoneNumberPrivacy"));
const UsernameSecurity = lazy(() => import("./pages/blog/UsernameSecurity"));
const IpAddressSecurity = lazy(() => import("./pages/blog/IpAddressSecurity"));
const IdentityTheftResponse = lazy(() => import("./pages/blog/IdentityTheftResponse"));
const PasswordSecurityGuide = lazy(() => import("./pages/blog/PasswordSecurityGuide"));
const VpnPrivacyGuide = lazy(() => import("./pages/blog/VpnPrivacyGuide"));
const TwoFactorAuthentication = lazy(() => import("./pages/blog/TwoFactorAuthentication"));
const SecureBrowsingGuide = lazy(() => import("./pages/blog/SecureBrowsingGuide"));
const FreeUsernameSearch = lazy(() => import("./pages/blog/FreeUsernameSearch"));
const UsernameReuse = lazy(() => import("./pages/blog/UsernameReuse"));
const WhatIsDigitalExposure = lazy(() => import("./pages/blog/WhatIsDigitalExposure"));
const UsernameSearchMisleading = lazy(() => import("./pages/blog/UsernameSearchMisleading"));
const LensOsintConfidenceWrong = lazy(() => import("./pages/blog/LensOsintConfidenceWrong"));
const LensIntroduction = lazy(() => import("./pages/blog/LensIntroduction"));
const LensConfidenceMeaning = lazy(() => import("./pages/blog/LensConfidenceMeaning"));
const LensCaseStudyFalsePositive = lazy(() => import("./pages/blog/LensCaseStudyFalsePositive"));
const DarkWebScansNoise = lazy(() => import("./pages/blog/DarkWebScansNoise"));
const OsintToInsight = lazy(() => import("./pages/blog/OsintToInsight"));
const EthicalOsintExposure = lazy(() => import("./pages/blog/EthicalOsintExposure"));
const DarkWebMonitoring = lazy(() => import("./pages/DarkWebMonitoring"));
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
const ScanAnalytics = lazy(() => import("./pages/ScanAnalytics"));
const RlsCheck = lazy(() => import("./pages/admin/RlsCheck"));
const Providers = lazy(() => import("./pages/admin/Providers"));
const Health = lazy(() => import("./pages/admin/Health"));
const Observability = lazy(() => import("./pages/admin/Observability"));
const Glitches = lazy(() => import("./pages/admin/Glitches"));
const Policies = lazy(() => import("./pages/admin/Policies"));
const AuditLogs = lazy(() => import("./pages/admin/AuditLogs"));
const Audit = lazy(() => import("./pages/admin/Audit"));
const SystemAudit = lazy(() => import("./pages/admin/SystemAudit"));
const PaymentErrors = lazy(() => import("./pages/Admin/PaymentErrors"));
const FalsePositivesReview = lazy(() => import("./pages/Admin/FalsePositivesReview"));
const SecurityReport = lazy(() => import("./pages/admin/SecurityReport"));
const Workspace = lazy(() => import("./pages/Workspace"));
const Workspaces = lazy(() => import("./pages/Workspaces"));
const WorkspaceManagement = lazy(() => import("./pages/WorkspaceManagement"));
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
const ErrorViewer = lazy(() => import("./pages/admin/ErrorViewer"));
const SystemHealth = lazy(() => import("./pages/admin/SystemHealth"));
const DatabaseExport = lazy(() => import("./pages/admin/DatabaseExport"));
const ScanManagement = lazy(() => import("./pages/admin/ScanManagement"));
const ScanTimeline = lazy(() => import("./pages/ScanTimeline"));
const ProviderHealth = lazy(() => import("./pages/admin/ProviderHealth"));
const ApiKeys = lazy(() => import("./pages/ApiKeys"));
const Admin = lazy(() => import("./pages/Admin"));
const OrganizationNew = lazy(() => import("./pages/OrganizationNew"));
const Performance = lazy(() => import("./pages/admin/Performance"));
const Subscription = lazy(() => import("./pages/Subscription"));
const EmbedWidget = lazy(() => import("./pages/EmbedWidget"));
const Embed = lazy(() => import("./pages/Embed"));
const InstallApp = lazy(() => import("./pages/InstallApp"));
const Enterprise = lazy(() => import("./pages/Enterprise"));
const SettingsIndex = lazy(() => import("./pages/Settings/Index"));
const ProfileSettings = lazy(() => import("./pages/Settings/Profile"));
const Billing = lazy(() => import("./pages/Settings/Billing"));
const APIKeys = lazy(() => import("./pages/Settings/APIKeys"));
const PrivacySettings = lazy(() => import("./pages/Settings/Privacy"));
const SubscriptionSettings = lazy(() => import("./pages/Settings/Subscription"));
const SubscriptionManagement = lazy(() => import("./pages/Settings/SubscriptionManagement"));
const CreditsSettings = lazy(() => import("./pages/Settings/Credits"));
const AISettings = lazy(() => import("./pages/Settings/AISettings"));
const BrandingSettings = lazy(() => import("./pages/Settings/Branding"));
const AIAnalytics = lazy(() => import("./pages/Analytics/AIAnalytics"));
const NewReport = lazy(() => import("./pages/Reports/New"));
const ReportsList = lazy(() => import("./pages/Reports/List"));
const ApiDocs = lazy(() => import("./pages/ApiDocs"));
const DPA = lazy(() => import("./pages/legal/DPA"));
const AdvancedScan = lazy(() => import("./pages/AdvancedScan"));
const EvidencePack = lazy(() => import("./pages/EvidencePack"));
const BuyCredits = lazy(() => import("./pages/BuyCredits"));
const PricingPage = lazy(() => import("./pages/Pricing"));
const Features = lazy(() => import("./pages/Features"));
const ScanHealth = lazy(() => import("./pages/ScanHealth"));
const BatchScan = lazy(() => import("./pages/BatchScan"));
const MaigretScanner = lazy(() => import("./pages/MaigretScanner"));
const SimpleMaigretScan = lazy(() => import("./pages/SimpleMaigretScan"));
const SimpleMaigretResults = lazy(() => import("./pages/SimpleMaigretResults"));
const MaigretDebug = lazy(() => import("./pages/MaigretDebug"));
const MaigretSelfTest = lazy(() => import("./pages/MaigretSelfTest"));
const MaigretMonitoring = lazy(() => import("./pages/MaigretMonitoring"));
const UsernamesPage = lazy(() => import("./pages/scan/UsernamesPage"));
const UsernameResultsPage = lazy(() => import("./pages/scan/UsernameResultsPage"));
const EmailResultsPage = lazy(() => import("./pages/scan/EmailResultsPage"));
const PhoneResultsPage = lazy(() => import("./pages/scan/PhoneResultsPage"));
const OpsConsole = lazy(() => import("./pages/admin/OpsConsole"));
const AuditViewer = lazy(() => import("./pages/admin/AuditViewer"));
const Referrals = lazy(() => import("./pages/Referrals"));
const Research = lazy(() => import("./pages/Research"));
const AdminScanHealth = lazy(() => import("./pages/admin/ScanHealth"));
const SecuritySettings = lazy(() => import("./pages/admin/SecuritySettings"));
const AdminLensImages = lazy(() => import("./pages/AdminLensImages"));
const SampleReport = lazy(() => import("./pages/SampleReport"));
const ContextEnrichment = lazy(() => import("./pages/ContextEnrichment"));
const Lens = lazy(() => import("./pages/Lens"));
const DigitalFootprintScanner = lazy(() => import("./pages/DigitalFootprintScanner"));
const WhatIsDigitalFootprintEducational = lazy(() => import("./pages/WhatIsDigitalFootprintEducational"));
const UsernameExposure = lazy(() => import("./pages/UsernameExposure"));
const WhatIsOsint = lazy(() => import("./pages/WhatIsOsint"));
const ReduceDigitalFootprint = lazy(() => import("./pages/ReduceDigitalFootprint"));
const HowIdentityTheftStarts = lazy(() => import("./pages/HowIdentityTheftStarts"));
const DigitalPrivacyGlossary = lazy(() => import("./pages/DigitalPrivacyGlossary"));
const IsMyDataExposed = lazy(() => import("./pages/IsMyDataExposed"));
const OldDataBreaches = lazy(() => import("./pages/OldDataBreaches"));
const WhichDataMatters = lazy(() => import("./pages/WhichDataMatters"));
const StayPrivateOnline = lazy(() => import("./pages/StayPrivateOnline"));
const AIAnswersHub = lazy(() => import("./pages/AIAnswersHub"));
const AboutFootprintIQ = lazy(() => import("./pages/AboutFootprintIQ"));
const EditorialEthicsPolicy = lazy(() => import("./pages/EditorialEthicsPolicy"));
const EthicsPage = lazy(() => import("./pages/Ethics"));
const AIDigitalExposure = lazy(() => import("./pages/ai/DigitalExposure"));
const AIDigitalFootprint = lazy(() => import("./pages/ai/DigitalFootprint"));
const AIWhatIsOsint = lazy(() => import("./pages/ai/WhatIsOsint"));
const AIWhatIsIdentityProfiling = lazy(() => import("./pages/ai/WhatIsIdentityProfiling"));
const AIWhatAreDataBrokers = lazy(() => import("./pages/ai/WhatAreDataBrokers"));
const AIIndex = lazy(() => import("./pages/ai/Index"));
const EthicalOsintForIndividuals = lazy(() => import("./pages/EthicalOsintForIndividuals"));
const Contact = lazy(() => import("./pages/Contact"));
const UsernameReuseReport2026 = lazy(() => import("./pages/research/UsernameReuseReport2026"));
const FactSheet = lazy(() => import("./pages/research/FactSheet"));
const HowUsernameSearchToolsWork = lazy(() => import("./pages/guides/HowUsernameSearchToolsWork"));
const InterpretOsintResults = lazy(() => import("./pages/guides/InterpretOsintResults"));
const WhatOsintResultsMean = lazy(() => import("./pages/guides/WhatOsintResultsMean"));
const IsOsintScanWorthIt = lazy(() => import("./pages/guides/IsOsintScanWorthIt"));
const FreeVsPaidOsintTools = lazy(() => import("./pages/guides/FreeVsPaidOsintTools"));
const GoodOsintScanResult = lazy(() => import("./pages/guides/GoodOsintScanResult"));
const GuidesIndex = lazy(() => import("./pages/guides/GuidesIndex"));
const EthicalOsint = lazy(() => import("./pages/EthicalOsint"));
const Press = lazy(() => import("./pages/Press"));
const CryptoLandingPage = lazy(() => import("./pages/for/Crypto"));
const JobSeekersLandingPage = lazy(() => import("./pages/for/JobSeekers"));
const DevelopersLandingPage = lazy(() => import("./pages/for/Developers"));
const ExecutivesLandingPage = lazy(() => import("./pages/for/Executives"));
const ScanShare = lazy(() => import("./pages/share/ScanShare"));
const SearchUsernamePage = lazy(() => import("./pages/SearchUsername"));
const TikTokUsernameSearchPage = lazy(() => import("./pages/TikTokUsernameSearch"));
const InstagramUsernameSearchPage = lazy(() => import("./pages/InstagramUsernameSearch"));
const TwitterUsernameSearchPage = lazy(() => import("./pages/TwitterUsernameSearch"));

// AI Answers Hub - OSINT Explainer Pages
const AIAnswersWhatIsUsernameOsintScan = lazy(() => import("./pages/ai-answers/WhatIsUsernameOsintScan"));
const AIAnswersWhyUsernameReuseIsRisky = lazy(() => import("./pages/ai-answers/WhyUsernameReuseIsRisky"));
const AIAnswersAreUsernameSearchToolsAccurate = lazy(() => import("./pages/ai-answers/AreUsernameSearchToolsAccurate"));
const AIAnswersIsUsernameOsintLegal = lazy(() => import("./pages/ai-answers/IsUsernameOsintLegal"));
const AIAnswersEthicalOsintTools = lazy(() => import("./pages/ai-answers/EthicalOsintTools"));
const AIAnswersCommonOsintMisconceptions = lazy(() => import("./pages/ai-answers/CommonOsintMisconceptions"));
const AIAnswersWhenNotToUseOsint = lazy(() => import("./pages/ai-answers/WhenNotToUseOsint"));
const AIAnswersWhatIsAnIdentityRiskScore = lazy(() => import("./pages/ai-answers/WhatIsAnIdentityRiskScore"));
const AIAnswersDoesOsintIncludeDarkWebData = lazy(() => import("./pages/ai-answers/DoesOsintIncludeDarkWebData"));
const RemoveMyLifeProfile = lazy(() => import("./pages/RemoveMyLifeProfile"));
const PrivacyCentrePage = lazy(() => import("./pages/PrivacyCentrePage"));

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
    <ActiveScanProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RouterContent />
        <FloatingProgressTracker />
      </BrowserRouter>
    </ActiveScanProvider>
  );
}

function RouterContent() {
  const navigate = useNavigate();
  const { announce } = useAccessibility();
  const { resolvedTheme } = useTheme();
  
  // Dynamically update theme-color meta tag to match current theme
  useEffect(() => {
    const metas = document.querySelectorAll('meta[name="theme-color"]');
    const color = resolvedTheme === 'dark' ? '#0a0a14' : '#ffffff';
    metas.forEach((meta) => meta.setAttribute('content', color));
  }, [resolvedTheme]);

  // Android back-button handler: prevent app from closing at root in standalone PWA mode
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (!isStandalone) return;

    const handlePopState = () => {
      if (window.location.pathname === '/') {
        window.history.pushState(null, '', '/');
      }
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  // Track page views on route changes for Google Analytics
  useGoogleAnalytics();
  
  // Global navigation shortcuts
  useKeyboardShortcuts([
    {
      key: "d",
      ctrl: true,
      action: () => navigate("/dashboard"),
      description: "Go to Dashboard",
    },
    {
      key: ",",
      ctrl: true,
      action: () => navigate("/settings"),
      description: "Open Settings",
    },
  ]);
  
  return (
    <>
      <SkipLink />
      <GlobalSearch />
      <PWAInstallPrompt />
      <MobileCTABar />
      <ProUnlockWrapper />
      <Suspense fallback={<LoadingState />}>
        <PageTransition>
          <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/sample-report" element={<SampleReport />} />
            <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/advanced" element={<Navigate to="/scan" replace />} />
          <Route path="/new-scan" element={<Navigate to="/scan" replace />} />
          <Route path="/scan-history" element={<Navigate to="/dashboard" replace />} />
          <Route path="/results/:scanId" element={<ResultsDetail />} />
          <Route path="/anomaly-history" element={<AnomalyHistory />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/responsible-use" element={<ResponsibleUse />} />
          <Route path="/data-sources" element={<DataSources />} />
          <Route path="/how-we-source-data" element={<DataSources />} />
          <Route path="/support" element={<Support />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/support/confirmation" element={<SupportConfirmation />} />
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/ai-in-osint-2025" element={<AiInOsint2025 />} />
          <Route path="/blog/osint-ai-era-2026" element={<OsintAiEra2026 />} />
          <Route path="/blog/persona-dna-and-evidence-packs" element={<PersonaDnaLaunch />} />
          <Route path="/blog/what-is-osint-risk" element={<WhatIsOsintRisk />} />
          <Route path="/blog/dark-web-monitoring-explained" element={<DarkWebMonitoringBlog />} />
          <Route path="/blog/what-is-digital-footprint" element={<WhatIsDigitalFootprint />} />
          <Route path="/blog/check-email-breach" element={<CheckEmailBreach />} />
          <Route path="/blog/osint-beginners-guide" element={<OsintBeginnersGuide />} />
          <Route path="/blog/remove-data-brokers" element={<RemoveDataBrokers />} />
          <Route path="/blog/social-media-privacy" element={<SocialMediaPrivacy />} />
          <Route path="/blog/phone-number-privacy" element={<PhoneNumberPrivacy />} />
          <Route path="/blog/username-security" element={<UsernameSecurity />} />
          <Route path="/blog/ip-address-security" element={<IpAddressSecurity />} />
          <Route path="/blog/identity-theft-response" element={<IdentityTheftResponse />} />
          <Route path="/blog/password-security-guide" element={<PasswordSecurityGuide />} />
          <Route path="/blog/vpn-privacy-guide" element={<VpnPrivacyGuide />} />
          <Route path="/blog/two-factor-authentication" element={<TwoFactorAuthentication />} />
          <Route path="/blog/secure-browsing-guide" element={<SecureBrowsingGuide />} />
          <Route path="/blog/free-username-search" element={<FreeUsernameSearch />} />
          <Route path="/blog/username-reuse" element={<UsernameReuse />} />
          <Route path="/blog/what-is-digital-exposure" element={<WhatIsDigitalExposure />} />
          <Route path="/blog/username-search-misleading" element={<UsernameSearchMisleading />} />
          <Route path="/blog/lens-osint-confidence-wrong" element={<LensOsintConfidenceWrong />} />
          <Route path="/blog/lens-introduction" element={<LensIntroduction />} />
          <Route path="/blog/lens-confidence-meaning" element={<LensConfidenceMeaning />} />
          <Route path="/blog/lens-case-study-false-positive" element={<LensCaseStudyFalsePositive />} />
          <Route path="/blog/dark-web-scans-noise" element={<DarkWebScansNoise />} />
          <Route path="/blog/osint-to-insight" element={<OsintToInsight />} />
          <Route path="/blog/ethical-osint-exposure" element={<EthicalOsintExposure />} />
          <Route path="/dark-web-monitoring" element={<DarkWebMonitoring />} />
          <Route path="/remove-mylife-profile" element={<RemoveMyLifeProfile />} />
          <Route path="/privacy-centre" element={<PrivacyCentrePage />} />
          <Route path="/lens" element={<Lens />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/usernames" element={<UsernamePage />} />
          <Route path="/username-search" element={<UsernamePage />} />
          <Route path="/email-breach-check" element={<EmailBreachCheckPage />} />
          <Route path="/email-exposure" element={<EmailBreachCheckPage />} />
          <Route path="/username-search-tools" element={<UsernameSearchToolsPage />} />
          <Route path="/email-breach-tools" element={<EmailBreachToolsPage />} />
          <Route path="/maigret-scanner" element={<MaigretScanner />} />
          <Route path="/dashboard/maigret" element={<MaigretMonitoring />} />
          <Route path="/maigret/simple" element={<SimpleMaigretScan />} />
          <Route path="/maigret/results/:jobId" element={<SimpleMaigretResults />} />
          <Route path="/maigret/debug" element={<MaigretDebug />} />
          <Route path="/maigret/self-test" element={<MaigretSelfTest />} />
          <Route path="/scan/usernames" element={<UsernamesPage />} />
          <Route path="/scan/usernames/:jobId" element={<UsernameResultsPage />} />
          <Route path="/scan/emails/:jobId" element={<EmailResultsPage />} />
          <Route path="/scan/phones/:jobId" element={<PhoneResultsPage />} />
          <Route path="/docs/api" element={<ApiDocsOld />} />
          
          <Route path="/api" element={<ApiDocs />} />
          <Route path="/developers" element={<DeveloperPortal />} />
          <Route path="/analyst" element={<Analyst />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/cases/:caseId" element={<CaseDetail />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/new" element={<NewReport />} />
          <Route path="/reports/list" element={<ReportsList />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/features" element={<Features />} />
          <Route path="/enterprise" element={<Enterprise />} />
          <Route path="/settings" element={<SettingsIndex />} />
          <Route path="/settings/profile" element={<ProfileSettings />} />
          <Route path="/settings/billing" element={<Billing />} />
          <Route path="/settings/api-keys" element={<APIKeys />} />
          <Route path="/settings/privacy" element={<PrivacySettings />} />
          <Route path="/settings/subscription" element={<SubscriptionSettings />} />
          <Route path="/settings/subscription-management" element={<SubscriptionManagement />} />
          <Route path="/settings/credits" element={<CreditsSettings />} />
          <Route path="/settings/ai" element={<AISettings />} />
          <Route path="/settings/branding" element={<BrandingSettings />} />
          <Route path="/analytics/ai" element={<AIAnalytics />} />
          <Route path="/analytics/scans" element={<ScanAnalytics />} />
          <Route path="/api-docs" element={<ApiDocs />} />
          <Route path="/context-enrichment" element={<ContextEnrichment />} />
          <Route path="/legal/dpa" element={<DPA />} />
          <Route path="/scan/advanced" element={<Navigate to="/scan" replace />} />
          <Route path="/evidence-pack" element={<EvidencePack />} />
          <Route path="/settings/health" element={<ScanHealth />} />
          <Route path="/scan/batch" element={<BatchScan />} />
          <Route path="/buy-credits" element={<BuyCreditsPage />} />
          <Route path="/partners" element={<PartnersIndex />} />
          <Route path="/partners/dashboard" element={<PartnerDashboard />} />
          <Route path="/global-index" element={<GlobalIndex />} />
          <Route path="/intelligence" element={<IntelligenceDashboard />} />
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
            <Route path="/workflows/new" element={<WorkflowNew />} />
            <Route path="/security" element={<Security />} />
            <Route path="/plugins" element={<PluginMarketplace />} />
            <Route path="/predictive-analytics" element={<PredictiveAnalytics />} />
          <Route path="/admin/roles" element={<RoleManagement />} />
          <Route path="/admin/rls-check" element={<RlsCheck />} />
          <Route path="/admin/security-report" element={<SecurityReport />} />
          <Route path="/admin/scan-management" element={<ScanManagement />} />
          <Route path="/admin/scans" element={<ScanManagement />} />
          <Route path="/admin/provider-health" element={<ProviderHealth />} />
          <Route path="/scan/:scanId/timeline" element={<ScanTimeline />} />
          <Route path="/api-keys" element={<ApiKeys />} />
          <Route path="/admin/providers" element={<Providers />} />
          <Route path="/admin/health" element={<Health />} />
          <Route path="/admin/observability" element={<Observability />} />
          <Route path="/admin/glitches" element={<Glitches />} />
          <Route path="/admin/policies" element={<Policies />} />
          <Route path="/admin/audit-logs" element={<AuditLogs />} />
          <Route path="/admin/audit" element={<Audit />} />
          <Route path="/admin/system-audit" element={<SystemAudit />} />
          <Route path="/admin/payment-errors" element={<PaymentErrors />} />
          <Route path="/admin/false-positives" element={<FalsePositivesReview />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/workspaces" element={<Workspaces />} />
          <Route path="/workspace-management" element={<WorkspaceManagement />} />
          <Route path="/trust" element={<Trust />} />
          <Route path="/how-we-source-data" element={<HowWeSourceData />} />
          <Route path="/graph" element={<Graph />} />
          <Route path="/search" element={<Search />} />
          <Route path="/ai-analyst" element={<AIAnalyst />} />
          <Route path="/monitoring/:runId" element={<MonitorRunDetail />} />
          <Route path="/preferences" element={<Preferences />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/embed" element={<Embed />} />
          <Route path="/embed-widget" element={<EmbedWidget />} />
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
          <Route path="/admin/incidents" element={<ObservabilityDashboard />} />
          <Route path="/admin/circuit-breakers" element={<CircuitBreakers />} />
          <Route path="/admin/cost-tracking" element={<CostTracking />} />
          <Route path="/admin/workspace-audit" element={<WorkspaceAudit />} />
          <Route path="/admin/performance" element={<Performance />} />
          <Route path="/admin/errors" element={<ErrorViewer />} />
          <Route path="/admin/ops" element={<OpsConsole />} />
          <Route path="/admin/audit-viewer" element={<AuditViewer />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/admin/system-health" element={<SystemHealth />} />
          <Route path="/admin/lens-images" element={<AdminLensImages />} />
          <Route path="/admin/security-settings" element={<SecuritySettings />} />
          <Route path="/admin/scan-health" element={<AdminScanHealth />} />
          <Route path="/admin/database-export" element={<DatabaseExport />} />
          <Route path="/admin/users" element={<Admin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/research" element={<Research />} />
          <Route path="/research/username-reuse-report-2026" element={<UsernameReuseReport2026 />} />
          <Route path="/research/fact-sheet" element={<FactSheet />} />
          <Route path="/guides" element={<GuidesIndex />} />
          <Route path="/guides/how-username-search-tools-work" element={<HowUsernameSearchToolsWork />} />
            <Route path="/guides/interpret-osint-results" element={<InterpretOsintResults />} />
            <Route path="/guides/what-osint-results-mean" element={<WhatOsintResultsMean />} />
            <Route path="/guides/is-osint-scan-worth-it" element={<IsOsintScanWorthIt />} />
            <Route path="/guides/free-vs-paid-osint-tools" element={<FreeVsPaidOsintTools />} />
            <Route path="/guides/good-osint-scan-result" element={<GoodOsintScanResult />} />
           
           {/* SEO Pillar Pages */}
          <Route path="/digital-footprint-scanner" element={<DigitalFootprintScanner />} />
          <Route path="/digital-footprint-check" element={<DigitalFootprintScanner />} />
          <Route path="/online-footprint-scanner" element={<DigitalFootprintScanner />} />
          <Route path="/what-is-a-digital-footprint" element={<WhatIsDigitalFootprintEducational />} />
          <Route path="/username-exposure" element={<UsernameExposure />} />
          <Route path="/what-is-osint" element={<WhatIsOsint />} />
        
          {/* AI Fusion & Predictive Routes */}
          <Route path="/persona-resolver" element={<PersonaResolver />} />
          <Route path="/threat-forecast" element={<ThreatForecast />} />
          <Route path="/clients/:clientId" element={<ClientPortal />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/automation" element={<Automation />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/trust/ai-agents" element={<TrustAIAgents />} />
          <Route path="/reduce-digital-footprint" element={<ReduceDigitalFootprint />} />
          <Route path="/how-identity-theft-starts" element={<HowIdentityTheftStarts />} />
          <Route path="/digital-privacy-glossary" element={<DigitalPrivacyGlossary />} />
          <Route path="/is-my-data-exposed" element={<IsMyDataExposed />} />
          <Route path="/old-data-breaches" element={<OldDataBreaches />} />
          <Route path="/which-data-matters" element={<WhichDataMatters />} />
          <Route path="/stay-private-online" element={<StayPrivateOnline />} />
          <Route path="/ai-answers-hub" element={<AIAnswersHub />} />
          <Route path="/about-footprintiq" element={<AboutFootprintIQ />} />
          <Route path="/editorial-ethics-policy" element={<EditorialEthicsPolicy />} />
          <Route path="/ethics" element={<EthicsPage />} />
          <Route path="/ai" element={<AIIndex />} />
          <Route path="/ai/digital-exposure" element={<AIDigitalExposure />} />
          <Route path="/ai/digital-footprint" element={<AIDigitalFootprint />} />
          <Route path="/ai/what-is-osint" element={<AIWhatIsOsint />} />
          <Route path="/ai/what-is-identity-profiling" element={<AIWhatIsIdentityProfiling />} />
          <Route path="/ai/what-are-data-brokers" element={<AIWhatAreDataBrokers />} />
          
          {/* AI Answers Hub - OSINT Explainer Pages */}
          <Route path="/ai-answers" element={<Navigate to="/ai-answers-hub" replace />} />
          <Route path="/ai-answers/what-is-a-username-osint-scan" element={<AIAnswersWhatIsUsernameOsintScan />} />
          <Route path="/ai-answers/why-username-reuse-is-risky" element={<AIAnswersWhyUsernameReuseIsRisky />} />
          <Route path="/ai-answers/are-username-search-tools-accurate" element={<AIAnswersAreUsernameSearchToolsAccurate />} />
          <Route path="/ai-answers/is-username-osint-legal" element={<AIAnswersIsUsernameOsintLegal />} />
          <Route path="/ai-answers/ethical-osint-tools" element={<AIAnswersEthicalOsintTools />} />
          <Route path="/ai-answers/common-osint-misconceptions" element={<AIAnswersCommonOsintMisconceptions />} />
          <Route path="/ai-answers/when-not-to-use-osint" element={<AIAnswersWhenNotToUseOsint />} />
          <Route path="/ai-answers/what-is-an-identity-risk-score" element={<AIAnswersWhatIsAnIdentityRiskScore />} />
          <Route path="/ai-answers/does-osint-include-dark-web-data" element={<AIAnswersDoesOsintIncludeDarkWebData />} />
          
          <Route path="/ethical-osint-for-individuals" element={<EthicalOsintForIndividuals />} />
          <Route path="/ethical-osint" element={<EthicalOsint />} />
          <Route path="/press" element={<Press />} />
          <Route path="/media" element={<Press />} />
          
          {/* Niche Landing Pages */}
          <Route path="/for/crypto" element={<CryptoLandingPage />} />
          <Route path="/for/job-seekers" element={<JobSeekersLandingPage />} />
          <Route path="/for/developers" element={<DevelopersLandingPage />} />
          <Route path="/for/executives" element={<ExecutivesLandingPage />} />
          
          {/* Share Pages */}
          <Route path="/share/:scanId" element={<ScanShare />} />
          
          {/* Platform-Specific Username Search Pages */}
          <Route path="/search-username" element={<SearchUsernamePage />} />
          <Route path="/tiktok-username-search" element={<TikTokUsernameSearchPage />} />
          <Route path="/instagram-username-search" element={<InstagramUsernameSearchPage />} />
          <Route path="/twitter-username-search" element={<TwitterUsernameSearchPage />} />
          
          {/* Embeddable Widget */}
          <Route path="/embed/widget" element={<EmbedWidget />} />
          <Route path="/install" element={<InstallApp />} />
          
              <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PageTransition>
            </Suspense>
            <CookieConsent />
          </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;