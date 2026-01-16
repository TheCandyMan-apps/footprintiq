import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Shield, 
  Eye, 
  Network, 
  CircleCheck, 
  AlertTriangle, 
  Lock, 
  Layers,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Lens() {
  const whyConfidenceMatters = [
    {
      icon: AlertTriangle,
      title: 'OSINT is Noisy',
      description: 'Raw results include false positives, outdated data, and misattributed profiles. Without filtering, signal drowns in noise.',
    },
    {
      icon: HelpCircle,
      title: 'False Positives Are Common',
      description: 'Same username doesn\'t mean same person. Context matters. A match is not proof — it\'s a starting point.',
    },
    {
      icon: Layers,
      title: 'Raw Results ≠ Reliable Conclusions',
      description: 'Without analysis, scan results are just noise. LENS transforms data into actionable intelligence.',
    },
  ];

  const howLensDifferent = [
    {
      icon: Lock,
      title: 'No Scraping Behind Logins',
      description: 'LENS only analyzes publicly accessible data. No private account access, ever.',
    },
    {
      icon: Eye,
      title: 'No Surveillance',
      description: 'We don\'t monitor, track, or alert. Analysis happens on-demand, by you.',
    },
    {
      icon: CircleCheck,
      title: 'No Black-Box Certainty Claims',
      description: 'We never say "this is definitely the person." We explain confidence levels honestly.',
    },
    {
      icon: Layers,
      title: 'Confidence is Explainable',
      description: 'Every LENS score comes with a human-readable explanation of contributing signals.',
    },
  ];

  const confidenceBands = [
    { range: '75-100%', label: 'Strong match', meaning: 'High corroboration across signals', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    { range: '50-74%', label: 'Likely match', meaning: 'Some signals align, needs verification', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    { range: '31-49%', label: 'Weak match', meaning: 'Limited evidence, treat as tentative', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    { range: '0-30%', label: 'Insufficient', meaning: 'Cannot establish meaningful connection', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  ];

  const faqItems = [
    {
      question: 'What does LENS stand for?',
      answer: 'LENS stands for Link & Evidence Network System. It is an analysis layer that evaluates evidence quality, corroboration, and context to produce confidence assessments humans can understand.',
    },
    {
      question: 'How does LENS calculate confidence?',
      answer: 'LENS analyzes multiple signals including username consistency, platform context, cross-platform corroboration, and metadata stability. These signals are weighted and combined to produce an overall confidence score with an explanation.',
    },
    {
      question: 'Is LENS legal to use?',
      answer: 'Yes. LENS only analyzes publicly accessible information. It does not access private accounts, scrape behind logins, or perform any surveillance activities. It is designed for ethical, legal OSINT research.',
    },
    {
      question: 'What data does LENS analyze?',
      answer: 'LENS analyzes public profile data, username patterns, platform metadata, and corroboration signals across publicly accessible sources. It does not access private data or information behind authentication.',
    },
    {
      question: 'How is LENS different from people search sites?',
      answer: 'Unlike people search sites that claim certainty, LENS provides transparent confidence scoring with explanations. We never claim a match is definitive — we explain the evidence and let you decide. LENS is built for OSINT professionals who need reliable analysis, not marketing claims.',
    },
  ];

  // Schema for SEO - fully typed to match SEO component requirements
  const faqSchema = {
    "@context": "https://schema.org" as const,
    "@type": "FAQPage" as const,
    mainEntity: faqItems.map(item => ({
      "@type": "Question" as const,
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer" as const,
        "text": item.answer
      }
    }))
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      {
        "@type": "ListItem" as const,
        "position": 1,
        "name": "Home",
        "item": "https://footprintiq.app"
      },
      {
        "@type": "ListItem" as const,
        "position": 2,
        "name": "LENS",
        "item": "https://footprintiq.app/lens"
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="LENS — Evidence-Based OSINT Confidence, Explained"
        description="Don't just find profiles. Understand how reliable they are. LENS analyzes public signals to explain why a result appears and how confident you should be."
        canonical="https://footprintiq.app/lens"
        schema={{
          faq: faqSchema,
          breadcrumbs: breadcrumbSchema
        }}
      />
      
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-6 bg-gradient-to-b from-background to-secondary/20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Network className="w-4 h-4" />
              <span className="text-sm font-medium">Link & Evidence Network System</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Don't just find profiles.<br />
              <span className="text-primary">Understand how reliable they are.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              LENS (Link & Evidence Network System) analyzes public signals to explain why a result appears — and how confident you should be.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/scan">
                  <Search className="w-4 h-4 mr-2" />
                  Try a Scan
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/pricing">
                  Explore LENS Pro
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* What is LENS? */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-primary/20">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-primary/10 text-primary">
                    <Layers className="w-8 h-8" />
                  </div>
                </div>
                <CardTitle className="text-3xl">What is LENS?</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  LENS is an analysis layer that sits above OSINT scans. It evaluates evidence quality, corroboration, and context to produce a confidence assessment humans can understand.
                </p>
                <p className="text-muted-foreground mt-4">
                  Instead of overwhelming you with raw matches, LENS explains <strong>why</strong> a result appeared and <strong>how much</strong> you should trust it.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why Confidence Matters */}
        <section className="py-20 px-6 bg-secondary/20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Why Confidence Matters</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Raw OSINT results can mislead without proper analysis. LENS bridges the gap between data and understanding.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              {whyConfidenceMatters.map((item, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="p-3 rounded-lg bg-destructive/10 text-destructive">
                        <item.icon className="w-6 h-6" />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How LENS is Different */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">How LENS is Different</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Built for transparency, not marketing claims. Every score is explainable.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              {howLensDifferent.map((item, index) => (
                <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary">
                        <item.icon className="w-6 h-6" />
                      </div>
                      <CardTitle>{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Built for Privacy-Conscious Users */}
        <section className="py-20 px-6 bg-secondary/20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-500 mb-6">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Privacy First</span>
            </div>
            
            <h2 className="text-3xl font-bold mb-6">Built for Privacy-Conscious Users</h2>
            
            <Card className="border-2 border-green-500/20 bg-green-500/5">
              <CardContent className="py-8">
                <p className="text-2xl font-medium text-green-400">
                  Public data only. No monitoring. No tracking. No alerts.
                </p>
                <p className="text-muted-foreground mt-4">
                  LENS analyzes what's already public. We don't surveil, we don't store search terms, and we don't build profiles on you.
                </p>
                <div className="flex justify-center gap-4 mt-6">
                  <Link to="/trust" className="text-primary hover:underline text-sm">
                    Read our Trust & Security page →
                  </Link>
                  <Link to="/responsible-use" className="text-primary hover:underline text-sm">
                    Responsible Use Policy →
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Confidence Bands */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">LENS Confidence Bands</h2>
            <p className="text-center text-muted-foreground mb-12">
              Understanding what confidence scores mean
            </p>
            
            <div className="space-y-4">
              {confidenceBands.map((band, index) => (
                <div 
                  key={index} 
                  className={`flex items-center gap-4 p-4 rounded-lg border ${band.color}`}
                >
                  <div className="font-mono font-bold text-lg min-w-[80px]">
                    {band.range}
                  </div>
                  <Badge variant="outline" className={band.color}>
                    {band.label}
                  </Badge>
                  <p className="text-muted-foreground flex-1">
                    {band.meaning}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-6 bg-secondary/20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Frequently Asked Questions</h2>
            <p className="text-center text-muted-foreground mb-12">
              Common questions about LENS and how it works
            </p>
            
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
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

        {/* Final CTA */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to understand your results?</h2>
            <p className="text-muted-foreground mb-8">
              Start with a free scan and see LENS confidence analysis in action.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/scan">
                  <Search className="w-4 h-4 mr-2" />
                  Run a Free Scan
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/pricing">
                  Learn About Pro
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
