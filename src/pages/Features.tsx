import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FeatureDemo } from "@/components/FeatureDemo";
import { 
  Shield, 
  Zap, 
  Database, 
  Eye, 
  Bot, 
  Users, 
  FileText, 
  Lock, 
  TrendingUp, 
  Globe, 
  Webhook,
  BarChart3,
  Layers,
  Network,
  Play
} from "lucide-react";
import { Link } from "react-router-dom";

const Features = () => {
  const featuresData = [
    {
      icon: Database,
      title: "Advanced Data Enrichment",
      description: "Access 20+ premium OSINT APIs and intelligence databases",
      demo: {
        title: "Data Enrichment Workflow",
        steps: [
          {
            label: "Input Target",
            screenshot: "/demo-enrichment-1.png",
            description: "Enter an email address, phone number, or domain to begin enrichment. The system automatically determines available data sources."
          },
          {
            label: "API Selection",
            screenshot: "/demo-enrichment-2.png",
            description: "View available premium APIs and select which data sources to query. Options include social media, professional networks, and breach databases."
          },
          {
            label: "Data Collection",
            screenshot: "/demo-enrichment-3.png",
            description: "Watch real-time progress as the system queries 20+ APIs simultaneously, aggregating results and removing duplicates."
          },
          {
            label: "Results Dashboard",
            screenshot: "/demo-enrichment-4.png",
            description: "View comprehensive results with social profiles, professional history, associated accounts, and risk indicators all in one unified interface."
          }
        ]
      },
      useCases: [
        {
          title: "Corporate Investigation",
          example: "A security analyst investigating potential insider threats can cross-reference employee email addresses across multiple breach databases, social media platforms, and professional networks to identify compromised credentials or suspicious activity patterns."
        },
        {
          title: "Due Diligence",
          example: "Before a business acquisition, run comprehensive background checks on key executives using our enrichment APIs to uncover undisclosed associations, previous litigation, or reputation risks."
        },
        {
          title: "Threat Intelligence",
          example: "Security teams can enrich IP addresses and domain indicators with historical DNS records, geolocation data, and threat actor attribution to build comprehensive threat profiles."
        }
      ],
      features: [
        "20+ premium API integrations",
        "Social media profile discovery",
        "Professional network analysis",
        "Historical data lookups",
        "Automated entity resolution"
      ]
    },
    {
      icon: Eye,
      title: "Dark Web Monitoring",
      description: "Real-time surveillance of dark web marketplaces and forums",
      demo: {
        title: "Dark Web Monitoring Interface",
        steps: [
          {
            label: "Setup Monitors",
            screenshot: "/demo-darkweb-1.png",
            description: "Configure monitoring rules for specific keywords, domains, email addresses, or credential patterns across dark web sources."
          },
          {
            label: "Live Surveillance",
            screenshot: "/demo-darkweb-2.png",
            description: "View real-time dashboard showing active marketplaces, forums, and paste sites being monitored with live threat indicators."
          },
          {
            label: "Alert Triggered",
            screenshot: "/demo-darkweb-3.png",
            description: "Receive instant notifications when monitored keywords or data appear. See the source, context, and threat level assessment."
          },
          {
            label: "Threat Analysis",
            screenshot: "/demo-darkweb-4.png",
            description: "Deep dive into findings with full context, related posts, seller information, and recommended response actions."
          }
        ]
      },
      useCases: [
        {
          title: "Brand Protection",
          example: "E-commerce companies can monitor dark web marketplaces for counterfeit products, leaked customer databases, or compromised payment card information associated with their brand."
        },
        {
          title: "Executive Protection",
          example: "Monitor dark web forums and paste sites for leaked executive credentials, personal information, or threats targeting C-suite individuals and their families."
        },
        {
          title: "Incident Response",
          example: "After a suspected breach, instantly search dark web marketplaces and forums to determine if your organization's data has been posted or offered for sale."
        }
      ],
      features: [
        "Real-time marketplace monitoring",
        "Forum and chat surveillance",
        "Paste site tracking",
        "Automated alerts",
        "Historical breach database"
      ]
    },
    {
      icon: Zap,
      title: "Unlimited Scans & Quotas",
      description: "No limits on scans, queries, or data access",
      demo: {
        title: "Bulk Scanning Workflow",
        steps: [
          {
            label: "Bulk Upload",
            screenshot: "/demo-bulk-1.png",
            description: "Upload CSV files with thousands of targets (emails, IPs, domains) or paste lists directly into the interface."
          },
          {
            label: "Processing Queue",
            screenshot: "/demo-bulk-2.png",
            description: "Monitor scan progress with real-time updates. Premium users get priority processing with parallel execution."
          },
          {
            label: "Results Stream",
            screenshot: "/demo-bulk-3.png",
            description: "View results as they complete. Filter, sort, and export findings on-the-fly without waiting for all scans to finish."
          },
          {
            label: "Export & Schedule",
            screenshot: "/demo-bulk-4.png",
            description: "Export results in multiple formats or schedule recurring scans to run automatically at specified intervals."
          }
        ]
      },
      useCases: [
        {
          title: "Continuous Monitoring",
          example: "MSPs and MSSPs can run unlimited daily scans across their entire client portfolio, monitoring thousands of domains, email addresses, and IP addresses without worrying about quota limits."
        },
        {
          title: "Bulk Research",
          example: "Law enforcement agencies investigating organized crime can scan hundreds of phone numbers, email addresses, and usernames simultaneously to map criminal networks and identify connections."
        },
        {
          title: "Comprehensive Audits",
          example: "Enterprises conducting quarterly security audits can scan all employee accounts, company domains, and digital assets without budget concerns or usage restrictions."
        }
      ],
      features: [
        "Unlimited scan volume",
        "No monthly caps",
        "Bulk scanning support",
        "Priority processing",
        "Extended data retention"
      ]
    },
    {
      icon: Webhook,
      title: "API Access & Integrations",
      description: "5,000 API calls per hour with custom webhook support",
      demo: {
        title: "API Integration Setup",
        steps: [
          {
            label: "Generate API Key",
            screenshot: "/demo-api-1.png",
            description: "Create API keys with granular permissions. Set rate limits, IP restrictions, and expiration dates for enhanced security."
          },
          {
            label: "Configure Webhooks",
            screenshot: "/demo-api-2.png",
            description: "Set up webhook endpoints to receive real-time notifications for scan completions, new findings, or security alerts."
          },
          {
            label: "Test Integration",
            screenshot: "/demo-api-3.png",
            description: "Use the built-in API testing console to verify endpoints, inspect responses, and troubleshoot integration issues."
          },
          {
            label: "Monitor Usage",
            screenshot: "/demo-api-4.png",
            description: "Track API usage metrics, response times, error rates, and remaining quota in real-time dashboard."
          }
        ]
      },
      useCases: [
        {
          title: "SOAR Integration",
          example: "Security teams can integrate FootprintIQ into their SOAR platform to automatically enrich security alerts with OSINT data, triggering workflows when high-risk indicators are detected."
        },
        {
          title: "SIEM Enhancement",
          example: "Feed real-time threat intelligence and breach data directly into Splunk, QRadar, or other SIEM platforms to enhance correlation rules and improve threat detection accuracy."
        },
        {
          title: "Custom Dashboards",
          example: "Build custom executive dashboards that pull live data from FootprintIQ API to display organizational risk scores, active threats, and security posture metrics."
        }
      ],
      features: [
        "RESTful API access",
        "5,000 calls/hour",
        "Webhook notifications",
        "Custom integrations",
        "OpenAPI documentation"
      ]
    },
    {
      icon: Bot,
      title: "Unlimited AI Analyst",
      description: "AI-powered threat analysis and natural language queries",
      demo: {
        title: "AI Analyst in Action",
        steps: [
          {
            label: "Ask Question",
            screenshot: "/demo-ai-1.png",
            description: "Type natural language queries like 'Show me all compromised accounts from last month' or 'What's our overall risk score?'"
          },
          {
            label: "AI Processing",
            screenshot: "/demo-ai-2.png",
            description: "Watch the AI analyze your data, cross-reference findings, and identify patterns across multiple scans and sources."
          },
          {
            label: "Insights Report",
            screenshot: "/demo-ai-3.png",
            description: "Receive comprehensive answers with visual charts, risk scores, and actionable recommendations backed by data."
          },
          {
            label: "Deep Dive",
            screenshot: "/demo-ai-4.png",
            description: "Ask follow-up questions or request deeper analysis. The AI maintains context and can explore related findings."
          }
        ]
      },
      useCases: [
        {
          title: "Threat Correlation",
          example: "Ask the AI analyst to find patterns across multiple scans: 'Show me all email addresses associated with this domain that appear in recent breaches and have social media accounts.' Get instant, contextual answers."
        },
        {
          title: "Risk Assessment",
          example: "Query: 'What is the overall risk score for our organization based on last month's scans?' The AI provides a comprehensive risk analysis with recommendations and remediation steps."
        },
        {
          title: "Investigative Research",
          example: "Conduct conversational investigations: 'Find all connections between these three email addresses and identify common data breaches or compromised accounts.' The AI maps relationships and highlights key findings."
        }
      ],
      features: [
        "Natural language queries",
        "Pattern recognition",
        "Automated threat scoring",
        "Contextual insights",
        "Investigation assistance"
      ]
    },
    {
      icon: Users,
      title: "Team Collaboration & Admin Tools",
      description: "Workspace management with granular permissions",
      demo: {
        title: "Team Management Workflow",
        steps: [
          {
            label: "Create Workspace",
            screenshot: "/demo-team-1.png",
            description: "Set up separate workspaces for different teams or clients. Configure workspace settings, branding, and data isolation."
          },
          {
            label: "Invite Members",
            screenshot: "/demo-team-2.png",
            description: "Add team members via email invitation. Assign roles (Admin, Analyst, Viewer) with specific permission levels."
          },
          {
            label: "Manage Permissions",
            screenshot: "/demo-team-3.png",
            description: "Fine-tune access control for each user. Control who can run scans, view sensitive data, export reports, or manage billing."
          },
          {
            label: "Activity Audit",
            screenshot: "/demo-team-4.png",
            description: "Review comprehensive audit logs showing all user actions, scan history, data access, and configuration changes."
          }
        ]
      },
      useCases: [
        {
          title: "Multi-Team Deployment",
          example: "Large enterprises can create separate workspaces for different teams (Security, Legal, HR) with isolated data and custom permission levels for each team's specific needs."
        },
        {
          title: "Client Management",
          example: "Security consultancies can manage multiple client workspaces, assign team members to specific clients, and track billable hours through detailed audit logs."
        },
        {
          title: "Training & Onboarding",
          example: "Create read-only workspaces for new analysts to review historical cases and learn investigation techniques without risking data integrity or exposing sensitive information."
        }
      ],
      features: [
        "Unlimited workspaces",
        "Role-based access control",
        "Team member management",
        "Audit logging",
        "Activity tracking"
      ]
    },
    {
      icon: FileText,
      title: "Advanced Reporting & White-label",
      description: "Professional PDF reports with custom branding",
      demo: {
        title: "Report Generation Process",
        steps: [
          {
            label: "Select Template",
            screenshot: "/demo-report-1.png",
            description: "Choose from executive summary, technical deep-dive, or compliance templates. Each optimized for different audiences."
          },
          {
            label: "Customize Branding",
            screenshot: "/demo-report-2.png",
            description: "Upload your logo, set brand colors, and configure header/footer text. Preview changes in real-time."
          },
          {
            label: "Configure Sections",
            screenshot: "/demo-report-3.png",
            description: "Select which data sections to include: executive summary, detailed findings, remediation steps, or compliance mapping."
          },
          {
            label: "Generate & Distribute",
            screenshot: "/demo-report-4.png",
            description: "Generate professional PDF reports and schedule automated distribution via email or webhook delivery."
          }
        ]
      },
      useCases: [
        {
          title: "Client Deliverables",
          example: "MSPs can generate white-labeled security assessment reports with their own branding, logo, and color scheme to deliver professional findings to clients without revealing the underlying platform."
        },
        {
          title: "Executive Briefings",
          example: "Security teams can create executive-friendly reports that translate technical findings into business risk metrics, perfect for board presentations and stakeholder communications."
        },
        {
          title: "Compliance Documentation",
          example: "Generate audit-ready reports for compliance frameworks (ISO 27001, SOC 2, GDPR) showing evidence of due diligence and security monitoring activities."
        }
      ],
      features: [
        "PDF export",
        "Custom branding",
        "Multiple report templates",
        "Scheduled reports",
        "Automated distribution"
      ]
    },
    {
      icon: Lock,
      title: "SSO & Advanced Security",
      description: "Enterprise-grade authentication and security controls",
      demo: {
        title: "SSO Configuration Guide",
        steps: [
          {
            label: "Provider Setup",
            screenshot: "/demo-sso-1.png",
            description: "Connect your identity provider (Okta, Azure AD, Google Workspace) using SAML 2.0 or OAuth 2.0 protocols."
          },
          {
            label: "User Mapping",
            screenshot: "/demo-sso-2.png",
            description: "Configure automatic user provisioning, attribute mapping, and default role assignment for new SSO users."
          },
          {
            label: "Security Policies",
            screenshot: "/demo-sso-3.png",
            description: "Enforce MFA, set session timeouts, configure IP allowlists, and define conditional access rules."
          },
          {
            label: "Test & Monitor",
            screenshot: "/demo-sso-4.png",
            description: "Test SSO login flow and monitor authentication logs, failed attempts, and active sessions in real-time."
          }
        ]
      },
      useCases: [
        {
          title: "Enterprise SSO",
          example: "Connect FootprintIQ to your organization's Okta, Azure AD, or Google Workspace for centralized user management, eliminating password sprawl and ensuring consistent security policies."
        },
        {
          title: "Compliance Requirements",
          example: "Meet regulatory requirements with SAML 2.0 authentication, enforced MFA, session controls, and comprehensive audit trails for all user activities."
        },
        {
          title: "Zero Trust Architecture",
          example: "Implement conditional access policies that restrict FootprintIQ access based on device posture, network location, and user risk score within your zero trust framework."
        }
      ],
      features: [
        "SAML 2.0 SSO",
        "OAuth 2.0 support",
        "Enforced MFA",
        "Session management",
        "IP allowlisting"
      ]
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Premium Features — FootprintIQ",
    "description": "Explore FootprintIQ's premium features including advanced data enrichment, dark web monitoring, unlimited scans, and enterprise capabilities.",
    "url": "https://footprintiq.app/features"
  };

  return (
    <>
      <SEO
        title="Premium Features — FootprintIQ OSINT Platform"
        description="Explore advanced OSINT capabilities: 20+ APIs, dark web monitoring, unlimited scans, AI analyst, team collaboration, white-label reports, and enterprise security."
        canonical="https://footprintiq.app/features"
        structuredData={structuredData}
      />
      <div className="min-h-screen">
        <Header />
        
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
          
          <div className="relative z-10 container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Layers className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Premium Features</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Enterprise-Grade{" "}
                <span className="bg-gradient-accent bg-clip-text text-transparent">
                  OSINT Capabilities
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Unlock the full power of advanced intelligence gathering with premium features designed for security professionals, investigators, and enterprise teams
              </p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-16">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">20+</div>
                  <div className="text-sm text-muted-foreground">Premium APIs</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">5k</div>
                  <div className="text-sm text-muted-foreground">API Calls/Hour</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                  <div className="text-sm text-muted-foreground">Dark Web Monitoring</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">∞</div>
                  <div className="text-sm text-muted-foreground">Unlimited Scans</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Detailed Features */}
        <main className="container mx-auto px-6 pb-20 max-w-6xl">
          <div className="space-y-20">
            {featuresData.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <section key={index} className="scroll-mt-20">
                  <Card className="overflow-hidden border-2 hover:border-primary/50 transition-colors">
                    <CardHeader className="bg-gradient-card">
                      <div className="flex items-start gap-4">
                        <div className="rounded-xl bg-primary/10 p-3 border border-primary/20">
                          <Icon className="w-8 h-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-2xl mb-2">{feature.title}</CardTitle>
                          <CardDescription className="text-base">
                            {feature.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {/* Interactive Demo */}
                      {feature.demo && (
                        <div className="mb-8">
                          <div className="flex items-center gap-2 mb-4">
                            <Play className="w-5 h-5 text-primary" />
                            <h4 className="font-semibold">Interactive Walkthrough</h4>
                          </div>
                          <FeatureDemo
                            title={feature.demo.title}
                            steps={feature.demo.steps}
                          />
                        </div>
                      )}

                      {/* Key Features */}
                      <div className="mb-8">
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-primary" />
                          Key Capabilities
                        </h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          {feature.features.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <div className="rounded-full bg-primary/10 p-0.5 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              </div>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Use Cases */}
                      <div>
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <Network className="w-4 h-4 text-primary" />
                          Real-World Use Cases
                        </h4>
                        <div className="space-y-4">
                          {feature.useCases.map((useCase, idx) => (
                            <div key={idx} className="bg-gradient-card rounded-lg p-4 border border-border/50">
                              <h5 className="font-semibold mb-2">{useCase.title}</h5>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {useCase.example}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>
              );
            })}
          </div>

          {/* CTA Section */}
          <section className="mt-20 text-center">
            <Card className="bg-gradient-card border-2 border-primary/20">
              <CardContent className="pt-12 pb-12">
                <Globe className="w-16 h-16 text-primary mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-4">
                  Ready to Unlock Premium Features?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join thousands of security professionals using FootprintIQ's premium platform to protect organizations and investigate threats.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button size="lg" asChild>
                    <Link to="/pricing">View Pricing Plans</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/enterprise">Contact Sales</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Features;
