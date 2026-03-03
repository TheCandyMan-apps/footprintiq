import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowRight, Shield, Mail, Phone, User, UserCircle, Info, AlertCircle, Search, BarChart3, ListChecks, ShieldCheck } from "lucide-react";
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
  
  // Phone: starts with + OR is primarily numeric (only digits and phone separators)
  // This prevents usernames like "matchu12181990" from being detected as phone numbers
  const digits = trimmed.replace(/\D/g, '');
  const isPhoneLike = trimmed.startsWith('+') || 
    (digits.length >= 7 && /^[\d\s\-().+]+$/.test(trimmed));
  if (isPhoneLike) {
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
  const [searchParams] = useSearchParams();
  
  // Input state
  const [identifier, setIdentifier] = useState("");
  const [selectedEnhancers, setSelectedEnhancers] = useState<EnhancerKey[]>([]);
  
  // Pre-fill from URL query param ?q=
  useEffect(() => {
    const queryValue = searchParams.get('q');
    if (queryValue && !identifier) {
      setIdentifier(queryValue);
      analytics.trackEvent('scan_prefill_from_hero', { type: detectType(queryValue) });
    }
  }, [searchParams]);
  
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
        {/* ═══ ABOVE THE FOLD — input + CTA + trust ═══ */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
          <div className="w-full max-w-lg text-center mb-6">
            <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Check Your Exposure
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter a username, email, phone, or name
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-4">
            <Label htmlFor="identifier" className="sr-only">Search identifier</Label>
            <Input
              id="identifier"
              type="text"
              placeholder="Username, email, phone, or full name"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-12 text-base sm:text-lg bg-secondary border-border"
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
                    <span className="opacity-80">Include country code (+1, +44)</span>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-2 rounded-lg bg-muted/30 border border-border/50">
                <Info className="h-3.5 w-3.5" />
                <span><strong>Tip:</strong> Include country code for phone (+1, +44)</span>
              </div>
            )}

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
              className="w-full h-12"
              disabled={!identifier.trim()}
            >
              Analyse exposure
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            {/* Trust statement */}
            <p className="text-xs text-muted-foreground text-center">
              Public / OSINT only. No private data access.
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
        </main>

        {/* ═══ BELOW THE FOLD — lightweight conversion helpers ═══ */}
        <section className="border-t border-border bg-muted/20 px-4 sm:px-6 py-8">
          <div className="max-w-lg mx-auto space-y-8">
            {/* What you'll get */}
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
                What you'll get
              </h2>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Search className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Accounts found across 500+ platforms</span>
                </li>
                <li className="flex items-start gap-3">
                  <BarChart3 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Exposure signals &amp; risk score</span>
                </li>
                <li className="flex items-start gap-3">
                  <ListChecks className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Suggested next steps to reduce exposure</span>
                </li>
              </ul>
            </div>

            {/* Privacy-first micro panel */}
            <Card disableHover className="p-4 flex items-start gap-3 bg-card border-border">
              <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">Privacy-first by design</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  We only analyse publicly available data. No private databases, no dark web scraping, no data resale.
                </p>
                <Link to="/trust-safety" className="text-primary text-xs hover:underline mt-1 inline-block">
                  Read our Trust &amp; Safety policy →
                </Link>
              </div>
            </Card>
          </div>
        </section>
      </div>

      {/* Upgrade Dialog */}
      <UpgradeDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
      />
    </>
  );
}
