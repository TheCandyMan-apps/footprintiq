import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import premiumReport from "@/assets/premium-report.jpg";

export const PremiumTeaser = () => {
  return (
    <section className="relative py-20 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content Side */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Premium Features</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Unlock{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                Premium Features
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8">
              Take your OSINT capabilities to the next level with advanced intelligence and unlimited access
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-1 mt-1">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">20+ Premium APIs & Data Sources</p>
                  <p className="text-sm text-muted-foreground">Access advanced OSINT tools and enrichment databases</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-1 mt-1">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Real-time Dark Web Monitoring</p>
                  <p className="text-sm text-muted-foreground">Continuous surveillance of dark web marketplaces and forums</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-1 mt-1">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Unlimited Scans & AI Analysis</p>
                  <p className="text-sm text-muted-foreground">No limits on scans, queries, or AI-powered threat intelligence</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-1 mt-1">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Advanced Reporting & White-label</p>
                  <p className="text-sm text-muted-foreground">Professional PDF reports with custom branding options</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-1 mt-1">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Team Collaboration & Admin Tools</p>
                  <p className="text-sm text-muted-foreground">Manage workspaces, permissions, and team workflows</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/pricing">
                  Upgrade to Premium
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/features">View All Features</Link>
              </Button>
            </div>
          </div>

          {/* Image Side */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-3xl" />
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl">
              <div className="absolute inset-0 backdrop-blur-sm bg-background/30 z-10" />
              <img 
                src={premiumReport} 
                alt="Advanced security report preview" 
                className="w-full h-auto blur-sm"
              />
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="text-center bg-background/90 backdrop-blur-md rounded-xl p-6 border border-primary/20">
                  <Zap className="w-12 h-12 text-primary mx-auto mb-3" />
                  <p className="font-semibold text-lg mb-2">Premium Feature</p>
                  <p className="text-sm text-muted-foreground">Upgrade to unlock advanced reports</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
