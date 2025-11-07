import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import pricingHero from "@/assets/pricing-hero.jpg";
import { useParallax } from "@/hooks/useParallax";

// Stripe price IDs for each tier
const STRIPE_PRICES = {
  analyst: 'price_1SQgxEPNdM5SAyj7pZEUc11u', // $29/month
  enterprise: 'price_1SQh9JPNdM5SAyj722p376Qh', // $299/month
};

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with basic features",
    priceId: null,
    features: [
      "1 scan per month",
      "Basic data source detection",
      "Privacy score analysis",
      "Email breach checking",
      "Community support",
    ],
    cta: "Get Started Free",
    highlighted: false,
    isFree: true,
  },
  {
    name: "Analyst",
    price: "$29",
    period: "per month",
    description: "For security analysts & investigators",
    priceId: STRIPE_PRICES.analyst,
    features: [
      "Unlimited scans",
      "Advanced OSINT detection (100+ sources)",
      "Dark web monitoring",
      "AI-powered catfish detection",
      "Automated removal requests",
      "Continuous monitoring & alerts",
      "Social media profile analysis",
      "PDF report exports",
      "Priority email support",
      "Monthly privacy reports",
    ],
    cta: "Start Analyst Plan",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$299",
    period: "per month",
    description: "Advanced enterprise solution",
    priceId: STRIPE_PRICES.enterprise,
    features: [
      "Everything in Analyst",
      "Unlimited team members",
      "API access (10,000 calls/hour)",
      "Custom integrations",
      "White-label reports",
      "SSO authentication",
      "Advanced admin controls",
      "Dedicated account manager",
      "Custom SLA & compliance",
      "24/7 enterprise support",
    ],
    cta: "Start Enterprise Plan",
    highlighted: false,
  },
];

export const Pricing = () => {
  const navigate = useNavigate();
  const [scansPerMonth, setScansPerMonth] = useState(50);
  const bgRef = useRef<HTMLImageElement>(null);
  const bgParallax = useParallax(bgRef, { speed: 0.25, direction: 'down' });
  
  const calculatePrice = (scans: number) => {
    if (scans <= 10) return 0;
    if (scans <= 100) return 9.99;
    return 9.99 + Math.floor((scans - 100) / 50) * 5;
  };
  
  const currentPrice = calculatePrice(scansPerMonth);
  const { toast } = useToast();

  const handleCTA = async (tierName: string, priceId: string | null, isFree?: boolean) => {
    if (isFree) {
      navigate('/auth');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/auth');
      return;
    }

    if (!priceId) {
      toast({
        title: "Plan Not Available",
        description: "This pricing tier hasn't been configured yet.",
        variant: "destructive",
      });
      return;
    }

    try {
      const plan = tierName.toLowerCase();
      
      const { data, error } = await supabase.functions.invoke('billing/checkout', {
        body: { plan }
      });

      if (error) {
        console.error('Checkout function error:', error);
        throw error;
      }
      
      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL returned from server');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Error",
        description: error instanceof Error 
          ? error.message
          : "Couldn't start checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="relative py-20 px-6 overflow-hidden">
      {/* Background Image with Parallax */}
      <div className="absolute inset-0 z-0">
        <img 
          ref={bgRef}
          src={pricingHero} 
          alt="Pricing plans background" 
          className="w-full h-full object-cover opacity-10"
          style={{ 
            transform: bgParallax.transform,
            willChange: 'transform',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
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
              onClick={() => handleCTA('Analyst', STRIPE_PRICES.analyst)}
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
                onClick={() => handleCTA(tier.name, tier.priceId, 'isFree' in tier && tier.isFree)}
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

        {/* Feature Comparison Table */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-center mb-12">
            Compare{" "}
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              All Features
            </span>
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-semibold">Feature</th>
                  <th className="text-center p-4 font-semibold">Free</th>
                  <th className="text-center p-4 font-semibold bg-primary/5">Analyst</th>
                  <th className="text-center p-4 font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-border/50">
                  <td className="p-4 font-medium">Monthly Scans</td>
                  <td className="text-center p-4 text-muted-foreground">1</td>
                  <td className="text-center p-4 bg-primary/5 font-semibold">Unlimited</td>
                  <td className="text-center p-4 font-semibold">Unlimited</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-4 font-medium">Dark Web Monitoring</td>
                  <td className="text-center p-4"><span className="text-destructive">✗</span></td>
                  <td className="text-center p-4 bg-primary/5"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-4 font-medium">OSINT Data Sources</td>
                  <td className="text-center p-4 text-muted-foreground">Basic</td>
                  <td className="text-center p-4 bg-primary/5 font-semibold">100+</td>
                  <td className="text-center p-4 font-semibold">100+</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-4 font-medium">API Access</td>
                  <td className="text-center p-4"><span className="text-destructive">✗</span></td>
                  <td className="text-center p-4 bg-primary/5"><span className="text-destructive">✗</span></td>
                  <td className="text-center p-4 font-semibold">10,000/hour</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-4 font-medium">AI-Powered Analysis</td>
                  <td className="text-center p-4"><span className="text-destructive">✗</span></td>
                  <td className="text-center p-4 bg-primary/5"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-4 font-medium">Automated Removal Requests</td>
                  <td className="text-center p-4"><span className="text-destructive">✗</span></td>
                  <td className="text-center p-4 bg-primary/5"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-4 font-medium">Team Members</td>
                  <td className="text-center p-4 text-muted-foreground">1</td>
                  <td className="text-center p-4 bg-primary/5 text-muted-foreground">1</td>
                  <td className="text-center p-4 font-semibold">Unlimited</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-4 font-medium">Continuous Monitoring</td>
                  <td className="text-center p-4"><span className="text-destructive">✗</span></td>
                  <td className="text-center p-4 bg-primary/5"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-4 font-medium">PDF Reports</td>
                  <td className="text-center p-4"><span className="text-destructive">✗</span></td>
                  <td className="text-center p-4 bg-primary/5"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-4 font-medium">White-label Reports</td>
                  <td className="text-center p-4"><span className="text-destructive">✗</span></td>
                  <td className="text-center p-4 bg-primary/5"><span className="text-destructive">✗</span></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-4 font-medium">SSO Authentication</td>
                  <td className="text-center p-4"><span className="text-destructive">✗</span></td>
                  <td className="text-center p-4 bg-primary/5"><span className="text-destructive">✗</span></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-4 font-medium">Custom Integrations</td>
                  <td className="text-center p-4"><span className="text-destructive">✗</span></td>
                  <td className="text-center p-4 bg-primary/5"><span className="text-destructive">✗</span></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-4 font-medium">Support</td>
                  <td className="text-center p-4 text-muted-foreground">Community</td>
                  <td className="text-center p-4 bg-primary/5 text-muted-foreground">Priority Email</td>
                  <td className="text-center p-4 font-semibold">24/7 Dedicated</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-4 font-medium">Dedicated Account Manager</td>
                  <td className="text-center p-4"><span className="text-destructive">✗</span></td>
                  <td className="text-center p-4 bg-primary/5"><span className="text-destructive">✗</span></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
