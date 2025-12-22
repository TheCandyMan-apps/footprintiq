import { FootprintDNACard } from '@/components/FootprintDNACard';
import { FootprintDNAModal } from '@/components/FootprintDNAModal';
import { IdentityStrengthScore } from '@/components/intelligence/IdentityStrengthScore';
import { UsernameUniquenessScore } from '@/components/intelligence/UsernameUniquenessScore';
import { FootprintClusterMap } from '@/components/intelligence/FootprintClusterMap';
import { ProviderStatusPanel } from '@/components/maigret/ProviderStatusPanel';
import { RemovalQueue } from '@/components/RemovalQueue';
import { RemovalSuccessTracker } from '@/components/RemovalSuccessTracker';
import { TrustBadges } from '@/components/TrustBadges';
import { LastScanned } from '@/components/LastScanned';
import { ConfidenceScoreBadge } from '@/components/ConfidenceScoreBadge';
import { ConfidenceScoreIndicator } from '@/components/ConfidenceScoreIndicator';
import { ProviderMatchVisual } from '@/components/ProviderMatchVisual';
import { PhoneIntelligenceCard } from '@/components/results/PhoneIntelligenceCard';
import { PhoneExportOptions } from '@/components/results/PhoneExportOptions';
import { LockedInsightTile } from '@/components/results/LockedInsightTile';
import { usePhoneProviderStatuses } from '@/hooks/usePhoneProviderStatuses';
import { analyzeTrends } from '@/lib/trends';
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ScanErrorBoundary } from "@/components/ScanErrorBoundary";
import { AIAnalysis } from "@/components/AIAnalysis";
import { AIInsightsCard } from "@/components/AIInsightsCard";
import { CatfishDetection } from '@/components/CatfishDetection';
import { TimelineChart } from "@/components/TimelineChart";
import { ShareReportDialog } from "@/components/ShareReportDialog";
import { PDFReportButton } from "@/components/PDFReportButton";
import { ComprehensiveReportExport } from "@/components/ComprehensiveReportExport";
import { GraphExplorer } from "@/components/GraphExplorer";
import { MonitoringToggle } from "@/components/MonitoringToggle";
import { ScanSummary } from "@/components/ScanSummary";
import { AnomalyDetector } from "@/components/AnomalyDetector";
import { ScanProgressTracker } from "@/components/ScanProgressTracker";
import { ScanStatusIndicator } from "@/components/scan/ScanStatusIndicator";
import { ScanExecutionSummary } from "@/components/scan/ScanExecutionSummary";
import { FindingCard } from "@/components/scan/FindingCard";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, Cell, ResponsiveContainer, Legend } from "recharts";
import { clusterFindingsByDate } from "@/lib/timeline";
import { buildGraph, buildGraphFromFindings, detectEntityType } from "@/lib/graph";
import { Finding } from "@/lib/ufm";
import { ExportControls } from "@/components/ExportControls";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { exportAsJSON, exportAsCSV, exportAsPDF } from "@/lib/exports";
import { ArtifactDownloadCard } from "@/components/scan/ArtifactDownloadCard";
import { useArtifactGeneration } from "@/hooks/useArtifactGeneration";
import { cn } from "@/lib/utils";
import { normalizePlanTier, hasCapability } from '@/lib/billing/planCapabilities';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Trash2, 
  Users,
  Download,
  ArrowLeft,
  TrendingUp,
  Shield,
  Info,
  FileJson,
  FileSpreadsheet,
  FileText,
  Network,
  Zap,
  Brain
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import type { User } from "@supabase/supabase-js";
import { AddToCaseButton } from "@/components/case/AddToCaseButton";
import { ExportEnrichedButton } from "@/components/scan/ExportEnrichedButton";

interface DataSource {
  id: string;
  name: string;
  category: string;
  url: string;
  risk_level: string;
  data_found: string[];
  metadata?: any;
}

interface SocialProfile {
  id: string;
  platform: string;
  username: string;
  profile_url: string;
  found: boolean;
  followers?: string;
  last_active?: string;
  is_verified?: boolean;
  account_id?: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  account_type?: string;
  source?: string;
  metadata?: any;
}

interface Scan {
  id: string;
  scan_type: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  privacy_score: number;
  total_sources_found: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  status?: string;
  created_at: string;
}

interface RemovalRequest {
  id: string;
  source_id: string;
  source_name: string;
  source_type: string;
  status: string;
}

const privacyTips = [
  "Use strong, unique passwords for each account",
  "Enable two-factor authentication wherever available",
  "Regularly review and adjust your social media privacy settings",
  "Be cautious about sharing personal information online",
  "Use a VPN when connecting to public Wi-Fi",
  "Regularly search for your name online to monitor your digital footprint",
  "Consider using privacy-focused search engines like DuckDuckGo",
  "Review app permissions and revoke unnecessary access",
];

