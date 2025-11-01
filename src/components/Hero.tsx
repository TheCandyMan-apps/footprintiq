import { Button } from "@/components/ui/button";
import { Shield, Search, Trash2, AlertTriangle } from "lucide-react";
import heroImage from "@/assets/hero-privacy.jpg";
import credentialBreach from "@/assets/credential-breach.jpg";

interface HeroProps {
  onStartScan: () => void;
}

export const Hero = ({ onStartScan }: HeroProps) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background Image with Overlay */}
      <img
        src={heroImage}
        alt="Digital privacy protection background"
        className="absolute inset-0 w-full h-full object-cover opacity-30 animate-fade-in"
        width={1920}
        height={1080}
        loading="eager"
        decoding="async"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5" />
      
      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--primary-rgb),0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--primary-rgb),0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      
      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
        {/* Threat Alert Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-destructive/10 border border-destructive/20 animate-fade-in backdrop-blur-sm">
          <AlertTriangle className="w-4 h-4 text-destructive animate-pulse" />
          <span className="text-sm font-medium text-destructive">
            Over 15 billion credentials exposed in data breaches
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent tracking-tight animate-fade-in [animation-delay:100ms]">
          Protect Your Digital Identity
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed pb-2 animate-fade-in [animation-delay:200ms]">
          Scan email, username, domain, phone, and IP across <span className="text-primary font-semibold">trusted OSINT sources</span>. 
          Discover breaches and exposures, then <span className="text-accent font-semibold">remove your data automatically</span> from 100+ data brokers.
        </p>
        
        {/* Privacy Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-12 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm animate-fade-in [animation-delay:300ms] shadow-lg shadow-primary/5">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Privacy first — your data is never sold
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-16 animate-fade-in [animation-delay:400ms]">
          <Button 
            size="lg" 
            variant="hero"
            onClick={onStartScan}
            className="text-lg px-10 py-7 h-auto shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
          >
            <Search className="w-5 h-5" />
            Start Free Scan
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="text-lg px-10 py-7 h-auto border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
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
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto animate-fade-in [animation-delay:500ms]">
          <FeatureCard 
            icon={<Search className="w-6 h-6" />}
            title="Comprehensive Scan"
            description="Search across 100+ data broker sites and OSINT databases"
            delay="500ms"
          />
          <FeatureCard 
            icon={<Trash2 className="w-6 h-6" />}
            title="Automated Removal"
            description="We handle the entire data removal process for you"
            delay="600ms"
          />
          <FeatureCard 
            icon={<Shield className="w-6 h-6" />}
            title="Ongoing Protection"
            description="Continuous monitoring for new exposures and threats"
            delay="700ms"
          />
        </div>

        {/* Credential Breach Warning Section */}
        <div className="mt-20 max-w-4xl mx-auto animate-fade-in [animation-delay:800ms]">
          <div className="relative rounded-2xl overflow-hidden group">
            <img
              src={credentialBreach}
              alt="Credential breach visualization"
              className="w-full h-48 object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-destructive/80 via-destructive/60 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Your credentials could be for sale right now
                </h3>
                <p className="text-white/90 text-lg pb-1">
                  Take action before it's too late
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: string;
}

const FeatureCard = ({ icon, title, description, delay = "0ms" }: FeatureCardProps) => {
  return (
    <div 
      className="group p-8 rounded-2xl bg-gradient-card border border-border/50 shadow-card hover:shadow-glow hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm animate-fade-in"
      style={{ animationDelay: delay }}
    >
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 mx-auto text-primary group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/10">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors leading-tight">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed pb-1">{description}</p>
    </div>
  );
};
