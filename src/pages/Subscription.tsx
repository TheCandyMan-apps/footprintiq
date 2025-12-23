import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, Calendar, CreditCard } from "lucide-react";

const Subscription = () => {
  const { user, subscriptionTier, isPremium, refreshSubscription } = useSubscription();
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    const fetchSubscriptionDetails = async () => {
      const { data } = await supabase.functions.invoke("billing-check-subscription");
      if (data?.subscription_end) {
        setSubscriptionEnd(data.subscription_end);
      }
    };
    
    fetchSubscriptionDetails();
  }, [user, navigate]);

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error || !data?.url) {
        toast({
          title: "Error",
          description: error?.message || "Could not open subscription portal",
          variant: "destructive",
        });
        return;
      }
      window.open(data.url, "_blank");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open subscription portal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("billing-checkout", {
        body: { plan: 'pro' }
      });
      if (error || !data?.url) {
        toast({
          title: "Checkout error",
          description: error?.message || "Could not start checkout",
          variant: "destructive",
        });
        return;
      }
      window.open(data.url, "_blank");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start checkout",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Subscription Management - FootprintIQ"
        description="Manage your FootprintIQ subscription, billing, and payment methods"
      />
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">Subscription Management</h1>
        <p className="text-muted-foreground mb-8">Manage your plan and billing settings</p>

        <div className="grid gap-6">
          {/* Current Plan Card */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">Current Plan</h2>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold capitalize">{subscriptionTier}</span>
                  {isPremium && (
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  )}
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                isPremium ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                {isPremium ? "Active" : "Free"}
              </div>
            </div>

            {subscriptionEnd && (
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  Renews on {new Date(subscriptionEnd).toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="flex gap-3">
              {isPremium ? (
                <Button 
                  onClick={handleManageSubscription}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  Manage Subscription
                </Button>
              ) : (
                <Button 
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                  Upgrade to Pro
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={refreshSubscription}
              >
                Refresh Status
              </Button>
            </div>
          </Card>

          {/* Plan Features Card */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Plan Features</h3>
            <ul className="space-y-2">
              {subscriptionTier === "free" && (
                <>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    1 scan per month
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Basic data source detection
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Privacy score analysis
                  </li>
                </>
              )}
              {isPremium && (
                <>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Unlimited scans
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Advanced OSINT detection
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    AI-powered catfish detection
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Automated removal requests
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Continuous monitoring
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Priority support
                  </li>
                </>
              )}
            </ul>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Subscription;
