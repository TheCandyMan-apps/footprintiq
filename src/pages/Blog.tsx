import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { SEO, organizationSchema } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
const blogPosts = [{
  slug: "dark-web-scans-noise",
  title: "Why Most \"Dark Web Scans\" Are Noise — And How AI Fixes That",
  excerpt: "Dark web scanning has become a marketing buzzword. Learn why most scan results are noise, and how AI-filtered intelligence delivers calm, actionable insights instead of panic.",
  date: "January 21, 2026",
  readTime: "8 min read",
  category: "Thought Leadership",
  featured: true,
  image: "/blog-images/dark-web-noise.webp"
}, {
  slug: "osint-to-insight",
  title: "From OSINT to Insight: Reducing False Positives in Risk Intelligence",
  excerpt: "Raw OSINT data creates noise. Learn how probabilistic analysis, confidence scoring, and multi-signal correlation transform data into actionable intelligence.",
  date: "January 21, 2026",
  readTime: "9 min read",
  category: "Thought Leadership",
  featured: false,
  image: "/blog-images/osint-insight.webp"
}, {
  slug: "ethical-osint-exposure",
  title: "Ethical OSINT: How to Assess Exposure Without Surveillance",
  excerpt: "OSINT tools exist on a spectrum from helpful to harmful. Learn the principles that separate ethical exposure assessment from surveillance, and why transparency matters.",
  date: "January 21, 2026",
  readTime: "10 min read",
  category: "Thought Leadership",
  featured: false,
  image: "/blog-images/ethical-osint.webp"
}, {
  slug: "ethical-osint-standard",
  title: "Why Ethical OSINT Needs a New Standard",
  excerpt: "Ethical OSINT isn't about collecting less data — it's about claiming less certainty. Learn why interpretation, not volume, defines responsible intelligence practice.",
  date: "January 20, 2026",
  readTime: "6 min read",
  category: "LENS",
  featured: false,
  image: "/blog-images/ethical-osint.webp"
}, {
  slug: "osint-false-positives",
  title: "False Positives Are the Real OSINT Risk (And How to Reduce Them)",
  excerpt: "A missed profile is inconvenient. A false match can lead to incorrect conclusions, reputational harm, or wasted investigations. Learn how LENS reduces false positives by design.",
  date: "January 21, 2026",
  readTime: "7 min read",
  category: "LENS",
  featured: false,
  image: "/blog-images/false-positives.webp"
}, {
  slug: "public-data-not-public-truth",
  title: "Public Data Doesn't Mean Public Truth",
  excerpt: "A username appearing on a site doesn't mean ownership, activity, intent, or identity. Learn why responsible OSINT requires probabilistic interpretation, not absolute claims.",
  date: "January 22, 2026",
  readTime: "6 min read",
  category: "LENS",
  featured: false,
  image: "/blog-images/public-data.webp"
}, {
  slug: "lens-case-study-false-positive",
  title: "Case Study: How LENS Prevented a Costly Misidentification",
  excerpt: "A security team nearly flagged the wrong person based on username matches alone. LENS confidence scoring revealed critical evidence gaps that traditional tools missed.",
  date: "January 19, 2026",
  readTime: "7 min read",
  category: "LENS",
  featured: true,
  image: "/blog-images/lens-case-study.webp"
}, {
  slug: "lens-osint-confidence-wrong",
  title: "Why Most OSINT Tools Get Confidence Wrong",
  excerpt: "Binary results mislead analysts. High match rates create noise. False positives waste time and damage trust. Learn why probabilistic thinking matters in OSINT.",
  date: "January 16, 2026",
  readTime: "10 min read",
  category: "LENS",
  featured: false,
  image: "/blog-images/lens-confidence.webp"
}, {
  slug: "lens-introduction",
  title: "From Results to Reliability: Introducing LENS",
  excerpt: "LENS is an analysis layer that evaluates evidence quality, corroboration, and context to produce confidence assessments humans can understand. Learn why we built it.",
  date: "January 17, 2026",
  readTime: "8 min read",
  category: "LENS",
  featured: false,
  image: "/blog-images/lens-intro.webp"
}, {
  slug: "lens-confidence-meaning",
  title: "What 'Confidence' Actually Means in OSINT",
  excerpt: "Confidence is not certainty. Understanding the difference helps you interpret risk, make better decisions, and build trust through honest uncertainty.",
  date: "January 18, 2026",
  readTime: "9 min read",
  category: "LENS",
  featured: false,
  image: "/blog-images/lens-meaning.webp"
}, {
  slug: "osint-ai-era-2026",
  title: "2026 OSINT and the Era of AI: The Future of Digital Intelligence",
  excerpt: "Discover how AI is transforming Open Source Intelligence in 2026. From autonomous agents to predictive threat detection, explore the cutting-edge tools and ethical considerations shaping modern OSINT.",
  date: "January 10, 2026",
  readTime: "14 min read",
  category: "AI & Technology",
  featured: true,
  image: "/blog-images/osint-ai-era-2026.webp"
}, {
  slug: "ai-in-osint-2025",
  title: "The Evolution of AI in OSINT: Key Trends Shaping 2025",
  excerpt: "Explore how artificial intelligence is revolutionizing Open Source Intelligence in 2025, from booming market growth to real-world cybersecurity applications and privacy protection.",
  date: "November 7, 2025",
  readTime: "12 min read",
  category: "AI & Technology",
  featured: false,
  image: "/blog-images/ai-osint-2025.webp"
}, {
  slug: "how-exposed-am-i-online",
  title: "How Exposed Am I Online? (2026 Digital Footprint Guide)",
  excerpt: "Learn how to measure your online exposure using ethical OSINT techniques. Comprehensive 2026 guide covering digital footprint scans, breach checks, and exposure reduction strategies.",
  date: "February 13, 2026",
  readTime: "11 min read",
  category: "Privacy",
  featured: true,
  image: "/blog-images/digital-footprint.webp"
}, {
  slug: "what-is-username-osint-scan",
  title: "What Is a Username OSINT Scan?",
  excerpt: "Learn what a username OSINT scan is, how automated tools check hundreds of platforms, accuracy limitations to watch for, and when to use one ethically.",
  date: "February 13, 2026",
  readTime: "10 min read",
  category: "OSINT",
  featured: false,
  image: "/blog-images/username-security.webp"
}, {
  slug: "are-username-search-tools-accurate",
  title: "Are Username Search Tools Accurate?",
  excerpt: "An honest, data-driven assessment of username search tool accuracy. Learn why 41% of results are false positives and how confidence scoring improves reliability.",
  date: "February 13, 2026",
  readTime: "11 min read",
  category: "OSINT",
  featured: false,
  image: "/blog-images/username-security.webp"
}, {
  slug: "remove-address-from-google",
  title: "How to Remove Your Address From Google (UK & Global Guide)",
  excerpt: "Step-by-step guide to removing your home address from Google search results. Covers the Google removal tool, GDPR rights, data broker opt-outs, and what to do when Google refuses.",
  date: "February 13, 2026",
  readTime: "12 min read",
  category: "Privacy",
  featured: true,
  image: "/blog-images/digital-footprint.webp"
}, {
  slug: "what-is-osint-risk",
  title: "What is OSINT Risk? Understanding Your Digital Exposure",
  excerpt: "Learn what OSINT risk means for your business, how threat actors use open-source intelligence, and practical steps to reduce your digital attack surface.",
  date: "January 31, 2025",
  readTime: "8 min read",
  category: "Cybersecurity",
  featured: true,
  image: "/blog-images/osint.webp"
}, {
  slug: "dark-web-monitoring-explained",
  title: "Dark Web Monitoring Explained: Protecting Your Organization",
  excerpt: "Comprehensive guide to dark web monitoring - what it is, how it works, and why your organization needs it to prevent credential theft and data breaches.",
  date: "January 31, 2025",
  readTime: "10 min read",
  category: "Cybersecurity",
  featured: false,
  image: "/blog-images/dark-web.webp"
}, {
  slug: "what-is-digital-footprint",
  title: "What Is a Digital Footprint? Complete Guide 2025",
  excerpt: "Learn everything about digital footprints, why they matter for your privacy, and how to manage your online presence effectively.",
  date: "January 15, 2025",
  readTime: "8 min read",
  category: "Privacy Basics",
  featured: true
}, {
  slug: "remove-data-brokers",
  title: "How to Remove Your Personal Info from Data Brokers",
  excerpt: "Complete guide to removing your personal information from data broker websites and people search engines.",
  date: "January 14, 2025",
  readTime: "12 min read",
  category: "Privacy"
}, {
  slug: "check-email-breach",
  title: "How to Check If Your Email Was Breached",
  excerpt: "Step-by-step guide to checking if your email address was exposed in data breaches and what to do if it was compromised.",
  date: "January 12, 2025",
  readTime: "6 min read",
  category: "Security"
}, {
  slug: "dark-web-monitoring",
  title: "Dark Web Monitoring: What You Need to Know",
  excerpt: "Understanding dark web monitoring, what information criminals look for, and how to protect yourself.",
  date: "January 11, 2025",
  readTime: "9 min read",
  category: "Security"
}, {
  slug: "osint-beginners-guide",
  title: "OSINT for Beginners: Open-Source Intelligence Explained",
  excerpt: "A beginner-friendly introduction to OSINT (Open-Source Intelligence) and how it helps protect your privacy online.",
  date: "January 10, 2025",
  readTime: "10 min read",
  category: "OSINT"
}, {
  slug: "social-media-privacy",
  title: "Social Media Privacy Settings Guide 2025",
  excerpt: "Comprehensive guide to securing your Facebook, Instagram, Twitter, LinkedIn, and TikTok privacy settings.",
  date: "January 8, 2025",
  readTime: "11 min read",
  category: "Privacy"
}, {
  slug: "phone-number-privacy",
  title: "Phone Number Privacy Risks You Should Know",
  excerpt: "How your phone number can be used to track you, what data it reveals, and how to protect your mobile privacy.",
  date: "January 6, 2025",
  readTime: "7 min read",
  category: "Privacy Basics"
}, {
  slug: "username-security",
  title: "Why Username Reuse Is Dangerous for Your Privacy",
  excerpt: "Learn how reusing usernames across platforms creates security risks and how attackers exploit this vulnerability.",
  date: "January 4, 2025",
  readTime: "8 min read",
  category: "Security"
}, {
  slug: "ip-address-security",
  title: "IP Address Security: What Your IP Reveals About You",
  excerpt: "Understanding what information your IP address exposes and practical steps to protect your online anonymity.",
  date: "January 2, 2025",
  readTime: "9 min read",
  category: "Privacy Basics"
}, {
  slug: "identity-theft-response",
  title: "How to Respond to Identity Theft: Complete Action Plan",
  excerpt: "Step-by-step guide to recovering from identity theft, protecting your accounts, and preventing future incidents.",
  date: "December 30, 2024",
  readTime: "15 min read",
  category: "Security"
}];
const Blog = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "FootprintIQ Blog",
    "description": "Learn about digital privacy, OSINT, data breaches, and online security.",
    "url": "https://footprintiq.app/blog",
    "blogPost": blogPosts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "datePublished": new Date(post.date).toISOString(),
      "url": `https://footprintiq.app/blog/${post.slug}`
    }))
  };
  return <>
      <SEO 
        title="Digital Footprint Intelligence Blog — Privacy & OSINT Guides | FootprintIQ" 
        description="Digital footprint intelligence guides covering threat intelligence, how to continuously monitor digital assets, and reduce your attack surface. Expert OSINT and privacy tutorials." 
        canonical="https://footprintiq.app/blog" 
        schema={{
          organization: organizationSchema,
          custom: structuredData
        }}
      />
      
      <Header />
      
      <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent my-0 px-0">
              Digital Footprint Intelligence & Privacy Blog
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              Expert guides on threat intelligence, OSINT, and privacy protection
            </p>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Learn how to continuously monitor your digital assets, understand your attack surface, and reduce exposure. 
              Our digital footprint intelligence resources help you stay ahead of threats with actionable insights.
            </p>
          </div>

          {/* Featured Post */}
          {blogPosts.filter(post => post.featured).map(post => <article key={post.slug} className="mb-16 bg-gradient-to-br from-primary/5 via-primary-glow/5 to-accent/5 border-2 border-primary/20 rounded-3xl p-8 md:p-10 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300">
              <div className="flex items-center gap-2 text-sm mb-4">
                <span className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-bold uppercase tracking-wide">
                  Featured
                </span>
                <span className="px-3 py-1.5 bg-accent/20 text-accent-foreground rounded-full text-xs font-medium">
                  {post.category}
                </span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                <Link to={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                  {post.title}
                </Link>
              </h2>
              
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{post.excerpt}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {post.readTime}
                  </span>
                </div>
                
                <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all group">
                  Read Full Article
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>)}

          {/* All Posts */}
          <div className="grid gap-6 md:grid-cols-2">
            {blogPosts.filter(post => !post.featured).map(post => <article key={post.slug} className="group bg-card border border-border rounded-2xl p-6 hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {post.date}
                  </span>
                </div>
                
                <h2 className="text-xl font-bold mb-3 leading-snug group-hover:text-primary transition-colors">
                  <Link to={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>
                
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed line-clamp-3">{post.excerpt}</p>
                
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readTime}
                  </span>
                  
                  <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:gap-3 transition-all">
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>)}
          </div>
        </div>
      </main>

      <Footer />
    </>;
};
export default Blog;