import { Brain, Lock, Zap, Users, Eye, Target } from "lucide-react";

const benefits = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "AI-Powered Detection",
    description:
      "Machine learning algorithms detect fake profiles and correlate identities across platforms, reducing false positives.",
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: "Enterprise-Grade Security",
    description:
      "Your data is encrypted end-to-end and never sold. We're serious about protecting your privacy.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Automated Workflows",
    description:
      "No manual work required. Our system handles scanning, analysis, and removal requests automatically.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Identity Verification",
    description:
      "Verify real vs fake profiles with username correlation and behavioral analysis.",
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: "Continuous Monitoring",
    description:
      "24/7 monitoring ensures you're alerted immediately when new data exposures appear.",
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "100+ Sources Covered",
    description:
      "We scan data brokers, people search sites, social media, and public records.",
  },
];

export const WhyChooseUs = () => {
  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Why Choose FootprintIQ
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The most comprehensive privacy protection platform available
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                {benefit.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">
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
