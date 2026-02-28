import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Shield, Mail, AlertCircle, Apple } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";

import { GDPRConsentModal } from "@/components/auth/GDPRConsentModal";
import { SEO } from "@/components/SEO";
import { TurnstileGate, type TurnstileGateRef } from "@/components/auth/TurnstileGate";
import { logActivity } from "@/lib/activityLogger";

const authSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").max(72, "Password must be less than 72 characters")
});
const signUpSchema = authSchema.extend({
  fullName: z.string().trim().min(1, "Full name is required").max(100, "Full name must be less than 100 characters")
});
function getFriendlyAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('over_email_send_rate') || lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Too many attempts. Please wait a minute before trying again.';
  }
  if (lower.includes('user_already_exists') || lower.includes('already registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (lower.includes('weak_password') || lower.includes('password is too weak')) {
    return 'Please choose a stronger password (at least 8 characters with a mix of letters and numbers).';
  }
  if (lower.includes('invalid login credentials') || lower.includes('invalid_credentials')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Please verify your email address before signing in. Check your inbox for a confirmation link.';
  }
  return 'Something went wrong. Please try again.';
}

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileGateRef>(null);
  const [pendingSignupData, setPendingSignupData] = useState<{
    email: string;
    password: string;
    fullName: string;
  } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [awaitingEmailConfirmation, setAwaitingEmailConfirmation] = useState(false);
  
  // Hardcoded fallback exists in useTurnstile hook, so always treat as configured
  const siteKeyConfigured = true;

  const handleTurnstileToken = useCallback((token: string) => {
    setTurnstileToken(token);
    setTurnstileError(null);
  }, []);

  const handleTurnstileError = useCallback((error: string) => {
    setTurnstileToken(null);
    setTurnstileError(error);
  }, []);

  const resetTurnstile = useCallback(() => {
    setTurnstileToken(null);
    setTurnstileError(null);
    turnstileRef.current?.reset();
  }, []);
  // Compute safe redirect target from query params
  const getRedirectTarget = useCallback(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const redirectTo = searchParams.get('redirect');
    // Validate: must start with "/" and not "//" (prevents open redirect)
    if (redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')) {
      return redirectTo;
    }
    return '/dashboard';
  }, []);

  // Claim anonymous scan after signup
  const claimAnonymousScan = useCallback(async (userId: string) => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const claimScanId = searchParams.get('claim');
      if (!claimScanId) return;

      const { error } = await supabase
        .from('scans')
        .update({ user_id: userId, claimed: true })
        .eq('id', claimScanId)
        .is('user_id', null); // Only claim if still unclaimed

      if (!error) {
        console.log('[Auth] Anonymous scan claimed:', claimScanId);
        sessionStorage.removeItem('fpiq_anon_scan_id');
        sessionStorage.removeItem('fpiq_anon_target');
      }
    } catch (err) {
      console.warn('[Auth] Failed to claim anonymous scan:', err);
    }
  }, []);

  useEffect(() => {
    const safeRedirect = getRedirectTarget();
    
    // Listener FIRST (prevents missing events during init)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAwaitingEmailConfirmation(false);
        navigate(safeRedirect);
      }
    });

    // THEN read current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAwaitingEmailConfirmation(false);
        navigate(safeRedirect);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, getRedirectTarget]);
  const checkBlockedDomain = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('is_email_blocklisted', { _email: email });
      if (error) {
        console.error('Blocklist check failed:', error);
        return false; // Fail open to prevent lockout on DB errors
      }
      return data === true;
    } catch (err) {
      console.error('Blocklist check exception:', err);
      return false;
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous turnstile error
    setTurnstileError(null);

    // Validate Turnstile token (only if site key is configured)
    if (siteKeyConfigured && !turnstileToken) {
      setTurnstileError("Please complete the verification to continue.");
      return;
    }

    // Validate form data
    const result = signUpSchema.safeParse({
      email,
      password,
      fullName
    });
    if (!result.success) {
      const firstError = result.error.errors[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    // Verify Turnstile token server-side before proceeding
    if (siteKeyConfigured && turnstileToken) {
      try {
        const { data: verifyResult, error: verifyError } = await supabase.functions.invoke('turnstile-verify', {
          body: { turnstile_token: turnstileToken }
        });

        if (verifyError || !verifyResult?.ok) {
          setTurnstileError(verifyResult?.error || 'Verification failed. Please try again.');
          resetTurnstile();
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('[Auth] Turnstile verification error:', err);
        setTurnstileError('Verification service unavailable. Please try again.');
        resetTurnstile();
        setLoading(false);
        return;
      }
    }

    // Check if email domain is blocklisted
    const isBlocked = await checkBlockedDomain(result.data.email);
    
    if (isBlocked) {
      setLoading(false);
      toast({
        title: "Registration blocked",
        description: "This email domain is not allowed. Please use a different email address.",
        variant: "destructive"
      });
      return;
    }

    setLoading(false);

    // Store data and show GDPR consent modal
    setPendingSignupData({
      email: result.data.email,
      password: result.data.password,
      fullName: result.data.fullName
    });
    setShowConsentModal(true);
  };
  const handleConsentAccept = async () => {
    if (!pendingSignupData) return;
    setShowConsentModal(false);
    
    // Create account immediately with default 'standard' persona
    setLoading(true);
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: pendingSignupData.email,
        password: pendingSignupData.password,
        options: {
          data: {
            full_name: pendingSignupData.fullName,
            persona: 'standard', // Default all new users to Standard mode
            user_agent: navigator.userAgent
          },
          emailRedirectTo: `${window.location.origin}${getRedirectTarget()}`
        }
      });
      if (signUpError) throw signUpError;

      setPendingSignupData(null);
      resetTurnstile();
      
      toast({
        title: "Success!",
        description: authData.session
          ? "Your account has been created. Redirecting..."
          : "Your account has been created. Please check your email to confirm, then you'll be redirected."
      });

      if (authData.session) {
        setAwaitingEmailConfirmation(false);
        await claimAnonymousScan(authData.session.user.id);
        setTimeout(() => navigate(getRedirectTarget()), 250);
      } else {
        setAwaitingEmailConfirmation(true);
      }
    } catch (error: any) {
      resetTurnstile();
      toast({
        title: "Sign up failed",
        description: getFriendlyAuthError(error.message || ''),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleConsentDecline = () => {
    setShowConsentModal(false);
    setPendingSignupData(null);
    toast({
      title: "Signup cancelled",
      description: "You must accept the data processing terms to create an account."
    });
  };
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const result = authSchema.safeParse({
      email,
      password
    });
    if (!result.success) {
      const firstError = result.error.errors[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    });
    setLoading(false);
    
    if (error) {
      toast({
        title: "Sign in failed",
        description: getFriendlyAuthError(error.message || ''),
        variant: "destructive",
      });
    } else {
      // Log successful login
      await logActivity({
        action: "user.login",
        entityType: "user",
        metadata: { method: "password" },
      });
    }
  };
  const handleGoogleSignIn = async () => {
    setLoading(true);
    const {
      error
    } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${getRedirectTarget()}`
      }
    });
    setLoading(false);
    if (error) {
      toast({
        title: "Google sign in failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  return <><SEO
      title="Sign In or Create Account | FootprintIQ"
      description="Sign in or create your FootprintIQ account to scan your digital footprint, monitor data breaches, and manage your online privacy."
      canonical="https://footprintiq.app/auth"
    /><div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-background via-background to-secondary/10 animate-fadeIn">
      <Card className="w-full max-w-md p-8 bg-gradient-card border-border shadow-card">
        <div className="text-center mb-8">
          <img src="/logo-dark.png" alt="FootprintIQ Logo" className="w-212 h-32 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-foreground mb-1">Sign in to FootprintIQ</h1>
          <p className="text-muted-foreground">
            Protect your privacy across the internet
          </p>
        </div>

        {awaitingEmailConfirmation && (
          <div className="mb-4 rounded-lg border border-border bg-card/50 p-3 text-sm text-muted-foreground">
            Check your inbox to confirm your email. Once confirmed, you’ll be redirected automatically.
          </div>
        )}

        <Tabs defaultValue={new URLSearchParams(window.location.search).get('tab') === 'signup' ? 'signup' : 'signin'} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <div className="space-y-4">
              <div className="space-y-3">
                <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
                  <Mail className="w-4 h-4 mr-2" />
                  Continue with Google
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
                </div>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="signin-email">Email</Label>
                  <Input id="signin-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required maxLength={255} />
                </div>
                <div>
                  <Label htmlFor="signin-password">Password</Label>
                  <Input id="signin-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} maxLength={72} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="signup">
            <div className="space-y-4">
              <div className="space-y-3">
                <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
                  <Mail className="w-4 h-4 mr-2" />
                  Continue with Google
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or sign up with email</span>
                </div>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input id="signup-name" type="text" value={fullName} onChange={e => setFullName(e.target.value)} required maxLength={100} />
                </div>
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required maxLength={255} />
                </div>
                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} maxLength={72} />
                </div>
                
                {/* Turnstile verification for signup */}
                <div className="space-y-2">
                  <TurnstileGate
                    ref={turnstileRef}
                    onToken={handleTurnstileToken}
                    onError={handleTurnstileError}
                    action="signup"
                    inline
                  />
                  {turnstileError && (
                    <div className="flex items-center gap-2 text-destructive text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{turnstileError}</span>
                    </div>
                  )}
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <GDPRConsentModal open={showConsentModal} onAccept={handleConsentAccept} onDecline={handleConsentDecline} loading={loading} />
    </div></>;
};
export default Auth;