import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { StructuredData, organizationSchema } from "@/components/StructuredData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { ReactNode } from "react";

interface RelatedArticle {
  href: string;
  title: string;
  description: string;
  badge?: string;
}

interface CTAButton {
  href: string;
  label: string;
  variant?: "default" | "outline";
}

interface BlogLayoutProps {
  // SEO & Meta
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  publishedTime: string;
  modifiedTime?: string;
  keywords: string;
  
  // Header display
  category: string;
  categoryBadgeStyle?: string;
  secondaryBadge?: string;
  displayDate: string;
  readTime: string;
  
  // Hero
  heroImage: string;
  heroAlt: string;
  
  // Content
  children: ReactNode;
  
  // CTA Section
  ctaTitle: string;
  ctaDescription: string;
  ctaButtons: CTAButton[];
  
  // Related Articles
  relatedArticles: RelatedArticle[];
  
  // Tags for SEO
  tags: string[];
}

export function BlogLayout({
  title,
  description,
  canonical,
  ogImage,
  publishedTime,
  modifiedTime,
  keywords,
  category,
  categoryBadgeStyle = "bg-primary/10 text-primary hover:bg-primary/20",
  secondaryBadge,
  displayDate,
  readTime,
  heroImage,
  heroAlt,
  children,
  ctaTitle,
  ctaDescription,
  ctaButtons,
  relatedArticles,
  tags,
}: BlogLayoutProps) {
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
        name: title
      }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    image: ogImage,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      "@type": "Organization",
      name: "FootprintIQ"
    },
    publisher: organizationSchema,
    keywords
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <SEO 
        title={`${title} | FootprintIQ`}
        description={description}
        canonical={canonical}
        ogImage={ogImage}
        article={{
          publishedTime,
          modifiedTime: modifiedTime || publishedTime,
          author: "FootprintIQ",
          tags
        }}
      />
      <StructuredData 
        organization={organizationSchema}
        breadcrumbs={breadcrumbs}
        custom={articleSchema}
      />
      <Header />
      
      <main className="flex-1">
        <article className="max-w-4xl mx-auto px-6 py-12">
          {/* Back Link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>

          {/* Header Meta */}
          <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
            <Badge className={categoryBadgeStyle}>{category}</Badge>
            {secondaryBadge && <Badge variant="outline">{secondaryBadge}</Badge>}
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {displayDate}
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4" />
              {readTime}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {title}
          </h1>

          {/* Gradient Divider */}
          <div className="h-1 w-24 bg-gradient-to-r from-primary via-primary-glow to-accent rounded-full mb-8"></div>

          {/* Featured Image */}
          <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl border-2 border-border/50">
            <img 
              src={heroImage} 
              alt={heroAlt}
              className="w-full h-auto object-cover"
              loading="eager"
            />
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none 
            prose-headings:font-bold prose-headings:tracking-tight
            prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b prose-h2:border-border
            prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-primary
            prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:text-base prose-p:my-4
            prose-ul:my-6 prose-ol:my-6
            prose-li:text-muted-foreground prose-li:my-2 prose-li:leading-relaxed
            prose-strong:text-foreground prose-strong:font-semibold
            prose-a:text-primary prose-a:no-underline prose-a:font-medium hover:prose-a:underline">
            {children}
          </div>

          {/* CTA Section */}
          <div className="mt-16 p-8 bg-gradient-to-br from-primary/5 via-primary-glow/5 to-accent/5 rounded-3xl border-2 border-primary/20">
            <h3 className="text-2xl font-bold mb-3">{ctaTitle}</h3>
            <p className="text-muted-foreground mb-6 text-lg">{ctaDescription}</p>
            <div className="flex flex-wrap gap-4">
              {ctaButtons.map((button, index) => (
                <Button 
                  key={index} 
                  asChild 
                  size="lg" 
                  variant={button.variant || "default"} 
                  className="font-semibold"
                >
                  <Link to={button.href}>{button.label}</Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Related Articles */}
          <div className="mt-16 pt-8 border-t border-border">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {relatedArticles.map((article, index) => (
                <Link key={index} to={article.href} className="group">
                  <Card className="p-6 hover:shadow-lg hover:border-primary/30 transition-all h-full">
                    {article.badge && (
                      <Badge className="mb-3 bg-primary/10 text-primary">{article.badge}</Badge>
                    )}
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{article.description}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </article>
      </main>
      
      <Footer />
    </div>
  );
}

// Reusable components for blog content
export function BlogLead({ children }: { children: ReactNode }) {
  return (
    <p className="text-xl leading-relaxed !text-foreground/80 !my-8">
      {children}
    </p>
  );
}

export function BlogQuote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="border-l-4 border-primary pl-6 my-8 italic text-lg">
      {children}
    </blockquote>
  );
}

export function BlogWarning({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 my-8">
      <p className="!text-destructive font-semibold !my-0">⚠️ {title}</p>
      <div className="!my-2">{children}</div>
    </div>
  );
}

export function BlogInfo({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 my-8">
      <p className="!text-primary font-semibold !my-0">💡 {title}</p>
      <div className="!my-2">{children}</div>
    </div>
  );
}
