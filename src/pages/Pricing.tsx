import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, X, Star, Building2, Search, Shield, Eye, Database, Lock, UserCheck } from "lucide-react";
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
      supabase
        .from('workspaces')
        .select('subscription_tier, plan')
        .eq('id', workspace.id)
        .single()
        .then(({ data }) => {
          if (data) {
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
    "description": "OSINT-based digital visibility platform",
    "brand": { "@type": "Organization", "name": "FootprintIQ" },
    "offers": [
      {
        "@type": "Offer",
        "name": "Free Scan",
        "price": "0",
        "priceCurrency": "GBP",
        "description": "A fast way to see what's publicly visible."
      },
      {
        "@type": "Offer",
        "name": "Pro Plan",
        "price": PLANS.pro.priceMonthly.toString(),
        "priceCurrency": "GBP",
        "description": "For individuals who want ongoing visibility and control."
      },
      {
        "@type": "Offer",
        "name": "Business Plan",
        "price": PLANS.business.priceMonthly.toString(),
        "priceCurrency": "GBP",
        "description": "For organisations managing digital exposure at scale."
      }
    ]
  };

  const faqs = [
    {
      q: "Is this legal?",
      a: "Yes. FootprintIQ only analyses publicly accessible information."
    },
    {
      q: "Is this hacking?",
      a: "No. We do not access private systems, protected databases, or credentials."
    },
    {
      q: "Where does the data come from?",
      a: "Public websites, platforms, breach disclosures, and open sources."
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes. There are no long-term contracts."
    },
    {
      q: "Do you store my data?",
      a: "Only what's required to generate your report. You control retention on paid plans."
    }
  ];

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  // Combine structured data into an array for the SEO component
  const combinedStructuredData = [pricingStructuredData, faqStructuredData];

  const freeIncludes = [
    "Single digital footprint scan",
    "Username and alias discovery",
    "Public profile detection",
    "Breach exposure indicators",
    "High-level risk summary",
    "Clear, readable report"
  ];

  const freeLimitations = [
    "One-time scan",
    "Limited historical context",
    "No monitoring or alerts"
  ];

  // High-Risk Intelligence feature copy per tier
  const freeHighRisk = {
    excluded: "High-Risk Intelligence not included",
    upgrade: "Upgrade to see advanced risk context"
  };

  const proHighRisk = [
    "AI-filtered high-risk summaries",
    "Confidence scoring"
  ];

  const proHighRiskExcluded = [
    "No raw sources"
  ];

  const businessHighRisk = [
    "Everything in Pro",
    "Source category breakdowns",
    "Audit logs",
    "Compliance export"
  ];

  const proIncludes = [
    "Multiple scans per month",
    "Expanded source coverage",
    "Confidence scoring per finding",
    "Risk severity classification",
    "Historical scan comparisons",
    "Exportable reports",
    "Priority scan processing"
  ];

  const proBestFor = [
    "Professionals",
    "Journalists",
    "Security-aware individuals",
    "Anyone managing a public online presence"
  ];

  const businessIncludes = [
    "Team workspaces",
    "Shared investigations",
    "Case management",
    "API access",
    "Higher scan limits",
    "Audit logs",
    "Priority support",
    "Custom data retention"
  ];

  const businessBestFor = [
    "Security teams",
    "Investigators",
    "Research groups",
    "Compliance and risk teams"
  ];

  const trustLine = "Ethical OSINT • Public data only • No monitoring • No surveillance";

  const transparencyList = [
    "Bypass security controls",
    "Access private accounts",
    "Use scraped private databases",
    "Perform surveillance"
  ];

  return (
    <>
      <SEO
        title="Pricing — FootprintIQ"
        description="Simple pricing. No surprises. Understand your online exposure before it's used against you."
        canonical="https://footprintiq.app/pricing"
        schema={{ custom: combinedStructuredData }}
      />
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Hero Section */}
        <section className="py-20 px-4 bg-background">
          <div className="container mx-auto text-center max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                Simple pricing. No surprises.
              </h1>
              <p className="text-xl text-muted-foreground mb-4">
                Understand your online exposure before it's used against you.
              </p>
              <p className="text-muted-foreground">
                FootprintIQ is free to try. Upgrade only if you want deeper visibility, monitoring, or advanced reporting.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              
              {/* Free Plan - De-emphasised */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0 }}
                className="opacity-90"
              >
                <Card className={`relative h-full ${currentPlan === 'free' ? 'ring-2 ring-primary' : ''}`}>
                  {currentPlan === 'free' && (
                    <Badge variant="secondary" className="absolute -top-3 right-4">Current Plan</Badge>
                  )}
                  
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Search className="w-5 h-5 text-muted-foreground/70" />
                      <CardTitle className="text-2xl">Free Scan</CardTitle>
                    </div>
                    <p className="text-xs text-muted-foreground/80 font-medium tracking-wide">
                      Discovery • Awareness • Preview
                    </p>
                    <div className="pt-2">
                      <span className="text-3xl font-bold text-muted-foreground">£0</span>
                    </div>
                    <CardDescription className="pt-4">
                      A fast way to see what's publicly visible.
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-3">Includes</p>
                      <ul className="space-y-2">
                        {freeIncludes.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-3">Limitations</p>
                      <ul className="space-y-2">
                        {freeLimitations.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* High-Risk Intelligence - Free */}
                    <div className="p-3 bg-muted/50 rounded-lg border border-border">
                      <p className="text-sm font-medium text-muted-foreground mb-2">High-Risk Intelligence</p>
                      <div className="flex items-start gap-2 text-sm text-muted-foreground mb-1">
                        <span>🚫</span>
                        <span>{freeHighRisk.excluded}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{freeHighRisk.upgrade}</span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex flex-col gap-2">
                    <Button 
                      className="w-full" 
                      variant="ghost"
                      onClick={() => handleSelectPlan('free')}
                      disabled={currentPlan === 'free'}
                    >
                      {currentPlan === 'free' ? 'Current Plan' : 'Try Free Scan'}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">No credit card required</p>
                  </CardFooter>
                </Card>
              </motion.div>

              {/* Pro Plan - Highlighted as Recommended */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="scale-[1.02]"
              >
                <Card className={`relative h-full border-primary shadow-xl ${currentPlan === 'pro' ? 'ring-2 ring-primary' : ''}`}>
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    <Star className="w-3 h-3 mr-1" />
                    Recommended
                  </Badge>
                  {currentPlan === 'pro' && (
                    <Badge variant="secondary" className="absolute -top-3 right-4">Current Plan</Badge>
                  )}
                  
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-primary" />
                      <CardTitle className="text-2xl">Pro</CardTitle>
                    </div>
                    <p className="text-xs text-primary font-medium tracking-wide">
                      Validation • Investigation • Action
                    </p>
                    <div className="pt-2">
                      <span className="text-4xl font-bold">£{PLANS.pro.priceMonthly}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <CardDescription className="pt-4">
                      For individuals who want ongoing visibility and control.
                    </CardDescription>
                    
                    {/* Pro Differentiator */}
                    <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-sm font-medium text-primary">
                        Understand why results exist — not just that they do.
                      </p>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-3">Everything in Free, plus</p>
                      <ul className="space-y-2">
                        {proIncludes.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-3">Best for</p>
                      <ul className="space-y-1">
                        {proBestFor.map((item, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                            <UserCheck className="w-3 h-3" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* High-Risk Intelligence - Pro */}
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-sm font-medium text-primary mb-2">High-Risk Intelligence</p>
                      {proHighRisk.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm mb-1">
                          <span>✅</span>
                          <span>{item}</span>
                        </div>
                      ))}
                      {proHighRiskExcluded.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span>❌</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => handleSelectPlan('pro')}
                      disabled={currentPlan === 'pro'}
                    >
                      {currentPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>

              {/* Business Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className={`relative h-full ${currentPlan === 'business' ? 'ring-2 ring-primary' : ''}`}>
                  {currentPlan === 'business' && (
                    <Badge variant="secondary" className="absolute -top-3 right-4">Current Plan</Badge>
                  )}
                  
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                      <CardTitle className="text-2xl">Business / Teams</CardTitle>
                    </div>
                    <p className="text-xs text-muted-foreground/80 font-medium tracking-wide">
                      Scale • Compliance • Collaboration
                    </p>
                    <div className="pt-2">
                      <span className="text-2xl font-bold text-muted-foreground">Custom pricing</span>
                    </div>
                    <CardDescription className="pt-4">
                      For organisations managing digital exposure at scale.
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-3">Includes</p>
                      <ul className="space-y-2">
                        {businessIncludes.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-3">Best for</p>
                      <ul className="space-y-1">
                        {businessBestFor.map((item, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                            <UserCheck className="w-3 h-3" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* High-Risk Intelligence - Business/Enterprise */}
                    <div className="p-3 bg-muted/50 rounded-lg border border-border">
                      <p className="text-sm font-medium text-foreground mb-2">High-Risk Intelligence</p>
                      {businessHighRisk.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm mb-1">
                          <span>✅</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => navigate('/contact')}
                    >
                      Contact Sales
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </div>
            
            {/* Trust Line */}
            <div className="text-center mt-12">
              <p className="text-sm text-muted-foreground font-medium">
                {trustLine}
              </p>
            </div>
          </div>
        </section>

        {/* What You're Paying For */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Search className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">What you're paying for</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                You're not paying for "magic" or secret data.
              </p>
            </div>
            
            <Card className="bg-card">
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">You're paying for:</p>
                <ul className="space-y-3">
                  {[
                    "Correlation across hundreds of public sources",
                    "Structured analysis",
                    "Confidence scoring",
                    "Clear reporting",
                    "Time saved"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm text-muted-foreground border-t pt-4">
                  This is the same methodology used in professional OSINT work — without the manual effort.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
            </div>
            
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="bg-card rounded-xl border px-6">
                  <AccordionTrigger className="hover:no-underline text-left">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Transparency Statement */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Transparency Statement</h2>
              </div>
            </div>
            
            <Card className="bg-card">
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">FootprintIQ does not:</p>
                <ul className="space-y-3 mb-6">
                  {transparencyList.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-muted-foreground">
                      <X className="w-5 h-5 text-destructive flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm font-medium border-t pt-4">
                  If information isn't public, we don't see it.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Know what's visible — before it's misused.
              </h2>
              <p className="text-muted-foreground mb-8">
                Start with a free scan. Upgrade only if you need more.
              </p>
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="gap-2"
              >
                <Eye className="w-5 h-5" />
                Run a Free Scan
              </Button>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default PricingPage;
