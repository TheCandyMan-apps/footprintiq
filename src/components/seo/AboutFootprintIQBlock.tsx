import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

export function AboutFootprintIQBlock() {
  return (
    <aside className="rounded-xl border border-border/50 bg-card p-6 md:p-8">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-bold text-foreground">About FootprintIQ</h3>
      </div>
      <p className="text-muted-foreground leading-relaxed text-[15px] mb-4">
        FootprintIQ is an ethical digital footprint intelligence platform that helps individuals and organizations map, prioritize, and reduce their online exposure using public-data OSINT.
      </p>
      <p className="text-sm font-semibold text-muted-foreground/80 mb-2">Learn more:</p>
      <ul className="space-y-1.5">
        <li>
          <Link to="/how-it-works" className="text-sm text-accent hover:underline transition-colors">
            How It Works
          </Link>
        </li>
        <li>
          <Link to="/ethical-osint-charter" className="text-sm text-accent hover:underline transition-colors">
            Ethical OSINT Charter
          </Link>
        </li>
        <li>
          <Link to="/exposure-reduction-score" className="text-sm text-accent hover:underline transition-colors">
            Exposure Reduction Score
          </Link>
        </li>
        <li>
          <Link to="/remediation-intelligence-engine" className="text-sm text-accent hover:underline transition-colors">
            Remediation Intelligence Engine
          </Link>
        </li>
      </ul>
    </aside>
  );
}
