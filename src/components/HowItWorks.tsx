import { Search, Shield, Trash2, TrendingUp } from "lucide-react";

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
  return (
    <section className="py-20 px-6 bg-gradient-card">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
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
              className="relative p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 group"
            >
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-accent flex items-center justify-center text-2xl font-bold">
                {step.step}
              </div>

              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform duration-300">
                {step.icon}
              </div>

              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
