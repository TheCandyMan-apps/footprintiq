import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const links = [
  { to: "/username-search", label: "Username Search", desc: "Search usernames across 500+ platforms" },
  { to: "/find-someone-by-username", label: "Find Someone by Username", desc: "Locate profiles linked to a specific handle" },
  { to: "/check-my-digital-footprint", label: "Check My Digital Footprint", desc: "Audit your own public exposure" },
  { to: "/reverse-username-search", label: "Reverse Username Search", desc: "Trace a handle back to linked accounts" },
];

export const HomepageSEOLinks = () => {
  return (
    <section className="py-16 px-6 bg-muted/30 border-t border-border">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
          Explore more tools
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="group flex items-center justify-between p-5 rounded-xl border border-border bg-card hover:shadow-elevated transition-all"
            >
              <div>
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{l.label}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{l.desc}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-4" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
