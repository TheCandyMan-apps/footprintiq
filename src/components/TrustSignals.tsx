import { Shield } from "lucide-react";
import scamadviserLogo from "@/assets/scamadviser-logo.jpg";

export const TrustSignals = () => {
  const items = [
    "Public data only",
    "No monitoring or tracking",
    "No private account access",
    "User-initiated scans only"
  ];

  return (
    <section className="py-16 px-6 bg-muted/30 border-y border-border">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">Built for Privacy</span>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {items.map((item, index) => (
            <span 
              key={index}
              className="px-4 py-2 rounded-full bg-card border border-border text-sm text-muted-foreground"
            >
              {item}
            </span>
          ))}
        </div>
        
        <p className="text-base text-muted-foreground">
          All findings represent publicly observable information. <span className="text-foreground font-medium">Verification is always required.</span>
        </p>
        
        <a 
          href="https://www.scamadviser.com/check-website/footprintiq.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-6 opacity-60 hover:opacity-100 transition-opacity"
        >
          <img 
            src={scamadviserLogo} 
            alt="Verified by ScamAdviser" 
            className="h-6 w-auto"
          />
        </a>
      </div>
    </section>
  );
};
