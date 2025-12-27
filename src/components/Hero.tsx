import { Button } from "@/components/ui/button";
import { Search, Eye, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface HeroProps {
  onStartScan: () => void;
  onAdvancedScan?: () => void;
}

export const Hero = ({
  onStartScan,
  onAdvancedScan
}: HeroProps) => {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center bg-background">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center">
        {/* Main headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight text-foreground">
          Understand Your Digital Exposure
          <span className="block text-primary mt-2">Before It Becomes a Problem</span>
        </h1>
        
        {/* Subheading */}
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto leading-relaxed">
          FootprintIQ surfaces publicly observable digital exposure across the web — without assumptions, accusations, or automation of harm.
        </p>
        
        {/* Transparency line */}
        <p className="text-base text-muted-foreground/80 mb-10 max-w-2xl mx-auto">
          We provide visibility. You make the decisions.
        </p>
        
        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button 
            size="lg" 
            onClick={onStartScan} 
            className="w-full sm:w-auto text-lg px-8 py-6 h-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" 
            asChild
          >
            <Link to="/auth">
              <Search className="w-5 h-5 mr-2" />
              Run a Free Exposure Scan
            </Link>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="w-full sm:w-auto text-lg px-8 py-6 h-auto border-2 hover:bg-muted" 
            asChild
          >
            <Link to="/dashboard">
              <Eye className="w-5 h-5 mr-2" />
              Explore Investigator Mode
            </Link>
          </Button>
        </div>
        
        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span>Human-led interpretation</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span>Public sources only</span>
          </div>
        </div>
      </div>
    </section>
  );
};
