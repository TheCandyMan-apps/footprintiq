import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { invokeWithRetry, classifyError, getUserFriendlyMessage } from "@/lib/supabaseRetry";
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

import { PremiumApifyOptions } from "@/components/scan/PremiumApifyOptions";
import { AnonModeToggle } from "@/components/scan/AnonModeToggle";
import { CreditsBadge } from "@/components/workspace/CreditsBadge";
import { ScanProgressDialog } from "@/components/scan/ScanProgressDialog";
import { ProviderPanel } from "@/components/scan/ProviderPanel";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGeocoding } from "@/hooks/useGeocoding";
import { useActiveScanContext } from "@/contexts/ActiveScanContext";
import { useWorkerStatus } from "@/hooks/useWorkerStatus";
import { WorkerStatusBanner } from "@/components/scan/WorkerStatusBanner";
import { ScanTypeHelp } from "@/components/scan/ScanTypeHelp";
import { ProviderPreviewStrip } from "@/components/scan/ProviderPreviewStrip";
import { getWorkersForScanType, scanTypeUsesWorkers, getScanTypeMeta } from "@/lib/scan/scanTypeMeta";
import { validateScanInput, getFormatHint } from "@/lib/scan/inputValidation";
import { type ScanType } from "@/lib/providers/registry";
import { normalizePlanTier } from "@/lib/billing/planCapabilities";
import { WhatsMyNameTab } from "@/components/scan/WhatsMyNameTab";
import { ToolSelector, TOOLS } from "@/components/scan/ToolSelector";
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
import { UpgradeModal } from "@/components/UpgradeModal";
import { ActivityLogger } from "@/lib/activityLogger";

