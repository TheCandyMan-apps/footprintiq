import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, FileCheck, Award, Eye, Database, UserCheck, Clock } from 'lucide-react';

export default function Trust() {
  const securityFeatures = [
    {
      icon: Lock,
      title: 'AES-256 Encryption',
      description: 'All data is encrypted at rest and in transit using industry-standard AES-256 encryption, ensuring your information remains secure.',
      badge: 'Active',
      color: 'text-blue-500',
    },
    {
      icon: Eye,
      title: 'No Logs Policy',
      description: 'We do not store your search queries or personal information. Scan results are temporarily processed and immediately deleted after viewing.',
      badge: 'Enforced',
      color: 'text-green-500',
    },
    {
      icon: FileCheck,
      title: 'GDPR Compliant',
      description: 'Fully compliant with GDPR regulations. We respect your data rights including access, rectification, erasure, and portability.',
      badge: 'Certified',
      color: 'text-purple-500',
    },
    {
      icon: Award,
      title: 'SOC 2 Ready',
      description: 'Following SOC 2 Type II security controls and best practices to ensure the highest level of data protection and operational security.',
      badge: 'In Progress',
      color: 'text-orange-500',
    },
  ];

  const privacyPractices = [
    {
      icon: Database,
      title: 'Minimal Data Collection',
      description: 'We only collect the minimum data necessary to perform your scan. No unnecessary tracking or profiling.',
    },
    {
      icon: UserCheck,
      title: 'User Control',
      description: 'You maintain full control over your data. Request deletion at any time through your account settings.',
    },
    {
      icon: Clock,
      title: 'Automatic Data Deletion',
      description: 'Scan data is automatically purged after 90 days. Search terms are never stored.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Trust & Security - FootprintIQ"
        description="Learn about our security measures, privacy practices, and compliance certifications. Your data security is our top priority."
      />
      
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-6 bg-gradient-to-b from-background to-secondary/20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Security & Privacy</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Your Trust is Our Priority
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We implement industry-leading security measures and privacy practices to protect your data at every step.
            </p>
          </div>
        </section>

        {/* Security Features */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Security Certifications</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {securityFeatures.map((feature, index) => (
                <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg bg-muted ${feature.color}`}>
                          <feature.icon className="w-6 h-6" />
                        </div>
                        <CardTitle>{feature.title}</CardTitle>
                      </div>
                      <Badge variant="secondary">{feature.badge}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Privacy Practices */}
        <section className="py-20 px-6 bg-secondary/20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Privacy Practices</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {privacyPractices.map((practice, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <practice.icon className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-lg">{practice.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{practice.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Data Protection Statement */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl">Our Commitment to Your Privacy</CardTitle>
                <CardDescription>What we do and don't do with your data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-green-500">✓ What We Do:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Encrypt all data with AES-256 encryption</li>
                    <li>• Process scans in secure, isolated environments</li>
                    <li>• Automatically delete search queries immediately after use</li>
                    <li>• Provide full transparency in our data handling</li>
                    <li>• Give you complete control over your data</li>
                  </ul>
                </div>
                
                <div className="space-y-3 pt-4 border-t">
                  <h3 className="font-semibold text-red-500">✗ What We Don't Do:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Store your search terms or queries</li>
                    <li>• Share your data with third parties for marketing</li>
                    <li>• Track your browsing behavior outside our platform</li>
                    <li>• Sell or monetize your personal information</li>
                    <li>• Use your data to train AI models without consent</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 px-6 bg-secondary/20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Questions About Security?</h2>
            <p className="text-muted-foreground mb-8">
              Our security team is here to answer any questions you may have about our practices.
            </p>
            <a 
              href="mailto:security@footprintiq.app" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <Shield className="w-5 h-5" />
              Contact Security Team
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
