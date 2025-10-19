import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Video, FileText, ArrowRight, Download } from "lucide-react";
import { Link } from "react-router-dom";

const resources = [
  {
    type: "Blog",
    title: "Understanding Your Digital Footprint",
    description: "Learn what data is collected about you online and how to minimize your exposure",
    icon: BookOpen,
    link: "/blog",
    date: "2024-03-15"
  },
  {
    type: "Webinar",
    title: "Enterprise Privacy Best Practices",
    description: "90-minute deep dive into corporate digital privacy management",
    icon: Video,
    link: "/resources/webinars",
    date: "2024-03-10"
  },
  {
    type: "Whitepaper",
    title: "The State of Digital Privacy 2024",
    description: "Comprehensive analysis of privacy trends and threats across industries",
    icon: FileText,
    link: "#",
    date: "2024-02-28"
  },
  {
    type: "Guide",
    title: "OSINT Investigation Handbook",
    description: "Complete guide to conducting ethical open-source intelligence research",
    icon: BookOpen,
    link: "#",
    date: "2024-02-15"
  }
];

const ResourcesIndex = () => {
  return (
    <>
      <SEO
        title="Resources — FootprintIQ"
        description="Access blogs, whitepapers, webinars, and guides on digital privacy, OSINT, and data protection best practices."
        canonical="https://footprintiq.app/resources"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="py-20 px-6 bg-gradient-to-br from-primary/5 via-background to-accent/5">
            <div className="max-w-4xl mx-auto text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-6 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Resources & Insights
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Stay informed with the latest insights on digital privacy, OSINT, and data protection
              </p>
            </div>
          </section>

          {/* Featured Resource */}
          <section className="py-16 px-6">
            <div className="max-w-6xl mx-auto">
              <Card className="p-8 bg-gradient-card mb-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <span className="text-sm font-medium text-primary">Featured Whitepaper</span>
                    <h2 className="text-3xl font-bold mt-2 mb-4">
                      The State of Digital Privacy 2024
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Our comprehensive 50-page analysis covers emerging privacy threats, 
                      regulatory changes, and best practices for individuals and organizations.
                    </p>
                    <div className="flex gap-4">
                      <Button>
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button variant="outline">
                        Read Online
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <FileText className="w-24 h-24 text-muted-foreground" />
                  </div>
                </div>
              </Card>

              {/* Resource Categories */}
              <div className="grid gap-4 md:grid-cols-3 mb-12">
                <Link to="/blog">
                  <Card className="p-6 hover:shadow-glow transition-all cursor-pointer h-full">
                    <BookOpen className="w-8 h-8 text-primary mb-3" />
                    <h3 className="text-xl font-bold mb-2">Blog</h3>
                    <p className="text-muted-foreground">
                      Expert insights and privacy tips
                    </p>
                  </Card>
                </Link>

                <Link to="/resources/webinars">
                  <Card className="p-6 hover:shadow-glow transition-all cursor-pointer h-full">
                    <Video className="w-8 h-8 text-primary mb-3" />
                    <h3 className="text-xl font-bold mb-2">Webinars</h3>
                    <p className="text-muted-foreground">
                      Live and recorded training sessions
                    </p>
                  </Card>
                </Link>

                <Card className="p-6 hover:shadow-glow transition-all cursor-pointer">
                  <FileText className="w-8 h-8 text-primary mb-3" />
                  <h3 className="text-xl font-bold mb-2">Whitepapers</h3>
                  <p className="text-muted-foreground">
                    In-depth research and analysis
                  </p>
                </Card>
              </div>

              {/* All Resources */}
              <h2 className="text-2xl font-bold mb-6">Latest Resources</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {resources.map((resource) => {
                  const Icon = resource.icon;
                  return (
                    <Card key={resource.title} className="p-6 hover:shadow-glow transition-all">
                      <div className="flex items-start gap-4">
                        <Icon className="w-8 h-8 text-primary flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-xs font-medium text-primary">{resource.type}</span>
                          <h3 className="text-lg font-bold mt-1 mb-2">{resource.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {resource.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{resource.date}</span>
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={resource.link}>
                                View <ArrowRight className="w-4 h-4 ml-1" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ResourcesIndex;
