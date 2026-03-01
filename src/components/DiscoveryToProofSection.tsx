import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scan, ClipboardCheck, RefreshCw, BarChart3, ArrowRight } from "lucide-react";

const steps = [
  { icon: Scan, label: "Scan", desc: "Discover your public exposure across 500+ sources" },
  { icon: ClipboardCheck, label: "Act", desc: "Follow guided remediation steps to reduce risk" },
  { icon: RefreshCw, label: "Verify", desc: "Re-scan to confirm changes took effect" },
  { icon: BarChart3, label: "Measure", desc: "Compare before/after exposure scores" },
];

export function DiscoveryToProofSection() {
  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            From Discovery to Clean-Up to Proof
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            FootprintIQ is designed to help you reduce exposure — not just show a scary list.
            Track progress over time with before/after measurement.
          </p>
        </div>

        {/* 4-step horizontal flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, idx) => (
            <div key={step.label} className="relative flex flex-col items-center text-center">
              {/* Connector line (hidden on first, visible between items on lg) */}
              {idx > 0 && (
                <div className="hidden lg:block absolute top-8 -left-3 w-6 border-t-2 border-dashed border-primary/30" />
              )}
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                <step.icon className="w-7 h-7 text-primary" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
                Step {idx + 1}
              </span>
              <h3 className="text-lg font-bold mb-1">{step.label}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" asChild className="text-lg px-8 py-6 h-auto">
            <Link to="/free-scan">
              <Scan className="w-5 h-5 mr-2" />
              Start a Scan
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 h-auto border-2">
            <Link to="/guides/reduce-digital-footprint">
              How Remediation Works
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
