import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Shield, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";

import { GDPRConsentModal } from "@/components/auth/GDPRConsentModal";
import { PersonaSelectorModal, type Persona } from "@/components/auth/PersonaSelectorModal";
import { TurnstileGate, type TurnstileGateRef } from "@/components/auth/TurnstileGate";
import { logActivity } from "@/lib/activityLogger";

const authSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").max(72, "Password must be less than 72 characters")
});
const signUpSchema = authSchema.extend({
  fullName: z.string().trim().min(1, "Full name is required").max(100, "Full name must be less than 100 characters")
});
const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileGateRef>(null);
  const [pendingSignupData, setPendingSignupData] = useState<{
    email: string;
    password: string;
    fullName: string;
    persona?: Persona;
  } | null>(null);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  useEffect(() => {
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
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

    // Validate Turnstile token (only if site key is configured)
    const siteKeyConfigured = !!import.meta.env.VITE_TURNSTILE_SITE_KEY;
    if (siteKeyConfigured && !turnstileToken) {
      toast({
        title: "Verification required",
        description: "Please complete the verification to continue.",
        variant: "destructive"
      });
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

    // Check if email domain is blocklisted
    setLoading(true);
    const isBlocked = await checkBlockedDomain(result.data.email);
    setLoading(false);
    
    if (isBlocked) {
      toast({
        title: "Registration blocked",
        description: "This email domain is not allowed. Please use a different email address.",
        variant: "destructive"
      });
      return;
    }

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

    // Show persona selector after GDPR consent
    setShowConsentModal(false);
    setShowPersonaModal(true);
  };
  const handlePersonaSelect = async (persona: Persona) => {
    if (!pendingSignupData) return;
    setLoading(true);
    try {
      // Create account
      const {
        data: authData,
        error: signUpError
      } = await supabase.auth.signUp({
        email: pendingSignupData.email,
        password: pendingSignupData.password,
        options: {
          data: {
            full_name: pendingSignupData.fullName
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (signUpError) throw signUpError;

      // Log GDPR consent and persona
      if (authData.user) {
        const {
          error: consentError
        } = await supabase.from('consents').insert({
          user_id: authData.user.id,
          consent_type: 'gdpr_signup',
          consent_text: 'I consent to FootprintIQ processing my personal data for scan services only, and I have read and agree to the Privacy Policy and Terms of Service.',
          ip_address: null,
          user_agent: navigator.userAgent
        });
        if (consentError) {
          console.error('Failed to log consent:', consentError);
        }

        // Create profile with persona
        const {
          error: profileError
        } = await supabase.from('profiles').upsert({
          user_id: authData.user.id,
          email: pendingSignupData.email,
          full_name: pendingSignupData.fullName,
          persona: persona
        });
        if (profileError) {
          console.error('Failed to create profile:', profileError);
        }
      }
      setShowPersonaModal(false);
      setPendingSignupData(null);
      // Reset Turnstile after successful signup
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      toast({
        title: "Success!",
        description: "Your account has been created. Redirecting..."
      });
    } catch (error: any) {
      // Reset Turnstile on error to get a fresh token
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      toast({
        title: "Sign up failed",
        description: error.message,
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
        description: error.message,
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
        redirectTo: `${window.location.origin}/dashboard`
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
  return <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-background via-background to-secondary/10 animate-fadeIn">
      <Card className="w-full max-w-md p-8 bg-gradient-card border-border shadow-card">
        <div className="text-center mb-8">
          <img src="/logo-dark.png" alt="FootprintIQ Logo" className="w-212 h-32 mx-auto mb-4" />
          
          <p className="text-muted-foreground">
            Protect your privacy across the internet
          </p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
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
                <TurnstileGate
                  ref={turnstileRef}
                  onToken={setTurnstileToken}
                  action="signup"
                  inline
                />
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <GDPRConsentModal open={showConsentModal} onAccept={handleConsentAccept} onDecline={handleConsentDecline} loading={loading} />

      <PersonaSelectorModal open={showPersonaModal} onSelect={handlePersonaSelect} loading={loading} />
    </div>;
};
export default Auth;