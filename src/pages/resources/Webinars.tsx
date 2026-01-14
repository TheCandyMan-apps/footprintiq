import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Video, Calendar, Clock, Users, Play } from "lucide-react";

const upcomingWebinars = [
  {
    title: "Advanced OSINT Techniques for 2024",
    date: "2024-04-15",
    time: "2:00 PM EST",
    duration: "90 minutes",
    attendees: 156,
    description: "Learn cutting-edge open-source intelligence methods from industry experts",
    status: "upcoming"
  },
  {
    title: "Enterprise Data Protection Strategies",
    date: "2024-04-22",
    time: "1:00 PM EST",
    duration: "60 minutes",
    attendees: 89,
    description: "Protecting corporate digital assets in an era of increasing exposure",
    status: "upcoming"
  }
];

const pastWebinars = [
  {
    title: "Introduction to Digital Privacy Auditing",
    date: "2024-03-08",
    duration: "75 minutes",
    views: 2341,
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
    description: "Comprehensive guide to conducting privacy audits for individuals and organizations"
  },
  {
    title: "Understanding Data Broker Networks",
    date: "2024-02-15",
    duration: "60 minutes",
    views: 1876,
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
    description: "Deep dive into how data brokers operate and how to remove your information"
  }
];

const WebinarsPage = () => {
  return (
    <>
      <SEO
        title="Privacy & OSINT Webinars — FootprintIQ Training"
        description="Join live and on-demand webinars on OSINT techniques, data protection, and enterprise privacy strategies. Expert-led training sessions."
        canonical="https://footprintiq.app/resources/webinars"
        schema={{
          breadcrumbs: {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app/" },
              { "@type": "ListItem", position: 2, name: "Resources", item: "https://footprintiq.app/resources" },
              { "@type": "ListItem", position: 3, name: "Webinars", item: "https://footprintiq.app/resources/webinars" }
            ]
          }
        }}
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="py-20 px-6 bg-gradient-to-br from-primary/5 via-background to-accent/5">
            <div className="max-w-4xl mx-auto text-center">
              <Video className="w-16 h-16 mx-auto mb-6 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Expert Webinars
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Learn from industry experts through live sessions and on-demand recordings
              </p>
            </div>
          </section>

          {/* Upcoming Webinars */}
          <section className="py-16 px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Upcoming Webinars</h2>
              
              <div className="space-y-6 mb-16">
                {upcomingWebinars.map((webinar) => (
                  <Card key={webinar.title} className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-3">
                          Upcoming
                        </span>
                        <h3 className="text-2xl font-bold mb-3">{webinar.title}</h3>
                        <p className="text-muted-foreground mb-4">{webinar.description}</p>
                        
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>{webinar.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>{webinar.time} • {webinar.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            <span>{webinar.attendees} registered</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center md:justify-end">
                        <Button size="lg">
                          Register Now
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Past Webinars */}
              <h2 className="text-3xl font-bold mb-8">On-Demand Recordings</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {pastWebinars.map((webinar) => (
                  <Card key={webinar.title} className="overflow-hidden hover:shadow-glow transition-all">
                    <div className="aspect-video bg-muted relative group cursor-pointer">
                      <img 
                        src={webinar.thumbnail} 
                        alt={webinar.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-16 h-16 text-white" />
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2">{webinar.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {webinar.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{webinar.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{webinar.views} views</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default WebinarsPage;
