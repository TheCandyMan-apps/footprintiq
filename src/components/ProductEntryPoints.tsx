import { Link } from "react-router-dom";
import { User, Mail, Search, ArrowRight } from "lucide-react";

const entryPoints = [
  {
    icon: <User className="w-6 h-6" />,
    title: "Username Search",
    description: "Find where your username appears across platforms",
    href: "/username-search"
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: "Email Exposure Check",
    description: "Check if your email is in breach databases",
    href: "/email-breach-check"
  },
  {
    icon: <Search className="w-6 h-6" />,
    title: "Digital Footprint Scan",
    description: "Run a complete scan across all identifiers",
    href: "/scan"
  }
];

export const ProductEntryPoints = () => {
  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Start with a Focused Scan
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the scan that matches what you want to discover
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {entryPoints.map((entry, index) => (
            <Link
              key={index}
              to={entry.href}
              className="group p-6 rounded-xl bg-card border border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary/20 transition-colors">
                {entry.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                {entry.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {entry.description}
              </p>
              <div className="flex items-center text-sm font-medium text-primary">
                <span>Get started</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
