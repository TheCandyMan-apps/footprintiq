import { Brain, Lock, Zap, Users, Eye, Target, Star } from "lucide-react";
import featuresHero from "@/assets/features-hero.jpg";

const benefits = [
  {
    icon: <Brain className="w-7 h-7" />,
    title: "AI-Powered Detection",
    description:
      "Advanced machine learning algorithms detect fake profiles, correlate identities, and analyze behavioral patterns across platforms.",
  },
  {
    icon: <Lock className="w-7 h-7" />,
    title: "Enterprise-Grade Security",
    description:
      "Your data is encrypted end-to-end and never shared. We're serious about protecting your privacy while we protect it.",
  },
  {
    icon: <Zap className="w-7 h-7" />,
    title: "Automated Process",
    description:
      "No manual work required. Our system handles everything from scanning to removal requests automatically.",
  },
  {
    icon: <Users className="w-7 h-7" />,
    title: "Identity Verification",
    description:
      "Verify real vs fake profiles with facial recognition, username correlation, and behavioral analysis.",
  },
  {
    icon: <Eye className="w-7 h-7" />,
    title: "Continuous Monitoring",
    description:
      "24/7 monitoring ensures you're alerted immediately when new data exposures appear online.",
  },
  {
    icon: <Target className="w-7 h-7" />,
    title: "100+ Sources Covered",
    description:
      "We scan data brokers, people search sites, social media, dark web forums, and more.",
  },
];

export const WhyChooseUs = () => {
  return (
    <section className="relative py-20 px-6 overflow-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={featuresHero} 
          alt="Security features network" 
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background/98 to-background" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <Star className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Premium Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 flex items-center justify-center gap-3 flex-wrap">
            Why Choose
            <img 
              src="/logo-dark.png" 
              alt="FootprintIQ" 
              className="h-12 md:h-16 w-auto inline-block"
            />
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The most comprehensive privacy protection platform available
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group relative p-6 rounded-2xl bg-gradient-card border border-border/50 hover:border-accent/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,230,230,0.2)] hover:-translate-y-2"
            >
              {/* Animated background gradient */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-accent opacity-0 group-hover:opacity-10 transition-opacity" />
              
              {/* Icon container with pulse effect */}
              <div className="relative w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-4 text-accent group-hover:bg-accent/20 transition-all duration-300 shadow-[0_0_15px_rgba(0,230,230,0.15)] group-hover:scale-110">
                {benefit.icon}
                <div className="absolute inset-0 rounded-xl bg-accent/20 animate-pulse opacity-0 group-hover:opacity-100" />
              </div>
              
              <h3 className="text-lg font-bold mb-2 group-hover:text-accent transition-colors">
                {benefit.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
