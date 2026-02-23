import { User, MessageSquare, Database, Link2, BarChart3, Globe } from "lucide-react";

const scanItems = [
  {
    icon: <User className="w-5 h-5" />,
    title: "Username and email matching",
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: "Where your accounts overlap",
  },
  {
    icon: <Database className="w-5 h-5" />,
    title: "How visible you are",
  },
  {
    icon: <Link2 className="w-5 h-5" />,
    title: "Account age and activity patterns",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "How easy you are to find",
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: "Connections between your profiles",
  },
];

export const WhyChooseUs = () => {
  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            What We Check
          </h2>
          <p className="text-muted-foreground">
            Continuous outside-in monitoring across your full digital surface
          </p>
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
          All findings require independent verification.
        </p>
      </div>
    </section>
  );
};
