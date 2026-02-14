import { Shield, Users, Globe, ScanSearch } from "lucide-react";
import scamadviserLogo from "@/assets/scamadviser-logo.jpg";

const stats = [
  { icon: Users, value: "2,000+", label: "People scanned" },
  { icon: Globe, value: "350+", label: "Platforms checked" },
  { icon: ScanSearch, value: "10,000+", label: "Exposures found" },
];

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
          <span className="text-sm font-medium text-primary">Trusted by Real People</span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <Icon className="w-5 h-5 text-primary mx-auto mb-1.5" />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
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
