import { Link } from "react-router-dom";
import { Search, Globe, ArrowRight, Fingerprint, Shield, BookOpen } from "lucide-react";

const allTools = [
  {
    to: "/username-checker",
    title: "Username Checker",
    desc: "Check if a username exists across 500+ platforms",
    icon: Search,
  },
  {
    to: "/username-lookup",
    title: "Username Lookup",
    desc: "Search where a username appears online",
    icon: Fingerprint,
  },
  {
    to: "/reverse-username-search",
    title: "Reverse Username Search",
    desc: "Find public accounts and mentions by username",
    icon: Globe,
  },
  {
    to: "/social-media-finder",
    title: "Social Media Finder",
    desc: "Discover public social profiles linked to a handle",
    icon: ArrowRight,
  },
  {
    to: "/digital-footprint-check",
    title: "Digital Footprint Check",
    desc: "See what personal data is publicly visible online",
    icon: Shield,
  },
  {
    to: "/ai-answers-hub",
    title: "AI Answers Hub",
    desc: "Get answers to OSINT and digital privacy questions",
    icon: BookOpen,
  },
];

interface RelatedToolsGridProps {
  /** The current page path — will be excluded from the grid */
  currentPath: string;
}

export function RelatedToolsGrid({ currentPath }: RelatedToolsGridProps) {
  const links = allTools.filter((t) => t.to !== currentPath);

  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
            Related Tools &amp; Guides
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="p-5 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <link.icon className="h-4 w-4 text-primary" />
                  <h3 className="text-foreground font-semibold group-hover:text-primary transition-colors">
                    {link.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
