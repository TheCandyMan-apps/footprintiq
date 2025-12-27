import { Check, X } from "lucide-react";

const whatWeAre = [
  "Visibility into publicly observable exposure",
  "Structured signal grouping and explanation",
  "Support for human-led verification",
  "Context-aware confidence scoring",
];

const whatWeAreNot = [
  "Criminal detection or prediction",
  "Automated accusations or labels",
  "Surveillance or private data access",
  "A replacement for professional judgment",
];

export const WhatWeAre = () => {
  return (
    <section className="py-20 px-6 bg-muted/30 border-y border-border">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            What FootprintIQ Provides (and Doesn't)
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* What we provide */}
          <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              What FootprintIQ Provides
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
          <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
              <X className="w-5 h-5 text-destructive" />
              What FootprintIQ Does Not Do
            </h3>
            <ul className="space-y-3">
              {whatWeAreNot.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-muted-foreground">
                  <X className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          All findings represent exposure signals, not conclusions.
        </p>
      </div>
    </section>
  );
};
