import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PARTNER_TIERS } from "@/lib/partners";
import { Handshake, TrendingUp, Users, Award, CheckCircle, ArrowRight } from "lucide-react";

const PartnersIndex = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    website: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('send-support-email', {
        body: {
          name: formData.name,
          email: formData.email,
          issueType: 'partnership',
          subject: `Partner Application: ${formData.company}`,
          message: `Company: ${formData.company}\nWebsite: ${formData.website}\n\n${formData.message}`
        }
      });

      if (error) throw error;

      toast({
        title: "Application Submitted",
        description: "We'll review your application and get back to you within 2 business days."
      });

      setFormData({ name: "", email: "", company: "", website: "", message: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Partner Program — FootprintIQ"
        description="Join FootprintIQ's partner network. Earn commissions, access exclusive resources, and help protect digital privacy worldwide."
        canonical="https://footprintiq.app/partners"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="py-20 px-6 bg-gradient-to-br from-primary/5 via-background to-accent/5">
            <div className="max-w-4xl mx-auto text-center">
              <Handshake className="w-16 h-16 mx-auto mb-6 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Partner with FootprintIQ
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Join our partner network and help organizations worldwide protect their digital privacy. Earn competitive commissions while making a meaningful impact.
              </p>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="py-16 px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Why Partner with Us?</h2>
              
              <div className="grid md:grid-cols-3 gap-8 mb-16">
                <Card className="p-6 text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-3">Competitive Commissions</h3>
                  <p className="text-muted-foreground">
                    Earn up to 30% recurring commission on every client you refer
                  </p>
                </Card>

                <Card className="p-6 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-3">Dedicated Support</h3>
                  <p className="text-muted-foreground">
                    Get priority support and a dedicated partner success manager
                  </p>
                </Card>

                <Card className="p-6 text-center">
                  <Award className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-3">Growth Opportunities</h3>
                  <p className="text-muted-foreground">
                    Access exclusive training, co-marketing, and business development
                  </p>
                </Card>
              </div>

              {/* Partner Tiers */}
              <h2 className="text-3xl font-bold text-center mb-12">Partner Tiers</h2>
              
              <div className="grid md:grid-cols-3 gap-8 mb-16">
                {PARTNER_TIERS.map((tier, index) => (
                  <Card key={tier.name} className={`p-8 ${index === 1 ? 'border-primary shadow-glow' : ''}`}>
                    <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                    <p className="text-3xl font-bold text-primary mb-4">{tier.commission}%</p>
                    <p className="text-sm text-muted-foreground mb-6">
                      {tier.minClients}{tier.maxClients ? `-${tier.maxClients}` : '+'} clients
                    </p>
                    
                    <ul className="space-y-3">
                      {tier.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>

              {/* Application Form */}
              <Card className="p-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-center">Apply to Become a Partner</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name *</label>
                    <Input
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="ACME Corp"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Website</label>
                    <Input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://yourcompany.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Why do you want to partner with us? *</label>
                    <Textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your experience and why you'd be a great partner..."
                      rows={4}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </Card>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PartnersIndex;
