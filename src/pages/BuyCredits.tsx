import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Coins, Check, Zap, Shield, TrendingUp } from "lucide-react";
import { trackCreditPurchase } from "@/lib/sentry-monitoring";

const CREDIT_PACKAGES = [
  {
    id: "10",
    credits: 10,
    price: 9,
    pricePerCredit: 0.9,
    popular: false,
  },
  {
    id: "50",
    credits: 50,
    price: 40,
    pricePerCredit: 0.8,
    popular: true,
    savings: "11%",
  },
  {
    id: "100",
    credits: 100,
    price: 75,
    pricePerCredit: 0.75,
    popular: false,
    savings: "17%",
  },
];

const CREDIT_USES = [
  "Dark web monitoring alerts",
  "Dating & NSFW platform searches",
  "Premium evidence reveals",
  "PDF report exports",
  "Advanced API access",
];

export default function BuyCredits() {
  const [selectedPackage, setSelectedPackage] = useState("50");

  // Fetch current credit balance
  const { data: balance } = useQuery({
    queryKey: ["credits-balance"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.rpc("get_credits_balance", {
        _workspace_id: user.id,
      });

      if (error) throw error;
      return data || 0;
    },
  });

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async (packageId: string) => {
      // Validate and refresh session first
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          throw new Error("Session expired. Please log in again.");
        }
      }

      const { data, error } = await supabase.functions.invoke("billing/purchase-credits", {
        body: { package: packageId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        trackCreditPurchase(true);
        window.open(data.url, "_blank");
        toast.success("Redirecting to checkout...");
      } else {
        trackCreditPurchase(false, new Error('No checkout URL returned'));
        toast.error("Failed to get checkout link");
      }
    },
    onError: (error) => {
      trackCreditPurchase(false, error as Error);
      toast.error(error instanceof Error ? error.message : "Purchase failed");
    },
  });

  const handlePurchase = () => {
    purchaseMutation.mutate(selectedPackage);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Buy Credits | FootprintIQ"
        description="Purchase premium credits for advanced OSINT features including dark web monitoring, dating platform searches, and more."
      />
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-elegant">
              <Coins className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Premium Credits
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Unlock advanced OSINT capabilities with pay-as-you-go credits
            </p>
            {balance !== undefined && (
              <Badge variant="outline" className="text-lg px-4 py-2">
                Current Balance: {balance} credits
              </Badge>
            )}
          </div>

          {/* Credit Packages */}
          <div className="grid md:grid-cols-3 gap-6">
            {CREDIT_PACKAGES.map((pkg) => (
              <Card
                key={pkg.id}
                className={`p-6 cursor-pointer transition-all hover:shadow-elevated ${
                  selectedPackage === pkg.id
                    ? "border-primary bg-primary/5 shadow-elegant"
                    : ""
                } ${pkg.popular ? "relative" : ""}`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <div className="text-center space-y-4">
                  <div>
                    <div className="text-4xl font-bold">{pkg.credits}</div>
                    <div className="text-sm text-muted-foreground">credits</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">£{pkg.price}</div>
                    <div className="text-sm text-muted-foreground">
                      £{pkg.pricePerCredit.toFixed(2)} per credit
                    </div>
                    {pkg.savings && (
                      <Badge variant="secondary" className="mt-2">
                        Save {pkg.savings}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPackage === pkg.id ? "border-primary bg-primary" : "border-muted"
                    }`}>
                      {selectedPackage === pkg.id && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <span className="text-sm">
                      {selectedPackage === pkg.id ? "Selected" : "Select"}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Purchase Button */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-1">
                  {CREDIT_PACKAGES.find(p => p.id === selectedPackage)?.credits} Credits
                </h3>
                <p className="text-sm text-muted-foreground">
                  One-time payment • No subscription required
                </p>
              </div>
              <Button
                size="lg"
                onClick={handlePurchase}
                disabled={purchaseMutation.isPending}
                className="min-w-[200px]"
              >
                <Zap className="w-5 h-5 mr-2" />
                {purchaseMutation.isPending ? "Processing..." : `Pay £${CREDIT_PACKAGES.find(p => p.id === selectedPackage)?.price}`}
              </Button>
            </div>
          </Card>

          {/* What You Can Do */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Credit Usage
              </h3>
              <ul className="space-y-3">
                {CREDIT_USES.map((use, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{use}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Why Buy Credits?
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>✓ No monthly commitment</li>
                <li>✓ Credits never expire</li>
                <li>✓ Use only when you need advanced features</li>
                <li>✓ Perfect for occasional investigations</li>
                <li>✓ Full transparency on credit usage</li>
              </ul>
            </Card>
          </div>

          {/* FAQs */}
          <Card className="p-6 bg-muted/50">
            <h3 className="text-xl font-semibold mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium mb-1">Do credits expire?</p>
                <p className="text-muted-foreground">No, your credits never expire. Use them whenever you need.</p>
              </div>
              <div>
                <p className="font-medium mb-1">Can I get a refund?</p>
                <p className="text-muted-foreground">Unused credits can be refunded within 30 days of purchase.</p>
              </div>
              <div>
                <p className="font-medium mb-1">What payment methods do you accept?</p>
                <p className="text-muted-foreground">We accept all major credit cards, debit cards, and digital wallets via Stripe.</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
