import { SEO } from '@/components/SEO';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, Users, Zap, Lock, Globe, BarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC 2 Type II compliant with advanced encryption, SSO, and audit logging.',
  },
  {
    icon: Users,
    title: 'Multi-Workspace Management',
    description: 'Manage multiple teams with role-based access control and seat management.',
  },
  {
    icon: Zap,
    title: 'REST API Access',
    description: 'Full API access with rate limiting, webhooks, and comprehensive documentation.',
  },
  {
    icon: Lock,
    title: 'White-Label Reports',
    description: 'Custom branding, domain, and report templates for your organization.',
  },
  {
    icon: Globe,
    title: 'Global Coverage',
    description: 'Multi-region deployment with 99.9% uptime SLA and 24/7 support.',
  },
  {
    icon: BarChart,
    title: 'Advanced Analytics',
    description: 'Custom dashboards, forecasting, and usage analytics for your team.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'FootprintIQ Enterprise',
  description: 'Enterprise OSINT and digital footprint intelligence platform',
  brand: { '@type': 'Brand', name: 'FootprintIQ' },
  offers: {
    '@type': 'Offer',
    price: 'Contact',
    priceCurrency: 'GBP',
    availability: 'https://schema.org/InStock',
  },
};

export default function Enterprise() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Enterprise Solutions | FootprintIQ"
        description="Enterprise-grade OSINT platform with API access, SSO, multi-workspace management, and white-label reporting."
      />
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Enterprise OSINT Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Built for security teams, investigators, and organizations requiring
              advanced threat intelligence and scalable infrastructure.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/pricing')}>
                View Pricing
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/support')}>
                Contact Sales
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-4 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Enterprise Features
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <Card key={i} className="p-6 hover:shadow-lg transition-shadow">
                  <feature.icon className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Integration */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Seamless Integration
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Integrate FootprintIQ into your existing security stack with our
              REST API, webhooks, and SIEM connectors.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/api-docs')}>
                API Documentation
              </Button>
              <Button variant="outline" onClick={() => navigate('/integrations')}>
                View Integrations
              </Button>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to secure your organization?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join leading enterprises protecting their digital footprint with FootprintIQ.
            </p>
            <Button size="lg" variant="secondary" onClick={() => navigate('/support')}>
              Schedule a Demo
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
