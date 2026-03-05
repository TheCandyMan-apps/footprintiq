import { AlertTriangle } from "lucide-react";

interface AccuracyCalloutProps {
  context?: "platform" | "comparison";
}

export function AccuracyCallout({ context = "platform" }: AccuracyCalloutProps) {
  return (
    <aside className="mb-16 p-5 rounded-xl border border-border bg-muted/20">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">Accuracy & Limitations</h3>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>False positives are possible — matching a username does not confirm the same person owns every account.</li>
            <li>Only publicly available data is queried. Private, login-protected, and deleted content is never accessed.</li>
            <li>Do not use results to harass, stalk, or dox anyone. FootprintIQ is designed for self-audit, authorised investigation, and risk assessment only.</li>
            {context === "comparison" && (
              <li>Feature comparisons reflect publicly documented capabilities and may change as tools are updated.</li>
            )}
          </ul>
        </div>
      </div>
    </aside>
  );
}
