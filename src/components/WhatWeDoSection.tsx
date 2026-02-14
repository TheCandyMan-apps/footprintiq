import { Eye, UserCheck, Scale, Brain } from "lucide-react";

export const WhatWeDoSection = () => {
  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-6">
          <Eye className="w-7 h-7 text-primary" />
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
          Built for Clarity — Not Conclusions
        </h2>
        
        <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-3xl mx-auto">
          FootprintIQ helps you see where your personal information appears online — across social media, forums, data brokers, and breach databases.
        </p>
        
        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-xl bg-card border border-border">
            <UserCheck className="w-6 h-6 text-primary mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">We don't label people</p>
            <p className="text-xs text-muted-foreground">No profiling, no judgments — just facts about what's publicly visible.</p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-border">
            <Scale className="w-6 h-6 text-primary mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">We don't predict intent</p>
            <p className="text-xs text-muted-foreground">We show exposure signals, not behavioural predictions or risk labels.</p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-border">
            <Brain className="w-6 h-6 text-primary mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">We don't replace your judgment</p>
            <p className="text-xs text-muted-foreground">You decide what matters and what to do about it. We just surface the data.</p>
          </div>
        </div>
        
        <p className="text-base text-muted-foreground/80 italic max-w-2xl mx-auto">
          We surface exposure signals so informed decisions can be made responsibly.
        </p>
      </div>
    </section>
  );
};
