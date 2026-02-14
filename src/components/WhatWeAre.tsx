import { Check, X, ShieldAlert } from "lucide-react";

const whatWeAre = [
  "A free privacy scanner anyone can use",
  "Shows what's publicly visible about you online",
  "Checks hundreds of platforms, data brokers, and breach databases",
  "Gives you a step-by-step plan to reduce your exposure",
  "Built around transparency, consent, and accuracy",
];

const whatWeAreNot = [
  { label: "Not a surveillance or monitoring tool", detail: "We don't watch, track, or follow anyone." },
  { label: "Not a people-search or background check site", detail: "You can't look up other people without their knowledge." },
  { label: "Not a data broker", detail: "We never sell, share, or store your personal data." },
  { label: "Not an enterprise-only product", detail: "Free scans are available to everyone — no sign-up required." },
  { label: "Not a replacement for professional judgment", detail: "Results are signals, not conclusions. You decide what to do." },
];

export const WhatWeAre = () => {
  return (
    <section className="py-20 px-6 bg-muted/30 border-y border-border">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <ShieldAlert className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Transparency Matters</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            What FootprintIQ Is — and Isn't
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We believe you deserve to know exactly what a tool does before you use it. Here's the honest picture.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* What we provide */}
          <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              What FootprintIQ Is
            </h3>
            <ul className="space-y-3">
              {whatWeAre.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-muted-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What we don't do */}
          <div className="p-6 rounded-xl bg-card border border-destructive/20 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
              <X className="w-5 h-5 text-destructive" />
              What FootprintIQ Is NOT
            </h3>
            <ul className="space-y-4">
              {whatWeAreNot.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <X className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-foreground font-medium">{item.label}</span>
                    <p className="text-sm text-muted-foreground mt-0.5">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          All findings represent exposure signals, not conclusions. FootprintIQ is designed for self-assessment and authorised research only.
        </p>
      </div>
    </section>
  );
};
