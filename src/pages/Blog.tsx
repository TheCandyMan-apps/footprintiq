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
    slug: "osint-beginners-guide",
    title: "OSINT for Beginners: Open-Source Intelligence Explained",
    excerpt: "A beginner-friendly introduction to OSINT (Open-Source Intelligence) and how it helps protect your privacy online.",
    date: "January 10, 2025",
    readTime: "10 min read",
    category: "OSINT",
  },
];

const Blog = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "FootprintIQ Blog",
    "description": "Learn about digital privacy, OSINT, data breaches, and online security.",
    "url": "https://footprintiq.com/blog",
    "blogPost": blogPosts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "datePublished": new Date(post.date).toISOString(),
      "url": `https://footprintiq.com/blog/${post.slug}`,
    })),
  };

  return (
    <>
      <SEO
        title="Blog - Digital Privacy & OSINT Guides | FootprintIQ"
        description="Learn about digital footprints, OSINT, data breaches, and online privacy protection. Expert guides and tutorials for staying safe online."
        canonical="https://footprintiq.com/blog"
        structuredData={structuredData}
      />
      
      <Header />
      
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Privacy & Security Blog
            </h1>
            <p className="text-xl text-muted-foreground">
              Expert guides on digital footprints, OSINT, and online privacy
            </p>
          </div>

          <div className="space-y-8">
            {blogPosts.map((post) => (
              <article
                key={post.slug}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
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
                
                <h2 className="text-2xl font-bold mb-3">
                  <Link
                    to={`/blog/${post.slug}`}
                    className="hover:text-primary transition-colors"
                  >
                    {post.title}
                  </Link>
                </h2>
                
                <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                
                <Link
                  to={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
                >
                  Read Article
                  <ArrowRight className="w-4 h-4" />
                </Link>
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
