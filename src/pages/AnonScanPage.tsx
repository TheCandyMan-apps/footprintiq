/**
 * Anonymous Scan Entry Page
 * Accessible without authentication.
 * Routes through the free n8n quick-scan workflow.
 */
import { useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAnonymousScan } from "@/hooks/useAnonymousScan";
import { TurnstileWidget } from "@/components/security/TurnstileWidget";
import type { TurnstileWidgetRef } from "@/components/security/TurnstileWidget";
import {
  Shield, ArrowRight, User, Mail, Phone, UserCircle,
  AlertCircle, Lock, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type DetectedType = "email" | "phone" | "name" | "username";

function detectType(input: string): DetectedType {
  const trimmed = input.trim();
  if (!trimmed) return "username";
  if (/@.+\..+/.test(trimmed)) return "email";
  const digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+") || (digits.length >= 7 && /^[\d\s\-().+]+$/.test(trimmed))) return "phone";
  if (/\s/.test(trimmed)) return "name";
  return "username";
}

const TYPE_BADGES: Record<DetectedType, { icon: React.ReactNode; label: string; color: string }> = {
  email: { icon: <Mail className="h-3 w-3" />, label: "Email", color: "text-green-400 bg-green-500/10 border-green-500/30" },
  phone: { icon: <Phone className="h-3 w-3" />, label: "Phone", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  name: { icon: <UserCircle className="h-3 w-3" />, label: "Name", color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
  username: { icon: <User className="h-3 w-3" />, label: "Username", color: "text-muted-foreground bg-muted/50 border-border" },
};

export default function AnonScanPage() {
  const [searchParams] = useSearchParams();
  const [identifier, setIdentifier] = useState(searchParams.get("q") || "");
  const { triggerScan, isLoading, error, rateLimited } = useAnonymousScan();
  const navigate = useNavigate();
  const submittedRef = useRef(false);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const detectedType = useMemo((): DetectedType | null => {
    const t = identifier.trim();
    return t ? detectType(t) : null;
  }, [identifier]);

  // Only username scans are permitted anonymously
  const isRestrictedType = detectedType && detectedType !== "username";

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittedRef.current) return;
    const trimmed = identifier.trim();
    if (!trimmed) return;

    // For non-username types, redirect to auth
    if (isRestrictedType) {
      navigate(`/auth?tab=signup&redirect=/scan?q=${encodeURIComponent(trimmed)}`);
      return;
    }

    submittedRef.current = true;
    const scanId = await triggerScan(trimmed, turnstileToken || undefined);
    submittedRef.current = false;
    // Reset turnstile after submission
    turnstileRef.current?.reset();
    setTurnstileToken(null);

    if (scanId) {
      navigate(`/results/${scanId}?anon=1`);
    }
  }, [identifier, isRestrictedType, triggerScan, navigate, turnstileToken]);

  return (
    <>
      <SEO
        title="Free Username Scanner — Check Your Digital Footprint | FootprintIQ"
        description="Instantly scan any username across 500+ platforms. No account required. See where your information appears online using ethical, public-source intelligence."
        canonical="https://footprintiq.app/free-scan"
      />
      <Header />
      <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">

          {/* Hero text */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-5">
              <Shield className="h-3.5 w-3.5" />
              No account required
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Check Your Digital Footprint
            </h1>
            <p className="text-muted-foreground text-base max-w-sm mx-auto">
              See where your username appears across public platforms. Free, instant, no login needed.
            </p>
          </div>

          {/* Scan card */}
          <Card className="p-6 bg-card border-border shadow-card">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter a username to scan"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="h-12 text-base pr-24 bg-secondary border-border"
                  maxLength={255}
                  autoFocus
                  autoCorrect="off"
                  autoCapitalize="off"
                  disabled={isLoading}
                  aria-label="Username to scan"
                />
                {detectedType && (
                  <div className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium",
                    TYPE_BADGES[detectedType].color
                  )}>
                    {TYPE_BADGES[detectedType].icon}
                    <span>{TYPE_BADGES[detectedType].label}</span>
                  </div>
                )}
              </div>

              {/* Restricted type hint */}
              {isRestrictedType && (
                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2.5 border border-border/60">
                  <Lock className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                  <span>
                    <span className="font-medium text-foreground">{TYPE_BADGES[detectedType!].label} scans</span>
                    {" "}require a free account.{" "}
                    <button
                      type="submit"
                      className="text-primary hover:underline font-medium"
                    >
                      Sign up free →
                    </button>
                  </span>
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2.5 border border-destructive/20">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Rate limit CTA */}
              {rateLimited && (
                <div className="text-center pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/auth?tab=signup")}
                    className="text-xs"
                  >
                    Create free account to continue scanning
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </div>
              )}

              {/* Turnstile bot protection */}
              {!isRestrictedType && (
                <div className="flex justify-center">
                  <TurnstileWidget
                    ref={turnstileRef}
                    onToken={setTurnstileToken}
                    onError={() => setTurnstileToken(null)}
                  />
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={!identifier.trim() || isLoading || (!isRestrictedType && !turnstileToken)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Starting scan…
                  </>
                ) : isRestrictedType ? (
                  <>
                    Sign up to scan {TYPE_BADGES[detectedType!].label.toLowerCase()}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Scan now — free
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Public-source data only. 2 free scans per day. No login required.
              </p>
            </form>
          </Card>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-6 text-xs text-muted-foreground">
            {["500+ platforms", "Instant results", "Ethical OSINT only", "No surveillance"].map(f => (
              <span key={f} className="px-2.5 py-1 rounded-full bg-muted/40 border border-border/50">
                {f}
              </span>
            ))}
          </div>

          {/* Upgrade prompt */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Want email, phone & full name scans?{" "}
              <button
                onClick={() => navigate("/auth?tab=signup")}
                className="text-primary hover:underline font-medium"
              >
                Create a free account
              </button>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
