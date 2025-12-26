import { User, MessageSquare, ShieldAlert, Database, Link2, BarChart3 } from "lucide-react";

const scanItems = [
  {
    icon: <User className="w-5 h-5" />,
    title: "Public usernames and aliases",
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: "Social and forum profiles",
  },
  {
    icon: <ShieldAlert className="w-5 h-5" />,
    title: "Breached credentials and exposure signals",
  },
  {
    icon: <Database className="w-5 h-5" />,
    title: "Data broker and people-search listings",
  },
  {
    icon: <Link2 className="w-5 h-5" />,
    title: "Reused identifiers across platforms",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Risk indicators and confidence scoring",
  },
];

export const WhyChooseUs = () => {
  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            What we look for
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {scanItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                {item.icon}
              </div>
              <span className="text-sm font-medium text-foreground">
                {item.title}
              </span>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          All findings are sourced from publicly accessible information only.
        </p>
      </div>
    </section>
  );
};
