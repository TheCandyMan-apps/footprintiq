import { Check, X } from "lucide-react";
import { Link } from "react-router-dom";

const weWill = [
  "Help you understand what's publicly visible",
  "Support self-assessment and authorised research",
  "Provide practical steps to reduce exposure",
  "Use privacy-first and abuse-prevention controls",
];

const weWont = [
  "Sell personal data or operate as a data broker",
  "Provide \"find anyone\" / stalking workflows",
  "Access private accounts, messages, or paywalled content",
  "Enable covert surveillance or harassment",
];

export const ResponsibleUsePledge = () => {
  return (
    <section className="py-16 px-6 bg-muted/20 border-t border-border">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-foreground">
          What FootprintIQ Will and Won't Do
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* We will */}
          <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
            <h3 className="text-base font-semibold mb-4 text-foreground flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              We will
            </h3>
            <ul className="space-y-3">
              {weWill.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* We won't */}
          <div className="p-6 rounded-xl bg-card border border-destructive/20 shadow-sm">
            <h3 className="text-base font-semibold mb-4 text-foreground flex items-center gap-2">
              <X className="w-5 h-5 text-destructive" />
              We won't
            </h3>
            <ul className="space-y-3">
              {weWont.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <X className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-center mt-8">
          <Link
            to="/responsible-use"
            className="text-sm text-primary hover:underline"
          >
            Read our Responsible Use policy →
          </Link>
        </p>
      </div>
    </section>
  );
};