export default function AdvancedScan() {
  const navigate = useNavigate();
  const { workspace, loading: workspaceLoading, refreshWorkspace } = useWorkspace();
  const { persona, isStandard } = useUserPersona();
  const { anonModeEnabled, toggleAnonMode, isLoading: anonLoading } = useAnonMode();
  const { startTracking } = useActiveScanContext();
  const { isWorkerOffline, getWorkerByName } = useWorkerStatus();
  const { isFree, checkFeatureAccess, subscriptionTier: actualSubscriptionTier } = useTierGating();
  
  // ✅ ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
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
  const [selectedTool, setSelectedToolState] = useState<string>("maigret");
  
  // Handler that auto-sets scan type when a tool is selected
  const handleToolChange = useCallback((toolId: string) => {
    setSelectedToolState(toolId);
    const tool = TOOLS.find(t => t.id === toolId);
    if (tool && tool.scanTypes.length > 0) {
      // Set scan type to the first (primary) scan type for this tool
      setScanType(tool.scanTypes[0]);
    }
  }, []);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [maigretEnabled, setMaigretEnabled] = useState(true);
  const [usernameTags, setUsernameTags] = useState('');
  const [usernameAllSites, setUsernameAllSites] = useState(false);
  const [usernameArtifacts, setUsernameArtifacts] = useState<string[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<'provider_blocked' | 'insufficient_credits' | 'batch_blocked' | 'darkweb_blocked'>('insufficient_credits');
  const [phoneProviders, setPhoneProviders] = useState<string[]>([]);
  const [inputError, setInputError] = useState<string | null>(null);
  const [inputTouched, setInputTouched] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState<number>(0); // ✅ Debounce protection

  const { saveTemplate } = useScanTemplates();
  const { startScan: startUsernameScan } = useUsernameScan();
  
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
    username: ['maigret', 'sherlock', 'gosearch'],
    domain: ['urlscan', 'securitytrails', 'shodan', 'virustotal'],
    phone: ['fullcontact'],
  };

  useEffect(() => {
    if (scanType === 'username' && workspace?.plan) {
      // Tier-based defaults for username scans
      const isPro = workspace.plan === 'pro';
      setProviders(isPro ? ['maigret', 'sherlock'] : ['maigret', 'sherlock', 'gosearch']);
    } else {
      setProviders(DEFAULT_PROVIDERS[scanType] || []);
    }
    
    if (scanType !== 'email' && scanType !== 'ip') {
      setIsBatchMode(false);
      setBatchItems([]);
    }
    
    // Reset validation state when scan type changes
    setInputError(null);
    setInputTouched(false);
  }, [scanType, maigretEnabled, workspace?.plan]);

  // ✅ Move handleScanComplete here BEFORE any early returns
  const handleScanComplete = useCallback(async () => {
    setIsScanning(false);
    setProgressOpen(false);
    if (currentScanId) {
      // Fetch results_route from database for correct routing
      const { data } = await supabase
        .from('scans')
        .select('results_route')
        .eq('id', currentScanId)
        .maybeSingle();
      
      const route = data?.results_route ?? 'results';
      if (route === 'maigret') {
        navigate(`/maigret/results/${currentScanId}`);
      } else {
        navigate(`/results/${currentScanId}`);
      }
    } else {
      navigate("/dashboard");
    }
  }, [currentScanId, navigate]);

  const handleProgressClose = useCallback(() => {
    setProgressOpen(false);
    setModalScanId(null);
  }, []);

  // Guard: Show loading state while workspace initializes
  if (workspaceLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8">
            <div className="flex items-center justify-center space-x-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-muted-foreground">Loading workspace...</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }
  
  // Guard: Show banner if workspace is missing
  if (!workspace) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Creating workspace... please wait a moment.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }
  
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
    { id: "maigret", name: "Maigret", icon: Search, types: ['username'], description: "Advanced username reconnaissance across 500+ platforms including social media, forums, and gaming sites" },
    { id: "sherlock", name: "Sherlock", icon: Globe, types: ['username'], description: "Username enumeration across 300+ websites with high-accuracy presence detection" },
    { id: "gosearch", name: "GoSearch", icon: Shield, premium: true, types: ['username'], description: "Digital footprint discovery across 300+ websites with deep OSINT capabilities (Enterprise tier)" },
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
    // ✅ DEBOUNCE: Prevent rapid resubmissions (3-second cooldown)
    const now = Date.now();
    if (now - lastSubmitTime < 3000) {
      toast.info("Please wait a moment before submitting again");
      return;
    }
    setLastSubmitTime(now);
    
    // Validate input before scanning
    const validation = validateScanInput(scanType as ScanType, target);
    if (!validation.isValid) {
      setInputTouched(true);
      setInputError(validation.error || 'Invalid input');
      toast.error(validation.error || `Please enter a valid ${scanType}`);
      return;
    }
    
    // Use normalized value if available
    const normalizedTarget = validation.normalizedValue || target.trim();
    
    // Handle username scans with progress dialog
    if (scanType === 'username') {
      // ✅ STRICT VALIDATION: Prevent empty or boolean-like values
      if (!normalizedTarget || normalizedTarget.length < 2) {
        toast.error("Please enter a valid username (at least 2 characters)");
        return;
      }
      
      // ✅ Reject boolean-like values that may have been accidentally serialized
      const invalidValues = ['true', 'false', 'null', 'undefined'];
      if (invalidValues.includes(normalizedTarget.toLowerCase())) {
        toast.error("Please enter a valid username");
        console.error('[AdvancedScan] Rejected invalid username value:', normalizedTarget);
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

        // ✅ ENSURE WORKSPACE IS READY BEFORE STARTING SCAN
        let ensuredWorkspaceId = workspace?.id;
        
        if (!ensuredWorkspaceId) {
          toast.info("Preparing your workspace...");
          
          // Try quick-create
          await handleQuickCreateWorkspace();
          
          // Refresh workspace state
          await refreshWorkspace();
          
          // Final check - try sessionStorage as fallback
          ensuredWorkspaceId = workspace?.id || sessionStorage.getItem('current_workspace_id') || undefined;
          
          if (!ensuredWorkspaceId) {
            toast.error("Workspace failed to initialize. Please reload the page.");
            setIsScanning(false);
            return;
          }
          
          toast.success("Workspace ready!");
        }

        // Generate pre-scan ID for progress tracking
        const preScanId = self.crypto.randomUUID();
        
        // Open progress dialog BEFORE starting scan
        setModalScanId(preScanId);
        setProgressOpen(true);
        setCurrentScanId(preScanId);
        
        // Start tracking
        startTracking({
          scanId: preScanId,
          type: 'username',
          target: target.trim(),
          startedAt: new Date().toISOString(),
        });
        
        // Small delay to ensure subscription is established
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Start the scan with pre-generated ID
        console.log('[AdvancedScan] Starting username scan with workspace:', ensuredWorkspaceId, 'providers:', providers);
        const result = await startUsernameScan({
          scanId: preScanId,
          username: target.trim(),
          tags: usernameTags.trim() || undefined,
          allSites: usernameAllSites,
          artifacts: !isFree ? usernameArtifacts : [],
          debugMode: true, // Enable debug logging to see quota/auth errors
          providers, // Pass selected providers to scan orchestrator
          workspaceId: ensuredWorkspaceId, // ✅ Override workspace ID
        });
        console.log('[AdvancedScan] Scan started successfully:', result);

        // ✅ CRITICAL: Update modalScanId with the REAL scan ID from n8n-scan-trigger
        // The edge function creates its own scan ID in the database
        if (result?.jobId && result.jobId !== preScanId) {
          console.log('[AdvancedScan] Updating modalScanId from', preScanId, 'to', result.jobId);
          setModalScanId(result.jobId);
          setCurrentScanId(result.jobId);
        }

        // Progress dialog will handle navigation on completion
        setIsScanning(false);
      } catch (error) {
        console.error("[AdvancedScan] Username scan error:", error);
        
        // Classify the error
        const classified = classifyError(error);
        
        // Show appropriate error message
        if (classified.type === 'timeout') {
          toast.warning("Scan taking longer than expected", {
            description: "The scan is still running. Check your dashboard shortly.",
            duration: 8000
          });
        } else if (classified.type === 'rate_limit') {
          toast.error("Too many scans", {
            description: "Please wait a few minutes before trying again."
          });
        } else if (classified.type === 'network_error') {
          toast.error("Connection issue", {
            description: "Please check your network and try again.",
            action: {
              label: 'Retry',
              onClick: () => handleScan()
            }
          });
        } else {
          toast.error(getUserFriendlyMessage(classified), {
            description: "Check console (F12) for details",
            duration: 5000
          });
        }
        
        setIsScanning(false);
        setProgressOpen(false);
        setModalScanId(null);
        setCurrentScanId(null);
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
          
          const { data, error } = await invokeWithRetry(() =>
            supabase.functions.invoke("scan-orchestrate", {
              body: {
                scanId: preScanId,
                type: scanType,
                value: targetValue,
                workspaceId: workspace.id,
                anonMode: anonModeEnabled,
                options: {
                  providers: scanType === 'phone' ? phoneProviders : providers,
                  includeDating: sensitiveSources.includes('dating'),
                  includeNsfw: sensitiveSources.includes('nsfw'),
                  includeDarkweb: sensitiveSources.includes('darkweb') || darkwebEnabled,
                  premium: premiumOptions,
                },
              },
            })
          );

          if (error) {
            // Classify the error for better handling
            const classified = classifyError(error);
            console.error('[AdvancedScan] Scan error:', { error, classified });
            
            // Log failed scan attempt
            ActivityLogger.scanFailed(preScanId, {
              scan_type: scanType,
              target: targetValue,
              error: error.message,
              error_type: classified.type,
              workspace_id: workspace.id,
            }).catch(console.error);
            
            // For first target failure, close dialog and reset state
            if (index === 0) {
              setProgressOpen(false);
              setCurrentScanId(null);
              setIsScanning(false);
              
              // Handle specific error types
              switch (classified.type) {
                case 'rate_limit':
                  toast.error('Too many scans', { 
                    description: 'Please wait a few minutes before trying again.',
                    duration: 6000
                  });
                  break;
                  
                case 'auth_error':
                  toast.error('Session expired', { 
                    description: 'Please log in again to continue scanning.',
                    action: {
                      label: 'Log in',
                      onClick: () => navigate('/auth')
                    }
                  });
                  break;
                  
                case 'timeout':
                  toast.error('Scan taking longer than expected', { 
                    description: 'The scan is still running in the background. Check your dashboard in a few minutes.',
                    duration: 8000
                  });
                  break;
                  
                case 'network_error':
                  toast.error('Connection issue', { 
                    description: 'Please check your network and try again.',
                    action: {
                      label: 'Retry',
                      onClick: () => handleScan()
                    }
                  });
                  break;
                  
                case 'provider_unconfigured':
                  toast.warning('Partial scan available', { 
                    description: 'Some providers are not configured. Results may be limited.',
                    duration: 6000
                  });
                  // Don't throw - let partial results through
                  return { scanId: preScanId, partial: true };
                  
                case 'server_error':
                  toast.error('Server temporarily unavailable', { 
                    description: 'Our team has been notified. Please try again in a moment.',
                    action: {
                      label: 'Retry',
                      onClick: () => handleScan()
                    }
                  });
                  break;
                  
                default:
                  // Check for specific monetization/plan errors in message
                  const errorMessage = error.message || '';
                  if (errorMessage.includes('insufficient') || errorMessage.includes('credits')) {
                    setUpgradeReason('insufficient_credits');
                    setShowUpgradeModal(true);
                  } else if (errorMessage.includes('no_providers_available_for_tier') || 
                             errorMessage.includes('requires') || 
                             errorMessage.includes('blocked')) {
                    setUpgradeReason('provider_blocked');
                    setShowUpgradeModal(true);
                  } else if (errorMessage.includes('limit reached') || errorMessage.includes('quota')) {
                    setUpgradeReason('insufficient_credits');
                    setShowUpgradeModal(true);
                  } else {
                    toast.error('Scan failed', { 
                      description: getUserFriendlyMessage(classified),
                      duration: 5000
                    });
                  }
              }
            }
            throw error;
          }
          
          // Log successful scan start
          ActivityLogger.scanStarted(preScanId, {
            scan_type: scanType,
            target: targetValue,
            providers: providers.join(', '),
            workspace_id: workspace.id,
            batch_mode: targets.length > 1,
          }).catch(console.error);
          
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


  const handleApplyTemplate = (template: ScanTemplate) => {
    const config = template.configuration;
    setScanType(config.scanType);
    setProviders(config.providers || []);
    setSensitiveSources(config.sensitiveSources || []);
    setDarkwebEnabled(config.darkwebEnabled || false);
    setDarkwebDepth(config.darkwebDepth || 2);
    setPremiumOptions(config.premiumOptions || {});
    if (config.selectedTool) {
      setSelectedToolState(config.selectedTool);
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
              {/* Worker Status Banner - Dynamic based on scan type */}
              {scanTypeUsesWorkers(scanType as ScanType) ? (
                <WorkerStatusBanner 
                  showIfAllOnline={true} 
                  workerNames={getWorkersForScanType(scanType as ScanType)} 
                />
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-muted-foreground">
                    {getScanTypeMeta(scanType as ScanType)?.label || scanType} providers ready
                  </span>
                </div>
              )}
              
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
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="standard">Advanced Scan</TabsTrigger>
                  <TabsTrigger value="reverse-image">Reverse Image Intel</TabsTrigger>
                </TabsList>

                <TabsContent value="standard" className="space-y-8 mt-6">
                  {/* Standard scan form */}

          {/* Main Form */}
          <Card className="p-6 space-y-6">
            {/* Tool Selector */}
            <ToolSelector
              selectedTool={selectedTool}
              onToolChange={handleToolChange}
              scanType={scanType}
              userTier={(actualSubscriptionTier || 'free') as 'free' | 'pro' | 'business'}
              disabled={isScanning}
            />

            {/* Target Input */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Scan Type
                <ScanTypeHelp scanType={scanType as ScanType} />
              </Label>
              <Select value={scanType} onValueChange={setScanType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email Address</SelectItem>
                  <SelectItem value="username">Username</SelectItem>
                  <SelectItem value="domain">Domain</SelectItem>
                  <SelectItem value="phone">Phone Number</SelectItem>
                </SelectContent>
              </Select>
              {scanType === 'username' && (
                <>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Username scans use multiple OSINT tools (Maigret, Sherlock, GoSearch) for comprehensive social media discovery across 400+ platforms
                    </AlertDescription>
                  </Alert>
                  
                  {/* Username Scan Tools Status */}
                  <div className="flex items-center gap-2 p-3 rounded-lg border bg-card">
                    <span className="text-sm font-medium">Username Scan Tools Status:</span>
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
                  
                  {/* Username Scan Upgrade Teaser for Free Users */}
                  {isFree && (
                    <UpgradeTeaser
                      feature="username-scan"
                      title="Unlock Premium Username Scanning"
                      description="Search for usernames across 400+ social media platforms using multiple OSINT tools including Maigret, Sherlock, and GoSearch."
                      benefits={[
                        "Scan 400+ platforms including Facebook, Instagram, Twitter, LinkedIn, GitHub, and more",
                        "Multiple OSINT tools for comprehensive coverage",
                        "Advanced username discovery with pattern matching",
                        "Export results in multiple formats (CSV, JSON, PDF)",
                        "Priority scanning with faster results"
                      ]}
                      plan="pro"
                      className="mt-4"
                    />
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
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      placeholder={getScanTypeMeta(scanType as ScanType)?.placeholder || `Enter ${scanType}...`}
                      value={target}
                      onChange={(e) => {
                        setTarget(e.target.value);
                        setInputTouched(true);
                        // Validate on change
                        const result = validateScanInput(scanType as ScanType, e.target.value);
                        setInputError(e.target.value && !result.isValid ? result.error || null : null);
                      }}
                      onBlur={() => {
                        setInputTouched(true);
                        if (target) {
                          const result = validateScanInput(scanType as ScanType, target);
                          setInputError(!result.isValid ? result.error || null : null);
                        }
                      }}
                      className={`text-lg ${inputError && inputTouched ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                    {/* Format hint when empty */}
                    {!target && !inputTouched && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Format: {getFormatHint(scanType as ScanType)}
                      </p>
                    )}
                    {/* Validation error */}
                    {inputError && inputTouched && (
                      <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {inputError}
                      </p>
                    )}
                    {/* Valid indicator */}
                    {target && !inputError && inputTouched && (
                      <p className="text-xs text-green-600 mt-1">✓ Valid format</p>
                    )}
                  </div>
                  {/* Provider Preview Strip */}
                  <ProviderPreviewStrip
                    scanType={scanType as ScanType}
                    selectedProviders={scanType === 'phone' ? phoneProviders : providers}
                    userPlan={normalizePlanTier(actualSubscriptionTier)}
                  />
                </div>
              )}
            </div>

            {/* Anonymous Mode Toggle */}
            <AnonModeToggle
              enabled={anonModeEnabled}
              onChange={toggleAnonMode}
              isPremium={true}
            />

            {/* Tool selection for Username Scans is now handled via providers checkboxes above */}

            {/* Provider Selection */}
            {scanType === 'phone' ? (
              <ProviderPanel
                scanType="phone"
                selectedProviders={phoneProviders}
                onSelectionChange={setPhoneProviders}
                disabled={isScanning}
              />
            ) : (
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
            )}

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
                disabled={isScanning || workspaceLoading || (isBatchMode ? batchItems.length === 0 : !target.trim())}
                className="flex-1"
                size="lg"
              >
                <Zap className="w-5 h-5 mr-2" />
                {workspaceLoading
                  ? "Preparing workspace..."
                  : isScanning 
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

          {/* Template Manager */}
          <TemplateManager
            onApplyTemplate={handleApplyTemplate}
            onSaveTemplate={() => setSaveTemplateOpen(true)}
          />
                </TabsContent>

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
          initialProviders={scanType === 'username' ? ['sherlock', 'gosearch', 'maigret', 'holehe'] : undefined}
        />
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        reason={upgradeReason}
        blockedFeature={
          upgradeReason === 'provider_blocked' ? 'Advanced OSINT providers' :
          upgradeReason === 'darkweb_blocked' ? 'Dark web scanning' :
          upgradeReason === 'batch_blocked' ? 'Batch scanning' :
          'Credits for scanning'
        }
      />

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
