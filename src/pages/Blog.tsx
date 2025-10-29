import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const blogPosts = [
  {
    slug: "what-is-digital-footprint",
    title: "What Is a Digital Footprint? Complete Guide 2025",
    excerpt: "Learn everything about digital footprints, why they matter for your privacy, and how to manage your online presence effectively.",
    date: "January 15, 2025",
    readTime: "8 min read",
    category: "Privacy Basics",
    featured: true,
  },
  {
    slug: "remove-data-brokers",
    title: "How to Remove Your Personal Info from Data Brokers",
    excerpt: "Complete guide to removing your personal information from data broker websites and people search engines.",
    date: "January 14, 2025",
    readTime: "12 min read",
    category: "Privacy",
  },
  {
    slug: "check-email-breach",
    title: "How to Check If Your Email Was Breached",
    excerpt: "Step-by-step guide to checking if your email address was exposed in data breaches and what to do if it was compromised.",
    date: "January 12, 2025",
    readTime: "6 min read",
    category: "Security",
  },
  {
    slug: "dark-web-monitoring",
    title: "Dark Web Monitoring: What You Need to Know",
    excerpt: "Understanding dark web monitoring, what information criminals look for, and how to protect yourself.",
    date: "January 11, 2025",
    readTime: "9 min read",
    category: "Security",
  },
  {
    slug: "osint-beginners-guide",
    title: "OSINT for Beginners: Open-Source Intelligence Explained",
    excerpt: "A beginner-friendly introduction to OSINT (Open-Source Intelligence) and how it helps protect your privacy online.",
    date: "January 10, 2025",
    readTime: "10 min read",
    category: "OSINT",
  },
  {
    slug: "social-media-privacy",
    title: "Social Media Privacy Settings Guide 2025",
    excerpt: "Comprehensive guide to securing your Facebook, Instagram, Twitter, LinkedIn, and TikTok privacy settings.",
    date: "January 8, 2025",
    readTime: "11 min read",
    category: "Privacy",
  },
  {
    slug: "phone-number-privacy",
    title: "Phone Number Privacy Risks You Should Know",
    excerpt: "How your phone number can be used to track you, what data it reveals, and how to protect your mobile privacy.",
    date: "January 6, 2025",
    readTime: "7 min read",
    category: "Privacy Basics",
  },
  {
    slug: "username-security",
    title: "Why Username Reuse Is Dangerous for Your Privacy",
    excerpt: "Learn how reusing usernames across platforms creates security risks and how attackers exploit this vulnerability.",
    date: "January 4, 2025",
    readTime: "8 min read",
    category: "Security",
  },
  {
    slug: "ip-address-security",
    title: "IP Address Security: What Your IP Reveals About You",
    excerpt: "Understanding what information your IP address exposes and practical steps to protect your online anonymity.",
    date: "January 2, 2025",
    readTime: "9 min read",
    category: "Privacy Basics",
  },
  {
    slug: "identity-theft-response",
    title: "How to Respond to Identity Theft: Complete Action Plan",
    excerpt: "Step-by-step guide to recovering from identity theft, protecting your accounts, and preventing future incidents.",
    date: "December 30, 2024",
    readTime: "15 min read",
    category: "Security",
  },
];

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
      "url": `https://footprintiq.app/blog/${post.slug}`,
    })),
  };

  return (
    <>
      <SEO
        title="Blog - Digital Privacy & OSINT Guides | FootprintIQ"
        description="Learn about digital footprints, OSINT, data breaches, and online privacy protection. Expert guides and tutorials for staying safe online."
        canonical="https://footprintiq.app/blog"
        structuredData={structuredData}
      />
      
      <Header />
      
      <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              Privacy & Security Blog
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Expert guides on digital footprints, OSINT, and online privacy protection
            </p>
          </div>

          {/* Featured Post */}
          {blogPosts.filter(post => post.featured).map((post) => (
            <article
              key={post.slug}
              className="mb-16 bg-gradient-to-br from-primary/5 via-primary-glow/5 to-accent/5 border-2 border-primary/20 rounded-3xl p-8 md:p-10 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300"
            >
              <div className="flex items-center gap-2 text-sm mb-4">
                <span className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-bold uppercase tracking-wide">
                  Featured
                </span>
                <span className="px-3 py-1.5 bg-accent/20 text-accent-foreground rounded-full text-xs font-medium">
                  {post.category}
                </span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                <Link
                  to={`/blog/${post.slug}`}
                  className="hover:text-primary transition-colors"
                >
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
                
                <Link
                  to={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all group"
                >
                  Read Full Article
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))}

          {/* All Posts */}
          <div className="grid gap-6 md:grid-cols-2">
            {blogPosts.filter(post => !post.featured).map((post) => (
              <article
                key={post.slug}
                className="group bg-card border border-border rounded-2xl p-6 hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
              >
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
                  
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:gap-3 transition-all"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Blog;
