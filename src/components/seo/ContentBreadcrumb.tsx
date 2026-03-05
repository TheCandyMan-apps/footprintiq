import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "./JsonLd";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ContentBreadcrumbProps {
  /** Ordered breadcrumb trail. Last item is current page (no link). */
  items: BreadcrumbItem[];
}

/**
 * Breadcrumb UI + BreadcrumbList JSON-LD for content pages.
 * Usage:
 *   <ContentBreadcrumb items={[
 *     { label: "Home", href: "/" },
 *     { label: "Guides", href: "/guides" },
 *     { label: "Current Page" },
 *   ]} />
 */
export function ContentBreadcrumb({ items }: ContentBreadcrumbProps) {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://footprintiq.app";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${origin}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <ol className="flex items-center gap-1.5 flex-wrap">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={i} className="inline-flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="w-3 h-3" aria-hidden="true" />}
                {isLast ? (
                  <span className="text-foreground font-medium">{item.label}</span>
                ) : (
                  <Link
                    to={item.href || "/"}
                    className="hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
