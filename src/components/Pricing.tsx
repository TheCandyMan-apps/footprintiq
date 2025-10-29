import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out our service",
    features: [
      "1 scan per month",
      "Basic data source detection",
      "Privacy score analysis",
      "Manual removal guides",
      "Email support",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    description: "Best for individuals serious about privacy",
    features: [
      "Unlimited scans",
      "Advanced OSINT detection",
      "AI-powered catfish detection",
      "Automated removal requests",
      "Continuous monitoring",
      "Social media profile analysis",
      "Priority email support",
      "Monthly privacy reports",
    ],
    cta: "Get Pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "per month",
    description: "For businesses and teams",
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "Custom data broker coverage",
      "API access",
      "Dedicated account manager",
      "Advanced analytics dashboard",
      "White-label reporting",
      "24/7 priority support",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export const Pricing = () => {
  const navigate = useNavigate();
  const [scansPerMonth, setScansPerMonth] = useState(50);
  
  const calculatePrice = (scans: number) => {
    if (scans <= 10) return 0;
    if (scans <= 100) return 9.99;
    return 9.99 + Math.floor((scans - 100) / 50) * 5;
  };
  
  const currentPrice = calculatePrice(scansPerMonth);
  const { toast } = useToast();

  const handleCTA = async (tierName: string) => {
    if (tierName === "Enterprise") {
      window.location.href = "mailto:sales@footprintiq.com";
      return;
    }

    if (tierName === "Pro") {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error || !data?.url) {
        toast({
          title: "Checkout error",
          description: error?.message || "We couldn't start the checkout. Please try again.",
          variant: "destructive",
        });
        return;
      }
      window.open(data.url, "_blank");
      return;
    }

    // Free plan
    navigate("/auth");
  };

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your{" "}
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              Privacy Plan
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Protect your digital footprint with our comprehensive privacy solutions
          </p>
        </div>

        <Card className="max-w-md mx-auto p-6 mb-12">
          <h3 className="text-lg font-semibold mb-4">Instant Quote Calculator</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Scans per month: {scansPerMonth}</Label>
              <Slider
                value={[scansPerMonth]}
                onValueChange={(v) => setScansPerMonth(v[0])}
                min={10}
                max={500}
                step={10}
              />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Estimated monthly cost:</span>
              <span className="text-3xl font-bold">£{currentPrice.toFixed(2)}</span>
            </div>
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => handleCTA('Pro')}
            >
              Get Started Now
            </Button>
          </div>
        </Card>

        <div className="grid md:grid-cols-3 gap-8">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative p-8 rounded-2xl border transition-all duration-300 ${
                tier.highlighted
                  ? "bg-gradient-card border-primary shadow-glow scale-105"
                  : "bg-card border-border hover:border-primary/50"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-accent rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {tier.description}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground">/{tier.period}</span>
                </div>
              </div>

              <Button
                className="w-full mb-6"
                variant={tier.highlighted ? "default" : "outline"}
                size="lg"
                onClick={() => handleCTA(tier.name)}
              >
                {tier.cta}
              </Button>

              <ul className="space-y-3">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
