import { Globe } from "lucide-react";

export const WhatWeDoSection = () => {
  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-6">
          <Globe className="w-7 h-7 text-primary" />
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
          Understand your digital footprint
        </h2>
        
        <p className="text-lg text-muted-foreground leading-relaxed mb-4">
          FootprintIQ helps you understand what information about you is publicly accessible online — and how it can be connected.
        </p>
        
        <p className="text-lg text-muted-foreground leading-relaxed mb-4">
          We analyse usernames, profiles, breaches, and exposure signals across a wide range of open sources to build a clear picture of your online visibility.
        </p>
        
        <p className="text-base text-muted-foreground/80 italic">
          This is the same approach used in professional OSINT investigations — applied to personal digital privacy.
        </p>
      </div>
    </section>
  );
};
