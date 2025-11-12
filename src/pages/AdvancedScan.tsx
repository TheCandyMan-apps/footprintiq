import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { SensitiveConsentModal } from "@/components/providers/SensitiveConsentModal";
import { Search, Shield, Zap, Database, Globe, Lock, AlertTriangle, Info, BookOpen } from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useUserPersona } from "@/hooks/useUserPersona";
import { useAnonMode } from "@/hooks/useAnonMode";
import { useTierGating } from "@/hooks/useTierGating";
import { SpiderFootStatusIndicator } from "@/components/scan/SpiderFootStatusIndicator";
import { PremiumApifyOptions } from "@/components/scan/PremiumApifyOptions";
import { AnonModeToggle } from "@/components/scan/AnonModeToggle";
import { CreditsBadge } from "@/components/workspace/CreditsBadge";
import { ScanProgressDialog } from "@/components/scan/ScanProgressDialog";
import { ScanStatusIndicator } from "@/components/scan/ScanStatusIndicator";
import { ScanErrorBoundary } from "@/components/ScanErrorBoundary";
import { BatchUpload } from "@/components/scan/BatchUpload";
import { IPMapPreview } from "@/components/scan/IPMapPreview";
import { LocationMap } from "@/components/scan/LocationMap";
import { LocationCard } from "@/components/scan/LocationCard";
import { HighPrecisionToggle } from "@/components/scan/HighPrecisionToggle";
import { GeocodingProgress } from "@/components/scan/GeocodingProgress";
import { BuyCreditsModal } from "@/components/scan/BuyCreditsModal";
import { ReverseImageComponent } from "@/components/scan/ReverseImageComponent";
import { SpiderFootScanForm } from "@/components/scan/SpiderFootScanForm";
import { SpiderFootResults } from "@/components/scan/SpiderFootResults";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGeocoding } from "@/hooks/useGeocoding";
import { useActiveScanContext } from "@/contexts/ActiveScanContext";
import { useWorkerStatus } from "@/hooks/useWorkerStatus";
import { WorkerStatusBanner } from "@/components/scan/WorkerStatusBanner";
import { WhatsMyNameTab } from "@/components/scan/WhatsMyNameTab";
import { ToolSelector } from "@/components/scan/ToolSelector";
import { UpgradeTeaser } from "@/components/upsell/UpgradeTeaser";
import { PremiumUpgradeCTA } from "@/components/upsell/PremiumUpgradeCTA";
import { TemplateManager } from "@/components/scan/TemplateManager";
import { SaveTemplateDialog } from "@/components/scan/SaveTemplateDialog";
import { useScanTemplates, ScanTemplate } from "@/hooks/useScanTemplates";
import { useLowCreditToast } from "@/hooks/useLowCreditToast";
import { MaigretToggle } from "@/components/scan/MaigretToggle";
import { WorkerStatus } from "@/components/maigret/WorkerStatus";
import { useUsernameScan } from "@/hooks/useUsernameScan";
import { Switch } from "@/components/ui/switch";

