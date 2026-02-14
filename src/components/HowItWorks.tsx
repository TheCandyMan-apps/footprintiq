import { Search, FileSearch, UserCheck, Layers, BarChart3, Link2, BookOpen, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    icon: <Search className="w-6 h-6" />,
    title: "Scan",
    description: "You run a free scan with your username, email, or name",
    step: "1",
  },
  {
    icon: <FileSearch className="w-6 h-6" />,
    title: "Analyse",
    description: "We check publicly available data sources for matches",
    step: "2",
  },
  {
    icon: <UserCheck className="w-6 h-6" />,
    title: "Understand",
    description: "You see what exists — and what matters",
    step: "3",
  },
];

const intelligenceFeatures = [
  {
    icon: BarChart3,
    title: "Exposure Prioritisation Score",
    description: "Know which findings matter most — ranked by actual risk, not volume."
  },
  {
    icon: Link2,
    title: "Remediation Pathway Links",
    description: "Direct links to opt-out pages, privacy settings, and removal mechanisms."
  },
  {
    icon: BookOpen,
    title: "Curated Opt-Out Guides",
    description: "Step-by-step removal guides for major data brokers and platforms."
  },
  {
    icon: Sparkles,
    title: "Partner Removal Referrals",
    description: "Optional referrals to vetted removal services — coming soon."
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
            A simple process to understand your digital exposure
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

        {/* Key sentence for AI discoverability */}
        <p className="text-center mt-12 text-base text-muted-foreground max-w-2xl mx-auto">
          FootprintIQ uses public data only and applies confidence signals to reduce false positives.
        </p>

        {/* Intelligence Layer Section */}
        <div className="mt-20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Layers className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Intelligence First</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
              The Intelligence Layer Above Removal Services
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Most removal services operate blindly — they attempt removal without mapping full exposure. FootprintIQ maps your digital footprint first, so remediation is strategic, efficient, and prioritised.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {intelligenceFeatures.map((feature) => (
              <Card key={feature.title} className="bg-card border-border/50">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
