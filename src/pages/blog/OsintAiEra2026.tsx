import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Brain, TrendingUp, Shield, AlertTriangle, Zap, Globe, Lock, Target, Eye, Bot, Network, Cpu, Scale, Workflow, BookOpen, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";
import { StructuredData, organizationSchema } from "@/components/StructuredData";
import { BlogPullQuote } from "@/components/blog/BlogPullQuote";
import { BlogCallout } from "@/components/blog/BlogCallout";
import { getBlogHeroImage } from "@/lib/blogImages";
import { Badge } from "@/components/ui/badge";

export default function OsintAiEra2026() {
  const heroImage = getBlogHeroImage("osint-ai-era-2026");

  const breadcrumbSchema = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      { "@type": "ListItem" as const, position: 1, name: "Home", item: "https://footprintiq.app" },
      { "@type": "ListItem" as const, position: 2, name: "Blog", item: "https://footprintiq.app/blog" },
      { "@type": "ListItem" as const, position: 3, name: "2026 OSINT and the Era of AI" }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "2026 OSINT and the Era of AI: The Future of Digital Intelligence",
    description: "Discover how AI is transforming Open Source Intelligence in 2026. From autonomous agents to predictive threat detection, explore the cutting-edge tools and ethical considerations shaping modern OSINT.",
    author: { "@type": "Organization", name: "FootprintIQ" },
    publisher: { "@type": "Organization", name: "FootprintIQ", logo: { "@type": "ImageObject", url: "https://footprintiq.app/logo-social.png" } },
    datePublished: "2026-01-10",
    dateModified: "2026-01-10",
    image: heroImage
  };

  const faqSchema = {
    "@context": "https://schema.org" as const,
    "@type": "FAQPage" as const,
    mainEntity: [
      {
        "@type": "Question" as const,
        name: "What is AI-powered OSINT?",
        acceptedAnswer: {
          "@type": "Answer" as const,
          text: "AI-powered OSINT combines artificial intelligence with Open Source Intelligence gathering to automate data collection, analysis, and threat detection from publicly available sources. It uses machine learning to identify patterns, correlate information, and provide actionable insights faster than traditional manual methods."
        }
      },
      {
        "@type": "Question" as const,
        name: "How is AI transforming OSINT in 2026?",
        acceptedAnswer: {
          "@type": "Answer" as const,
          text: "The OSINT landscape in 2026 is defined by autonomous intelligence agents that gather and prioritize intelligence independently, multimodal analysis processing text, images, video, and audio simultaneously, and predictive threat detection using machine learning to identify emerging threats before they materialize."
        }
      },
      {
        "@type": "Question" as const,
        name: "What are the ethical considerations for AI-OSINT?",
        acceptedAnswer: {
          "@type": "Answer" as const,
          text: "Key ethical considerations include collecting only legally accessible public data, ensuring no system intrusion or authentication bypassing, understanding jurisdictional privacy laws, purpose limitation, data minimization, transparency about capabilities, and addressing AI-specific concerns like algorithmic bias and explainability."
        }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>2026 OSINT and the Era of AI: The Future of Digital Intelligence | FootprintIQ</title>
        <meta name="description" content="Discover how AI is transforming Open Source Intelligence in 2026. From autonomous agents to predictive threat detection, explore the cutting-edge tools and ethical considerations shaping modern OSINT." />
        <link rel="canonical" href="https://footprintiq.app/blog/osint-ai-era-2026" />
      </Helmet>

      <StructuredData breadcrumbs={breadcrumbSchema} custom={articleSchema} faq={faqSchema} organization={organizationSchema} />

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-primary/5">
        <Header />
        
        <main className="flex-1">
          <article className="container mx-auto px-4 py-12 max-w-4xl">
            <Link to="/blog" className="inline-flex items-center text-primary hover:text-primary/80 mb-8 group">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Blog
            </Link>

            {heroImage && (
              <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={heroImage} 
                  alt="AI and OSINT convergence - futuristic digital intelligence visualization"
                  className="w-full h-[400px] object-cover"
                  loading="eager"
                />
              </div>
            )}

            <header className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <Badge>AI & Technology</Badge>
                <Badge variant="outline">OSINT</Badge>
                <Badge variant="outline">Featured</Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent leading-tight">
                2026 OSINT and the Era of AI: The Future of Digital Intelligence
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <time dateTime="2026-01-10">January 10, 2026</time>
                <span>•</span>
                <span>14 min read</span>
              </div>
            </header>

            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Welcome to 2026, where the fusion of <strong className="text-foreground">Open Source Intelligence (OSINT)</strong> and <strong className="text-foreground">Artificial Intelligence (AI)</strong> has fundamentally transformed how we collect, analyze, and act on digital information. What once required teams of analysts working for weeks can now be accomplished in minutes with unprecedented accuracy and depth.
              </p>

              <BlogCallout type="info" title="The AI-OSINT Revolution">
                This comprehensive guide explores the cutting-edge developments shaping OSINT in the AI era, the tools revolutionizing threat intelligence, and the critical ethical considerations every practitioner must understand.
              </BlogCallout>

              {/* Current State Section */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Brain className="h-8 w-8 text-primary" />
                  The Current State of AI-Powered OSINT
                </h2>
                <p className="mb-6">
                  The OSINT landscape in 2026 is defined by three transformative shifts:
                </p>
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
                    <CardContent className="pt-6">
                      <Bot className="h-8 w-8 text-primary mb-3" />
                      <h3 className="text-lg font-semibold mb-2">Autonomous Agents</h3>
                      <p className="text-muted-foreground text-sm">
                        AI systems that independently gather, correlate, and prioritize intelligence without human intervention.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
                    <CardContent className="pt-6">
                      <Eye className="h-8 w-8 text-accent mb-3" />
                      <h3 className="text-lg font-semibold mb-2">Multimodal Analysis</h3>
                      <p className="text-muted-foreground text-sm">
                        Simultaneous processing of text, images, video, audio, and structured data for comprehensive threat assessment.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
                    <CardContent className="pt-6">
                      <TrendingUp className="h-8 w-8 text-emerald-500 mb-3" />
                      <h3 className="text-lg font-semibold mb-2">Predictive Detection</h3>
                      <p className="text-muted-foreground text-sm">
                        Machine learning models that identify emerging threats before they materialize.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <BlogPullQuote author="Industry Analysis">
                What once required teams of analysts working for weeks can now be accomplished in minutes with AI-powered OSINT tools, achieving unprecedented accuracy and depth.
              </BlogPullQuote>

              {/* Key AI Technologies Section */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Cpu className="h-8 w-8 text-accent" />
                  Key AI Technologies Reshaping OSINT
                </h2>

                <Card className="mb-6 border-2 border-primary/20">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
                      Large Language Models (LLMs) for Intelligence Analysis
                    </h3>
                    <p className="mb-4 text-muted-foreground">
                      Modern LLMs have revolutionized how analysts process unstructured data:
                    </p>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <span className="text-sm"><strong>Entity Extraction:</strong> Identifying people, organizations, locations automatically</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <span className="text-sm"><strong>Sentiment Analysis:</strong> Understanding emotional context and motivations</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Globe className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <span className="text-sm"><strong>Cross-Language:</strong> Real-time translation across 100+ languages</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <BookOpen className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <span className="text-sm"><strong>Report Generation:</strong> Analyst-quality summaries from raw data</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mb-6 border-2 border-accent/20">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground text-sm font-bold">2</span>
                      Computer Vision for Visual OSINT
                    </h3>
                    <p className="mb-4 text-muted-foreground">
                      Image and video intelligence has reached new heights:
                    </p>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2">
                        <Eye className="h-4 w-4 text-accent mt-1 flex-shrink-0" />
                        <span className="text-sm"><strong>Geolocation:</strong> Determine precise locations from visual cues</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Eye className="h-4 w-4 text-accent mt-1 flex-shrink-0" />
                        <span className="text-sm"><strong>Object Recognition:</strong> Identify equipment, uniforms, logos</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-accent mt-1 flex-shrink-0" />
                        <span className="text-sm"><strong>Deepfake Detection:</strong> 99%+ accuracy identifying manipulated media</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Zap className="h-4 w-4 text-accent mt-1 flex-shrink-0" />
                        <span className="text-sm"><strong>Temporal Analysis:</strong> Determining when photos were taken</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mb-6 border-2 border-emerald-500/20">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white text-sm font-bold">3</span>
                      Graph Neural Networks for Relationship Mapping
                    </h3>
                    <p className="mb-4 text-muted-foreground">
                      Understanding connections between entities is crucial:
                    </p>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="flex items-start gap-2">
                        <Network className="h-4 w-4 text-emerald-500 mt-1 flex-shrink-0" />
                        <span className="text-sm"><strong>Social Network Analysis:</strong> Mapping influence and hidden connections</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Network className="h-4 w-4 text-emerald-500 mt-1 flex-shrink-0" />
                        <span className="text-sm"><strong>Attribution Analysis:</strong> Linking anonymous accounts to identities</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Network className="h-4 w-4 text-emerald-500 mt-1 flex-shrink-0" />
                        <span className="text-sm"><strong>Threat Clustering:</strong> Grouping coordinated malicious activities</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Practical Applications Section */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Workflow className="h-8 w-8 text-primary" />
                  Practical Applications in 2026
                </h2>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <Shield className="h-8 w-8 text-primary mb-3" />
                      <h3 className="text-lg font-semibold mb-3">Enterprise Security</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Attack Surface Management</li>
                        <li>• Executive Protection</li>
                        <li>• Supply Chain Risk</li>
                        <li>• Credential Monitoring</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-accent/20">
                    <CardContent className="pt-6">
                      <AlertTriangle className="h-8 w-8 text-amber-500 mb-3" />
                      <h3 className="text-lg font-semibold mb-3">Threat Intelligence</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• IOC Mining</li>
                        <li>• Campaign Tracking</li>
                        <li>• Vulnerability Intelligence</li>
                        <li>• Zero-day Monitoring</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-emerald-500/20">
                    <CardContent className="pt-6">
                      <Lock className="h-8 w-8 text-emerald-500 mb-3" />
                      <h3 className="text-lg font-semibold mb-3">Personal Privacy</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Digital Footprint Analysis</li>
                        <li>• Data Broker Detection</li>
                        <li>• Breach Notification</li>
                        <li>• Automated Removal</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <BlogCallout type="warning" title="The Dark Web Challenge">
                AI has transformed dark web intelligence, eliminating language barriers across Russian, Chinese, and Arabic forums, while enabling actor tracking across multiple aliases and real-time price monitoring of stolen data.
              </BlogCallout>

              {/* Ethical Considerations Section */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Scale className="h-8 w-8 text-amber-500" />
                  Ethical Considerations and Boundaries
                </h2>
                <p className="mb-6">
                  With great power comes significant responsibility. The AI-OSINT community has established clear ethical guidelines:
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Legal Boundaries
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span><strong>Public Information Only:</strong> Limited to legally accessible public data</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span><strong>No System Intrusion:</strong> Never bypassing authentication</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span><strong>Jurisdictional Awareness:</strong> Varying regional laws</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span><strong>GDPR Compliance:</strong> Data protection regulations</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-accent/20 bg-gradient-to-br from-card to-accent/5">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-accent" />
                        Ethical Guidelines
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                          <span className="text-accent font-bold">•</span>
                          <span><strong>Purpose Limitation:</strong> Relevant data only</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent font-bold">•</span>
                          <span><strong>Data Minimization:</strong> Avoiding unnecessary collection</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent font-bold">•</span>
                          <span><strong>Transparency:</strong> Clear about capabilities</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent font-bold">•</span>
                          <span><strong>Harm Prevention:</strong> Considering consequences</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-2 border-amber-500/20 bg-gradient-to-br from-card to-amber-500/5">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      AI-Specific Concerns
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-1 flex-shrink-0" />
                        <span><strong>Algorithmic Bias:</strong> Ensuring systems don't perpetuate discrimination</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-1 flex-shrink-0" />
                        <span><strong>False Positives:</strong> Human review for high-stakes decisions</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-1 flex-shrink-0" />
                        <span><strong>Explainability:</strong> Understanding AI conclusions</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-1 flex-shrink-0" />
                        <span><strong>Data Provenance:</strong> Tracking source reliability</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Essential Tools Section */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Zap className="h-8 w-8 text-primary" />
                  Essential OSINT Tools for 2026
                </h2>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <Card className="border-l-4 border-l-primary">
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-3">Username & Social Media</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><strong>Maigret:</strong> Cross-platform search across 3000+ sites</li>
                        <li><strong>Sherlock:</strong> Fast username enumeration</li>
                        <li><strong>WhatsMyName:</strong> Community-maintained search</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-accent">
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-3">Email Intelligence</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><strong>Holehe:</strong> Check email registration across services</li>
                        <li><strong>Have I Been Pwned:</strong> Breach detection</li>
                        <li><strong>Hunter.io:</strong> Professional email discovery</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-emerald-500">
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-3">Technical Intelligence</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><strong>Shodan:</strong> Internet-connected device search</li>
                        <li><strong>VirusTotal:</strong> File and URL reputation</li>
                        <li><strong>SpiderFoot:</strong> Automated reconnaissance</li>
                        <li><strong>Recon-NG:</strong> Modular framework</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-3">Phone Intelligence</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><strong>PhoneInfoga:</strong> Phone number reconnaissance</li>
                        <li><strong>Carrier Lookup:</strong> Network and line type ID</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <BlogPullQuote>
                The integration of AI and OSINT represents both an opportunity and a challenge. By understanding these technologies and applying them responsibly, you can protect yourself, your organization, and contribute to a safer digital ecosystem.
              </BlogPullQuote>

              {/* Future Outlook Section */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-emerald-500" />
                  The Future: What's Coming in 2027 and Beyond
                </h2>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <Card className="border-2 border-emerald-500/20">
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-3 text-emerald-500">Emerging Trends</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Autonomous OSINT Agents with minimal oversight</li>
                        <li>• Real-Time Threat Prediction systems</li>
                        <li>• Advanced Synthetic Media Intelligence</li>
                        <li>• Privacy-Preserving Analytics</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-amber-500/20">
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-3 text-amber-500">Challenges Ahead</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• AI vs AI: Adversaries using AI to evade detection</li>
                        <li>• Evolving privacy regulations</li>
                        <li>• Maintaining accuracy amid synthetic content</li>
                        <li>• Growing talent gap for AI-OSINT practitioners</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* CTA Section */}
              <Card className="mb-8 border-0 bg-gradient-to-br from-primary via-primary/90 to-accent p-8 text-primary-foreground">
                <h3 className="text-2xl font-bold mb-4">Ready to Harness AI-Powered OSINT?</h3>
                <p className="text-lg mb-6 opacity-90">
                  Start by running a free FootprintIQ scan to discover what AI-powered OSINT reveals about your digital footprint. Understanding your exposure is the first step toward effective protection in the AI era.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" variant="secondary">
                    <Link to="/pricing">Get Started Free</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20">
                    <Link to="/scan">Try OSINT Scan</Link>
                  </Button>
                </div>
              </Card>

              {/* Related Articles */}
              <section className="mt-16 pt-8 border-t">
                <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Link to="/blog/ai-in-osint-2025" className="group">
                    <Card className="p-6 hover:shadow-lg transition-shadow h-full">
                      <h3 className="text-lg font-semibold group-hover:text-primary transition-colors mb-2">
                        The Evolution of AI in OSINT: Key Trends Shaping 2025
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Explore how AI began revolutionizing OSINT in 2025, setting the stage for today's advanced capabilities.
                      </p>
                    </Card>
                  </Link>
                  <Link to="/blog/what-is-osint-risk" className="group">
                    <Card className="p-6 hover:shadow-lg transition-shadow h-full">
                      <h3 className="text-lg font-semibold group-hover:text-primary transition-colors mb-2">
                        What is OSINT Risk? Understanding Your Digital Exposure
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Learn how publicly available information can be used against you and how to protect yourself.
                      </p>
                    </Card>
                  </Link>
                </div>
              </section>
            </div>
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
}
