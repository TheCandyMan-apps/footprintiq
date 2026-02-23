import { User, Mail, Database, Link2 } from "lucide-react";

const discoveries = [
  {
    icon: <User className="w-6 h-6" />,
    title: "Where your username appears online",
    description: "See what attackers see — identify accounts and profiles linked to usernames you use across hundreds of platforms"
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: "Whether your email is publicly exposed",
    description: "Triage your digital risks — check breach databases and public exposure sources before they're exploited"
  },
  {
    icon: <Database className="w-6 h-6" />,
    title: "Data broker listings linked to your identity",
    description: "Know exactly where people-search sites list your information — the intelligence you need before buying removals"
  },
  {
    icon: <Link2 className="w-6 h-6" />,
    title: "Hidden connections between public information",
    description: "Understand how identifiers link across platforms — the correlation risk most tools miss"
  }
];

export const WhatYouCanDiscover = () => {
  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            What FootprintIQ Helps You Discover
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {discoveries.map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-card border border-border shadow-sm"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
