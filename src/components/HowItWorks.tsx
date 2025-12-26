import { Search, Globe, FileText } from "lucide-react";

const steps = [
  {
    icon: <Search className="w-6 h-6" />,
    title: "Enter what you want to check",
    description: "Start with a username, email address, or other identifier you've used online.",
    step: "1",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "We scan public sources",
    description: "FootprintIQ searches hundreds of open, publicly accessible sources — including social platforms, forums, breach indexes, and data brokers.",
    step: "2",
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Review your exposure",
    description: "You receive a structured report highlighting where you appear online, what information is exposed, potential privacy risks, and recommended next steps.",
    step: "3",
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 px-6 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to understand your online visibility
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
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