export default function AdvancedScan() {
  const navigate = useNavigate();
  const { workspace, loading: workspaceLoading, refreshWorkspace } = useWorkspace();
  const { persona, isStandard } = useUserPersona();
  const { anonModeEnabled, toggleAnonMode, isLoading: anonLoading } = useAnonMode();
  const { startTracking } = useActiveScanContext();
  const { isWorkerOffline, getWorkerByName } = useWorkerStatus();
  const { isFree, checkFeatureAccess } = useTierGating();
  
  // Show low-credit toasts for free users
  useLowCreditToast();
  const [scanType, setScanType] = useState<string>("email");
  const [target, setTarget] = useState("");
  const [providers, setProviders] = useState<string[]>([]);
  const [sensitiveSources, setSensitiveSources] = useState<string[]>([]);
  const [darkwebEnabled, setDarkwebEnabled] = useState(false);
  const [darkwebDepth, setDarkwebDepth] = useState(2);
  const [isScanning, setIsScanning] = useState(false);
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [pendingSensitiveSources, setPendingSensitiveSources] = useState<string[]>([]);
  const [workspaceAutoCreated, setWorkspaceAutoCreated] = useState(false);
  const [premiumOptions, setPremiumOptions] = useState<{
    socialMediaFinder?: boolean;
    osintScraper?: boolean;
    osintKeywords?: string[];
    darkwebScraper?: boolean;
    darkwebUrls?: string[];
    darkwebSearch?: string;
    darkwebDepth?: number;
    darkwebPages?: number;
  }>({});
  const [batchItems, setBatchItems] = useState<string[]>([]);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [darkWebPolicyAccepted, setDarkWebPolicyAccepted] = useState(false);
  const [highPrecisionMode, setHighPrecisionMode] = useState(false);
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [ipLocations, setIpLocations] = useState<Array<{ ip: string; lat?: number; lon?: number }>>([]);
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [modalScanId, setModalScanId] = useState<string | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<string>("free");
  const [selectedTool, setSelectedTool] = useState<string>("spiderfoot");
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [maigretEnabled, setMaigretEnabled] = useState(true); // Maigret toggle for username scans
  const { saveTemplate } = useScanTemplates();
  
  // Username scan specific options
  const [usernameTags, setUsernameTags] = useState('');
  const [usernameAllSites, setUsernameAllSites] = useState(false);
  const [usernameArtifacts, setUsernameArtifacts] = useState<string[]>([]);
  const { startScan: startUsernameScan } = useUsernameScan();

  // Geocoding for IP addresses
  const { 
    locations, 
    loading: geocodingLoading, 
    getLocationForIP, 
    getErrorForIP,
    progressItems,
    isProcessing,
    totalCount,
    completedCount,
    errorCount 
  } = useGeocoding(
    ipLocations,
    { 
      enabled: scanType === 'ip' && ipLocations.length > 0,
      highPrecisionMode 
    }
  );

  // Auto-select default providers when scan type changes
  const DEFAULT_PROVIDERS: Record<string, string[]> = {
    email: ['hibp', 'dehashed', 'clearbit', 'fullcontact'],
    username: maigretEnabled ? ['maigret', 'dehashed'] : ['dehashed'], // Include maigret if enabled
    domain: ['urlscan', 'securitytrails', 'shodan', 'virustotal'],
    phone: ['fullcontact'],
  };

  // Set default providers on mount and when scan type changes
  useEffect(() => {
    setProviders(DEFAULT_PROVIDERS[scanType] || []);
    // Reset batch mode when switching types
    if (scanType !== 'email' && scanType !== 'ip') {
      setIsBatchMode(false);
      setBatchItems([]);
    }
  }, [scanType, maigretEnabled]); // Re-run when maigretEnabled changes

  const availableProviders = [
    { id: "hibp", name: "Have I Been Pwned", icon: Shield, types: ['email'] },
    { id: "dehashed", name: "DeHashed", icon: Database, types: ['email', 'username'] },
    { id: "clearbit", name: "Clearbit", icon: Globe, types: ['email', 'domain'] },
    { id: "fullcontact", name: "FullContact", icon: Database, types: ['email', 'phone', 'domain'] },
    { id: "urlscan", name: "URLScan.io", icon: Search, types: ['domain'] },
    { id: "securitytrails", name: "SecurityTrails", icon: Shield, types: ['domain'] },
    { id: "shodan", name: "Shodan", icon: Globe, types: ['domain', 'ip'] },
    { id: "virustotal", name: "VirusTotal", icon: Shield, types: ['domain'] },
    { id: "abuseipdb", name: "AbuseIPDB", icon: Shield, types: ['ip'] },
    { id: "apify-social", name: "Social Media Finder Pro (400+ platforms)", icon: Search, premium: true, types: ['username'], description: "Discover profiles across Facebook, Instagram, Twitter, TikTok, LinkedIn, GitHub, Reddit, and 400+ more" },
    { id: "apify-osint", name: "OSINT Scraper (Paste sites)", icon: Database, premium: true, types: ['email', 'username'], description: "Search Pastebin, GitHub Gist, Codepad, and other paste sites for exposed data" },
  ];

  // Filter providers by current scan type and user persona
  const compatibleProviders = availableProviders.filter(p => {
    // Check if provider supports current scan type
    if (!p.types.includes(scanType)) return false;
    
    // Hide premium/advanced providers for standard users
    if (isStandard && p.premium) return false;
    
    return true;
  });

  const toggleProvider = (id: string) => {
    setProviders(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSensitiveSourceToggle = (source: string) => {
    if (sensitiveSources.includes(source)) {
      setSensitiveSources(prev => prev.filter(s => s !== source));
    } else {
      // Show consent modal
      setPendingSensitiveSources([source]);
      setShowConsentModal(true);
    }
  };

  const handleConsentConfirm = async (confirmedCategories: string[]) => {
    try {
      // Save consent to database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      if (!workspace?.id) throw new Error("No workspace selected");

      const { data, error } = await supabase.functions.invoke("consent-manage", {
        body: { 
          workspace_id: workspace.id,
          categories: confirmedCategories,
        },
      });

      if (error) throw error;

      // Update UI
      setSensitiveSources(prev => [...prev, ...confirmedCategories]);
      setShowConsentModal(false);
      toast.success("Consent recorded. Sensitive sources enabled.");
    } catch (error) {
      console.error("Error saving consent:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save consent");
    }
  };
  // Quick create a default workspace if none exists
  const handleQuickCreateWorkspace = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create a default workspace with unique slug
      const name = "My Workspace";
      const slug = `my-workspace-${Math.random().toString(36).slice(2,7)}`;

      const { data: ws, error: wsError } = await supabase
        .from("workspaces" as any)
        .insert({ name, owner_id: user.id, slug })
        .select()
        .single();

      if (wsError) throw wsError;
      if (!ws) throw new Error("Failed to create workspace");

      // Add creator as admin member
      const { error: memberError } = await supabase.from("workspace_members" as any).insert({
        workspace_id: (ws as any).id,
        user_id: user.id,
        role: "admin",
      });
      if (memberError) throw memberError;

      // Activate it for the session
      sessionStorage.setItem('current_workspace_id', (ws as any).id);

      toast.success("Workspace created");
      // Refresh hook state so this page can proceed
      await refreshWorkspace?.();
    } catch (err) {
      console.error("Create workspace error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to create workspace");
    }
  };
  // If no workspace after load, auto-create one to unblock scans
  if (!workspaceLoading && !workspace && !workspaceAutoCreated) {
    handleQuickCreateWorkspace().finally(() => setWorkspaceAutoCreated(true));
  }

  const handleScan = async () => {
    // Handle username scans inline with resilient pattern
    if (scanType === 'username') {
      if (!target.trim()) {
        toast.error("Please enter a username to scan");
        return;
      }

      setIsScanning(true);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Please log in to perform scans");
          setIsScanning(false);
          return;
        }

        if (!workspace?.id) {
          toast.error("No workspace found");
          setIsScanning(false);
          return;
        }

        // Use resilient username scan hook
        const result = await startUsernameScan({
          username: target.trim(),
          tags: usernameTags.trim() || undefined,
          allSites: usernameAllSites,
          artifacts: !isFree ? usernameArtifacts : [],
          debugMode: false,
        });

        const jobId = result?.jobId;
        if (jobId) {
          setCurrentScanId(jobId);
          
          // Start tracking
          startTracking({
            scanId: jobId,
            type: 'username',
            target: target.trim(),
            startedAt: new Date().toISOString(),
          });

          // Show success toast based on status
          if (result.status === 'queued') {
            toast.info(`Username scan queued for "${target.trim()}"`, {
              description: 'Worker processing - results will appear shortly'
            });
          } else {
            toast.success(`Username scan started for "${target.trim()}"`);
          }

          // Navigate immediately to results page (no progress dialog for username scans)
          navigate(`/maigret/results/${jobId}`);
        }
      } catch (error) {
        console.error("Username scan error:", error);
        toast.error(error instanceof Error ? error.message : "Scan failed");
      } finally {
        setIsScanning(false);
      }
      return; // Exit early for username scans
    }

    // Validation
    const targets = isBatchMode ? batchItems : [target];
    if (targets.length === 0 || (targets.length === 1 && !targets[0].trim())) {
      toast.error("Please enter at least one target to scan");
      return;
    }

    // Check premium requirement for batch scans
    if (isBatchMode && targets.length > 1 && isStandard) {
      toast.error("Batch scanning requires a premium subscription", {
        description: "Upgrade to scan multiple targets at once",
        action: {
          label: "Upgrade",
          onClick: () => navigate('/pricing')
        }
      });
      return;
    }

    // Dark web policy check
    if (darkwebEnabled && !darkWebPolicyAccepted) {
      toast.error("Please accept the dark web scanning policy");
      return;
    }

    setIsScanning(true);

    try {
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to perform scans");
        setIsScanning(false);
        return;
      }
      
      if (!workspace?.id) {
        toast.error("No workspace selected");
        setIsScanning(false);
        return;
      }

      // Process batch or single scan
      const scanPromises = targets.map(async (targetValue, index) => {
        try {
          // Generate scanId upfront (using Web Crypto API)
          const preScanId = self.crypto.randomUUID();
          
          // For the first scan, open dialog and subscribe BEFORE calling edge function
          if (index === 0) {
            setModalScanId(preScanId);
            setProgressOpen(true);
            setCurrentScanId(preScanId);
            
            // Start floating tracker
            startTracking({
              scanId: preScanId,
              type: 'advanced',
              target: targetValue,
              startedAt: new Date().toISOString(),
            });
            
            // Small delay to ensure subscription is established
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          const { data, error } = await supabase.functions.invoke("scan-orchestrate", {
            body: {
              scanId: preScanId,
              type: scanType,
              value: targetValue,
              workspaceId: workspace.id,
              options: {
                providers,
                includeDating: sensitiveSources.includes('dating'),
                includeNsfw: sensitiveSources.includes('nsfw'),
                includeDarkweb: sensitiveSources.includes('darkweb') || darkwebEnabled,
                premium: premiumOptions,
              },
            },
          });

          if (error) throw error;
          return { success: true, scanId: preScanId, target: targetValue };
        } catch (err) {
          console.error(`Scan failed for ${targetValue}:`, err);
          return { success: false, error: err, target: targetValue };
        }
      });

      const results = await Promise.allSettled(scanPromises);
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
      const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success));

      if (successful.length > 0) {
        toast.success(`${successful.length} scan(s) initiated successfully`);
      }

      if (failed.length > 0) {
        toast.error(`${failed.length} scan(s) failed`, {
          description: "Check console for details"
        });
      }
      
    } catch (error) {
      console.error("Scan error:", error);
      toast.error(error instanceof Error ? error.message : "Scan failed", {
        description: "Please try again or contact support"
      });
      setIsScanning(false);
      setCurrentScanId(null);
    }
  };

  const handleScanComplete = () => {
    setIsScanning(false);
    setProgressOpen(false);
    if (currentScanId) {
      // Navigate to appropriate results page based on scan type
      if (scanType === 'username') {
        navigate(`/maigret/results/${currentScanId}`);
      } else {
        navigate(`/results/${currentScanId}`);
      }
    } else {
      navigate("/dashboard");
    }
  };

  const handleProgressClose = () => {
    setProgressOpen(false);
    setModalScanId(null);
  };

  const handleApplyTemplate = (template: ScanTemplate) => {
    const config = template.configuration;
    setScanType(config.scanType);
    setProviders(config.providers || []);
    setSensitiveSources(config.sensitiveSources || []);
    setDarkwebEnabled(config.darkwebEnabled || false);
    setDarkwebDepth(config.darkwebDepth || 2);
    setPremiumOptions(config.premiumOptions || {});
    if (config.selectedTool) {
      setSelectedTool(config.selectedTool);
    }
    toast.success(`Template "${template.name}" applied`);
  };

  const handleSaveTemplate = async (
    name: string,
    description: string | null,
    config: any,
    category?: string | null,
    tags?: string[] | null
  ) => {
    await saveTemplate(name, description, config, category, tags);
  };

  const getCurrentConfig = () => ({
    scanType,
    providers,
    sensitiveSources,
    darkwebEnabled,
    darkwebDepth,
    premiumOptions,
    selectedTool,
  });

  return (
    <ScanErrorBoundary context="scan">
      <div className="min-h-screen bg-background">
        <SEO
          title="Advanced Scan | FootprintIQ"
          description="Perform comprehensive OSINT scans across 400+ sources including dark web monitoring, social media, breaches, and more."
        />
        <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Workspace Loading/Error States */}
          {workspaceLoading && (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">Loading workspace...</p>
            </Card>
          )}
          
          {!workspaceLoading && !workspace && (
            <Card className="p-6 text-center space-y-4">
              <p className="text-destructive">No workspace found. Please create or join a workspace first.</p>
              <div className="flex items-center justify-center gap-3">
                <Button onClick={() => handleQuickCreateWorkspace()}>
                  Quick Create Workspace
                </Button>
                <Button variant="outline" onClick={() => navigate('/workspaces')}>
                  Open Workspaces
                </Button>
              </div>
            </Card>
          )}

          {!workspaceLoading && workspace && (
            <>
              {/* Worker Status Banner */}
              <WorkerStatusBanner />
              
              {/* Premium Upgrade CTA for Free Users */}
              {isFree && (
                <PremiumUpgradeCTA 
                  variant="banner"
                  message="Upgrade to Pro for unlimited scans"
                  feature="unlimited scans and premium tools"
                />
              )}
              
              {/* Real-time Status Indicator - compact inline version */}
              {isScanning && currentScanId && (
                <div className="mb-6">
                  <ScanStatusIndicator 
                    scanId={currentScanId}
                    onComplete={handleScanComplete}
                    compact={true}
                  />
                </div>
              )}

              {/* Header */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-elegant">
                    <Search className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                      Advanced OSINT Scan
                    </h1>
                    <p className="text-muted-foreground mt-2">
                      Comprehensive intelligence gathering across 400+ sources
                    </p>
                  </div>
                </div>
                <CreditsBadge workspaceId={workspace.id} />
              </div>

              {/* Tabs for scan types */}
              <Tabs defaultValue="standard" className="w-full">
                <TabsList className={`grid w-full ${import.meta.env.VITE_SPIDERFOOT_API_URL ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  <TabsTrigger value="standard">Advanced Scan</TabsTrigger>
                  {import.meta.env.VITE_SPIDERFOOT_API_URL && (
                    <TabsTrigger value="spiderfoot" className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      SpiderFoot Recon
                      <SpiderFootStatusIndicator />
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="reverse-image">Reverse Image Intel</TabsTrigger>
                </TabsList>

                <TabsContent value="standard" className="space-y-8 mt-6">
                  {/* Template Manager */}
                  <TemplateManager
                    onApplyTemplate={handleApplyTemplate}
                    onSaveTemplate={() => setSaveTemplateOpen(true)}
                  />

                  {/* Standard scan form continues below */}

          {/* Main Form */}
          <Card className="p-6 space-y-6">
            {/* Tool Selector */}
            <ToolSelector
              selectedTool={selectedTool}
              onToolChange={setSelectedTool}
              scanType={scanType}
              userTier={isFree ? 'free' : subscriptionTier === 'enterprise' ? 'enterprise' : 'pro'}
              disabled={isScanning}
            />

            {/* Target Input */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Scan Type
                <span className="text-xs text-muted-foreground">(Choose the type of identifier you want to investigate)</span>
              </Label>
              <Select value={scanType} onValueChange={setScanType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email Address</SelectItem>
                  <SelectItem value="username">Username (Uses Maigret Scanner)</SelectItem>
                  <SelectItem value="domain">Domain</SelectItem>
                  <SelectItem value="phone">Phone Number</SelectItem>
                </SelectContent>
              </Select>
              {scanType === 'username' && (
                <>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Username scans use our Maigret integration for comprehensive social media discovery across 400+ platforms
                    </AlertDescription>
                  </Alert>
                  
                  {/* Maigret Worker Status */}
                  <div className="flex items-center gap-2 p-3 rounded-lg border bg-card">
                    <span className="text-sm font-medium">Maigret Worker Status:</span>
                    <WorkerStatus />
                  </div>
                  
                  {/* Username Scan Options */}
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Username Scan Options
                    </h3>
                    
                    {/* Tags Input */}
                    <div className="space-y-2">
                      <Label htmlFor="username-tags">Tags (optional)</Label>
                      <Input
                        id="username-tags"
                        placeholder="investigation, case-123, social-media"
                        value={usernameTags}
                        onChange={(e) => setUsernameTags(e.target.value)}
                        disabled={isScanning}
                      />
                      <p className="text-xs text-muted-foreground">
                        Comma-separated tags for organization
                      </p>
                    </div>

                    {/* Scan All Sites Toggle */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-base">Scan All Sites</Label>
                        <p className="text-sm text-muted-foreground">
                          Check 300+ platforms (may take 60-120 seconds)
                        </p>
                      </div>
                      <Switch
                        checked={usernameAllSites}
                        onCheckedChange={setUsernameAllSites}
                        disabled={isScanning}
                      />
                    </div>

                    {/* Free Tier Warning */}
                    {isFree && usernameAllSites && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Free tier scans may timeout on all-sites mode. Consider upgrading to Premium for full coverage.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Export Artifacts - Premium Only */}
                    {!isFree && (
                      <div className="space-y-3 p-4 border rounded-lg">
                        <Label className="text-base">Export Artifacts</Label>
                        <p className="text-sm text-muted-foreground mb-3">
                          Generate additional export formats (Premium feature)
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { id: 'html', label: 'HTML Report' },
                            { id: 'pdf', label: 'PDF Export' },
                            { id: 'csv', label: 'CSV Data' },
                            { id: 'txt', label: 'Text File' },
                            { id: 'xmind', label: 'XMind Map' },
                          ].map((option) => (
                            <div key={option.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`artifact-${option.id}`}
                                checked={usernameArtifacts.includes(option.id)}
                                onCheckedChange={(checked) => {
                                  setUsernameArtifacts(
                                    checked
                                      ? [...usernameArtifacts, option.id]
                                      : usernameArtifacts.filter((a) => a !== option.id)
                                  );
                                }}
                                disabled={isScanning}
                              />
                              <label htmlFor={`artifact-${option.id}`} className="text-sm cursor-pointer">
                                {option.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upgrade CTA for Free Users */}
                    {isFree && (
                      <Alert className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
                        <Lock className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Unlock Premium Features:</strong> Export artifacts, priority scanning, and unlimited sites.
                          <Button 
                            variant="link" 
                            className="p-0 h-auto ml-2"
                            onClick={() => navigate('/pricing')}
                          >
                            Upgrade Now →
                          </Button>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  
                  {/* Maigret Upgrade Teaser for Free Users */}
                  {isFree && (
                    <UpgradeTeaser
                      feature="maigret"
                      title="Unlock Maigret Username Scanning"
                      description="Search for usernames across 400+ social media platforms and websites with our premium Maigret scanner."
                      benefits={[
                        "Scan 400+ platforms including Facebook, Instagram, Twitter, LinkedIn, GitHub, and more",
                        "Advanced username discovery with pattern matching",
                        "Export results in multiple formats (CSV, JSON, PDF)",
                        "Priority scanning with faster results"
                      ]}
                      plan="pro"
                      className="mt-4"
                    />
                  )}
                  
                  {/* WhatsMyName Premium Tab */}
                  {!isFree && (
                    <Card className="p-4 bg-primary/5 border-primary/20 mt-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        WhatsMyName Enrich (Premium)
                      </h4>
                      <WhatsMyNameTab subscriptionTier={subscriptionTier} />
                    </Card>
                  )}
                </>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Target Value</Label>
                {(scanType === 'email' || scanType === 'ip') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsBatchMode(!isBatchMode);
                      if (!isBatchMode) {
                        setBatchItems([]);
                      }
                    }}
                  >
                    {isBatchMode ? 'Single Mode' : 'Batch Mode'}
                  </Button>
                )}
              </div>

              {isBatchMode ? (
                <>
                  <BatchUpload
                    onBatchLoaded={setBatchItems}
                    scanType={scanType}
                    maxItems={isStandard ? 1 : 10}
                  />
                  {batchItems.length > 0 && (
                    <div className="p-3 bg-muted/50 rounded-lg border border-border">
                      <p className="text-sm font-medium mb-2">
                        {batchItems.length} {scanType}(s) loaded
                      </p>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {batchItems.slice(0, 5).map((item, idx) => (
                          <p key={idx} className="text-xs text-muted-foreground font-mono">
                            {item}
                          </p>
                        ))}
                        {batchItems.length > 5 && (
                          <p className="text-xs text-muted-foreground italic">
                            and {batchItems.length - 5} more...
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {scanType === 'ip' && batchItems.length > 0 && (
                    <>
                      <IPMapPreview ips={batchItems} />
                      
                      {/* High-Precision Mode Toggle */}
                      {!isStandard && (
                        <HighPrecisionToggle
                          enabled={highPrecisionMode}
                          onChange={setHighPrecisionMode}
                          isPremium={!isStandard}
                        />
                      )}

                      {/* Geocoding Progress Indicator */}
                      {!isStandard && (isProcessing || progressItems.length > 0) && (
                        <GeocodingProgress
                          items={progressItems}
                          totalCount={totalCount}
                          completedCount={completedCount}
                          errorCount={errorCount}
                          isActive={isProcessing}
                        />
                      )}

                      {/* Geocoded Locations Map */}
                      {locations.length > 0 && !isStandard && (
                        <LocationMap
                          locations={locations}
                          regionFilter={regionFilter}
                          onRegionFilterChange={setRegionFilter}
                          isPremium={!isStandard}
                        />
                      )}

                      {/* Geocoded Location Cards */}
                      {batchItems.length > 0 && !isStandard && (
                        <div className="space-y-2">
                          <Label>Geocoded Locations</Label>
                          <div className="grid gap-2 max-h-[300px] overflow-y-auto">
                            {batchItems.map((ip) => (
                              <LocationCard
                                key={ip}
                                ip={ip}
                                location={getLocationForIP(ip)}
                                loading={geocodingLoading}
                                error={getErrorForIP(ip)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <Input
                  placeholder={`Enter ${scanType}...`}
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="text-lg"
                />
              )}
            </div>

            {/* Anonymous Mode Toggle */}
            <AnonModeToggle
              enabled={anonModeEnabled}
              onChange={toggleAnonMode}
              isPremium={true}
            />

            {/* Maigret Toggle for Username Scans */}
            {scanType === 'username' && (
              <MaigretToggle
                enabled={maigretEnabled}
                onChange={setMaigretEnabled}
                disabled={isScanning}
              />
            )}

            {/* Provider Selection */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                Data Providers
                <span className="text-xs text-muted-foreground">
                  ({compatibleProviders.length} providers available for {scanType} scans)
                </span>
                {isStandard && (
                  <Badge variant="secondary" className="ml-2">
                    Simplified Mode
                  </Badge>
                )}
              </Label>
              {compatibleProviders.length === 0 ? (
                <div className="p-4 border border-border rounded-lg bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">
                    No providers available for {scanType} scans. Try a different scan type.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {compatibleProviders.map((provider) => {
                    const Icon = provider.icon;
                    return (
                    <Card
                      key={provider.id}
                      className={`p-4 cursor-pointer transition-all ${
                        providers.includes(provider.id)
                          ? "border-primary bg-primary/5"
                          : "hover:border-muted-foreground/50"
                      }`}
                      onClick={() => toggleProvider(provider.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox checked={providers.includes(provider.id)} className="mt-1" />
                        <Icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{provider.name}</span>
                            {provider.premium && <Badge variant="secondary">Premium</Badge>}
                          </div>
                          {provider.description && (
                            <p className="text-xs text-muted-foreground mt-1">{provider.description}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sensitive Sources */}
            <div className="space-y-3 p-4 border border-warning/30 rounded-lg bg-warning/5">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-warning" />
                <Label className="flex items-center gap-2">
                  Sensitive Sources (Consent Required)
                  <span className="text-xs text-muted-foreground">(Require explicit consent)</span>
                </Label>
              </div>
              <div className="space-y-2">
                {["dating", "nsfw", "darkweb"].map((source) => (
                  <label key={source} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={sensitiveSources.includes(source)}
                      onCheckedChange={() => handleSensitiveSourceToggle(source)}
                      disabled={source === 'darkweb' && isFree}
                    />
                    <span className="capitalize">{source} Sources</span>
                    <Badge variant="outline" className="ml-auto">-1 credit/reveal</Badge>
                  </label>
                ))}
              </div>
              
              {/* Dark Web Upgrade Teaser for Free Users */}
              {isFree && (
                <UpgradeTeaser
                  feature="darkweb"
                  title="Unlock Dark Web Monitoring"
                  description="Monitor and scan the dark web for exposed data, credential leaks, and security threats with enterprise-grade tools."
                  benefits={[
                    "Deep dark web scanning with customizable crawl depth",
                    "Real-time alerts for credential leaks and data exposures",
                    "Access to hidden forums, marketplaces, and paste sites",
                    "Comprehensive threat intelligence reports"
                  ]}
                  plan="pro"
                  className="mt-4"
                />
              )}
            </div>

            {/* Dark Web Options */}
            {(darkwebEnabled || sensitiveSources.includes('darkweb')) && (
              <Card className="p-4 bg-destructive/5 border-destructive/30 space-y-4">
                <Alert className="border-warning/50 bg-warning/10">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <AlertDescription className="text-sm">
                    <strong>Dark Web Scanning Policy:</strong> By enabling dark web monitoring, you acknowledge that:
                    <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                      <li>Results may include illegal or disturbing content</li>
                      <li>This feature is for legitimate security research only</li>
                      <li>Misuse may result in account suspension</li>
                      <li>Additional credits will be consumed (2-5x normal rate)</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={darkWebPolicyAccepted}
                    onCheckedChange={(checked) => setDarkWebPolicyAccepted(!!checked)}
                  />
                  <span className="text-sm">I accept the dark web scanning policy and terms</span>
                </label>

                {darkWebPolicyAccepted && (
                  <div className="space-y-3">
                    <Label>Dark Web Crawl Depth</Label>
                    <Select value={darkwebDepth.toString()} onValueChange={(v) => setDarkwebDepth(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Shallow (1 level) - 2x credits</SelectItem>
                        <SelectItem value="2">Medium (2 levels) - 3x credits</SelectItem>
                        <SelectItem value="3">Deep (3 levels) - 5x credits</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </Card>
            )}

            {/* Premium Apify Options */}
            <PremiumApifyOptions onChange={setPremiumOptions} />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleScan}
                disabled={isScanning || (isBatchMode ? batchItems.length === 0 : !target.trim())}
                className="flex-1"
                size="lg"
              >
                <Zap className="w-5 h-5 mr-2" />
                {isScanning 
                  ? "Scanning..." 
                  : isBatchMode && batchItems.length > 0
                    ? `Scan ${batchItems.length} Target${batchItems.length > 1 ? 's' : ''}`
                    : "Start Comprehensive Scan"
                }
              </Button>
              {!isStandard && (
                <Button
                  onClick={() => setShowBuyCreditsModal(true)}
                  variant="outline"
                  size="lg"
                  className="border-primary/50 hover:bg-primary/10"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Buy Credits
                </Button>
              )}
            </div>
          </Card>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-4">
              <Shield className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">400+ Sources</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive coverage across social media, breaches, and dark web
              </p>
            </Card>
            <Card className="p-4">
              <Lock className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Privacy First</h3>
              <p className="text-sm text-muted-foreground">
                All sensitive scans require explicit consent and are audited
              </p>
            </Card>
            <Card className="p-4">
              <Zap className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Real-Time Results</h3>
              <p className="text-sm text-muted-foreground">
                Parallel execution delivers results in under 15 seconds
              </p>
            </Card>
          </div>
                </TabsContent>

                {import.meta.env.VITE_SPIDERFOOT_API_URL ? (
                  <TabsContent value="spiderfoot" className="space-y-6 mt-6">
                    <SpiderFootScanForm workspaceId={workspace.id} />
                    <SpiderFootResults workspaceId={workspace.id} />
                  </TabsContent>
                ) : (
                  <TabsContent value="spiderfoot" className="space-y-6 mt-6">
                    <Card className="p-8 border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
                      <div className="text-center space-y-4">
                        <div className="flex justify-center">
                          <div className="p-4 rounded-full bg-primary/10">
                            <Shield className="w-12 h-12 text-primary" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold mb-2">SpiderFoot Coming Soon</h3>
                          <p className="text-muted-foreground max-w-2xl mx-auto">
                            Deploy your own SpiderFoot server to unlock 200+ module reconnaissance capabilities for comprehensive OSINT gathering.
                          </p>
                        </div>
                        <div className="flex gap-3 justify-center pt-4">
                          <Button
                            variant="default"
                            onClick={() => window.open('/docs/spiderfoot-setup', '_blank')}
                            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                          >
                            <BookOpen className="w-4 h-4 mr-2" />
                            Learn More
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => window.location.href = 'mailto:admin@footprintiq.app?subject=SpiderFoot Setup Help'}
                          >
                            Contact Support
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>
                )}

                <TabsContent value="reverse-image" className="mt-6">
                  <ReverseImageComponent />
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>

      <SensitiveConsentModal
        open={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        onConfirm={handleConsentConfirm}
      />

      <BuyCreditsModal
        open={showBuyCreditsModal}
        onClose={() => setShowBuyCreditsModal(false)}
      />

      {/* Progress Modal */}
      {modalScanId && (
        <ScanProgressDialog
          open={progressOpen}
          onOpenChange={handleProgressClose}
          scanId={modalScanId}
          onComplete={handleScanComplete}
        />
      )}

      {/* Save Template Dialog */}
      <SaveTemplateDialog
        open={saveTemplateOpen}
        onOpenChange={setSaveTemplateOpen}
        currentConfig={getCurrentConfig()}
        onSave={handleSaveTemplate}
      />
    </div>
  </ScanErrorBoundary>
  );
}
