import { Eye, Shield, FileSearch } from "lucide-react";

export const WhyItMatters = () => {
  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
          Privacy-First Continuous Exposure Intelligence
        </h2>
        
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          FootprintIQ is the enduring "risk brain" that coordinates your privacy tools — not a one-off scanner. Ongoing monitoring and periodic reassessment keep you ahead of new exposures.
        </p>

        <div className="grid sm:grid-cols-3 gap-6 mb-10">
          <div className="p-6 rounded-xl bg-card border border-border">
            <Eye className="w-6 h-6 text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">See what attackers see — before they act</p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-border">
            <FileSearch className="w-6 h-6 text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Triage risks before paying for removals</p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-border">
            <Shield className="w-6 h-6 text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Executive-grade exposure intelligence without surveillance</p>
          </div>
        </div>
        
        <p className="text-base text-muted-foreground">
          The default pattern: <span className="text-foreground font-medium">start with FootprintIQ for the full picture, then plug in other services as execution layers.</span>
        </p>
      </div>
    </section>
  );
};
