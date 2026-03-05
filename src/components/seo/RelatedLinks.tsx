import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getPageTitle } from "@/lib/seo/contentRegistry";

interface RelatedLinksProps {
  paths: string[];
  title?: string;
}

/**
 * Renders a list of internal links with titles looked up from the content registry.
 * Falls back to a readable title derived from the path.
 */
export function RelatedLinks({ paths, title = "Related Pages" }: RelatedLinksProps) {
  if (!paths.length) return null;

  return (
    <nav aria-label="Related pages" className="mt-12 pt-8 border-t border-border/40">
      <h2 className="text-lg font-semibold text-foreground mb-4">{title}</h2>
      <ul className="grid sm:grid-cols-2 gap-3">
        {paths.map((path) => (
          <li key={path}>
            <Link
              to={path}
              className="flex items-center gap-2 p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/30 transition-colors group"
            >
              <ArrowRight className="w-4 h-4 text-primary shrink-0 group-hover:translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {getPageTitle(path)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
