import { useParams, Link, Navigate } from "react-router-dom";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

const blogPosts = {
  "what-is-digital-footprint": {
    title: "What Is a Digital Footprint? Complete Guide 2025",
    date: "January 15, 2025",
    readTime: "8 min read",
    category: "Privacy Basics",
    content: `
      <h2>Understanding Your Digital Footprint</h2>
      <p>A digital footprint is the trail of data you leave behind while using the internet. Every time you browse websites, post on social media, shop online, or use apps, you're creating digital traces that can be tracked, collected, and analyzed.</p>

      <h3>Types of Digital Footprints</h3>
      <p><strong>Active Digital Footprint:</strong> Information you deliberately share online, such as social media posts, blog comments, emails, and form submissions.</p>
      <p><strong>Passive Digital Footprint:</strong> Data collected about you without your direct input, including IP addresses, browsing history, cookies, and device information.</p>

      <h3>Why Your Digital Footprint Matters</h3>
      <ul>
        <li><strong>Privacy Risks:</strong> Personal information can be exposed to data brokers, advertisers, and malicious actors</li>
        <li><strong>Reputation Impact:</strong> Online content can affect job prospects, relationships, and professional opportunities</li>
        <li><strong>Security Threats:</strong> Exposed data can be used for identity theft, phishing, and social engineering attacks</li>
        <li><strong>Financial Implications:</strong> Data brokers sell your information to third parties without your consent</li>
      </ul>

      <h3>How to Manage Your Digital Footprint</h3>
      <ol>
        <li><strong>Audit Your Online Presence:</strong> Use OSINT tools like FootprintIQ to scan what information is publicly available about you</li>
        <li><strong>Remove Old Accounts:</strong> Delete unused social media profiles and accounts you no longer need</li>
        <li><strong>Adjust Privacy Settings:</strong> Review and tighten privacy controls on all your active accounts</li>
        <li><strong>Use Data Removal Services:</strong> Employ automated tools to request removal from data broker sites</li>
        <li><strong>Monitor Regularly:</strong> Set up continuous monitoring to catch new exposures early</li>
      </ol>

      <h3>Tools and Services</h3>
      <p>FootprintIQ provides comprehensive digital footprint scanning using trusted OSINT sources including:</p>
      <ul>
        <li>Have I Been Pwned - Email breach detection</li>
        <li>Shodan - IP and device exposure scanning</li>
        <li>VirusTotal - Domain and file reputation checks</li>
        <li>100+ data broker removal services</li>
      </ul>

      <h3>Taking Action Today</h3>
      <p>Start by running a free scan to see what information is currently exposed about you online. Once you understand your digital footprint, you can take concrete steps to reduce your exposure and protect your privacy.</p>
    `,
  },
  "check-email-breach": {
    title: "How to Check If Your Email Was Breached",
    date: "January 12, 2025",
    readTime: "6 min read",
    category: "Security",
    content: `
      <h2>Email Breach Detection Guide</h2>
      <p>Data breaches expose millions of email addresses and passwords every year. If your email was involved in a breach, your personal information may be available to hackers on the dark web.</p>

      <h3>What Happens in a Data Breach?</h3>
      <p>When companies experience security breaches, attackers often steal databases containing:</p>
      <ul>
        <li>Email addresses</li>
        <li>Hashed or plaintext passwords</li>
        <li>Phone numbers</li>
        <li>Physical addresses</li>
        <li>Credit card information</li>
        <li>Social security numbers</li>
      </ul>

      <h3>How to Check for Breaches</h3>
      <p><strong>1. Use Have I Been Pwned:</strong> The most trusted free service for checking if your email was exposed in known breaches.</p>
      <p><strong>2. Run OSINT Scans:</strong> Tools like FootprintIQ aggregate data from multiple breach databases to give you comprehensive results.</p>
      <p><strong>3. Check Dark Web Monitoring:</strong> Premium services monitor underground forums and marketplaces for your data.</p>

      <h3>What to Do If You're Compromised</h3>
      <ol>
        <li><strong>Change Your Passwords Immediately:</strong> Update passwords on all affected accounts</li>
        <li><strong>Enable Two-Factor Authentication:</strong> Add an extra layer of security to prevent unauthorized access</li>
        <li><strong>Monitor Your Accounts:</strong> Watch for suspicious activity on financial and important accounts</li>
        <li><strong>Consider Identity Theft Protection:</strong> Services that monitor credit reports and financial activity</li>
        <li><strong>Use Unique Passwords:</strong> Never reuse passwords across different services</li>
      </ol>

      <h3>Prevention Strategies</h3>
      <ul>
        <li>Use a password manager to generate and store unique, strong passwords</li>
        <li>Enable 2FA wherever available</li>
        <li>Be cautious about where you share your email address</li>
        <li>Use temporary/disposable email addresses for untrusted sites</li>
        <li>Regularly scan for breaches using FootprintIQ</li>
      </ul>

      <h3>Understanding Breach Severity</h3>
      <p>Not all breaches are equal. Consider:</p>
      <ul>
        <li><strong>Data Sensitivity:</strong> What type of information was exposed?</li>
        <li><strong>Password Protection:</strong> Were passwords hashed, salted, or plaintext?</li>
        <li><strong>Breach Date:</strong> Recent breaches pose higher immediate risk</li>
        <li><strong>Company Response:</strong> How quickly was the breach disclosed and patched?</li>
      </ul>

      <p>Stay proactive about your email security by running regular breach checks and updating your security practices accordingly.</p>
    `,
  },
  "osint-beginners-guide": {
    title: "OSINT for Beginners: Open-Source Intelligence Explained",
    date: "January 10, 2025",
    readTime: "10 min read",
    category: "OSINT",
    content: `
      <h2>Introduction to OSINT</h2>
      <p>OSINT (Open-Source Intelligence) refers to the collection and analysis of publicly available information. Originally a practice used by intelligence agencies, OSINT has become essential for cybersecurity professionals, journalists, researchers, and individuals concerned about their privacy.</p>

      <h3>What Counts as Open-Source Intelligence?</h3>
      <p>OSINT encompasses data from:</p>
      <ul>
        <li><strong>Public Records:</strong> Court documents, property records, business registrations</li>
        <li><strong>Social Media:</strong> Posts, photos, connections, and metadata from platforms</li>
        <li><strong>Search Engines:</strong> Google, Bing, specialized search engines</li>
        <li><strong>Technical Sources:</strong> DNS records, WHOIS data, IP addresses, open ports</li>
        <li><strong>Data Breaches:</strong> Exposed credentials from compromised databases</li>
        <li><strong>News and Media:</strong> Articles, press releases, interviews</li>
      </ul>

      <h3>Common OSINT Use Cases</h3>
      <p><strong>1. Personal Privacy Protection:</strong> Discovering what information about you is publicly accessible and taking steps to remove it.</p>
      <p><strong>2. Cybersecurity:</strong> Identifying vulnerabilities in networks and systems before attackers do.</p>
      <p><strong>3. Investigation:</strong> Researching companies, individuals, or suspicious activities.</p>
      <p><strong>4. Brand Protection:</strong> Monitoring mentions, impersonation attempts, and reputation threats.</p>

      <h3>Popular OSINT Tools</h3>
      <p><strong>For Email Intelligence:</strong></p>
      <ul>
        <li>Have I Been Pwned - Breach detection</li>
        <li>Hunter.io - Email discovery and verification</li>
        <li>EmailRep - Reputation scoring</li>
      </ul>

      <p><strong>For Domain/IP Research:</strong></p>
      <ul>
        <li>Shodan - Internet-connected device search engine</li>
        <li>VirusTotal - File and URL analysis</li>
        <li>WHOIS - Domain registration information</li>
      </ul>

      <p><strong>For Social Media:</strong></p>
      <ul>
        <li>Social-Searcher - Cross-platform monitoring</li>
        <li>Sherlock - Username search across platforms</li>
        <li>IntelTechniques - Comprehensive social media tools</li>
      </ul>

      <h3>OSINT Methodology</h3>
      <ol>
        <li><strong>Define Objectives:</strong> What information are you looking for?</li>
        <li><strong>Collect Data:</strong> Gather information from multiple sources</li>
        <li><strong>Process and Analyze:</strong> Filter, correlate, and validate findings</li>
        <li><strong>Verify Information:</strong> Cross-reference data to ensure accuracy</li>
        <li><strong>Report Findings:</strong> Document results and actionable insights</li>
      </ol>

      <h3>Legal and Ethical Considerations</h3>
      <p><strong>What's Legal:</strong></p>
      <ul>
        <li>Accessing publicly available information</li>
        <li>Using search engines and public databases</li>
        <li>Analyzing your own digital footprint</li>
      </ul>

      <p><strong>What's Not:</strong></p>
      <ul>
        <li>Hacking or unauthorized access to systems</li>
        <li>Using stolen credentials or breach data illegally</li>
        <li>Harassment or stalking individuals</li>
        <li>Violating terms of service or privacy laws</li>
      </ul>

      <h3>How FootprintIQ Uses OSINT</h3>
      <p>FootprintIQ aggregates data from trusted OSINT sources to provide comprehensive digital footprint scanning:</p>
      <ul>
        <li><strong>Email Scans:</strong> Check for breaches, identify associated accounts</li>
        <li><strong>Username Searches:</strong> Find profiles across major platforms</li>
        <li><strong>Domain Intelligence:</strong> Analyze reputation, tech stack, and DNS history</li>
        <li><strong>IP Exposure:</strong> Identify open ports and vulnerable services</li>
        <li><strong>Phone Number Lookup:</strong> Carrier information and public records</li>
      </ul>

      <h3>Getting Started with OSINT</h3>
      <p>Begin by running an OSINT scan on yourself using FootprintIQ. This will show you exactly what information is publicly available and help you understand the power and scope of open-source intelligence.</p>

      <p>Remember: The same tools that help protect your privacy can be used against you. Understanding OSINT is the first step in securing your digital footprint.</p>
    `,
  },
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? blogPosts[slug as keyof typeof blogPosts] : null;

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "datePublished": new Date(post.date).toISOString(),
    "author": {
      "@type": "Organization",
      "name": "FootprintIQ",
    },
    "publisher": {
      "@type": "Organization",
      "name": "FootprintIQ",
      "logo": {
        "@type": "ImageObject",
        "url": "https://footprintiq.com/logo.png",
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://footprintiq.com/blog/${slug}`,
    },
  };

  return (
    <>
      <SEO
        title={`${post.title} | FootprintIQ Blog`}
        description={post.content.substring(0, 160).replace(/<[^>]*>/g, '')}
        canonical={`https://footprintiq.com/blog/${slug}`}
        ogType="article"
        article={{
          publishedTime: new Date(post.date).toISOString(),
          author: "FootprintIQ",
          tags: [post.category, "digital privacy", "OSINT"],
        }}
        structuredData={structuredData}
      />

      <Header />

      <main className="min-h-screen bg-background">
        <article className="max-w-3xl mx-auto px-6 py-16">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
              {post.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {post.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {post.readTime}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-8">{post.title}</h1>

          <div
            className="prose prose-lg max-w-none prose-headings:font-bold prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-12 p-6 bg-muted/50 rounded-2xl border border-border">
            <h3 className="text-xl font-bold mb-3">Ready to Check Your Digital Footprint?</h3>
            <p className="text-muted-foreground mb-4">
              Run a free OSINT scan to see what information is publicly available about you online.
            </p>
            <Button asChild>
              <Link to="/scan">Start Free Scan</Link>
            </Button>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
};

export default BlogPost;