const ResultsDetail = () => {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Use centralized subscription hook as single source of truth
  const { 
    user, 
    subscriptionTier: rawSubscriptionTier, 
    isLoading: subscriptionLoading 
  } = useSubscription();
  
  const [scan, setScan] = useState<Scan | null>(null);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [socialProfiles, setSocialProfiles] = useState<SocialProfile[]>([]);
  const [removalRequests, setRemovalRequests] = useState<RemovalRequest[]>([]);
  const [redactPII, setRedactPII] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isDNAModalOpen, setIsDNAModalOpen] = useState(false);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const pollTriesRef = useRef(0);
  const pollTimeoutRef = useRef<number | null>(null);
  
  // Artifact generation hook
  const { artifacts, isGenerating, generateArtifacts } = useArtifactGeneration(scanId);
  
  // Phone provider statuses hook
  const { statuses: phoneProviderStatuses } = usePhoneProviderStatuses(scanId);
  
  // Normalize user plan for capability checks
  // Map enterprise -> business for planCapabilities (enterprise is our commercial name, business is internal tier)
  const userPlan = normalizePlanTier(rawSubscriptionTier === 'enterprise' ? 'business' : rawSubscriptionTier);
  
  // Terminal states that stop polling
  const TERMINAL_STATES = [
    'completed',
    'completed_empty',
    'completed_partial',
    'failed',
    'timeout',
    'error',
    'cancelled',
  ];

  useEffect(() => {
    // Reset poll counter when scanId changes
    pollTriesRef.current = 0;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        fetchScanData();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => {
      subscription.unsubscribe();
      // Clear any pending poll timeout on unmount
      if (pollTimeoutRef.current !== null) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [navigate, scanId]);

  const fetchScanData = async (opts?: { silent?: boolean }) => {
    if (!scanId) return;

    const silent = opts?.silent ?? false;

    if (!silent && !scan) setLoading(true);

    try {
      // Fetch scan
      const { data: scanData, error: scanError } = await supabase
        .from("scans")
        .select("*")
        .eq("id", scanId)
        .maybeSingle();

      if (!scanData) {
        // Detect scan stuck in pending for > 2 minutes
        const now = Date.now();
        const pollStartTime = pollTriesRef.current === 1 ? now : now - (pollTriesRef.current * 5000);
        const stuckDuration = (now - pollStartTime) / 60000; // in minutes
        
        if (stuckDuration > 2) {
          toast({
            title: "Scan Appears Stuck",
            description: "This scan may have failed to start. Please refresh or try a new scan.",
            variant: "destructive",
          });
          if (!silent) setLoading(false);
          return;
        }
        
        // Poll less frequently until the background task populates the scan (max 20 tries)
        if (pollTriesRef.current < 20) {
          pollTriesRef.current++;
          if (pollTimeoutRef.current !== null) {
            clearTimeout(pollTimeoutRef.current);
          }
          pollTimeoutRef.current = window.setTimeout(() => fetchScanData({ silent: true }), 5000);
        }
        return;
      }

      if (scanError) throw scanError;
      setScan(scanData);

      // Check if scan is stuck in pending for > 2 minutes
      if (scanData.status === 'pending') {
        const createdAt = new Date(scanData.created_at).getTime();
        const stuckDuration = (Date.now() - createdAt) / 60000;
        
        if (stuckDuration > 2) {
          toast({
            title: "Scan Processing Error",
            description: "This scan appears to be stuck. It will be automatically cleaned up soon, or you can start a new scan.",
            variant: "destructive",
          });
        }
      }

      // Stop polling if scan is in a terminal state
      if (TERMINAL_STATES.includes(scanData.status)) {
        if (pollTimeoutRef.current !== null) {
          clearTimeout(pollTimeoutRef.current);
          pollTimeoutRef.current = null;
        }
        if (!silent) setLoading(false); // Stop loading state
      }

      // Fetch trend data for this user
      if (scanData.user_id) {
        const trends = await analyzeTrends(scanData.user_id, 30);
        setTrendData(trends);
      }

      // Fetch data sources
      const { data: sources, error: sourcesError } = await supabase
        .from("data_sources")
        .select("*")
        .eq("scan_id", scanId);

      if (sourcesError) throw sourcesError;
      setDataSources(sources || []);

      // Fetch social profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("social_profiles")
        .select("*")
        .eq("scan_id", scanId)
        .eq("found", true);

      if (profilesError) throw profilesError;
      setSocialProfiles(profiles || []);

      // Fetch findings by scan_id (prefer unified findings; fallback to scan_findings)
      const { data: findingsData, error: findingsError } = await supabase
        .from('findings' as any)
        .select('*')
        .eq('scan_id', scanId);

      let convertedFindings: Finding[] = [];

      if (!findingsError && Array.isArray(findingsData) && findingsData.length > 0) {
        // Convert unified findings - use phone_intelligence type for phone scans
        const findingType = scanData.scan_type === 'phone' ? 'phone_intelligence' : 'breach';
        convertedFindings = ((findingsData as any[]) || []).map((f: any) => ({
          id: f.id,
          type: findingType as any,
          title: `${f.provider}: ${f.kind}`,
          description: JSON.stringify(f.evidence || []),
          severity: f.severity as any,
          confidence: f.confidence,
          provider: f.provider,
          providerCategory: f.kind,
          evidence: f.evidence || [],
          impact: `Finding from ${f.provider}`,
          remediation: [],
          tags: [f.provider, f.kind],
          observedAt: f.observed_at,
          raw: f
        }));
      } else {
        // Fallback: derive findings from scan_findings for this job
        const { data: sfData, error: sfError } = await (supabase as any)
          .from('scan_findings')
          .select('site, status, url, raw')
          .eq('job_id', scanId);

        if (!sfError && Array.isArray(sfData)) {
          const lower = (s?: string) => (s || '').toLowerCase();
          const DARK_WEB_KEYWORDS = ['intelx','paste','dark','onion','leak','breach'];
          const BROKER_SITES = ['whitepages','spokeo','intelius','beenverified','truthfinder','pipl','radaris','fastpeoplesearch','peoplefinder','ussearch','peekyou','mylife'];

          convertedFindings = (sfData as any[]).map((r: any, idx: number) => {
            const site = lower(r.site);
            const isBreach = ['hibp','haveibeenpwned','intelx','leak','breach'].some(k => site.includes(k));
            const isDark = DARK_WEB_KEYWORDS.some(k => site.includes(k));
            const isBroker = BROKER_SITES.some(k => site.includes(k));
            const severity = isBreach ? 'high' : isDark ? 'medium' : 'low';
            const kind = isBreach ? 'breach' : isDark ? 'darkweb' : isBroker ? 'people_search' : 'exposure';

            return {
              id: `sf_${scanId}_${idx}`,
              type: 'breach' as const,
              title: `${r.site}: ${kind}`,
              description: r.url || '',
              severity: severity as any,
              confidence: 0.7,
              provider: r.site,
              providerCategory: kind,
              evidence: r.url ? [{ key: 'url', value: r.url }] : [],
              impact: `Finding from ${r.site}`,
              remediation: [],
              tags: [r.site, kind],
              observedAt: new Date().toISOString(),
              raw: r
            } as Finding;
          });
        } else {
          console.error('[ResultsDetail] Error fetching findings:', findingsError || sfError);
        }
      }

      setFindings(convertedFindings);
      console.log(`[ResultsDetail] Loaded ${convertedFindings.length} findings for scan ${scanId}`);

      // Fetch removal requests
      const { data: requests, error: requestsError } = await supabase
        .from("removal_requests")
        .select("*")
        .eq("scan_id", scanId);

      if (requestsError) throw requestsError;
      setRemovalRequests(requests || []);

      // Build entity graph from scan data
      if (scanData) {
        // Detect entity type from scan data
        let entityType: 'email' | 'username' | 'phone' | 'domain' | 'ip' = 'username';
        let entityValue = '';
        
        if (scanData.email) {
          entityType = 'email';
          entityValue = scanData.email;
        } else if (scanData.username) {
          entityType = 'username';
          entityValue = scanData.username;
        } else if (scanData.phone) {
          entityType = 'phone';
          entityValue = scanData.phone;
        }
        
        if (entityValue) {
          // Convert scan data to findings format for graph building
          const findings: Finding[] = [];
          
          // Add data sources as findings
          sources?.forEach(source => {
            findings.push({
              id: `source_${source.id}`,
              type: 'identity' as const,
              title: `Found on ${source.name}`,
              description: source.category,
              severity: source.risk_level as any,
              confidence: 0.8,
              provider: source.name,
              providerCategory: source.category,
              evidence: source.data_found.map(d => ({ key: 'data', value: d })),
              impact: `Data found: ${source.data_found.join(', ')}`,
              remediation: [],
              tags: ['data_source', source.category],
              observedAt: new Date().toISOString(),
              url: source.url,
              raw: source
            });
          });
          
          // Add social profiles as findings
          profiles?.forEach(profile => {
            findings.push({
              id: `profile_${profile.id}`,
              type: 'social_media' as const,
              title: `${profile.platform} Profile`,
              description: `Found on ${profile.platform}: ${profile.username}`,
              severity: 'info' as const,
              confidence: profile.is_verified ? 0.95 : 0.7,
              provider: profile.platform,
              providerCategory: 'Social Media',
              evidence: [
                { key: 'username', value: profile.username },
                { key: 'profile_url', value: profile.profile_url },
                ...(profile.followers ? [{ key: 'followers', value: profile.followers }] : [])
              ],
              impact: `Profile found on ${profile.platform}`,
              remediation: [],
              tags: ['social_media', profile.platform],
              observedAt: new Date().toISOString(),
              url: profile.profile_url,
              raw: profile
            });
          });
          
          // Build graph asynchronously
          buildGraphFromFindings(findings, {
            type: entityType,
            value: entityValue
          }).catch(err => console.error('[ResultsDetail] Error building graph:', err));
        }
      }

      // If background job is still populating AND scan not completed, poll less frequently (max 30 tries)
      const hasData = (sources?.length ?? 0) > 0 || (profiles?.length ?? 0) > 0 || convertedFindings.length > 0;
      const isTerminalState = TERMINAL_STATES.includes(scanData.status);
      
      if (!hasData && !isTerminalState && pollTriesRef.current < 30) {
        pollTriesRef.current++;
        if (pollTimeoutRef.current !== null) {
          clearTimeout(pollTimeoutRef.current);
        }
        pollTimeoutRef.current = window.setTimeout(() => fetchScanData({ silent: true }), 5000);
      } else {
        // Stop polling if scan is in terminal state or has data
        console.log('[ResultsDetail] Stopping poll - terminal state or has data');
        if (pollTimeoutRef.current !== null) {
          clearTimeout(pollTimeoutRef.current);
          pollTimeoutRef.current = null;
        }
        if (!silent) setLoading(false);
      }
    } catch (error: any) {
      console.error("Error fetching scan data:", error);
      toast({
        title: "Error loading scan",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleRemovalRequest = async (sourceId: string, sourceName: string, sourceType: string) => {
    if (!user || !scanId) return;

    const { error } = await supabase
      .from("removal_requests")
      .insert({
        user_id: user.id,
        scan_id: scanId,
        source_id: sourceId,
        source_name: sourceName,
        source_type: sourceType,
        status: 'pending',
      });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Removal Request Initiated",
        description: `We've started the removal process for ${sourceName}. This may take 7-30 days.`,
      });
      fetchScanData();
    }
  };

  const handleExportReport = () => {
    if (!scan) return;

    const report = {
      scan_date: new Date(scan.created_at).toLocaleDateString(),
      privacy_score: scan.privacy_score,
      total_sources: scan.total_sources_found,
      high_risk: scan.high_risk_count,
      medium_risk: scan.medium_risk_count,
      low_risk: scan.low_risk_count,
      data_sources: dataSources,
      social_profiles: socialProfiles,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `privacy-scan-${scan.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report exported",
      description: "Your privacy scan report has been downloaded.",
    });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "secondary";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return "Great! Your privacy is well protected.";
    if (score >= 60) return "Good, but there's room for improvement.";
    return "Your privacy is at risk. Take action now.";
  };

  const getRiskLevel = (highCount: number, mediumCount: number, lowCount: number): { label: string; color: string; variant: "destructive" | "default" | "secondary" } => {
    const totalFindings = highCount + mediumCount + lowCount;
    if (totalFindings === 0) return { label: "No Risk", color: "text-green-500", variant: "secondary" };
    
    // Calculate weighted risk score
    const riskScore = ((highCount * 100) + (mediumCount * 50) + (lowCount * 10)) / totalFindings;
    
    if (riskScore >= 70) {
      return { label: "High Risk", color: "text-destructive", variant: "destructive" };
    } else if (riskScore >= 30) {
      return { label: "Medium Risk", color: "text-primary", variant: "default" };
    } else {
      return { label: "Low Risk", color: "text-accent", variant: "secondary" };
    }
  };

  const isRemovalRequested = (sourceId: string, sourceType: string) => {
    return removalRequests.some(
      r => r.source_id === sourceId && r.source_type === sourceType
    );
  };

  // Build findings array for exports and graph
  const extractDomain = (urlStr?: string) => {
    if (!urlStr) return '';
    try {
      const host = new URL(urlStr).hostname;
      return host.replace(/^www\./, '');
    } catch {
      return '';
    }
  };

  const findingsForExport: Finding[] = [
    ...dataSources.map(source => ({
      id: source.id,
      type: 'breach' as const,
      title: source.name,
      description: source.category,
      severity: source.risk_level as any,
      confidence: 0.9,
      provider: 'OSINT Scan',
      providerCategory: source.category,
      evidence: [
        ...source.data_found.map(d => ({ key: 'data', value: d })),
        ...(source.url ? [{ key: 'domain', value: extractDomain(source.url) }] : []),
      ],
      impact: `Found on ${source.name}`,
      remediation: ['Request removal from this source'],
      tags: [source.category],
      observedAt: new Date().toISOString(),
      url: source.url
    } as Finding)),
    ...socialProfiles.map(profile => ({
      id: profile.id,
      type: 'social_media' as const,
      title: `${profile.platform}: @${profile.username}`,
      description: profile.profile_url,
      severity: 'low' as const,
      confidence: 0.8,
      provider: 'Social Profile',
      providerCategory: profile.platform,
      evidence: [
        { key: 'username', value: profile.username },
        { key: 'url', value: profile.profile_url },
        ...(profile.profile_url ? [{ key: 'domain', value: extractDomain(profile.profile_url) }] : []),
        ...(profile.full_name ? [{ key: 'name', value: profile.full_name }] : []),
      ],
      impact: `Profile found on ${profile.platform}`,
      remediation: [],
      tags: [profile.platform],
      observedAt: new Date().toISOString(),
      url: profile.profile_url
    } as Finding))
  ];

  if (loading || !scan) {
    return (
      <ScanErrorBoundary context="results">
        <div className="min-h-screen flex items-center justify-center">
          <Card className="p-8">Loading scan results...</Card>
        </div>
      </ScanErrorBoundary>
    );
  }

  return (
    <ScanErrorBoundary context="results">
      <div className="min-h-screen bg-background px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => navigate("/scan/advanced")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Scanner
            </Button>
            <div className="flex gap-2">
              <ComprehensiveReportExport
                scanId={scanId!}
                scan={scan}
                dataSources={dataSources}
                socialProfiles={socialProfiles}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={async () => { 
                      try {
                        await exportAsPDF(findingsForExport, redactPII); 
                        toast({ title: "PDF Exported", description: "Premium PDF report downloaded." });
                      } catch (error) {
                        toast({ title: "Export Failed", description: "Could not generate PDF.", variant: "destructive" });
                      }
                    }}
                  >
                    <FileText className="w-4 h-4 mr-2" /> Premium PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { exportAsCSV(findingsForExport, redactPII); toast({ title: "CSV Exported", description: "CSV report downloaded." }); }}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" /> CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { exportAsJSON(findingsForExport, redactPII); toast({ title: "JSON Exported", description: "JSON report downloaded." }); }}>
                    <FileJson className="w-4 h-4 mr-2" /> JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <LastScanned timestamp={scan.created_at} />
            <TrustBadges variant="compact" />
          </div>
        </div>

        {/* Scan Status Banner */}
        {scan.status !== 'completed' && (
          <Card className={cn(
            "mb-6 border-2",
            scan.status === 'failed' ? "border-destructive bg-destructive/5" :
            scan.status === 'timeout' && findings.length === 0 ? "border-warning bg-warning/5" :
            scan.status === 'timeout' && findings.length > 0 ? "border-blue-500 bg-blue-500/5" :
            "border-primary bg-primary/5"
          )}>
            <div className="p-6">
              <div className="flex items-start gap-4">
                {scan.status === 'failed' ? (
                  <AlertTriangle className="h-6 w-6 text-destructive mt-1 flex-shrink-0" />
                ) : scan.status === 'timeout' && findings.length === 0 ? (
                  <AlertTriangle className="h-6 w-6 text-warning mt-1 flex-shrink-0" />
                ) : scan.status === 'timeout' && findings.length > 0 ? (
                  <Info className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
                ) : (
                  <Info className="h-6 w-6 text-primary mt-1 flex-shrink-0 animate-pulse" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    {scan.status === 'failed' && "Scan Failed"}
                    {scan.status === 'timeout' && findings.length === 0 && "Scan Timed Out"}
                    {scan.status === 'timeout' && findings.length > 0 && "Partial Results Available"}
                    {scan.status === 'pending' && "Scan Processing"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {scan.status === 'failed' && (findings.length > 0
                      ? "This scan ran, but one or more providers returned errors. Review the provider cards below for details."
                      : "This scan encountered an error and could not complete."
                    )}
                    {scan.status === 'timeout' && findings.length === 0 && "This scan exceeded the maximum processing time and was automatically stopped. No results were found."}
                    {scan.status === 'timeout' && findings.length > 0 && "Some providers timed out during this scan, but results are available below. The scan may not be 100% complete."}
                    {scan.status === 'pending' && "Your scan is being processed. This typically takes 30-60 seconds."}
                  </p>
                  {(scan.status === 'failed' || (scan.status === 'timeout' && findings.length === 0)) && (
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => navigate('/scan/advanced')}
                        className="gap-2"
                      >
                        <Zap className="h-4 w-4" />
                        Start New Scan
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate('/dashboard')}
                      >
                        Back to Dashboard
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Search Criteria Headline */}
        <Card className="mb-8 p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">
                Scan Results for:
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                {scan.email && (
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-lg px-4 py-2">
                      {redactPII ? scan.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : scan.email}
                    </Badge>
                    <span className="text-sm text-muted-foreground">(Email)</span>
                  </div>
                )}
                {scan.username && (
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-lg px-4 py-2">
                      {scan.username}
                    </Badge>
                    <span className="text-sm text-muted-foreground">(Username)</span>
                  </div>
                )}
                {scan.phone && (
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-lg px-4 py-2">
                      {redactPII ? scan.phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-***-$3') : scan.phone}
                    </Badge>
                    <span className="text-sm text-muted-foreground">(Phone)</span>
                  </div>
                )}
                {(scan.first_name || scan.last_name) && (
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-lg px-4 py-2">
                      {redactPII 
                        ? `${scan.first_name?.[0] || ''}*** ${scan.last_name?.[0] || ''}***`
                        : `${scan.first_name || ''} ${scan.last_name || ''}`.trim()
                      }
                    </Badge>
                    <span className="text-sm text-muted-foreground">(Name)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Real-time Status Indicator - shown if scan is active */}
        {(scan.status === 'pending' || scan.status === 'processing') && scanId && (
          <div className="mb-8">
            <ScanStatusIndicator 
              scanId={scanId}
              onComplete={() => {
                // Refresh the scan data
                fetchScanData();
              }}
            />
          </div>
        )}

        {/* Footprint DNA Card */}
        <div className="mb-8">
          <FootprintDNACard scanId={scanId!} />
          
          <FootprintDNAModal
            open={isDNAModalOpen}
            onOpenChange={setIsDNAModalOpen}
            trendData={trendData}
            currentScore={scan.privacy_score || 0}
          />
        </div>

        {/* Scan Execution Summary - Provider Audit */}
        {scanId && (
          <ScanExecutionSummary scanId={scanId} className="mb-8" />
        )}

        {/* Intelligence Tiles for Username Scans */}
        {scan?.scan_type === 'username' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <ScanErrorBoundary context="results">
              <IdentityStrengthScore scanId={scanId!} />
            </ScanErrorBoundary>
            <ScanErrorBoundary context="results">
              <UsernameUniquenessScore scanId={scanId!} />
            </ScanErrorBoundary>
            <ScanErrorBoundary context="results">
              <FootprintClusterMap scanId={scanId!} />
            </ScanErrorBoundary>
          </div>
        )}

        {/* Phone Intelligence Section */}
        {scan?.phone && (
          <div className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Phone Intelligence Card */}
              <div className="lg:col-span-2">
                <ScanErrorBoundary context="results">
                  <PhoneIntelligenceCard 
                    phone={scan.phone} 
                    findings={findings.filter(f => f.type === 'phone_intelligence')}
                    providerStatuses={phoneProviderStatuses}
                  />
                </ScanErrorBoundary>
              </div>
              
              {/* Export Options */}
              <div className="space-y-4">
                <ScanErrorBoundary context="results">
                  <PhoneExportOptions
                    scanId={scanId!}
                    findings={findings.filter(f => f.type === 'phone_intelligence')}
                    userPlan={userPlan}
                    phone={scan.phone}
                    redactPII={redactPII}
                  />
                </ScanErrorBoundary>
              </div>
            </div>
            
            {/* Locked Insight Tiles for Premium Features */}
            {/* Only show locked tiles if user is on a lower tier - use explicit check to handle loading state */}
            {!subscriptionLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {/* AI Risk Analysis - locked for free users */}
                {userPlan === 'free' && (
                  <LockedInsightTile
                    title="AI Risk Analysis"
                    description="Get AI-powered insights about this phone number's risk profile"
                    icon={<Brain className="h-5 w-5 text-primary" />}
                    requiredTier="pro"
                  />
                )}
                
                {/* Identity Graph - locked for free/pro users only */}
                {(userPlan === 'free' || userPlan === 'pro') && (
                  <LockedInsightTile
                    title="Identity Graph"
                    description="See connections between this phone and other entities"
                    icon={<Network className="h-5 w-5 text-primary" />}
                    requiredTier="business"
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Provider Status Panel */}
        <div className="mb-8">
          <ScanErrorBoundary context="results">
            <ProviderStatusPanel scanId={scanId!} />
          </ScanErrorBoundary>
        </div>

        {/* Catfish Detection */}
        <div className="mb-8">
          <CatfishDetection 
            scanId={scanId!} 
            scanType={scan.scan_type}
            hasUsername={!!scan.username}
          />
        </div>

        {/* AI Analysis */}
        <div className="mb-8">
          <AIAnalysis scanId={scanId!} />
        </div>

        {/* AI Insights - Correlation Analysis */}
        {findings.length > 0 && (
          <div className="mb-8">
            <AIInsightsCard 
              findings={findings} 
              subscriptionTier={rawSubscriptionTier}
              scanId={scanId!}
              userId={user?.id}
              dataSources={dataSources}
              scanType={scan?.scan_type as 'username' | 'email' | 'phone' | 'personal_details'}
            />
          </div>
        )}

        {/* Removal Queue - Hidden for now */}
        {/* <div className="mb-8">
          <RemovalQueue scanId={scanId} userId={user?.id} />
        </div> */}

        {/* Removal Success Tracker - Hidden for now */}
        {/* <div className="mb-8">
          <RemovalSuccessTracker userId={user?.id} />
        </div> */}

        {/* Visualizations Section */}
        {(dataSources.length > 0 || socialProfiles.length > 0) && (
          <Card className="bg-[hsl(var(--card))] p-6 rounded-lg shadow-[var(--shadow-card)] mb-8 hover:shadow-[var(--shadow-glow)] transition-[var(--transition-smooth)]">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Data Analytics Overview
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Pie Chart - Data Source Distribution */}
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Source Distribution</h3>
                <ChartContainer
                  config={{
                    value: {
                      label: "Sources",
                      color: "hsl(var(--primary))",
                    },
                  }}
                  className="h-[250px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={(() => {
                          const categoryCount = dataSources.reduce((acc, source) => {
                            acc[source.category] = (acc[source.category] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>);
                          
                          return Object.entries(categoryCount).map(([name, value]) => ({ name, value }));
                        })()}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                      >
                        {(() => {
                          const categoryCount = dataSources.reduce((acc, source) => {
                            acc[source.category] = (acc[source.category] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>);
                          const colors = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', 'hsl(var(--destructive))'];
                          return Object.keys(categoryCount).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                          ));
                        })()}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              {/* Bar Chart - Risk Levels */}
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Risk Level Distribution</h3>
                <ChartContainer
                  config={{
                    count: {
                      label: "Count",
                      color: "hsl(var(--primary))",
                    },
                  }}
                  className="h-[250px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'High', count: scan.high_risk_count, fill: 'hsl(var(--destructive))' },
                        { name: 'Medium', count: scan.medium_risk_count, fill: 'hsl(var(--primary))' },
                        { name: 'Low', count: scan.low_risk_count, fill: 'hsl(var(--accent))' },
                      ]}
                    >
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {[
                          { name: 'High', count: scan.high_risk_count, fill: 'hsl(var(--destructive))' },
                          { name: 'Medium', count: scan.medium_risk_count, fill: 'hsl(var(--primary))' },
                          { name: 'Low', count: scan.low_risk_count, fill: 'hsl(var(--accent))' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              {/* Line Chart - Findings Timeline */}
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Discovery Timeline</h3>
                <ChartContainer
                  config={{
                    findings: {
                      label: "Findings",
                      color: "hsl(var(--primary))",
                    },
                  }}
                  className="h-[250px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={(() => {
                        const timelineData = dataSources.map((_, index) => ({
                          point: index + 1,
                          findings: index + 1,
                        }));
                        return timelineData.length > 0 ? timelineData : [{ point: 1, findings: 0 }];
                      })()}
                    >
                      <XAxis dataKey="point" label={{ value: 'Scan Progress', position: 'insideBottom', offset: -5 }} />
                      <YAxis label={{ value: 'Findings', angle: -90, position: 'insideLeft' }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="findings" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>
          </Card>
        )}

        {/* Confidence & Provider Match Analysis */}
        {(dataSources.length > 0 || socialProfiles.length > 0) && (
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">Data Quality & Source Analysis</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Overall Confidence Score */}
              <div>
                <ConfidenceScoreIndicator
                  score={Math.round(
                    [...dataSources, ...socialProfiles].reduce((sum, item) => {
                      const score = (item as any).confidence_score || 75;
                      return sum + score;
                    }, 0) / (dataSources.length + socialProfiles.length)
                  )}
                  label="Overall Data Confidence"
                  showDetails={true}
                  providerCount={new Set([...dataSources.map(d => d.category), ...socialProfiles.map(p => p.platform)]).size}
                />
              </div>

              {/* Provider Match Visualization */}
              <ProviderMatchVisual
                providers={[
                  ...new Set([
                    ...dataSources.map(d => d.category),
                    ...socialProfiles.map(p => p.platform)
                  ])
                ].map(provider => {
                  const sources = dataSources.filter(d => d.category === provider);
                  const profiles = socialProfiles.filter(p => p.platform === provider);
                  const matched = sources.length > 0 || profiles.length > 0;
                  const avgConfidence = matched
                    ? Math.round(
                        [...sources, ...profiles].reduce((sum, item) => sum + ((item as any).confidence_score || 75), 0) /
                        (sources.length + profiles.length)
                      )
                    : 0;
                  
                  return {
                    name: provider,
                    matched,
                    confidence: avgConfidence
                  };
                })}
                matchPercentage={Math.round(
                  (dataSources.length + socialProfiles.length) / 
                  Math.max(dataSources.length + socialProfiles.length, 1) * 100
                )}
              />
            </div>

            {/* Confidence Distribution */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {[...dataSources, ...socialProfiles].filter(item => ((item as any).confidence_score || 75) >= 85).length}
                </div>
                <p className="text-sm text-muted-foreground">High Confidence</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {[...dataSources, ...socialProfiles].filter(item => {
                    const score = (item as any).confidence_score || 75;
                    return score >= 50 && score < 85;
                  }).length}
                </div>
                <p className="text-sm text-muted-foreground">Medium Confidence</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {[...dataSources, ...socialProfiles].filter(item => ((item as any).confidence_score || 75) < 50).length}
                </div>
                <p className="text-sm text-muted-foreground">Low Confidence</p>
              </div>
            </div>
          </Card>
        )}

        {/* Export Artifacts Section */}
        {scanId && (
          <div className="mb-8">
            <ArtifactDownloadCard 
              artifacts={artifacts}
              isGenerating={isGenerating}
              onRegenerate={() => generateArtifacts(['csv', 'json', 'html', 'txt', 'pdf'])}
            />
          </div>
        )}

        {/* Export Controls */}
        {findingsForExport.length > 0 && (
          <div className="mb-8">
            <ExportControls 
              findings={findingsForExport}
              redactPII={redactPII}
              onRedactToggle={setRedactPII}
            />
          </div>
        )}

        {/* Atlas Intelligence Summary */}
        {findingsForExport.length > 0 && (
          <div className="mb-8">
            <ScanSummary 
              findings={findingsForExport}
              scanId={scanId}
              isPro={rawSubscriptionTier === "premium" || rawSubscriptionTier === "enterprise" || rawSubscriptionTier === "pro" || rawSubscriptionTier === "business"}
            />
          </div>
        )}

        {/* Anomaly Detection */}
        <div className="mb-8">
          <AnomalyDetector scanId={scanId!} findings={findings} />
          <div className="mt-4 flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/anomaly-history')}
              className="gap-2"
            >
              <Zap className="w-4 h-4" />
              View Anomaly History
            </Button>
          </div>
        </div>

        {/* Timeline & Graph - Enhanced Intelligence */}
        {(dataSources.length > 0 || socialProfiles.length > 0) && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <TimelineChart 
              events={clusterFindingsByDate(
                dataSources.map(source => ({
                  id: source.id,
                  type: 'breach' as const,
                  title: source.name,
                  description: source.category,
                  severity: source.risk_level as any,
                  confidence: 0.9,
                  provider: 'OSINT Scan',
                  providerCategory: source.category,
                  evidence: source.data_found.map(d => ({ key: 'Data', value: d })),
                  impact: `Found on ${source.name}`,
                  remediation: ['Request removal from this source'],
                  tags: [source.category],
                  observedAt: new Date().toISOString(),
                  url: source.url
                } as Finding))
              )}
            />
            <GraphExplorer 
              {...buildGraph(findingsForExport)}
            />
          </div>
        )}

        {/* Summary Card */}
        <Card className="p-8 mb-8 bg-gradient-card border-border shadow-card">
          <div className="text-center">
            <Shield className={`w-16 h-16 mx-auto mb-4 ${getScoreColor(scan.privacy_score)}`} />
            <h2 className="text-3xl font-bold mb-2">Privacy Score</h2>
            <p className={`text-6xl font-bold mb-3 ${getScoreColor(scan.privacy_score)}`}>
              {scan.privacy_score}/100
            </p>
            <p className="text-lg text-muted-foreground mb-6">
              {getScoreMessage(scan.privacy_score)}
            </p>
            
            {/* Risk Level Badge */}
            <div className="flex justify-center mb-6">
              {(() => {
                const riskLevel = getRiskLevel(scan.high_risk_count, scan.medium_risk_count, scan.low_risk_count);
                return (
                  <Badge variant={riskLevel.variant} className="text-lg px-6 py-2">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    {riskLevel.label}
                  </Badge>
                );
              })()}
            </div>
            
            <div className="grid md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-6">
              <div className="p-4 rounded-lg bg-background/50">
                <div className="text-2xl font-bold">{scan.total_sources_found}</div>
                <div className="text-sm text-muted-foreground">Total Sources</div>
              </div>
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="text-2xl font-bold text-destructive">{scan.high_risk_count}</div>
                <div className="text-sm text-muted-foreground">High Risk</div>
              </div>
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="text-2xl font-bold text-primary">{scan.medium_risk_count}</div>
                <div className="text-sm text-muted-foreground">Medium Risk</div>
              </div>
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <div className="text-2xl font-bold text-accent">
                  {removalRequests.length}
                </div>
                <div className="text-sm text-muted-foreground">Removal Requests</div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  const entityValue = scan.email || scan.username || scan.phone || '';
                  navigate(`/search?q=${encodeURIComponent(entityValue)}`);
                }}
              >
                <Network className="w-4 h-4 mr-2" />
                Explore Entity Graph
              </Button>
              <Button 
                onClick={() => navigate('/scan')}
              >
                Run New Scan
              </Button>
            </div>
          </div>
        </Card>

        {/* Privacy Tips */}
        <Card className="p-6 mb-8 bg-gradient-card border-border">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-semibold mb-3">Privacy Protection Tips</h3>
              <ul className="space-y-2">
                {privacyTips.slice(0, 4).map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-4 mb-8">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold">Actions</h3>
            </div>
            <div className="flex gap-2">
              {scan && (
                <>
                  <ExportEnrichedButton scanId={scan.id} size="sm" variant="outline" />
                  <AddToCaseButton
                    itemType="scan"
                    itemId={scan.id}
                    title={`Scan ${scan.id}`}
                    summary={`Type: ${scan.scan_type} • Date: ${new Date(scan.created_at).toLocaleString()}`}
                    buttonLabel="Add Scan to Case"
                    size="sm"
                  />
                </>
              )}
            </div>
          </div>
        </Card>

        {/* No Results Banner */}
        {scan.total_sources_found === 0 && dataSources.length === 0 && socialProfiles.length === 0 && findings.length === 0 && (

          <Card className="p-8 mb-8 text-center bg-accent/5 border-accent/30">
            <Shield className="w-16 h-16 mx-auto mb-4 text-accent opacity-70" />
            <h3 className="text-2xl font-semibold mb-3">No Data Found - That's Good News!</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              We searched across all selected providers and didn't find any exposed information. 
              This means your digital footprint is minimal or well-protected.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate('/scan')}>
                Try Another Scan Type
              </Button>
              <Button onClick={() => navigate('/scan')}>
                <Zap className="w-4 h-4 mr-2" />
                Add Premium Sources
              </Button>
            </div>
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                <strong>Tip:</strong> Try enabling premium Apify sources (Social Media Finder, OSINT Scraper) 
                for comprehensive coverage across 400+ platforms.
              </p>
            </div>
          </Card>
        )}


        {/* Findings Section - Enhanced detailed cards */}
        {findings.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="text-2xl font-bold">Scan Findings</h3>
                  <p className="text-sm text-muted-foreground">
                    {findings.length} {findings.length === 1 ? 'finding' : 'findings'} discovered across {new Set(findings.map(f => f.provider)).size} providers
                  </p>
                </div>
              </div>
              
              {/* Severity Summary */}
              <div className="flex gap-2">
                {['critical', 'high', 'medium', 'low', 'info'].map(severity => {
                  const count = findings.filter((f: any) => f.raw?.severity === severity).length;
                  if (count === 0) return null;
                  return (
                    <Badge 
                      key={severity}
                      variant={
                        severity === 'critical' || severity === 'high' 
                          ? 'destructive' 
                          : severity === 'medium' 
                          ? 'default' 
                          : 'secondary'
                      }
                    >
                      {count} {severity}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              {findings.map((finding) => (
                <div key={finding.id} className="space-y-2">
                  <FindingCard 
                    finding={{
                      id: finding.id,
                      provider: finding.provider,
                      kind: finding.providerCategory,
                      severity: (finding.raw as any)?.severity || finding.severity,
                      confidence: finding.confidence,
                      observed_at: finding.observedAt,
                      evidence: finding.evidence,
                      meta: (finding.raw as any)?.meta || {},
                    }}
                  />
                  <div className="flex justify-end">
                    <AddToCaseButton
                      itemType="finding"
                      itemId={String((finding as any).id)}
                      title={finding.title}
                      summary={`Provider: ${finding.provider} • Severity: ${(finding as any).raw?.severity || finding.severity}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monitoring Toggle */}
        {user && scanId && (
          <div className="mb-8">
            <MonitoringToggle scanId={scanId} userId={user.id} />
          </div>
        )}

        {/* Social Media Results */}
        {socialProfiles.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold">Social Media Profiles Found</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {socialProfiles.map((profile) => (
                <Card key={profile.id} className="p-5 bg-gradient-to-br from-primary/5 to-accent/5 border-border hover:shadow-[var(--shadow-glow)] transition-[var(--transition-smooth)]">
                  <div className="flex gap-4">
                    {profile.avatar_url && (
                      <img 
                        src={profile.avatar_url} 
                        alt={`${profile.username} avatar`}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 className="font-semibold">{profile.platform}</h4>
                        {profile.is_verified && (
                          <Badge variant="default" className="text-xs">Verified</Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">Active</Badge>
                        {profile.source === 'predicta' && (
                          <Badge variant="default" className="text-xs bg-primary">Predicta Search</Badge>
                        )}
                      </div>
                      
                      {profile.full_name && (
                        <p className="text-sm font-medium mb-1">{profile.full_name}</p>
                      )}
                      <p className="text-sm text-muted-foreground mb-2">@{profile.username}</p>
                      
                      {profile.bio && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{profile.bio}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                        {profile.account_id && (
                          <span>ID: {profile.account_id}</span>
                        )}
                        {profile.followers && (
                          <span>{profile.followers} followers</span>
                        )}
                        {profile.last_active && (
                          <span>Active: {profile.last_active}</span>
                        )}
                      </div>

                      {profile.metadata && Object.keys(profile.metadata).length > 0 && (
                        <details className="text-xs mb-3">
                          <summary className="cursor-pointer text-primary hover:underline">
                            View Metadata
                          </summary>
                          <div className="mt-2 p-3 bg-background/50 rounded-md max-h-40 overflow-y-auto">
                            <table className="w-full text-xs">
                              <tbody>
                                {Object.entries(profile.metadata)
                                  .filter(([_, value]) => value !== null && value !== undefined)
                                  .map(([key, value]) => (
                                    <tr key={key} className="border-b border-border/50 last:border-0">
                                      <td className="py-1 pr-3 font-medium text-muted-foreground capitalize">
                                        {key.replace(/_/g, ' ')}
                                      </td>
                                      <td className="py-1 break-all">
                                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </details>
                      )}

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(profile.profile_url, '_blank')}
                          className="flex-1"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Profile
                        </Button>
                        <Button 
                          variant="accent"
                          size="sm"
                          onClick={() => handleRemovalRequest(profile.id, profile.platform, 'social_media')}
                          disabled={isRemovalRequested(profile.id, 'social_media')}
                        >
                          {isRemovalRequested(profile.id, 'social_media') ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Data Broker Results */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Data Broker Sources Found</h3>
          
          <div className="space-y-4">
            {dataSources.map((source) => {
              const gradientClass = source.risk_level === 'high' 
                ? 'bg-gradient-to-r from-destructive/10 to-background border-destructive/20' 
                : source.risk_level === 'medium'
                ? 'bg-gradient-to-r from-primary/10 to-background border-primary/20'
                : 'bg-gradient-to-r from-accent/10 to-background border-accent/20';
              
              return (
              <Card key={source.id} className={`p-6 ${gradientClass} hover:shadow-[var(--shadow-glow)] transition-[var(--transition-smooth)]`}>
                <div className="flex flex-col gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle className={`w-5 h-5 ${source.risk_level === 'high' ? 'text-destructive' : source.risk_level === 'medium' ? 'text-primary' : 'text-accent'}`} />
                      <h4 className="text-lg font-semibold">{source.name}</h4>
                      <Badge variant={getRiskColor(source.risk_level) as any}>
                        {source.risk_level.toUpperCase()} RISK
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{source.category}</p>
                    
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Data Found:</p>
                      <div className="flex flex-wrap gap-2">
                        {source.data_found.map((data, idx) => (
                          <span 
                            key={idx} 
                            className="px-3 py-1 rounded-full bg-secondary text-xs"
                          >
                            {data}
                          </span>
                        ))}
                      </div>
                    </div>

                    {source.metadata && Object.keys(source.metadata).length > 0 && (
                      <details className="text-sm">
                        <summary className="cursor-pointer text-primary hover:underline font-medium mb-2">
                          View Detailed Metadata
                        </summary>
                        <div className="mt-3 p-4 bg-background/50 rounded-md max-h-60 overflow-y-auto">
                          <table className="w-full text-sm">
                            <tbody>
                              {Object.entries(source.metadata)
                                .filter(([_, value]) => value !== null && value !== undefined && value !== '')
                                .map(([key, value]) => (
                                  <tr key={key} className="border-b border-border/50 last:border-0">
                                    <td className="py-2 pr-4 font-medium text-muted-foreground capitalize align-top">
                                      {key.replace(/_/g, ' ')}
                                    </td>
                                    <td className="py-2 break-all">
                                      {typeof value === 'object' ? (
                                        <pre className="text-xs bg-background/50 p-2 rounded overflow-x-auto">
                                          {JSON.stringify(value, null, 2)}
                                        </pre>
                                      ) : (
                                        String(value)
                                      )}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </details>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-2 border-t border-border/50">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(source.url, '_blank')}
                      className="flex-1"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Source
                    </Button>
                    <Button 
                      variant="accent"
                      size="sm"
                      onClick={() => handleRemovalRequest(source.id, source.name, 'data_broker')}
                      disabled={isRemovalRequested(source.id, 'data_broker')}
                    >
                      {isRemovalRequested(source.id, 'data_broker') ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Requested
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Request Removal
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
              );
            })}
          </div>
        </div>
        </div>
      </div>
    </ScanErrorBoundary>
  );
};

export default ResultsDetail;