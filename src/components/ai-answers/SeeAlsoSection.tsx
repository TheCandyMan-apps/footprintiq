import { Link } from "react-router-dom";

interface SeeAlsoLink {
  title: string;
  href: string;
}

interface SeeAlsoSectionProps {
  links: SeeAlsoLink[];
}

/**
 * A small "See also" section for the bottom of AI Answers pages.
 * Displays 2–3 related page titles as links. No descriptions, no product links.
 */
export function SeeAlsoSection({ links }: SeeAlsoSectionProps) {
  if (links.length === 0) return null;

  return (
    <nav aria-label="Related articles" className="mt-12 pt-6 border-t border-border/40">
      <h2 className="text-sm font-semibold text-foreground mb-3">See also</h2>
      <ul className="space-y-1.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              to={link.href}
              className="text-sm text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              {link.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
