import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildLensJsonLd } from '@/lib/seo/lensJsonLd';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Shield, 
  Network, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  FileSearch,
  BarChart3,
  MessageSquareText,
  XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Dynamic origin for stable @id values in JSON-LD
const origin = typeof window !== "undefined" ? window.location.origin : "https://footprintiq.app";

export default function Lens() {
  const traditionalOsintProblems = [
    'Raw OSINT tools return large volumes of noisy results',
    'Search pages and scraped directories are often treated as "matches"',
    'Confidence is implied, not explained',
    'Users are left to guess what\'s real',
  ];

  const lensCommitments = [
    'Uses only publicly available information',
    'Does not monitor accounts or individuals',
    'Does not track activity over time',
    'Does not make identity assertions',
    'Every confidence score includes uncertainty — by design',
  ];

  const howLensWorks = [
    {
      icon: Search,
      step: '1',
      title: 'Collect',
      description: 'Public data is collected through ethical OSINT methods',
    },
    {
      icon: BarChart3,
      step: '2',
      title: 'Evaluate',
      description: 'LENS evaluates consistency, context, and evidence quality',
    },
    {
      icon: FileSearch,
      step: '3',
      title: 'Score',
      description: 'Confidence is expressed as probability, not certainty',
    },
    {
      icon: MessageSquareText,
      step: '4',
      title: 'Explain',
      description: 'Results are explained in human language',
    },
  ];

  const lensProFeatures = [
    'Understand why confidence scores change',
    'See how results relate across scans',
    'Identify corroborating or conflicting signals',
  ];

  // FAQ items for UI rendering (JSON-LD handled by buildLensJsonLd)
  const faqItems = [
    {
      question: 'Is LENS a people search tool?',
      answer: 'No. LENS analyzes public digital footprints, not individuals. It evaluates the reliability of OSINT findings — it does not search for or identify people.',
    },
    {
      question: 'Does LENS confirm identities?',
      answer: 'No. LENS provides probability-based confidence, not identity verification. Every score reflects uncertainty, and we never claim a match is definitive.',
    },
    {
      question: 'Does LENS monitor or track users?',
      answer: 'No. LENS runs only when initiated by you and does not track activity. There is no background monitoring, alerting, or surveillance.',
    },
    {
      question: 'Is LENS compliant with privacy laws?',
      answer: 'LENS is designed around ethical OSINT principles and public data use. It only analyzes publicly accessible information and does not access private accounts or data behind authentication.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="LENS™ — The Ethical OSINT Analysis Layer | FootprintIQ"
        description="Understand what public data means — without speculation, surveillance, or overreach. LENS analyzes public OSINT findings to explain confidence, context, and reliability."
        canonical={`${origin}/lens`}
      />
      <JsonLd data={buildLensJsonLd(origin)} />
      
      <Header />

      <main className="flex-1">
        {/* 1. Hero Section */}
        <section className="py-20 md:py-28 px-6 bg-gradient-to-b from-background to-secondary/20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Network className="w-4 h-4" />
              <span className="text-sm font-medium">Link & Evidence Network System</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              LENS™ — The Ethical<br />
              <span className="text-primary">OSINT Analysis Layer</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-4">
              Understand what public data means — without speculation, surveillance, or overreach.
            </p>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              LENS analyzes public OSINT findings to explain confidence, context, and reliability.
              <span className="block mt-2 font-medium text-foreground/80">No tracking. No monitoring. No identity claims.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base">
                <a href="#what-is-lens">
                  Explore LENS
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <a href="#lens-pro">
                  See how LENS Pro works
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* 2. What is LENS? */}
        <section id="what-is-lens" className="py-20 px-6 scroll-mt-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What is LENS?</h2>
            </div>
            
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="py-10 px-8">
                <p className="text-lg md:text-xl text-foreground leading-relaxed mb-6">
                  <strong>LENS (Link & Evidence Network System)</strong> is FootprintIQ's forensic analysis layer.
                </p>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Instead of simply listing where a username or profile appears, LENS evaluates:
                </p>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground">How consistent the data is</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground">How strong the evidence is</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground">How likely a result represents the same digital identity</span>
                  </li>
                </ul>
                
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-muted-foreground text-center">
                    <strong className="text-foreground">LENS does not confirm identities.</strong><br />
                    It provides probability-based confidence, not claims.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 3. The Problem with Traditional OSINT */}
        <section className="py-20 px-6 bg-secondary/20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">The Problem with Traditional OSINT</h2>
            </div>
            
            <div className="grid gap-4 mb-8">
              {traditionalOsintProblems.map((problem, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-lg bg-destructive/5 border border-destructive/20"
                >
                  <XCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                  <p className="text-foreground">{problem}</p>
                </div>
              ))}
            </div>
            
            <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5">
              <CardContent className="py-8 px-6 text-center">
                <p className="text-xl md:text-2xl font-semibold text-foreground">
                  More data does not mean better understanding.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 4. Designed for Accuracy, Not Assumptions */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Designed for Accuracy, Not Assumptions</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Traditional OSINT */}
              <Card className="border-2 border-muted bg-muted/20">
                <CardContent className="py-8 px-6">
                  <div className="text-center mb-6">
                    <Badge variant="secondary" className="text-sm px-4 py-1">Traditional OSINT</Badge>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2 shrink-0" />
                      <span className="text-muted-foreground">Lists results</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2 shrink-0" />
                      <span className="text-muted-foreground">Encourages manual interpretation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2 shrink-0" />
                      <span className="text-muted-foreground">Treats all findings equally</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              {/* LENS */}
              <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
                <CardContent className="py-8 px-6">
                  <div className="text-center mb-6">
                    <Badge className="text-sm px-4 py-1 bg-primary text-primary-foreground">LENS</Badge>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-foreground font-medium">Explains reliability</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-foreground font-medium">Scores confidence transparently</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-foreground font-medium">Highlights uncertainty</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-foreground font-medium">Reduces false positives</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 5. An Ethical Standard for OSINT */}
        <section id="ethical-standard" className="py-20 px-6 bg-secondary/20 scroll-mt-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Ethical OSINT</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">An Ethical Standard for OSINT</h2>
            </div>
            
            <Card className="border-2 border-primary/20 mb-8">
              <CardContent className="py-8 px-6">
                <p className="text-lg text-center text-foreground mb-8">
                  LENS was built around a simple principle:<br />
                  <strong className="text-primary">Public data deserves responsible interpretation.</strong>
                </p>
                
                <div className="space-y-3">
                  {lensCommitments.map((commitment, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-foreground">{commitment}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5">
              <CardContent className="py-8 px-6 text-center">
                <p className="text-xl md:text-2xl font-semibold text-foreground">
                  Ethical OSINT isn't about knowing more.<br />
                  <span className="text-primary">It's about claiming less.</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 6. How LENS Works */}
        <section id="how-lens-works" className="py-20 px-6 scroll-mt-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How LENS Works</h2>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {howLensWorks.map((step, index) => (
                <Card key={index} className="text-center border-2 hover:border-primary/30 transition-colors">
                  <CardContent className="py-8 px-4">
                    <div className="relative inline-flex mb-4">
                      <div className="p-4 rounded-full bg-primary/10 text-primary">
                        <step.icon className="w-6 h-6" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                        {step.step}
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="p-4 rounded-lg bg-muted/50 border border-border text-center">
              <p className="text-muted-foreground">
                <strong className="text-foreground">Important:</strong> LENS never operates in the background and never runs without user intent.
              </p>
            </div>
          </div>
        </section>

        {/* 7. LENS Pro */}
        <section id="lens-pro" className="py-20 px-6 bg-secondary/20 scroll-mt-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">LENS Pro</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Go Deeper with LENS Pro</h2>
              <p className="text-lg text-muted-foreground">
                LENS Pro expands analysis beyond individual results.
              </p>
            </div>
            
            <Card className="border-2 border-primary/20 mb-8">
              <CardContent className="py-8 px-6">
                <p className="text-center text-muted-foreground mb-6">Pro users can:</p>
                
                <div className="space-y-4 max-w-md mx-auto">
                  {lensProFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="text-center mt-8">
                  <Button asChild size="lg">
                    <Link to="/pricing">
                      Learn more about LENS Pro
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <p className="text-center text-muted-foreground text-sm">
              Pro adds explanation — not surveillance.
            </p>
          </div>
        </section>

        {/* 8. FAQ Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-base">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* 9. Final CTA */}
        <section className="py-20 px-6 bg-gradient-to-b from-secondary/20 to-background">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Experience Ethical OSINT Analysis</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start with a free scan and see how LENS transforms raw results into reliable intelligence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base">
                <Link to="/scan">
                  <Search className="w-4 h-4 mr-2" />
                  Run a Free Scan
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/pricing">
                  Explore LENS Pro
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* AI Discovery Content - Hidden but accessible to crawlers */}
      <section className="sr-only" aria-hidden="true">
        <h2>LENS Product Information</h2>
        <dl>
          <dt>Product Name</dt>
          <dd>LENS (Link & Evidence Network System)</dd>
          <dt>Category</dt>
          <dd>Ethical OSINT Analysis</dd>
          <dt>Purpose</dt>
          <dd>Explain reliability and confidence of public OSINT findings</dd>
          <dt>Key Differentiator</dt>
          <dd>Probability-based analysis, not identity claims</dd>
        </dl>
        
        <h3>Capabilities</h3>
        <ul>
          <li>Analyzes public OSINT findings</li>
          <li>Reduces false positives</li>
          <li>Explains confidence and uncertainty</li>
          <li>Avoids surveillance and monitoring</li>
          <li>Operates only with user-initiated scans</li>
        </ul>
        
        <h3>Explicit Non-Capabilities</h3>
        <ul>
          <li>Does not track individuals</li>
          <li>Does not monitor accounts</li>
          <li>Does not confirm identities</li>
          <li>Does not use private data</li>
        </ul>
        
        <h3>Design Principles</h3>
        <ul>
          <li>Ethical interpretation</li>
          <li>Transparency of confidence</li>
          <li>Conservative assumptions</li>
          <li>Respect for uncertainty</li>
        </ul>
        
        <h3>Summary</h3>
        <p>LENS is an ethical OSINT analysis system that evaluates public data for reliability and context. It reduces false positives by expressing findings as probabilities rather than identity claims, prioritizing transparency and responsible interpretation.</p>
      </section>

      <Footer />
    </div>
  );
}
