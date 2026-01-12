import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMultiToolScan } from '@/hooks/useMultiToolScan';
import { useUserPersona } from '@/hooks/useUserPersona';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/hooks/useWorkspace';
import { isScanTypeAvailable } from '@/hooks/useAdvancedScan';

import { useWorkerStatus } from '@/hooks/useWorkerStatus';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Loader2, 
  Shield, 
  Zap, 
  Crown, 
  Search, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Lightbulb,
  Lock,
  Gift
} from 'lucide-react';
import { useEmailVerification } from '@/hooks/useEmailVerification';
import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner';
import { analytics } from '@/lib/analytics';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToolConfig {
  id: string;
  name: string;
  description: string;
  creditCost: number;
  icon: typeof Shield;
  supportedTypes: string[];
  premium?: boolean;
  status?: 'available' | 'unavailable' | 'checking';
}

interface MultiToolScanFormProps {
  workspaceId: string;
}

export function MultiToolScanForm({ workspaceId }: MultiToolScanFormProps) {
  const [target, setTarget] = useState('');
  const [targetType, setTargetType] = useState<'username' | 'email' | 'ip' | 'domain'>('username');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [showRescanSuggestions, setShowRescanSuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [userScanCount, setUserScanCount] = useState<number>(0);
  const [loadingScanCount, setLoadingScanCount] = useState(true);
  const { isStandard } = useUserPersona();
  const { isScanning, startMultiToolScan, progress } = useMultiToolScan();
  const { isVerified, isLoading: verificationLoading } = useEmailVerification();
  const { workspace } = useWorkspace();
  
  const navigate = useNavigate();

  // Free tier onboarding credit check
  const isFreeWorkspace = (workspace?.subscription_tier || 'free').toLowerCase() === 'free';
  const freeAnyScanCredits = (workspace as any)?.free_any_scan_credits || 0;
  const hasAnyScanCredit = freeAnyScanCredits > 0;

  // Check scan type availability using the exported helper
  const scanTypeAvailability = useMemo(() => {
    return isScanTypeAvailable(targetType as 'email' | 'username' | 'domain' | 'phone', workspace?.subscription_tier, freeAnyScanCredits);
  }, [targetType, workspace?.subscription_tier, freeAnyScanCredits]);
  
  const isScanBlocked = !scanTypeAvailability.available;

  // Check if user needs verification for second scan
  const requiresVerificationForScan = !verificationLoading && !isVerified && userScanCount >= 1;

  // Fetch user's scan count on mount
  useEffect(() => {
    async function fetchScanCount() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setLoadingScanCount(false);
          return;
        }

        const { count, error } = await supabase
          .from('scans')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id);

        if (!error && count !== null) {
          setUserScanCount(count);
        }
      } catch (error) {
        console.error('Error fetching scan count:', error);
      } finally {
        setLoadingScanCount(false);
      }
    }

    fetchScanCount();
  }, []);
  
  const tools: ToolConfig[] = [
    {
      id: 'maigret',
      name: 'Maigret',
      description: 'Social media discovery across 400+ platforms',
      creditCost: 5,
      icon: Search,
      supportedTypes: ['username'],
      status: 'available', // Maigret is always available as a core tool
    },
    {
      id: 'reconng',
      name: 'Recon-ng',
      description: 'Passive reconnaissance with 100+ modules',
      creditCost: 10,
      icon: Zap,
      supportedTypes: ['username', 'email', 'ip', 'domain'],
      premium: true,
      status: 'available', // Recon-ng availability handled by edge function
    },
  ];

  const compatibleTools = tools.filter(t => {
    if (!t.supportedTypes.includes(targetType)) return false;
    if (isStandard && t.premium) return false;
    return true;
  });

  const toggleTool = (toolId: string) => {
    setSelectedTools(prev =>
      prev.includes(toolId) ? prev.filter(t => t !== toolId) : [...prev, toolId]
    );
  };

  const totalCost = selectedTools.reduce((sum, toolId) => {
    const tool = tools.find(t => t.id === toolId);
    return sum + (tool?.creditCost || 0);
  }, 0);

  const handleAIRescanSuggest = async () => {
    if (!target.trim()) {
      toast.error('Please enter a target first');
      return;
    }

    setLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-rescan-suggest', {
        body: {
          username: target,
          targetType,
          previousError: 'No results found'
        }
      });

      if (error) throw error;

      if (data.suggestions && data.suggestions.length > 0) {
        setAiSuggestions(data.suggestions);
        setShowRescanSuggestions(true);
        toast.success('AI suggestions generated');
      } else {
        toast.info('No alternative suggestions available');
      }
    } catch (error: any) {
      console.error('AI suggestion error:', error);
      if (error.message?.includes('429')) {
        toast.error('Rate limit exceeded. Please try again later.');
      } else if (error.message?.includes('402')) {
        toast.error('Insufficient AI credits. Please add credits.');
      } else {
        toast.error('Failed to generate suggestions');
      }
    } finally {
      setLoadingAI(false);
    }
  };

  const applySuggestion = (suggestion: string) => {
    setTarget(suggestion);
    setShowRescanSuggestions(false);
    toast.success(`Applied suggestion: ${suggestion}`);
  };

  const handleStartScan = async () => {
    // Check verification requirement for second scan
    if (requiresVerificationForScan) {
      analytics.trackEvent('email_verification_blocked_action', { action: 'second_scan' });
      toast.error('Please verify your email to run additional scans');
      return;
    }

    // PRE-SCAN: Check tier restrictions BEFORE attempting scan
    if (isScanBlocked) {
      toast.error('Upgrade required', {
        description: scanTypeAvailability.reason || `${targetType} scans are not available on your current plan.`,
        action: {
          label: 'Upgrade Now',
          onClick: () => navigate('/settings/billing')
        },
        duration: 8000
      });
      analytics.trackEvent('scan_blocked_tier_restriction', { 
        scan_type: targetType, 
        reason: scanTypeAvailability.reason 
      });
      return;
    }

    if (!target.trim()) {
      toast.error('Please enter a target');
      return;
    }

    if (selectedTools.length === 0) {
      toast.error('Please select at least one tool');
      return;
    }

    // Pre-scan validation: Check for unavailable tools
    const unavailableTools = selectedTools.filter(toolId => {
      const tool = tools.find(t => t.id === toolId);
      return tool?.status === 'unavailable';
    });

    if (unavailableTools.length > 0) {
      const toolNames = unavailableTools
        .map(id => tools.find(t => t.id === id)?.name)
        .filter(Boolean)
        .join(', ');
      toast.warning(`Skipping unavailable tools: ${toolNames}`);
    }

    // Pre-scan validation: Check credits (approximate)
    // Note: Actual credit check happens server-side
    if (totalCost > 0) {
      console.log(`Starting scan with estimated cost: ${totalCost} credits`);
    }

    try {
      const result = await startMultiToolScan({
        target,
        targetType,
        tools: selectedTools,
        workspaceId,
      });

      if (result?.scanId) {
        // Progress tracking is handled by the hook
        toast.success('Scan started successfully');
      }
    } catch (error: any) {
      console.error('Scan start error:', error);
      
      // Handle tier restriction errors with upgrade prompt
      const errorCode = error?.code || '';
      if (errorCode === 'no_providers_available_for_tier' || errorCode === 'free_any_scan_exhausted') {
        toast.error('Upgrade required', {
          description: error.message || `${targetType} scans require Pro plan.`,
          action: {
            label: 'Upgrade Now',
            onClick: () => navigate('/settings/billing')
          },
          duration: 8000
        });
        return;
      }
      
      // Handle specific error cases
      if (error.message?.includes('insufficient credits')) {
        toast.error('Insufficient credits to start scan');
      } else if (error.message?.includes('rate limit')) {
        toast.error('Rate limit exceeded. Please try again later.');
      } else {
        toast.error('Failed to start scan. Please try again.');
      }
    }
  };

  // Auto-select available tools on target type change
  useState(() => {
    const availableTools = compatibleTools
      .filter(t => t.status === 'available')
      .map(t => t.id);
    setSelectedTools(availableTools);
  });

  if (isStandard) {
    return (
      <Card className="p-8 border-2 border-primary/20">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <Crown className="h-8 w-8 text-primary" />
          </div>
          
          <div>
            <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Multi-Tool Orchestration
              <span className="text-xs bg-gradient-to-r from-primary to-accent text-primary-foreground px-2 py-1 rounded-full">
                Premium
              </span>
            </h3>
            <p className="text-muted-foreground text-lg">
              Upgrade to run parallel scans across multiple OSINT tools!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-semibold">Parallel Execution</p>
                <p className="text-sm text-muted-foreground">Run Maigret and Recon-ng together</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-semibold">Unified Results</p>
                <p className="text-sm text-muted-foreground">Correlated findings in one view</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-semibold">Smart Fallbacks</p>
                <p className="text-sm text-muted-foreground">Auto-skip unavailable tools</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-semibold">Case Integration</p>
                <p className="text-sm text-muted-foreground">Save combined data instantly</p>
              </div>
            </div>
          </div>

          <Button
            size="lg"
            onClick={() => navigate('/pricing')}
            className="w-full max-w-xs"
          >
            <Crown className="mr-2 h-5 w-5" />
            Upgrade to Premium
          </Button>

          <p className="text-xs text-muted-foreground">
            Start your 14-day free trial • Cancel anytime
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      {/* Verification banner for second scan */}
      {requiresVerificationForScan && (
        <EmailVerificationBanner placement="scan_page" />
      )}

      <div>
        <h3 className="text-lg font-semibold mb-2">Multi-Tool OSINT Scan</h3>
        <p className="text-sm text-muted-foreground">
          Run parallel scans across multiple tools for comprehensive intelligence gathering
        </p>
      </div>

      {/* Target Input */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="target">Target</Label>
          <Input
            id="target"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder={`Enter ${targetType}...`}
            disabled={isScanning}
            className="text-lg"
          />
        </div>

        {/* Free tier credit indicator */}
        {isFreeWorkspace && (
          <Alert className={hasAnyScanCredit ? 'bg-green-500/10 border-green-500/30' : 'bg-amber-500/10 border-amber-500/30'}>
            {hasAnyScanCredit ? (
              <Gift className="h-4 w-4 text-green-500" />
            ) : (
              <Info className="h-4 w-4 text-amber-500" />
            )}
            <AlertDescription className="flex items-center justify-between">
              <span>
                {hasAnyScanCredit ? (
                  <>
                    <strong>You have 1 free advanced scan</strong> (email/phone/name) available.
                  </>
                ) : (
                  <>
                    Email/phone/name scans require Pro plan. <strong>Username scans remain free.</strong>
                  </>
                )}
              </span>
              {!hasAnyScanCredit && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/settings/billing')}
                  className="ml-2"
                >
                  <Crown className="h-3 w-3 mr-1" />
                  Upgrade
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-4 gap-2">
          <TooltipProvider>
            {(['username', 'email', 'ip', 'domain'] as const).map((type) => {
              // Disable non-username types for free users without credit
              const isTypeDisabled = isFreeWorkspace && !hasAnyScanCredit && type !== 'username';
              
              return (
                <Tooltip key={type}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={targetType === type ? 'default' : 'outline'}
                      onClick={() => {
                        if (!isTypeDisabled) {
                          setTargetType(type);
                          setSelectedTools([]);
                        }
                      }}
                      disabled={isScanning || isTypeDisabled}
                      className={`capitalize ${isTypeDisabled ? 'opacity-50' : ''}`}
                    >
                      {type}
                      {isTypeDisabled && <Lock className="h-3 w-3 ml-1" />}
                    </Button>
                  </TooltipTrigger>
                  {isTypeDisabled && (
                    <TooltipContent>
                      <p>Upgrade to Pro for {type} scans</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
      </div>

      {/* Tool Selection */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          Select Tools
          <span className="text-xs text-muted-foreground">
            ({compatibleTools.length} available for {targetType})
          </span>
        </Label>

        {compatibleTools.length === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              No tools available for {targetType} scans. Try a different target type.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-2">
            {compatibleTools.map((tool) => {
              const Icon = tool.icon;
              const isSelected = selectedTools.includes(tool.id);
              const isUnavailable = tool.status === 'unavailable';

              return (
                <Card
                  key={tool.id}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : isUnavailable
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:border-muted-foreground/50'
                  }`}
                  onClick={() => !isUnavailable && toggleTool(tool.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={isSelected} 
                      disabled={isUnavailable}
                      className="mt-1" 
                    />
                    <Icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-medium">{tool.name}</span>
                        {tool.premium && <Badge variant="secondary" className="text-xs">Premium</Badge>}
                        <Badge variant="outline" className="text-xs">
                          {tool.creditCost} credits
                        </Badge>
                        {isUnavailable ? (
                          <Badge variant="destructive" className="text-xs flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Unavailable
                          </Badge>
                        ) : (
                          <Badge variant="default" className="text-xs flex items-center gap-1 bg-green-500">
                            <CheckCircle2 className="w-3 h-3" />
                            Ready
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{tool.description}</p>
                      {isUnavailable && (
                        <p className="text-xs text-destructive mt-1">
                          
                          {tool.id === 'maigret' && 'Service unavailable'}
                          {tool.id === 'reconng' && 'Service unavailable'}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Cost Summary */}
      {selectedTools.length > 0 && (
        <Alert className="bg-primary/5 border-primary/20">
          <Info className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              {selectedTools.length} tool{selectedTools.length > 1 ? 's' : ''} selected
            </span>
            <Badge variant="outline" className="font-semibold">
              Total: {totalCost} credits
            </Badge>
          </AlertDescription>
        </Alert>
      )}

      {/* Warning for unavailable tools */}
      {selectedTools.some(id => tools.find(t => t.id === id)?.status === 'unavailable') && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Some selected tools are unavailable. They will be skipped automatically during the scan.
          </AlertDescription>
        </Alert>
      )}

      {/* AI Rescan Suggestions */}
      {showRescanSuggestions && aiSuggestions.length > 0 && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              <h4 className="font-semibold">AI Suggested Alternatives</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Try these variations if your search returned no results:
            </p>
            <div className="space-y-2">
              {aiSuggestions.slice(0, 5).map((suggestion, idx) => (
                <Card key={idx} className="p-3 hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => applySuggestion(suggestion.query)}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{suggestion.query}</code>
                        <Badge variant={suggestion.confidence === 'high' ? 'default' : 'secondary'} className="text-xs">
                          {suggestion.confidence}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{suggestion.reason}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={(e) => {
                      e.stopPropagation();
                      applySuggestion(suggestion.query);
                    }}>
                      Try
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowRescanSuggestions(false)} className="w-full">
              Dismiss
            </Button>
          </div>
        </Card>
      )}

      {/* Progress Display */}
      {isScanning && progress && (
        <Card className="p-4 bg-muted/50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Scan Progress</span>
              <Badge>{progress.stage}</Badge>
            </div>
            <div className="space-y-2">
              {progress.tools?.map((tool) => (
                <div key={tool.name} className="flex items-center gap-2 text-sm">
                  {tool.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  {tool.status === 'running' && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                  {tool.status === 'failed' && <XCircle className="w-4 h-4 text-destructive" />}
                  {tool.status === 'skipped' && <AlertTriangle className="w-4 h-4 text-warning" />}
                  <span className="flex-1">{tool.name}:</span>
                  <span className="text-muted-foreground">{tool.message}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{progress.message}</p>
            
            {/* Show AI suggestions button if scan completed with no results */}
            {progress.stage === 'completed' && progress.tools?.every(t => t.status === 'completed' && t.message?.includes('No results')) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAIRescanSuggest}
                disabled={loadingAI}
                className="w-full"
              >
                {loadingAI ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating suggestions...
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Get AI Rescan Suggestions
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Tier restriction inline message */}
      {isScanBlocked && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
          <Lock className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>Upgrade required</strong>
              <p className="text-sm opacity-90">{scanTypeAvailability.reason}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/settings/billing')}
              className="ml-4 border-destructive/50 hover:bg-destructive/20"
            >
              <Crown className="h-3 w-3 mr-1" />
              Upgrade
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Start Button */}
      <Button
        onClick={handleStartScan}
        disabled={isScanning || !target.trim() || selectedTools.length === 0 || isScanBlocked}
        className="w-full"
        size="lg"
      >
        {isScanning ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Scanning...
          </>
        ) : isScanBlocked ? (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Upgrade to Scan
          </>
        ) : (
          <>
            <Zap className="mr-2 h-4 w-4" />
            Start Multi-Tool Scan ({totalCost} Credits)
          </>
        )}
      </Button>
    </Card>
  );
}
