import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditsDisplay } from "@/components/workspace/CreditsDisplay";
import { CreditsAnalyticsDashboard } from "@/components/credits/CreditsAnalyticsDashboard";
import { useWorkspace } from "@/hooks/useWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreditCard, Package, Zap, Loader2, BarChart3 } from "lucide-react";
import { SettingsBreadcrumb } from "@/components/settings/SettingsBreadcrumb";
import { SettingsNav } from "@/components/settings/SettingsNav";
import { trackPaymentError } from "@/lib/sentry";
import { paymentMonitor } from "@/lib/monitoring/payment-monitor";

export default function CreditsSettings() {
  const { workspace } = useWorkspace();
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const validateSession = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        // Try to refresh session
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !session) {
          toast.error("Session expired. Please sign in again.");
          return null;
        }
        
        return session.user;
      }
      
      return user;
    } catch (error) {
      console.error("Session validation error:", error);
      trackPaymentError(error instanceof Error ? error : 'Session validation failed', {
        errorType: 'session_validation',
      });
      return null;
    }
  };

  const creditPackages = [
    {
      name: "Tiny Pack",
      credits: 10,
      price: 5,
      priceId: "price_1SQtRIPNdM5SAyj7WIxLQDeq",
      icon: Package,
      popular: false,
    },
    {
      name: "Small Pack",
      credits: 50,
      price: 20,
      priceId: "price_1SQtTSPNdM5SAyj77N2cBl6B",
      icon: Zap,
      popular: false,
    },
    {
      name: "Medium Pack",
      credits: 100,
      price: 35,
      priceId: "price_1SQtTfPNdM5SAyj7jrfjyTL7",
      icon: CreditCard,
      popular: false,
    },
    {
      name: "Starter Pack",
      credits: 500,
      price: 9,
      priceId: "price_1SRP2KPNdM5SAyj7j99PagEP",
      icon: Zap,
      popular: true,
    },
    {
      name: "Pro Pack",
      credits: 2000,
      price: 29,
      priceId: "price_1SRP2WPNdM5SAyj7GLCvttAF",
      icon: CreditCard,
      popular: false,
      savings: "Best Value",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <SettingsNav />
          </div>
        </aside>
        <div className="min-w-0">
          <SettingsBreadcrumb currentPage="Credits" />
          <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Credits & Billing</h1>
          <p className="text-muted-foreground mt-2">
            Manage your credits and purchase additional scan capacity
          </p>
        </div>

      {workspace && <CreditsDisplay workspaceId={workspace.id} />}

      <Tabs defaultValue="purchase" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="purchase">
            <Package className="h-4 w-4 mr-2" />
            Purchase Credits
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="purchase" className="space-y-6 mt-6">
          <div>

            <h2 className="text-xl font-semibold mb-4">Credit Packages</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creditPackages.map((pack) => {
            const Icon = pack.icon;
            return (
              <Card
                key={pack.name}
                className={`p-6 relative ${
                  pack.popular ? 'border-primary shadow-lg' : ''
                }`}
              >
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="flex flex-col items-center text-center">
                  <div className="p-3 rounded-full bg-primary/10 mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>

                  <h3 className="text-xl font-bold mb-2">{pack.name}</h3>
                  
                  <div className="mb-4">
                    <p className="text-4xl font-bold">£{pack.price}</p>
                    <p className="text-muted-foreground">
                      {pack.credits} credits
                    </p>
                    {pack.savings && (
                      <p className="text-sm text-green-600 font-medium mt-1">
                        {pack.savings}
                      </p>
                    )}
                  </div>

                  <div className="w-full space-y-2 text-sm text-muted-foreground mb-6">
                    <p>• {Math.floor(pack.credits / 1)} basic scans</p>
                    <p>• {Math.floor(pack.credits / 5)} advanced scans</p>
                    <p>• {Math.floor(pack.credits / 10)} dark web scans</p>
                  </div>

                  <Button 
                    className="w-full" 
                    variant={pack.popular ? "default" : "outline"}
                    disabled={purchasing === pack.priceId}
                    onClick={async () => {
                      setPurchasing(pack.priceId);
                      
                      // Track attempt
                      paymentMonitor.trackAttempt();
                      
                      try {
                        // Validate session first
                        const user = await validateSession();
                        if (!user) {
                          throw new Error("Authentication required");
                        }

                        if (!workspace?.id) {
                          throw new Error("No workspace found");
                        }

                        // Validate payload
                        if (!pack.priceId || !pack.credits) {
                          throw new Error("Invalid package configuration");
                        }

                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 15000);

                        try {
                        const { data, error } = await supabase.functions.invoke(
                            'credits-checkout', 
                            {
                              body: { 
                                priceId: pack.priceId,
                                credits: pack.credits,
                                workspaceId: workspace.id 
                              },
                            }
                          );

                          clearTimeout(timeoutId);

                          if (error) {
                            // Track failure
                            paymentMonitor.trackFailure(error, {
                              priceId: pack.priceId,
                              amount: pack.price,
                              stage: 'checkout_creation',
                            });

                            // Log error for monitoring
                            trackPaymentError(error, {
                              priceId: pack.priceId,
                              amount: pack.price,
                              errorType: 'checkout_creation',
                              errorCode: error.code || 'unknown',
                            });
                            throw error;
                          }

                          if (data?.url) {
                            window.open(data.url, '_blank');
                          } else {
                            throw new Error("No checkout URL returned");
                          }
                        } catch (fetchError: any) {
                          clearTimeout(timeoutId);
                          
                          if (fetchError.name === 'AbortError') {
                            throw new Error("Request timeout - please try again");
                          }
                          throw fetchError;
                        }
                      } catch (err: any) {
                        console.error("Purchase error:", err);
                        
                        // Track failure
                        paymentMonitor.trackFailure(err, {
                          priceId: pack.priceId,
                          amount: pack.price,
                          stage: 'purchase_flow',
                        });
                        
                        let errorMessage = "Failed to create checkout session";
                        
                        if (err?.message?.includes("Authentication")) {
                          errorMessage = "Please sign in to purchase credits";
                        } else if (err?.message?.includes("timeout")) {
                          errorMessage = "Request timed out - please try again";
                        } else if (err?.message?.includes("Bad Request")) {
                          errorMessage = "Invalid request - please refresh and try again";
                        } else if (err?.message) {
                          errorMessage = err.message;
                        }

                        toast.error(errorMessage);
                        
                        trackPaymentError(err, {
                          priceId: pack.priceId,
                          amount: pack.price,
                          errorType: 'purchase_error',
                        });
                      } finally {
                        setPurchasing(null);
                      }
                    }}
                  >
                    {purchasing === pack.priceId ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Purchase'
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
            </div>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Credit Usage Guide</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Basic Scan (1 credit)</h4>
                <p className="text-sm text-muted-foreground">
                  Includes HIBP, DeHashed, and basic data broker checks
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Advanced Scan (5 credits)</h4>
                <p className="text-sm text-muted-foreground">
                  Includes all basic sources plus Pipl, FullContact, Clearbit, Shodan
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Dark Web Scan (10 credits)</h4>
                <p className="text-sm text-muted-foreground">
                  Comprehensive dark web monitoring including paste sites, forums, and marketplaces
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Dating/NSFW Sites (3 credits each)</h4>
                <p className="text-sm text-muted-foreground">
                  Specialized scans for dating platforms and adult content sites
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <CreditsAnalyticsDashboard />
          </TabsContent>
        </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
