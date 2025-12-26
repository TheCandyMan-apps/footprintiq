import { Search, Shield, Trash2, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: <Search className="w-6 h-6" />,
    title: "Comprehensive Scan",
    description:
      "Enter your personal information and we'll scan 100+ data broker sites, people search engines, and social media platforms.",
    step: "1",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "AI Analysis",
    description:
      "Our system analyzes your digital footprint, detects fake profiles, and generates a comprehensive privacy score.",
    step: "2",
  },
  {
    icon: <Trash2 className="w-6 h-6" />,
    title: "Automated Removal",
    description:
      "We submit removal requests to data brokers on your behalf, handling the tedious paperwork and follow-ups.",
    step: "3",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Ongoing Monitoring",
    description:
      "Continuous monitoring catches new data exposures quickly. Get monthly reports showing your privacy improvement.",
    step: "4",
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to take control of your online privacy
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative p-6 rounded-xl bg-card border border-border shadow-sm"
            >
              {/* Step number */}
              <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-sm">
                {step.step}
              </div>

              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                {step.icon}
              </div>

              <h3 className="text-lg font-semibold mb-2 text-foreground">
                {step.title}
              </h3>
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
