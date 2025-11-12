import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

const CREDIT_PACKAGES = [
  {
    credits: 10,
    price: 5,
    priceId: "price_1SQtRIPNdM5SAyj7WIxLQDeq",
    popular: false,
  },
  {
    credits: 50,
    price: 20,
    priceId: "price_1SQtTSPNdM5SAyj77N2cBl6B",
    popular: false,
  },
  {
    credits: 100,
    price: 35,
    priceId: "price_1SQtTfPNdM5SAyj7jrfjyTL7",
    popular: false,
  },
  {
    credits: 500,
    price: 9,
    priceId: "price_1SRP2KPNdM5SAyj7j99PagEP",
    popular: true,
  },
  {
    credits: 2000,
    price: 29,
    priceId: "price_1SRP2WPNdM5SAyj7GLCvttAF",
    popular: false,
  },
];

export default function BuyCreditsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: workspace } = useQuery({
    queryKey: ["user-workspace", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("workspace_members")
        .select("workspace_id, workspaces(subscription_tier)")
        .eq("user_id", user.id)
        .limit(1)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const handlePurchase = async (pkg: typeof CREDIT_PACKAGES[0]) => {
    if (!user || !workspace) {
      toast({
        title: "Authentication required",
        description: "Please sign in to purchase credits",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setLoading(pkg.priceId);

    try {
      const { data, error } = await supabase.functions.invoke("billing/purchase-credits-checkout", {
        body: {
          priceId: pkg.priceId,
          credits: pkg.credits,
          workspaceId: workspace.workspace_id,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast({
        title: "Purchase failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const tier = (workspace as any)?.workspaces?.subscription_tier || "free";
  const isPremium = ["pro", "enterprise"].includes(tier.toLowerCase());

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Buy Credits</h1>
            <p className="text-muted-foreground">
              Purchase credits to unlock premium Apify features
            </p>
          </div>

          {isPremium && (
            <Card className="mb-6 border-primary">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-5 w-5 text-primary" />
                  <p className="font-semibold">
                    You're on a {tier} plan with unlimited premium features!
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Credits are optional for Pro and Enterprise users. You already have access to all Apify actors.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CREDIT_PACKAGES.map((pkg) => (
              <Card
                key={pkg.priceId}
                className={pkg.popular ? "border-primary shadow-lg" : ""}
              >
                <CardHeader>
                  {pkg.popular && (
                    <Badge className="w-fit mb-2">Most Popular</Badge>
                  )}
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    {pkg.credits} Credits
                  </CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-foreground">
                      ${pkg.price}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-muted-foreground">
                      ${(pkg.price / pkg.credits).toFixed(2)} per credit
                    </p>
                    <p className="text-sm">
                      • {Math.floor(pkg.credits / 3)} Social Media scans
                    </p>
                    <p className="text-sm">
                      • {Math.floor(pkg.credits / 2)} OSINT scans
                    </p>
                    <p className="text-sm">
                      • {Math.floor(pkg.credits / 5)} Dark Web scans
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => handlePurchase(pkg)}
                    disabled={loading === pkg.priceId}
                  >
                    {loading === pkg.priceId ? "Processing..." : "Purchase"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>How Credits Work</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                • <strong>Social Media Finder</strong> - 3 credits per scan
              </p>
              <p className="text-sm text-muted-foreground">
                • <strong>OSINT Paste Scraper</strong> - 2 credits per scan
              </p>
              <p className="text-sm text-muted-foreground">
                • <strong>Dark Web Scraper</strong> - 5 credits per scan
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Credits never expire and can be used across all your scans. Pro and Enterprise subscribers receive monthly credits and unlimited access.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
