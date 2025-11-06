import { Button } from "@/components/ui/button";
import { Shield, Search, Trash2, AlertTriangle, Scan, Lock, Zap, Globe } from "lucide-react";
import heroImage from "@/assets/hero-privacy.jpg";
import credentialBreach from "@/assets/credential-breach.jpg";
import { useParallax, useScrollFade } from "@/hooks/useParallax";
import { useRef } from "react";

interface HeroProps {
  onStartScan: () => void;
  onAdvancedScan?: () => void;
}

export const Hero = ({ onStartScan, onAdvancedScan }: HeroProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const bgParallax = useParallax(bgRef, { speed: 0.3, direction: 'down' });
  const contentParallax = useParallax(contentRef, { speed: 0.15, direction: 'up' });
  const fadeOpacity = useScrollFade(containerRef);

  return (
    <div ref={containerRef} className="relative min-h-[100svh] md:min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background Image with Overlay and Parallax */}
      <img
        ref={bgRef}
        src={heroImage}
        alt="Digital privacy protection background"
        className="absolute inset-0 w-full h-full object-cover opacity-30 animate-fade-in"
        style={{ 
          transform: bgParallax.transform,
          willChange: 'transform',
        }}
        width={1920}
        height={1080}
        loading="eager"
        decoding="async"
      />
      <div 
        className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5" 
        style={{ opacity: fadeOpacity }}
      />
      
      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--primary-rgb),0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--primary-rgb),0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      
      {/* Content with Parallax */}
      <div 
        ref={contentRef}
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 md:pt-32 lg:pt-36 pb-12 sm:pb-16 md:pb-20 text-center"
        style={{ 
          transform: contentParallax.transform,
          willChange: 'transform',
        }}
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 md:mb-8 leading-tight pb-2 tracking-tight animate-fade-in mt-4 sm:mt-6 md:mt-8">
          <span className="block text-foreground">Scan Your Digital Footprint</span>
          <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Master Your FootprintIQ</span>
          <span className="block text-foreground">Protect Your Privacy</span>
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 sm:mb-7 md:mb-8 max-w-3xl mx-auto leading-relaxed pb-3 animate-fade-in [animation-delay:200ms]">
          Take control of your online privacy. Discover where your <span className="text-primary font-semibold">personal information appears</span> across the web and <span className="text-accent font-semibold">remove it effortlessly</span>.
        </p>
        
        {/* Privacy Badge */}
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 mb-8 sm:mb-10 md:mb-12 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm animate-fade-in [animation-delay:300ms] shadow-lg shadow-primary/5">
          <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
          <span className="text-xs sm:text-sm font-medium text-foreground">
            Privacy first — your data is never sold
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-5 justify-center items-center mb-10 sm:mb-12 md:mb-16 animate-fade-in [animation-delay:400ms]">
          <Button 
            size="lg" 
            variant="hero"
            onClick={onStartScan}
            className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-6 md:py-7 h-auto shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
            asChild
          >
            <a href="/auth">
              <Scan className="w-4 h-4 sm:w-5 sm:h-5" />
              Get Started
            </a>
          </Button>
          {onAdvancedScan && (
            <Button 
              size="lg" 
              variant="secondary"
              onClick={onAdvancedScan}
              className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-6 md:py-7 h-auto shadow-xl shadow-accent/20 hover:shadow-2xl hover:shadow-accent/30 transition-all duration-300 hover:scale-105 bg-gradient-to-r from-accent/20 to-accent/10 hover:from-accent/30 hover:to-accent/20 border border-accent/50"
            >
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
              Advanced Scan
            </Button>
          )}
          <Button 
            size="lg" 
            variant="outline"
            className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-6 md:py-7 h-auto border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
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
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 max-w-5xl mx-auto animate-fade-in [animation-delay:500ms]">
          <FeatureCard 
            icon={<Globe className="w-6 h-6" />}
            title="Find Your Data"
            description="Search hundreds of websites at once to discover your exposed information"
            delay="500ms"
          />
          <FeatureCard 
            icon={<Zap className="w-6 h-6" />}
            title="Get Instant Results"
            description="See what's out there immediately with automatic monitoring for new exposures"
            delay="600ms"
          />
          <FeatureCard 
            icon={<Lock className="w-6 h-6" />}
            title="Stay Protected"
            description="Remove your data automatically and keep your privacy secure"
            delay="700ms"
          />
        </div>

        {/* Credential Breach Warning Section */}
        <div className="mt-12 sm:mt-16 md:mt-20 max-w-4xl mx-auto animate-fade-in [animation-delay:800ms]">
          <div className="relative rounded-xl sm:rounded-2xl overflow-hidden group">
            <img
              src={credentialBreach}
              alt="Credential breach visualization"
              className="w-full h-36 sm:h-44 md:h-48 object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-destructive/80 via-destructive/60 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 md:p-8">
              <div className="text-center">
                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3">
                  Your credentials could be for sale right now
                </h3>
                <p className="text-white/90 text-sm sm:text-base md:text-lg pb-1">
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
  const cardRef = useRef<HTMLDivElement>(null);
  const cardParallax = useParallax(cardRef, { speed: 0.1, direction: 'up' });
  
  return (
    <div 
      ref={cardRef}
      className="group p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bg-gradient-card border border-border/50 shadow-card hover:shadow-glow hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm animate-fade-in"
      style={{ 
        animationDelay: delay,
        transform: cardParallax.transform,
        willChange: 'transform',
      }}
    >
      <div className="w-12 h-12 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 sm:mb-5 md:mb-6 mx-auto text-primary group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/10">
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 group-hover:text-primary transition-colors leading-tight pb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pb-2">{description}</p>
    </div>
  );
};
