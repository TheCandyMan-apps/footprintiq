import { Brain, Lock, Zap, Users, Eye, Target } from "lucide-react";

const benefits = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "AI-Powered Detection",
    description:
      "Advanced machine learning algorithms detect fake profiles, correlate identities, and analyze behavioral patterns across platforms.",
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: "Enterprise-Grade Security",
    description:
      "Your data is encrypted end-to-end and never shared. We're serious about protecting your privacy while we protect it.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Automated Process",
    description:
      "No manual work required. Our system handles everything from scanning to removal requests automatically.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Identity Verification",
    description:
      "Verify real vs fake profiles with facial recognition, username correlation, and behavioral analysis.",
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: "Continuous Monitoring",
    description:
      "24/7 monitoring ensures you're alerted immediately when new data exposures appear online.",
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "100+ Sources Covered",
    description:
      "We scan data brokers, people search sites, social media, dark web forums, and more.",
  },
];

export const WhyChooseUs = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why Choose{" "}
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              TrueMatch
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The most comprehensive privacy protection platform available
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-gradient-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform duration-300">
                {benefit.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
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
