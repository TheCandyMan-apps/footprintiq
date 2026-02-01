import { useState, useCallback, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowRight, Shield, Mail, Phone, User, UserCircle, Info, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/security/TurnstileWidget";
import { useTurnstileRequired } from "@/hooks/useTurnstileRequired";
import { useTierGating } from "@/hooks/useTierGating";
import { UpgradeDialog } from "@/components/UpgradeDialog";
import { ProOptionsPanel } from "./ProOptionsPanel";
import { 
  type UnifiedScanConfig, 
  type DetectedType, 
  type EnhancerKey, 
  type ScanMode,
  deriveScanMode 
} from "@/lib/scan/unifiedScanTypes";
import { validatePhone } from "@/lib/phone/phoneUtils";
import { analytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface UnifiedScanFormProps {
  onSubmit: (config: UnifiedScanConfig) => void;
  /** User's subscription tier (from user_roles) - used to gate Pro features */
  subscriptionTier?: string;
}

// Type detection function
function detectType(input: string): DetectedType {
  const trimmed = input.trim();
  if (!trimmed) return "username";
  
  // Email: contains @ with a valid domain pattern
  if (/@.+\..+/.test(trimmed)) {
    return "email";
  }
  
  // Phone: starts with + or has 7+ digits
  const digits = trimmed.replace(/\D/g, '');
  if (trimmed.startsWith('+') || digits.length >= 7) {
    return "phone";
  }
  
  // Name: contains whitespace
  if (/\s/.test(trimmed)) {
    return "name";
  }
  
  // Default: username
  return "username";
}

// Format hints for each type
const FORMAT_HINTS: Record<DetectedType, { icon: React.ReactNode; label: string; color: string }> = {
  email: {
    icon: <Mail className="h-3.5 w-3.5" />,
    label: "Email detected",
    color: "bg-green-500/10 text-green-400 border-green-500/20"
  },
  phone: {
    icon: <Phone className="h-3.5 w-3.5" />,
    label: "Phone detected",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20"
  },
  name: {
    icon: <UserCircle className="h-3.5 w-3.5" />,
    label: "Full name detected",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20"
  },
  username: {
    icon: <User className="h-3.5 w-3.5" />,
    label: "Username detected",
    color: "bg-muted/50 text-muted-foreground border-border"
  }
};

export function UnifiedScanForm({ onSubmit, subscriptionTier: tierProp }: UnifiedScanFormProps) {
  // Input state
  const [identifier, setIdentifier] = useState("");
  const [selectedEnhancers, setSelectedEnhancers] = useState<EnhancerKey[]>([]);
  
  // Upgrade dialog state
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  
  // Turnstile state
  const turnstileRef = useRef<TurnstileWidgetRef>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { required: requiresTurnstile } = useTurnstileRequired();
  
  // Use prop tier if provided, otherwise fall back to hook
  // This ensures consistency with what ScanPage sends to the backend
  const tierFromHook = useTierGating();
  const normalizedTier = (tierProp || tierFromHook.subscriptionTier || 'free').toLowerCase();
  const isFree = normalizedTier === 'free';
  const isProUser = normalizedTier === 'pro' || normalizedTier === 'business' || 
                   normalizedTier === 'premium' || normalizedTier === 'enterprise' ||
                   normalizedTier === 'analyst';
  
  // Detect input type
  const detectedType = useMemo((): DetectedType | null => {
    const trimmed = identifier.trim();
    if (!trimmed) return null;
    return detectType(trimmed);
  }, [identifier]);
  
  // Has input - for progressive disclosure
  const hasInput = identifier.trim().length > 0;

  const handleChangeEnhancer = useCallback((key: EnhancerKey, enabled: boolean) => {
    setSelectedEnhancers(prev => 
      enabled 
        ? [...prev, key]
        : prev.filter(k => k !== key)
    );
  }, []);

  const handleRequestUpgrade = useCallback(() => {
    setShowUpgradeDialog(true);
  }, []);

  const handleTurnstileToken = useCallback((token: string) => {
    setTurnstileToken(token);
    setTurnstileError(null);
  }, []);

  const handleTurnstileError = useCallback((error: string) => {
    setTurnstileToken(null);
    setTurnstileError(error);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    analytics.scanStartClick();
    setTurnstileError(null);
    
    // Validate Turnstile if required
    if (requiresTurnstile && !turnstileToken) {
      setTurnstileError("Please complete the verification to continue.");
      return;
    }
    
    const trimmed = identifier.trim();
    
    if (!trimmed) {
      toast({
        title: "Missing Input",
        description: "Please enter an identifier to search",
        variant: "destructive",
      });
      return;
    }
    
    const type = detectType(trimmed);
    
    // Validate phone format if detected
    if (type === "phone") {
      const phoneValidation = validatePhone(trimmed);
      if (!phoneValidation.isValid) {
        toast({
          title: "Invalid Phone Number",
          description: phoneValidation.error || "Please enter a valid phone number with country code",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Derive scan mode and strip enhancers for Free users
    const { scanMode, finalEnhancers } = deriveScanMode(isFree, type, selectedEnhancers);
    
    // If Free user had enhancers selected (stale state), show toast
    if (isFree && selectedEnhancers.length > 0) {
      sonnerToast.info("Pro-only options removed. Upgrade to enable.");
      setSelectedEnhancers([]);
    }
    
    const config: UnifiedScanConfig = {
      query: trimmed,
      detectedType: type,
      scanMode,
      enhancers: finalEnhancers,
      turnstile_token: turnstileToken || undefined,
    };
    
    analytics.scanSubmit(type);
    onSubmit(config);
    
    // Reset Turnstile
    setTurnstileToken(null);
    turnstileRef.current?.reset();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col">
        {/* SEO Header - provides H1 and content for crawlers */}
        <header className="bg-muted/30 border-b border-border">
          <div className="max-w-4xl mx-auto px-6 py-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Free Digital Footprint Scanner
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Check where your personal information appears online. Scan usernames across 500+ platforms, 
              detect email breaches, verify phone exposure, and discover your digital presence using ethical OSINT methods.
            </p>
          </div>
        </header>

        {/* Main Form */}
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <Card className="w-full max-w-2xl p-8 bg-gradient-card border-border shadow-card">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Shield className="h-7 w-7 text-primary" />
                <h2 className="text-2xl font-semibold">Start Your Scan</h2>
              </div>
              <p className="text-muted-foreground">
                Enter a username, email, phone number, or full name to discover your online presence
              </p>
            </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Single Input Field */}
            <div className="space-y-3">
              <Label htmlFor="identifier" className="sr-only">
                Search identifier
              </Label>
              <Input
                id="identifier"
                type="text"
                placeholder="Username, email, phone number, or full name"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-12 text-lg bg-secondary border-border"
                maxLength={255}
                autoFocus
                data-tour="scan-input"
              />
              
              {/* Dynamic type detection hint */}
              {detectedType ? (
                <div className={cn(
                  "flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-all border",
                  FORMAT_HINTS[detectedType].color
                )}>
                  {FORMAT_HINTS[detectedType].icon}
                  <span className="font-medium">{FORMAT_HINTS[detectedType].label}</span>
                  {detectedType === "phone" && (
                    <>
                      <span className="text-muted-foreground">—</span>
                      <span className="opacity-80">Include country code (+1, +44, etc.)</span>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-2 rounded-lg bg-muted/30 border border-border/50">
                  <Info className="h-3.5 w-3.5" />
                  <span>
                    <strong>Phone format:</strong> Include country code (+1, +44, etc.) for best results
                  </span>
                </div>
              )}
            </div>

            {/* Turnstile verification */}
            {requiresTurnstile && (
              <div className="space-y-2 opacity-90">
                <TurnstileWidget
                  ref={turnstileRef}
                  onToken={handleTurnstileToken}
                  onError={handleTurnstileError}
                  theme="dark"
                  action="scan-start"
                  inline
                />
                {turnstileError && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{turnstileError}</span>
                  </div>
                )}
              </div>
            )}

            {/* Primary CTA */}
            <Button 
              type="submit" 
              size="lg" 
              data-tour="scan-button"
              className="w-full"
              disabled={!identifier.trim()}
            >
              Run scan
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            {/* Trust Line */}
            <p className="text-xs text-muted-foreground text-center">
              We only use public sources. Queries are discarded after processing.
            </p>

            {/* Pro Options Panel - Progressive Disclosure */}
            {hasInput && detectedType && (
              <div className="pt-4 border-t border-border">
                <ProOptionsPanel
                  detectedType={detectedType}
                  isFree={isFree}
                  selectedEnhancers={selectedEnhancers}
                  onChangeEnhancer={handleChangeEnhancer}
                  onRequestUpgrade={handleRequestUpgrade}
                />
              </div>
            )}
          </form>
        </Card>
      </main>

      {/* SEO Footer Content - adds more text for crawlers */}
      <footer className="bg-muted/20 border-t border-border">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="grid md:grid-cols-2 gap-8 text-sm text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground mb-2">What We Scan</h3>
              <ul className="space-y-1">
                <li>• Social media platforms (Instagram, TikTok, Reddit, X/Twitter, etc.)</li>
                <li>• Professional networks (LinkedIn, GitHub, Behance)</li>
                <li>• Gaming platforms (Steam, PlayStation, Xbox)</li>
                <li>• Forums, communities, and creative sites</li>
                <li>• Known data breach databases</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Privacy Promise</h3>
              <p className="mb-3">
                FootprintIQ only accesses publicly available information. We never store your queries, 
                track your activity, or sell your data. Scans are user-initiated and results are yours alone.
              </p>
              <p>
                <a href="/responsible-use" className="text-primary hover:underline">Read our Responsible Use Policy</a>
              </p>
            </div>
          </div>
        </div>
      </footer>
      </div>
      
      {/* Upgrade Dialog */}
      <UpgradeDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
      />
    </>
  );
}
