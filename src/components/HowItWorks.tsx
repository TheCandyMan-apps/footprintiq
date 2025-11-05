import { Search, Shield, Trash2, TrendingUp, Sparkles } from "lucide-react";
import howItWorksHero from "@/assets/how-it-works-hero.jpg";
import { useParallax } from "@/hooks/useParallax";
import { useRef } from "react";

const steps = [
  {
    icon: <Search className="w-8 h-8" />,
    title: "Comprehensive Scan",
    description:
      "Enter your personal information and we'll scan 100+ data broker sites, people search engines, and social media platforms to find where your data exists online.",
    step: "1",
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "AI Analysis",
    description:
      "Our AI-powered system analyzes your digital footprint, detects fake profiles, correlates identities across platforms, and generates a comprehensive privacy score.",
    step: "2",
  },
  {
    icon: <Trash2 className="w-8 h-8" />,
    title: "Automated Removal",
    description:
      "We automatically submit removal requests to data brokers and people search sites on your behalf, handling the tedious paperwork and follow-ups.",
    step: "3",
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: "Ongoing Monitoring",
    description:
      "Continuous monitoring ensures new data exposures are caught quickly. Get monthly reports showing your privacy improvement over time.",
    step: "4",
  },
];

export const HowItWorks = () => {
  const bgRef = useRef<HTMLImageElement>(null);
  const bgParallax = useParallax(bgRef, { speed: 0.2, direction: 'down' });
  
  return (
    <section id="how-it-works" className="relative py-20 px-6 overflow-hidden">
      {/* Hero Background with Parallax */}
      <div className="absolute inset-0 z-0">
        <img 
          ref={bgRef}
          src={howItWorksHero} 
          alt="Digital security concept" 
          className="w-full h-full object-cover opacity-20"
          style={{ 
            transform: bgParallax.transform,
            willChange: 'transform',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Simple Process</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            How It{" "}
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to take control of your online privacy
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-2xl bg-gradient-card border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-glow hover:scale-105"
            >
              {/* Step number badge */}
              <div className="absolute -top-5 -right-5 w-14 h-14 rounded-full bg-gradient-accent flex items-center justify-center border-4 border-background font-bold text-2xl shadow-lg group-hover:scale-110 transition-transform">
                {step.step}
              </div>

              {/* Icon with glow effect */}
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:bg-primary/20 transition-all duration-300 shadow-[0_0_20px_rgba(147,51,234,0.2)] group-hover:scale-110">
                {step.icon}
              </div>

              <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
              
              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-b-2xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
