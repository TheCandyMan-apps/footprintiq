import { Search, FileSearch, UserCheck } from "lucide-react";

const steps = [
  {
    icon: <Search className="w-6 h-6" />,
    title: "Scan",
    description: "Analyze public identifiers (usernames, emails, aliases)",
    step: "1",
  },
  {
    icon: <FileSearch className="w-6 h-6" />,
    title: "Review",
    description: "Exposure signals are grouped, explained, and contextualized",
    step: "2",
  },
  {
    icon: <UserCheck className="w-6 h-6" />,
    title: "Decide",
    description: "Human-led interpretation, verification, and action",
    step: "3",
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 px-6 bg-muted/30 border-y border-border">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A structured approach to understanding digital exposure
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative p-6 rounded-xl bg-card border border-border shadow-sm text-center"
            >
              {/* Step number */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-sm">
                {step.step}
              </div>

              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary mx-auto mt-4">
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
