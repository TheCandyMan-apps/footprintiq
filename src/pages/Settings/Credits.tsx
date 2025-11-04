import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditsDisplay } from "@/components/workspace/CreditsDisplay";
import { useWorkspace } from "@/hooks/useWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreditCard, Package, Zap } from "lucide-react";

export default function CreditsSettings() {
  const { workspace } = useWorkspace();

  const creditPackages = [
    {
      name: "Starter Pack",
      credits: 50,
      price: 9.99,
      icon: Package,
      popular: false,
    },
    {
      name: "Pro Pack",
      credits: 200,
      price: 29.99,
      icon: Zap,
      popular: true,
      savings: "25% off",
    },
    {
      name: "Enterprise Pack",
      credits: 1000,
      price: 99.99,
      icon: CreditCard,
      popular: false,
      savings: "40% off",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Credits & Billing</h1>
        <p className="text-muted-foreground mt-2">
          Manage your credits and purchase additional scan capacity
        </p>
      </div>

      {workspace && <CreditsDisplay workspaceId={workspace.id} />}

      <div>
        <h2 className="text-xl font-semibold mb-4">Purchase Credits</h2>
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
                    <p className="text-4xl font-bold">${pack.price}</p>
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
                    onClick={async () => {
                      try {
                        const { data, error } = await supabase.functions.invoke('billing/purchase-credits-checkout', {
                          body: { 
                            packageId: pack.name.toLowerCase().replace(' pack', ''),
                            workspaceId: workspace.id 
                          }
                        });
                        if (error) throw error;
                        if (data?.url) window.open(data.url, '_blank');
                      } catch (err: any) {
                        toast.error(err?.message || "Failed to create checkout session");
                      }
                    }}
                  >
                    Purchase
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
    </div>
  );
}
