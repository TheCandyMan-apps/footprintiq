import { Link } from "react-router-dom";
import { ShieldCheck, Lock, HeartHandshake, FileText } from "lucide-react";

/**
 * Compact trust block for placement near primary CTAs.
 * Reinforces ethical positioning without heavy visual weight.
 */
export function EthicalOsintTrustBlock() {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 sm:p-5 max-w-xl mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
        <p className="text-sm font-semibold text-foreground">
          Ethical OSINT. Built for self-protection.
        </p>
      </div>
      <ul className="space-y-2 text-xs text-muted-foreground mb-3">
        <li className="flex items-start gap-2">
          <Lock className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
          <span>Public information only — no private access</span>
        </li>
        <li className="flex items-start gap-2">
          <HeartHandshake className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
          <span>Abuse prevention + responsible use</span>
        </li>
        <li className="flex items-start gap-2">
          <FileText className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
          <span>Clear data handling + user controls</span>
        </li>
      </ul>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <Link to="/trust-safety" className="text-primary hover:underline">Trust &amp; Safety</Link>
        <Link to="/responsible-use" className="text-primary hover:underline">Responsible Use</Link>
        <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
      </div>
    </div>
  );
}
