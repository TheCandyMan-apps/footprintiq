import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CookieConsent } from "@/components/CookieConsent";
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
import PersonaDnaLaunch from "./pages/blog/PersonaDnaLaunch";
import Analyst from "./pages/Analyst";
import Assistant from "./pages/Assistant";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          <Route path="/analyst" element={<Analyst />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
        <CookieConsent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;