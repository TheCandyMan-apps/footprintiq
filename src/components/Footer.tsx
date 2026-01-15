import { Shield, Mail, Twitter, Linkedin, Github } from "lucide-react";
import { Link } from "react-router-dom";
import { TrustBadges } from "./TrustBadges";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-accent">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Trust Badges - Horizontal Scroll */}
        <div className="mb-10">
          <TrustBadges variant="scroll" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-center md:text-left">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
              <img 
                src="/logo-dark-optimized.webp" 
                alt="FootprintIQ Logo"
                width={180}
                height={51}
                loading="lazy"
                decoding="async"
                className="h-16 w-auto object-contain max-w-[180px] drop-shadow-sm"
              />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Understand your digital footprint with comprehensive OSINT-based visibility analysis.
            </p>
            <div className="flex gap-3 justify-center md:justify-start">
              <a href="https://twitter.com/footprintiq" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-transform hover:rotate-12">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="https://linkedin.com/company/footprintiq" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-transform hover:rotate-12">
                <Linkedin className="w-6 h-6" />
              </a>
              <a href="https://github.com/footprintiq" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-transform hover:rotate-12">
                <Github className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/" onClick={() => {
                  setTimeout(() => {
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }} className="hover:text-primary transition-colors">How It Works</Link>
              </li>
              <li>
                <Link to="/sample-report" className="hover:text-primary transition-colors">Sample Report</Link>
              </li>
              <li><Link to="/auth" className="hover:text-primary transition-colors">Get Started</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link to="/api-docs" className="hover:text-primary transition-colors">API Docs</Link></li>
              <li><Link to="/how-we-source-data" className="hover:text-primary transition-colors">How We Source Data</Link></li>
              <li><Link to="/support" className="hover:text-primary transition-colors">Support</Link></li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <h3 className="font-semibold mb-4">Legal & Trust</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/responsible-use" className="hover:text-primary transition-colors">Responsible Use</Link></li>
              <li><Link to="/trust" className="hover:text-primary transition-colors">Trust & Security</Link></li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="py-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground mb-2">
            FootprintIQ provides visibility into publicly available information only.
          </p>
          <p className="text-sm text-muted-foreground mb-2">
            It does not identify criminal activity, victims, or perpetrators.
          </p>
          <p className="text-sm text-muted-foreground font-medium">
            All findings require independent verification.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 FootprintIQ. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <a href="mailto:support@footprintiq.app" className="hover:text-primary transition-colors">
                support@footprintiq.app
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
