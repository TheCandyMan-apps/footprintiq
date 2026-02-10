import { ExternalLink } from "lucide-react";

interface Citation {
  url: string;
  title?: string;
}

interface CitationsListProps {
  citations: Citation[];
  compact?: boolean;
  maxVisible?: number;
}

export function CitationsList({ citations, compact = false, maxVisible = 5 }: CitationsListProps) {
  if (!citations || citations.length === 0) return null;

  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const visibleCitations = citations.slice(0, maxVisible);
  const remainingCount = citations.length - maxVisible;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {visibleCitations.map((citation, idx) => (
          <a
            key={idx}
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded transition-colors"
          >
            <img 
              src={`https://www.google.com/s2/favicons?domain=${extractDomain(citation.url)}&sz=16`}
              alt={`${extractDomain(citation.url)} favicon`}
              className="w-3 h-3"
            />
            <span className="truncate max-w-[80px]">{extractDomain(citation.url)}</span>
          </a>
        ))}
        {remainingCount > 0 && (
          <span className="text-xs text-muted-foreground px-2 py-1">
            +{remainingCount} more
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Sources</p>
      <div className="space-y-1">
        {visibleCitations.map((citation, idx) => (
          <a
            key={idx}
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <img 
              src={`https://www.google.com/s2/favicons?domain=${extractDomain(citation.url)}&sz=16`}
              alt=""
              className="w-4 h-4"
            />
            <span className="truncate flex-1">
              {citation.title || extractDomain(citation.url)}
            </span>
            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        ))}
        {remainingCount > 0 && (
          <p className="text-xs text-muted-foreground">
            +{remainingCount} more sources
          </p>
        )}
      </div>
    </div>
  );
}