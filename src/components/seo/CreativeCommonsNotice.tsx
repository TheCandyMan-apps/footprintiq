import { Link } from "react-router-dom";
import { Scale } from "lucide-react";

interface CreativeCommonsNoticeProps {
  pageTitle?: string;
}

export function CreativeCommonsNotice({ pageTitle }: CreativeCommonsNoticeProps) {
  return (
    <aside className="rounded-xl border border-border/50 bg-muted/30 p-5 md:p-6 mt-8">
      <div className="flex items-start gap-3">
        <Scale className="w-5 h-5 text-accent mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground mb-1">
            Licensed under CC BY 4.0
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {pageTitle ? `"${pageTitle}"` : "This content"} by{" "}
            <Link to="/" className="text-accent hover:underline">FootprintIQ</Link>{" "}
            is licensed under{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Creative Commons Attribution 4.0 International (CC BY 4.0)
            </a>.
            You are free to share and adapt this material for any purpose, including commercial, with attribution.
          </p>
          <p className="text-xs text-muted-foreground/70 mt-2">
            Cite as: FootprintIQ — <em>footprintiq.app</em>
          </p>
        </div>
      </div>
    </aside>
  );
}
