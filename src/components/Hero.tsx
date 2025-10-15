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
      />
      <div className="absolute inset-0 bg-gradient-hero" />
      
      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Your Privacy, Protected</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          FootprintIQ — Check Your Digital Footprint
          <br />
          <span className="bg-gradient-accent bg-clip-text text-transparent">(Email, Username, Domain, Phone, IP)</span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Scan with trusted OSINT sources like Have I Been Pwned, Shodan, and VirusTotal. 
          Discover email breaches, username exposure, domain intelligence, IP leaks, and phone data. 
          Remove your personal information from 100+ data brokers automatically.
        </p>
        
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
