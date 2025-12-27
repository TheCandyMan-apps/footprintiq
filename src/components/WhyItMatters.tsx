import { Eye, Shield, FileSearch } from "lucide-react";

export const WhyItMatters = () => {
  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
          Why Visibility Matters
        </h2>
        
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Digital exposure exists whether you're aware of it or not. Understanding what's visible is the first step to informed decision-making.
        </p>

        <div className="grid sm:grid-cols-3 gap-6 mb-10">
          <div className="p-6 rounded-xl bg-card border border-border">
            <Eye className="w-6 h-6 text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">See what others can see</p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-border">
            <FileSearch className="w-6 h-6 text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Understand context and correlation</p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-border">
            <Shield className="w-6 h-6 text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Make informed decisions</p>
          </div>
        </div>
        
        <p className="text-base text-muted-foreground">
          FootprintIQ provides clarity. <span className="text-foreground font-medium">You provide the judgment.</span>
        </p>
      </div>
    </section>
  );
};
