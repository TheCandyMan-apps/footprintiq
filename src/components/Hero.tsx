import { Button } from "@/components/ui/button";
import { Shield, Search, Trash2 } from "lucide-react";
import heroImage from "@/assets/hero-privacy.jpg";

interface HeroProps {
  onStartScan: () => void;
}

export const Hero = ({ onStartScan }: HeroProps) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <img
        src={heroImage}
        alt="Digital privacy protection background"
        className="absolute inset-0 w-full h-full object-cover opacity-20"
        width={1920}
        height={1080}
        loading="eager"
        decoding="async"
      />
      <div className="absolute inset-0 bg-gradient-hero" />
      
      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-10 pb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent tracking-wide">
          Check Your Digital Footprint
        </h1>
        
        <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
          Scan email, username, domain, phone, and IP with trusted OSINT sources. 
          Discover breaches and exposures, then remove your data from 100+ data brokers automatically.
        </p>
        
        {/* Privacy Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-12 rounded-full bg-primary/5 border border-primary/10">
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs text-muted-foreground">
            Privacy first — your data is never sold
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button 
            size="lg" 
            variant="hero"
            onClick={onStartScan}
            className="text-lg px-8 py-6 h-auto"
          >
            <Search className="w-5 h-5" />
            Start Free Scan
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="text-lg px-8 py-6 h-auto"
            onClick={() => {
              document.getElementById('how-it-works')?.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
              });
            }}
          >
            Learn More
          </Button>
        </div>
        
        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <FeatureCard 
            icon={<Search className="w-6 h-6" />}
            title="Comprehensive Scan"
            description="Search across 100+ data broker sites"
          />
          <FeatureCard 
            icon={<Trash2 className="w-6 h-6" />}
            title="Automated Removal"
            description="We handle the data removal process"
          />
          <FeatureCard 
            icon={<Shield className="w-6 h-6" />}
            title="Ongoing Protection"
            description="Continuous monitoring for new data"
          />
        </div>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="p-6 rounded-xl bg-gradient-card border border-border shadow-card hover:shadow-glow transition-all duration-300">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};
