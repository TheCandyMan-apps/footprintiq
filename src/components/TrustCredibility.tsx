import { Shield, CheckCircle, Lock, Scale } from "lucide-react";

const trustPoints = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Built by Security Professionals",
    description: "Our team has decades of combined experience in cybersecurity, OSINT, and privacy protection.",
  },
  {
    icon: <CheckCircle className="w-6 h-6" />,
    title: "Designed for Accuracy",
    description: "AI-powered false positive filtering ensures you only see verified, high-confidence results.",
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: "No Scraping of Private Data",
    description: "We only query publicly accessible, lawful OSINT sources. Your privacy is protected at every step.",
  },
  {
    icon: <Scale className="w-6 h-6" />,
    title: "Lawful & Ethical OSINT",
    description: "All data comes from public sources. We're GDPR compliant and follow responsible disclosure practices.",
  },
];

export const TrustCredibility = () => {
  return (
    <section className="py-20 px-6 bg-background border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Trust & Credibility
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We take privacy seriously — yours and the data we handle
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {trustPoints.map((point, index) => (
            <div
              key={index}
              className="flex gap-4 p-6 rounded-xl bg-card border border-border shadow-sm"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                {point.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {point.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {point.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
