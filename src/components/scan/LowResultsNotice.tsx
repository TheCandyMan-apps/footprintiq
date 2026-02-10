import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';

interface LowResultsNoticeProps {
  /** 'zero' for no results, 'low' for few results (e.g. ≤3) */
  variant: 'zero' | 'low';
}

export function LowResultsNotice({ variant }: LowResultsNoticeProps) {
  return (
    <div className="rounded-lg bg-muted/15 border border-border/30 p-4 text-left max-w-lg mx-auto">
      <div className="flex items-start gap-2.5">
        <Info className="w-4 h-4 text-muted-foreground/60 mt-0.5 shrink-0" />
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {variant === 'zero'
              ? 'No matching results were found for this query. This can mean limited public exposure — not a scan failure.'
              : 'Few results can mean limited public exposure, not a scan failure.'}
          </p>
          <p className="text-xs text-muted-foreground/70 leading-relaxed">
            You might consider:
          </p>
          <ul className="text-xs text-muted-foreground/70 leading-relaxed space-y-1 ml-3 list-disc list-outside">
            <li>Trying a different username or variation you may have used elsewhere</li>
            <li>Reviewing platforms you know you've signed up for manually</li>
          </ul>
          <p className="text-xs text-muted-foreground/70 leading-relaxed">
            Fewer results do not guarantee safety — they reflect what was observable at the time of scanning.
          </p>
          <p className="text-xs text-muted-foreground/50 pt-1">
            <Link to="/guides/good-osint-scan-result" className="underline underline-offset-2 hover:text-primary transition-colors">
              What does a good scan result look like?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
