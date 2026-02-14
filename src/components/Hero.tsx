import { Button } from "@/components/ui/button";
import { Eye, CheckCircle } from "lucide-react";
import { PLATFORM_DESCRIPTION_SHORT } from "@/lib/platformDescription";
import { HeroInputField } from "@/components/HeroInputField";

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
        {/* Main headline */}
        {/* Platform positioning */}
        <p className="text-sm font-medium uppercase tracking-widest text-primary mb-4">
          Digital Exposure Intelligence Platform
        </p>

        {/* Main headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight text-foreground">
          Map It. Prioritize It.
          <span className="block text-primary mt-2">Reduce It.</span>
        </h1>
        
        {/* Subheading */}
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto leading-relaxed">
          FootprintIQ is the ethical digital footprint intelligence platform that helps you understand and strategically reduce your online exposure.
        </p>
        
        {/* Transparency line */}
        <p className="text-base text-muted-foreground/80 mb-2 max-w-2xl mx-auto">
          We provide visibility. You make the decisions.
        </p>
        <p className="text-sm text-muted-foreground/60 mb-10 max-w-2xl mx-auto">
          Built for individuals and professionals who value transparency over surveillance.
        </p>
        
        {/* Inline Hero Input - reduces friction */}
        <div className="mb-8">
          <HeroInputField />
        </div>
        
        {/* Secondary CTA */}
        <div className="flex justify-center mb-12">
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-8 py-6 h-auto border-2 hover:bg-muted active:scale-[0.97] transition-transform" 
            asChild
          >
            <a href="#how-it-works">
              <Eye className="w-5 h-5 mr-2" />
              Learn How It Works
            </a>
          </Button>
        </div>
        
        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span>Public-source intelligence only</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span>Ethical OSINT</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span>Transparent exposure analysis</span>
          </div>
        </div>
      </div>
    </section>
  );
};
