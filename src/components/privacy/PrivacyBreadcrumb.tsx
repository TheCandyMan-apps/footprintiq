import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface PrivacyBreadcrumbProps {
  /** The label for the current page (last breadcrumb item). */
  currentPage: string;
}

/**
 * Subtle visual breadcrumb for privacy & removal pages.
 * Schema (JSON-LD) is handled separately per page.
 *
 * Renders: Home > Privacy Resources > {currentPage}
 */
export function PrivacyBreadcrumb({ currentPage }: PrivacyBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
      <ol className="flex items-center gap-1.5 flex-wrap">
        <li>
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
        </li>
        <li aria-hidden="true">
          <ChevronRight className="w-3 h-3" />
        </li>
        <li>
          <Link to="/privacy-centre" className="hover:text-primary transition-colors">
            Privacy Resources
          </Link>
        </li>
        <li aria-hidden="true">
          <ChevronRight className="w-3 h-3" />
        </li>
        <li className="text-foreground font-medium">{currentPage}</li>
      </ol>
    </nav>
  );
}
