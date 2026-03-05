import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Shield, Search, Radar, Users } from "lucide-react";

const collections = [
  { path: "/topics/username-search", label: "Username Search", icon: Search, description: "Tools, guides & platform scanners" },
  { path: "/topics/digital-footprint", label: "Digital Footprint", icon: Radar, description: "Audit & reduce your exposure" },
  { path: "/topics/privacy-removal", label: "Privacy & Removal", icon: Shield, description: "Remove your data online" },
  { path: "/topics/osint-for-individuals", label: "OSINT for Individuals", icon: Users, description: "Ethical intelligence for everyone" },
  { path: "/topics/scam-safety", label: "Scam Safety", icon: BookOpen, description: "Verify identities & spot scams" },
];

export function FeaturedCollections() {
  return (
    <nav aria-label="Featured collections" className="mt-12 pt-8 border-t border-border/40">
      <h2 className="text-lg font-semibold text-foreground mb-4">Explore Topic Collections</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {collections.map((c) => (
          <Link
            key={c.path}
            to={c.path}
            className="group flex items-start gap-3 p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-muted/30 transition-colors"
          >
            <c.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors block">
                {c.label}
              </span>
              <span className="text-xs text-muted-foreground">{c.description}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 ml-auto mt-0.5 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>
    </nav>
  );
}
