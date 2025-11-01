import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Zap, Building2, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UpgradeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan?: string;
}

const PLANS = [
  {
    id: "analyst",
    name: "Analyst Basic",
    price: "19",
    icon: Zap,
    features: [
      "100 scans per month",
      "Presence & breach checks",
      "Basic reports",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Professional OSINT",
    price: "59",
    icon: Crown,
    popular: true,
    features: [
      "Unlimited standard scans",
      "10 dark web credits/month",
      "PDF exports & AI summaries",
      "1 workspace",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise Intelligence",
    price: "179",
    icon: Building2,
    features: [
      "Everything in Pro",
      "Unlimited dark web monitoring",
      "API access",
      "White-label reports",
      "Multi-workspace",
      "Dedicated support",
    ],
  },
];

export const UpgradeDrawer = ({ open, onOpenChange, currentPlan }: UpgradeDrawerProps) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    if (planId === "enterprise") {
      window.location.href = "/enterprise";
      return;
    }

    setLoading(planId);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("Please sign in first");
        return;
      }

      const { data, error } = await supabase.functions.invoke("billing/checkout", {
        body: { plan: planId },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      toast.error("Failed to start checkout: " + error.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Upgrade Your Plan</SheetTitle>
          <SheetDescription>
            Choose the plan that fits your needs
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = currentPlan === plan.id;

            return (
              <Card
                key={plan.id}
                className={plan.popular ? "border-primary shadow-lg" : ""}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {plan.name}
                          {plan.popular && (
                            <Badge variant="default">Most Popular</Badge>
                          )}
                          {isCurrent && (
                            <Badge variant="outline">Current Plan</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {plan.price === "Contact" ? (
                            "Custom pricing"
                          ) : (
                            <>
                              <span className="text-2xl font-bold text-foreground">
                                £{plan.price}
                              </span>
                              /month
                            </>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    disabled={isCurrent || loading === plan.id}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {loading === plan.id
                      ? "Loading..."
                      : isCurrent
                      ? "Current Plan"
                      : plan.price === "Contact"
                      ? "Contact Sales"
                      : "Upgrade"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};
