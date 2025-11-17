import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, X, Sparkles, Shield, Zap, Users, TrendingUp, Lock } from "lucide-react";
import { PLANS, PlanId } from "@/lib/billing/tiers";
import { startCheckout } from "@/lib/billing/checkout";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const PricingPage = () => {
  const { workspace } = useWorkspace();
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState<PlanId>('free');

  useEffect(() => {
    if (workspace?.id) {
      // ✅ FIX: Read from workspaces instead of subscriptions to avoid 406 RLS errors
      supabase
        .from('workspaces')
        .select('subscription_tier, plan')
        .eq('id', workspace.id)
        .single()
        .then(({ data }) => {
          if (data) {
            // Safe normalization with fallback
            const plan = (data.subscription_tier || data.plan || 'free') as PlanId;
            setCurrentPlan(plan);
          }
        });
    }
  }, [workspace?.id]);

  const handleSelectPlan = async (planId: PlanId) => {
    if (planId === 'free') {
      navigate('/auth');
      return;
    }
    
    if (!workspace) {
      navigate('/auth');
      return;
    }

    await startCheckout({ planId, workspaceId: workspace.id });
  };

  const pricingStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "FootprintIQ",
    "description": "Enterprise OSINT platform for digital footprint analysis",
    "brand": { "@type": "Organization", "name": "FootprintIQ" },
    "offers": [
      {
        "@type": "Offer",
        "name": "Pro Plan",
        "price": PLANS.pro.priceMonthly.toString(),
        "priceCurrency": "GBP",
        "description": PLANS.pro.description
      },
      {
        "@type": "Offer",
        "name": "Business Plan",
        "price": PLANS.business.priceMonthly.toString(),
        "priceCurrency": "GBP",
        "description": PLANS.business.description
      }
    ]
  };

  const featureMatrix = [
    { name: "Username OSINT (Maigret)", free: true, pro: true, business: true },
    { name: "Sherlock/WhatsMyName", free: false, pro: true, business: true },
    { name: "GoSearch Integration", free: false, pro: false, business: true },
    { name: "Advanced Correlation", free: false, pro: true, business: true },
    { name: "AI False-Positive Removal", free: false, pro: true, business: true },
    { name: "Multi-Provider Orchestration", free: false, pro: true, business: true },
    { name: "API Access", free: false, pro: false, business: true },
    { name: "Team Workspaces", free: false, pro: false, business: true },
    { name: "Priority Queue", free: false, pro: true, business: true },
    { name: "AI-Generated Reports", free: false, pro: true, business: true },
    { name: "Monitoring & Alerts", free: false, pro: false, business: true },
    { name: "Case Management", free: false, pro: true, business: true },
  ];

  const faqs = [
    {
      q: "How are scan limits calculated?",
      a: "Scan limits reset monthly on your billing anniversary. Each username scan counts as one scan, regardless of how many providers are used."
    },
    {
      q: "What happens when I hit my monthly quota?",
      a: "You'll see a clear notification. You can either upgrade to a higher tier with more scans or wait until your quota resets next month. Business plans have unlimited scans."
    },
    {
      q: "Can I upgrade or downgrade anytime?",
      a: "Yes! Changes take effect immediately. Upgrades are prorated, and downgrades apply at the next billing cycle."
    },
    {
      q: "Do you store my scan results?",
      a: "Yes, all scan results are securely stored in your workspace with full audit logs. You maintain complete control and can export or delete data anytime."
    },
    {
      q: "Is FootprintIQ legal and GDPR compliant?",
      a: "Yes. FootprintIQ is designed for legitimate investigative, security research, and due diligence purposes. We're GDPR compliant and don't store personal data beyond what's necessary for service delivery."
    }
  ];

  return (
    <>
      <SEO
        title="Pricing — FootprintIQ OSINT Platform"
        description="Choose the perfect OSINT plan. From free username checks to unlimited enterprise investigations with Maigret, Sherlock & GoSearch."
        canonical="https://footprintiq.app/pricing"
        structuredData={pricingStructuredData}
      />
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <Header />
        
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-4">
          <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
          <div className="relative z-10 container mx-auto text-center max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="mb-6 px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                Trusted by Investigators Worldwide
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-accent bg-clip-text text-transparent">
                OSINT Intelligence, Instantly.
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                FootprintIQ reveals usernames, accounts, exposures and digital footprint signals across hundreds of platforms — using world-class automation powered by Maigret, Sherlock, GoSearch and AI analysis.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button size="lg" onClick={() => navigate('/auth')} className="gap-2">
                  <Zap className="w-5 h-5" />
                  Start Free
                </Button>
                <Button size="lg" variant="outline" onClick={() => handleSelectPlan('pro')}>
                  Upgrade to Pro
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
              <p className="text-muted-foreground">Start free, upgrade when you need more power</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {(Object.keys(PLANS) as PlanId[]).map((planId, index) => {
                const plan = PLANS[planId];
                const isCurrent = currentPlan === planId;
                const isPopular = planId === 'pro';
                
                return (
                  <motion.div
                    key={planId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className={`relative h-full transition-all hover:shadow-lg ${isPopular ? 'border-primary shadow-md scale-105' : ''} ${isCurrent ? 'ring-2 ring-primary' : ''}`}>
                      {isPopular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                          <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                        </div>
                      )}
                      {isCurrent && (
                        <div className="absolute -top-4 right-4">
                          <Badge variant="secondary">Current Plan</Badge>
                        </div>
                      )}
                      
                      <CardHeader>
                        <CardTitle className="text-2xl">{plan.label}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                        <div className="pt-4">
                          <span className="text-4xl font-bold">
                            {plan.priceMonthly === 0 ? 'Free' : `£${plan.priceMonthly}`}
                          </span>
                          {plan.priceMonthly > 0 && <span className="text-muted-foreground">/month</span>}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-primary" />
                            <span>
                              {plan.monthlyScanLimit === null 
                                ? 'Unlimited scans' 
                                : `${plan.monthlyScanLimit} scans/month`}
                            </span>
                          </div>
                          
                          {plan.allowedProviders.includes('maigret') && (
                            <div className="flex items-center gap-2 text-sm">
                              <Check className="w-4 h-4 text-primary" />
                              <span>Maigret username scanning</span>
                            </div>
                          )}
                          
                          {plan.allowedProviders.includes('sherlock') ? (
                            <div className="flex items-center gap-2 text-sm">
                              <Check className="w-4 h-4 text-primary" />
                              <span>Sherlock/WhatsMyName</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Lock className="w-4 h-4" />
                              <span>Sherlock (Pro+)</span>
                            </div>
                          )}
                          
                          {plan.allowedProviders.includes('gosearch') ? (
                            <div className="flex items-center gap-2 text-sm">
                              <Check className="w-4 h-4 text-primary" />
                              <span>GoSearch integration</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Lock className="w-4 h-4" />
                              <span>GoSearch (Business)</span>
                            </div>
                          )}
                          
                          {plan.features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <Check className="w-4 h-4 text-primary" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      
                      <CardFooter>
                        <Button 
                          className="w-full" 
                          variant={isPopular ? 'default' : 'outline'}
                          onClick={() => handleSelectPlan(planId)}
                          disabled={isCurrent}
                        >
                          {isCurrent ? 'Current Plan' : planId === 'free' ? 'Get Started' : `Upgrade to ${plan.label}`}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Feature Comparison</h2>
              <p className="text-muted-foreground">Everything you need to know about what's included</p>
            </div>
            
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/2">Feature</TableHead>
                    <TableHead className="text-center">Free</TableHead>
                    <TableHead className="text-center">Pro</TableHead>
                    <TableHead className="text-center">Business</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Monthly Scan Limit</TableCell>
                    <TableCell className="text-center">{PLANS.free.monthlyScanLimit}</TableCell>
                    <TableCell className="text-center">{PLANS.pro.monthlyScanLimit}</TableCell>
                    <TableCell className="text-center">Unlimited</TableCell>
                  </TableRow>
                  {featureMatrix.map((feature, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{feature.name}</TableCell>
                      <TableCell className="text-center">
                        {feature.free ? <Check className="w-5 h-5 text-primary mx-auto" /> : <X className="w-5 h-5 text-muted-foreground mx-auto" />}
                      </TableCell>
                      <TableCell className="text-center">
                        {feature.pro ? <Check className="w-5 h-5 text-primary mx-auto" /> : <X className="w-5 h-5 text-muted-foreground mx-auto" />}
                      </TableCell>
                      <TableCell className="text-center">
                        {feature.business ? <Check className="w-5 h-5 text-primary mx-auto" /> : <X className="w-5 h-5 text-muted-foreground mx-auto" />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </section>

        {/* Competitive Advantage */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                <TrendingUp className="w-4 h-4 mr-2" />
                Competitive Edge
              </Badge>
              <h2 className="text-3xl font-bold mb-4">Why FootprintIQ Beats the Competition</h2>
              <p className="text-muted-foreground">Advanced features that username.org, usersearch.ai, and Sherlock CLI can't match</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <Shield className="w-8 h-8 text-primary mb-2" />
                  <CardTitle>Multi-Tool OSINT Engine</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Maigret + Sherlock + GoSearch running in parallel. 300+ platforms scanned per username with intelligent deduplication.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <Zap className="w-8 h-8 text-primary mb-2" />
                  <CardTitle>Real-Time Progress Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Live scan progress with provider-by-provider updates. No waiting in the dark like CLI tools.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <Sparkles className="w-8 h-8 text-primary mb-2" />
                  <CardTitle>AI False-Positive Removal</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Automatic filtering of noise and false matches. Get only verified, high-confidence results.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <Users className="w-8 h-8 text-primary mb-2" />
                  <CardTitle>Enterprise-Grade Infrastructure</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Cloud Run workers, historical logs, API access, team collaboration. Built for professional investigators.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">Everything you need to know about FootprintIQ pricing</p>
            </div>
            
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="bg-card rounded-lg px-6">
                  <AccordionTrigger className="hover:no-underline">
                    <span className="text-left font-medium">{faq.q}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Enterprise CTA */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-4">Need Enterprise OSINT?</CardTitle>
                <CardDescription className="text-lg">
                  Bulk investigations, custom pipelines, dedicated support, and white-label deployments
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                  <span>✓ Custom Provider Integration</span>
                  <span>✓ Dedicated Cloud Workers</span>
                  <span>✓ SLA Guarantees</span>
                  <span>✓ On-Premise Deployment</span>
                </div>
                <div className="pt-4">
                  <Button size="lg" variant="default" asChild>
                    <a href="mailto:enterprise@footprintiq.app">Contact Enterprise Sales</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default PricingPage;
