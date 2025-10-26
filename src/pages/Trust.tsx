import { SEO } from '@/components/SEO';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Eye, FileCheck, Server, Users, AlertTriangle, Check } from 'lucide-react';

export default function Trust() {
  return (
    <>
      <SEO
        title="Trust & Security"
        description="Learn about FootprintIQ's security practices, compliance, and data protection measures"
      />
      
      <div className="container py-12 max-w-5xl">
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="outline">
            <Shield className="w-3 h-3 mr-1" />
            Trust Center
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Security & Trust</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your security is our priority. Learn how we protect your data and maintain the highest security standards.
          </p>
        </div>

        <div className="grid gap-6 mb-12">
          <Card className="p-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">Data Encryption</h2>
                <p className="text-muted-foreground mb-4">
                  All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. 
                  We never store unencrypted sensitive information.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>TLS 1.3 for all network communications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>AES-256 encryption for data at rest</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Encrypted database backups with key rotation</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">Privacy by Design</h2>
                <p className="text-muted-foreground mb-4">
                  We implement privacy-first principles in everything we build. Your data is never sold or shared with third parties.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Automatic PII redaction in logs and reports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Configurable data retention policies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>GDPR and CCPA compliant by default</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <FileCheck className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">Compliance & Certifications</h2>
                <p className="text-muted-foreground mb-4">
                  We maintain industry-standard certifications and undergo regular third-party audits.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">SOC 2 Type II</h3>
                    <p className="text-sm text-muted-foreground">
                      Annual certification for security, availability, and confidentiality
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">GDPR Compliant</h3>
                    <p className="text-sm text-muted-foreground">
                      Full compliance with EU data protection regulations
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">CCPA Compliant</h3>
                    <p className="text-sm text-muted-foreground">
                      California Consumer Privacy Act compliance
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">ISO 27001</h3>
                    <p className="text-sm text-muted-foreground">
                      Information security management certification
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Server className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">Infrastructure Security</h2>
                <p className="text-muted-foreground mb-4">
                  Our infrastructure is built on enterprise-grade cloud providers with multiple layers of security.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Multi-region redundancy and failover</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>24/7 security monitoring and threat detection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Regular penetration testing and vulnerability scans</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>DDoS protection and rate limiting</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">Access Control</h2>
                <p className="text-muted-foreground mb-4">
                  Enterprise-grade access controls with role-based permissions and audit logging.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Role-based access control (RBAC)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>SSO and SAML integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Multi-factor authentication (MFA)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Comprehensive audit trail for all actions</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <AlertTriangle className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">Incident Response</h2>
                <p className="text-muted-foreground mb-4">
                  We have a dedicated security team and incident response plan to handle any security events.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>24/7 security operations center</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Documented incident response procedures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Customer notification within 72 hours of breach</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Bug bounty program for responsible disclosure</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-8 bg-muted/50">
          <h2 className="text-xl font-semibold mb-4">Questions or Security Concerns?</h2>
          <p className="text-muted-foreground mb-4">
            Our security team is here to help. If you have questions about our security practices or 
            need to report a vulnerability, please contact us.
          </p>
          <div className="flex gap-4">
            <a 
              href="mailto:security@footprintiq.com"
              className="text-primary hover:underline font-medium"
            >
              security@footprintiq.com
            </a>
          </div>
        </Card>
      </div>
    </>
  );
}
