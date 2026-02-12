import { Link } from "react-router-dom";

export interface RelatedGuideLink {
  label: string;
  to: string;
}

interface RelatedPrivacyGuidesProps {
  links: RelatedGuideLink[];
}

export const RelatedPrivacyGuides = ({ links }: RelatedPrivacyGuidesProps) => (
  <section className="mt-16 mb-12">
    <h2 className="text-2xl font-bold mb-4 text-foreground">
      Related Privacy &amp; Removal Guides
    </h2>
    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
      {links.map((link) => (
        <li key={link.to}>
          <Link to={link.to} className="text-accent hover:underline">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </section>
);
