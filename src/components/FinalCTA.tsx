import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

export const FinalCTA = () => {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-muted/50 to-background">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
          Know what's visible. Reduce the risk.
        </h2>
        
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
          Start with a free scan and see what public information is connected to you online.
        </p>

        <Button 
          size="lg" 
          className="text-lg px-8 py-6 h-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" 
          asChild
        >
          <Link to="/auth">
            <Search className="w-5 h-5 mr-2" />
            Run a Free Scan
          </Link>
        </Button>

        <p className="text-sm text-muted-foreground mt-6">
          No credit card required · Results in minutes
        </p>
      </div>
    </section>
  );
};
