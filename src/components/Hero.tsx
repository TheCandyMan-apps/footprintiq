import { Button } from "@/components/ui/button";
import { CheckCircle, ShieldCheck, Scan, ArrowRight } from "lucide-react";
import { HeroInputField } from "@/components/HeroInputField";
import { Link } from "react-router-dom";

interface HeroProps {
  onStartScan?: () => void;
  onAdvancedScan?: () => void;
}

export const Hero = ({
  onStartScan,
  onAdvancedScan
}: HeroProps) => {
  return (
    <section className="relative min-h-[80svh] md:min-h-[85vh] flex items-center justify-center bg-background">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center">
        {/* Platform positioning */}
        <p className="text-sm font-medium uppercase tracking-widest text-primary mb-4">
          Ethical Digital Footprint Scanner
        </p>

        {/* Main headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight tracking-tight text-foreground">
          Map It. Prioritize It.
          <span className="block text-primary mt-2">Reduce It.</span>
        </h1>

        {/* Category line */}
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-6 max-w-3xl mx-auto leading-relaxed">
          Ethical OSINT for self-protection — scan your public exposure and reduce risk.
        </p>
        
        {/* Subheading */}
        <p className="text-base text-muted-foreground/80 mb-8 max-w-2xl mx-auto">
          See what attackers see before they act. Triage your digital risks before you pay for removals.
        </p>

        {/* 3-bullet differentiator block */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground mb-10 max-w-3xl mx-auto">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
            Not a people-search / background check site
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
            No covert surveillance or private data access
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
            Built for self-assessment, safety planning, and risk reduction
          </span>
        </div>
        
        {/* CTA row */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 h-auto active:scale-[0.97] transition-transform"
            asChild
          >
            <Link to="/free-scan">
              <Scan className="w-5 h-5 mr-2" />
              Run a Free Scan
            </Link>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-8 py-6 h-auto border-2 hover:bg-muted active:scale-[0.97] transition-transform" 
            asChild
          >
            <Link to="/trust-safety">
              See Trust &amp; Safety
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Social proof */}
        <p className="text-sm text-muted-foreground/60 mb-6">
          Used by over 2,000 people to understand their online visibility.
        </p>
        
        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span>Free to use</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span>No sign-up required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span>Public data only</span>
          </div>
        </div>
      </div>
    </section>
  );
};
