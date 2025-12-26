import { Check, X } from "lucide-react";

const whatWeAre = [
  "An OSINT-based visibility tool",
  "A way to understand your online exposure",
  "A privacy and awareness platform",
  "Built on public data and correlation",
];

const whatWeAreNot = [
  "Hacking",
  "Surveillance",
  "Private database access",
  "Social engineering",
  "Credential cracking",
];

export const WhatWeAre = () => {
  return (
    <section className="py-20 px-6 bg-muted/30 border-y border-border">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            What FootprintIQ is (and isn't)
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* What we are */}
          <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              What FootprintIQ is
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

          {/* What we are not */}
          <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
              <X className="w-5 h-5 text-destructive" />
              What FootprintIQ is not
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
          If information isn't publicly available, we don't see it.
        </p>
      </div>
    </section>
  );
};
