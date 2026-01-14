import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO, organizationSchema } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertCircle, Database, Bell, Lock, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function DarkWebMonitoringExplained() {
  const breadcrumbs = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      {
        "@type": "ListItem" as const,
        position: 1,
        name: "Home",
        item: "https://footprintiq.app"
      },
      {
        "@type": "ListItem" as const,
        position: 2,
        name: "Blog",
        item: "https://footprintiq.app/blog"
      },
      {
        "@type": "ListItem" as const,
        position: 3,
        name: "Dark Web Monitoring Explained"
      }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org" as const,
    "@type": "FAQPage" as const,
    mainEntity: [
      {
        "@type": "Question" as const,
        name: "What is dark web monitoring?",
        acceptedAnswer: {
          "@type": "Answer" as const,
          text: "Dark web monitoring is the continuous surveillance of hidden parts of the internet where stolen credentials, sensitive data, and illicit services are traded. It alerts organizations when their data appears in these underground marketplaces, allowing rapid response to potential breaches."
        }
      },
      {
        "@type": "Question" as const,
        name: "How does dark web monitoring work?",
        acceptedAnswer: {
          "@type": "Answer" as const,
          text: "Dark web monitoring tools use specialized crawlers and human intelligence to access hidden forums, marketplaces, and paste sites. They continuously scan for specific indicators like company email domains, executive names, or proprietary information, then alert security teams when matches are found."
        }
      },
      {
        "@type": "Question" as const,
        name: "Is dark web monitoring necessary for my business?",
        acceptedAnswer: {
          "@type": "Answer" as const,
          text: "Yes, if your business handles sensitive data or has employees with access to critical systems. Studies show that 60% of data breaches involve credentials stolen from previous breaches. Dark web monitoring provides early warning, enabling you to change passwords and secure accounts before attackers strike."
        }
      },
      {
        "@type": "Question" as const,
        name: "How quickly are alerts sent after data appears on the dark web?",
        acceptedAnswer: {
          "@type": "Answer" as const,
          text: "Modern dark web monitoring services like FootprintIQ provide near real-time alerts, typically within minutes to hours of data appearing. Speed is critical - the faster you know about exposed credentials, the quicker you can take protective action."
        }
      }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: "Dark Web Monitoring Explained: Protecting Your Organization",
    description: "Comprehensive guide to dark web monitoring - what it is, how it works, and why your organization needs it to prevent credential theft and data breaches.",
    image: "https://footprintiq.app/blog-images/dark-web.webp",
    datePublished: "2025-01-31T10:00:00Z",
    dateModified: "2025-01-31T10:00:00Z",
    author: {
      "@type": "Organization",
      name: "FootprintIQ"
    },
    publisher: organizationSchema,
    keywords: "dark web monitoring, credential theft, data breach protection, cybersecurity, threat intelligence"
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Dark Web Monitoring Explained: Essential Protection Guide | FootprintIQ"
        description="Comprehensive guide to dark web monitoring - what it is, how it works, and why your organization needs it to prevent credential theft and data breaches."
        canonical="https://footprintiq.app/blog/dark-web-monitoring-explained"
        ogImage="https://footprintiq.app/blog-images/dark-web.webp"
        article={{
          publishedTime: "2025-01-31T10:00:00Z",
          modifiedTime: "2025-01-31T10:00:00Z",
          author: "FootprintIQ",
          tags: ["Dark Web", "Cybersecurity", "Data Protection"]
        }}
        schema={{
          organization: organizationSchema,
          breadcrumbs: breadcrumbs,
          faq: faqSchema,
          custom: articleSchema
        }}
      />
      <Header />
      
      <main className="flex-1">
        <article className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Badge>Cybersecurity</Badge>
                <Badge variant="outline">Dark Web</Badge>
                <span className="text-sm text-muted-foreground">10 min read</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Dark Web Monitoring Explained: Protecting Your Organization from Underground Threats
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <time dateTime="2025-01-31">January 31, 2025</time>
                <span>•</span>
                <span>By FootprintIQ Security Team</span>
              </div>
            </div>

            {/* Featured Image */}
            <div className="mb-12 rounded-lg overflow-hidden">
              <img 
                src="/blog-images/dark-web.webp" 
                alt="Dark web monitoring - protecting against underground data theft"
                className="w-full h-auto"
              />
            </div>

            {/* Introduction */}
            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-xl leading-relaxed text-muted-foreground">
                The dark web operates in the shadows of the internet, hosting marketplaces where stolen credentials, 
                corporate data, and personal information are bought and sold daily. Dark web monitoring acts as your 
                organization's early warning system, detecting when your data appears in these hidden corners before 
                attackers can exploit it.
              </p>
            </div>

            {/* Main Content */}
            <div className="space-y-12">
              {/* Section 1 */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">What is the Dark Web?</h2>
                </div>
                <Card className="p-6 space-y-4">
                  <p className="text-lg">
                    The <strong>dark web</strong> is a portion of the internet that requires special software (like Tor) 
                    to access and is intentionally hidden from standard search engines. Unlike the regular "surface web" 
                    you use daily, the dark web provides anonymity to its users.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4 mt-6">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">Surface Web</h3>
                      <p className="text-sm text-muted-foreground">~4% of internet - Indexed by search engines</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">Deep Web</h3>
                      <p className="text-sm text-muted-foreground">~90% of internet - Private databases, intranets</p>
                    </div>
                    <div className="p-4 border rounded-lg bg-destructive/10">
                      <h3 className="font-semibold mb-2">Dark Web</h3>
                      <p className="text-sm text-muted-foreground">~6% of internet - Anonymous, encrypted networks</p>
                    </div>
                  </div>
                  <p className="text-lg pt-4">
                    While not inherently illegal, the dark web's anonymity makes it attractive for criminal activity, 
                    including the sale of stolen data, hacking tools, and illicit services.
                  </p>
                </Card>
              </section>

              {/* Section 2 */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Database className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">What Gets Sold on the Dark Web?</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Credentials & Access</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Email/password combinations from breaches</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                        <span>VPN credentials and remote access details</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Admin panel logins</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Corporate network access ($1,000-$100,000+)</span>
                      </li>
                    </ul>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Corporate Data</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Employee databases with PII</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Customer records and payment information</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Intellectual property and source code</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Internal communications and documents</span>
                      </li>
                    </ul>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Tools & Services</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Malware and ransomware kits</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                        <span>DDoS-for-hire services</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Exploit kits for known vulnerabilities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Hacking tutorials and guides</span>
                      </li>
                    </ul>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Financial Data</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Credit card numbers ($5-$100 each)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Bank account credentials</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                        <span>PayPal and cryptocurrency accounts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Tax documents and financial records</span>
                      </li>
                    </ul>
                  </Card>
                </div>
              </section>

              {/* Section 3 */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Bell className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">How Dark Web Monitoring Works</h2>
                </div>
                <Card className="p-6 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Data Collection</h3>
                      <p className="text-muted-foreground">
                        Specialized crawlers and human intelligence agents access hidden forums, marketplaces, IRC channels, 
                        and paste sites. They continuously scan millions of records from breach databases, criminal forums, 
                        and underground marketplaces.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Pattern Matching</h3>
                      <p className="text-muted-foreground">
                        Advanced algorithms search for specific indicators: your company's email domain, executive names, 
                        IP addresses, proprietary product names, or even sensitive project codenames. Machine learning 
                        improves detection accuracy over time.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Threat Analysis</h3>
                      <p className="text-muted-foreground">
                        When a match is found, security analysts verify the finding to eliminate false positives. They 
                        assess the severity, determine which accounts are compromised, and identify potential attack vectors.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                      4
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Real-Time Alerts</h3>
                      <p className="text-muted-foreground">
                        Your security team receives immediate notifications via email, SMS, or dashboard alerts. Speed is 
                        critical - the faster you know about exposure, the quicker you can respond.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                      5
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Remediation Guidance</h3>
                      <p className="text-muted-foreground">
                        Detailed reports include actionable recommendations: which passwords to reset, which accounts to 
                        secure, whether to revoke API keys, and how to prevent similar exposures.
                      </p>
                    </div>
                  </div>
                </Card>
              </section>

              {/* Section 4 */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Lock className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">Why Your Organization Needs Dark Web Monitoring</h2>
                </div>
                <div className="space-y-6">
                  <Card className="p-6 bg-primary/5">
                    <div className="flex items-start gap-4">
                      <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Early Breach Detection</h3>
                        <p className="text-muted-foreground">
                          Most organizations discover breaches 200+ days after they occur. Dark web monitoring can alert 
                          you within hours of credentials appearing, giving you time to secure accounts before attackers 
                          strike. IBM's Cost of a Data Breach report shows organizations save $1.76M on average with early detection.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-primary/5">
                    <div className="flex items-start gap-4">
                      <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Third-Party Risk Management</h3>
                        <p className="text-muted-foreground">
                          60% of breaches involve third parties. Monitor your vendors' and partners' credentials appearing 
                          on the dark web, as attackers often use compromised vendors as an entry point to larger targets.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-primary/5">
                    <div className="flex items-start gap-4">
                      <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Regulatory Compliance</h3>
                        <p className="text-muted-foreground">
                          GDPR, CCPA, HIPAA, and other regulations require organizations to implement "appropriate technical 
                          measures" to protect data. Dark web monitoring demonstrates proactive security posture and can 
                          reduce liability in case of a breach.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-primary/5">
                    <div className="flex items-start gap-4">
                      <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Executive Protection</h3>
                        <p className="text-muted-foreground">
                          C-level executives are prime targets for business email compromise (BEC) attacks. Monitor their 
                          personal and corporate email addresses to prevent credential-based attacks that cost companies 
                          an average of $4.2M per incident.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </section>

              {/* Section 5 */}
              <section>
                <h2 className="text-3xl font-bold mb-6">Real-World Impact: Case Studies</h2>
                <div className="space-y-6">
                  <Card className="p-6 border-l-4 border-l-destructive">
                    <h3 className="text-xl font-semibold mb-3">Manufacturing Company Saved from Ransomware</h3>
                    <p className="text-muted-foreground mb-4">
                      A mid-sized manufacturer's VPN credentials appeared on a dark web forum. Dark web monitoring alerted 
                      their security team within 2 hours. They immediately disabled the compromised account and discovered 
                      an inactive employee's credentials were still active. Without this alert, attackers would have had 
                      direct network access for a potential ransomware deployment.
                    </p>
                    <Badge>Prevented: $2.3M average ransomware cost</Badge>
                  </Card>

                  <Card className="p-6 border-l-4 border-l-amber-500">
                    <h3 className="text-xl font-semibold mb-3">Healthcare Provider Avoided HIPAA Violation</h3>
                    <p className="text-muted-foreground mb-4">
                      Employee credentials from a third-party breach gave attackers access to patient scheduling systems. 
                      Dark web monitoring detected the exposure before the attackers could access PHI (Protected Health 
                      Information). Rapid password resets prevented a breach that would have cost millions in HIPAA fines.
                    </p>
                    <Badge variant="secondary">Prevented: $4.35M average healthcare breach</Badge>
                  </Card>

                  <Card className="p-6 border-l-4 border-l-primary">
                    <h3 className="text-xl font-semibold mb-3">Financial Services Stopped Account Takeover</h3>
                    <p className="text-muted-foreground mb-4">
                      A major financial institution discovered 247 employee email/password combinations in a dark web database. 
                      The monitoring service identified that 89 employees were reusing passwords across work and personal accounts. 
                      Forced resets and enhanced MFA implementation prevented potential account takeovers affecting thousands of customers.
                    </p>
                    <Badge className="bg-green-600">Prevented: Mass account compromise</Badge>
                  </Card>
                </div>
              </section>

              {/* Section 6 */}
              <section>
                <h2 className="text-3xl font-bold mb-6">Choosing a Dark Web Monitoring Service</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Essential Features</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Comprehensive Coverage:</strong> Access to major forums, marketplaces, and paste sites</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Real-Time Alerts:</strong> Immediate notifications, not daily summaries</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Verified Intelligence:</strong> Human analysts to reduce false positives</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Actionable Reports:</strong> Clear remediation steps, not just raw data</span>
                      </li>
                    </ul>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Questions to Ask Vendors</h3>
                    <ul className="space-y-3 text-sm">
                      <li>• How many dark web sources do you monitor?</li>
                      <li>• What is your average alert response time?</li>
                      <li>• Do you provide historical breach data?</li>
                      <li>• Can you monitor specific domains, executives, or products?</li>
                      <li>• Do you offer API integration for automated workflows?</li>
                      <li>• What's your false positive rate?</li>
                      <li>• Do you provide remediation guidance and support?</li>
                      <li>• Can you monitor third-party vendors and partners?</li>
                    </ul>
                  </Card>
                </div>
              </section>

              {/* FAQ Section */}
              <section className="border-t pt-8">
                <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-2">Is dark web monitoring legal?</h3>
                    <p className="text-muted-foreground">
                      Yes, absolutely. Dark web monitoring services only access publicly available information on the dark web. 
                      They don't engage in illegal activities or purchase stolen data - they simply observe and report what's 
                      already being traded.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-2">Can you remove data from the dark web?</h3>
                    <p className="text-muted-foreground">
                      Generally no. Once data appears on the dark web, it's nearly impossible to remove. The focus should be 
                      on rapid response: changing passwords, revoking access, enabling MFA, and monitoring for misuse. Dark 
                      web monitoring provides the early warning needed for effective response.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-2">How much does dark web monitoring cost?</h3>
                    <p className="text-muted-foreground">
                      Pricing varies widely based on coverage and features. Individual monitoring starts around $10-50/month. 
                      Enterprise solutions typically range from $1,000-$50,000+ annually depending on the number of monitored 
                      assets, alert frequency, and support level. The cost is minimal compared to breach remediation expenses.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-2">Does dark web monitoring prevent breaches?</h3>
                    <p className="text-muted-foreground">
                      Dark web monitoring doesn't prevent initial data theft, but it dramatically reduces the window of 
                      opportunity for attackers to exploit stolen credentials. Think of it as a burglar alarm - it doesn't 
                      prevent break-ins, but it ensures you're notified immediately so you can respond before significant 
                      damage occurs.
                    </p>
                  </Card>
                </div>
              </section>

              {/* Conclusion */}
              <section className="border-t pt-8">
                <h2 className="text-3xl font-bold mb-6">Take Action Today</h2>
                <Card className="p-8 bg-primary/5">
                  <p className="text-lg mb-4">
                    Your organization's credentials are likely already circulating on the dark web - most companies just 
                    don't know it yet. Every day without monitoring is a day attackers could be planning their next move 
                    using your exposed data.
                  </p>
                  <p className="text-lg mb-6">
                    Dark web monitoring transforms the dark web from an invisible threat into a manageable risk. 
                    <strong> Early detection is your best defense.</strong>
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/scan">
                      <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                        Start Free Dark Web Scan
                      </button>
                    </Link>
                    <Link to="/monitoring">
                      <button className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors">
                        Continuous Monitoring Plans
                      </button>
                    </Link>
                  </div>
                </Card>
              </section>

              {/* Related Articles */}
              <section className="border-t pt-8">
                <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Link to="/blog/what-is-osint-risk">
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                      <Badge className="mb-3">Previous Article</Badge>
                      <h3 className="text-xl font-semibold mb-2">What is OSINT Risk?</h3>
                      <p className="text-sm text-muted-foreground">
                        Understand how public information creates security vulnerabilities for your organization.
                      </p>
                    </Card>
                  </Link>
                  <Link to="/blog">
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                      <h3 className="text-xl font-semibold mb-2">View All Security Articles</h3>
                      <p className="text-sm text-muted-foreground">
                        Explore our complete cybersecurity and threat intelligence resource library.
                      </p>
                    </Card>
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </article>
      </main>
      
      <Footer />
    </div>
  );
}