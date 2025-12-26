import { User, Briefcase, Newspaper, Shield, Users } from "lucide-react";

const personas = [
  {
    icon: <User className="w-5 h-5" />,
    label: "Individuals concerned about online privacy",
  },
  {
    icon: <Briefcase className="w-5 h-5" />,
    label: "Professionals managing their public presence",
  },
  {
    icon: <Newspaper className="w-5 h-5" />,
    label: "Journalists and researchers",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    label: "Security-aware users",
  },
  {
    icon: <Users className="w-5 h-5" />,
    label: "Anyone who wants to know what's out there — before it's misused",
  },
];

export const WhoItsFor = () => {
  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
          Who uses FootprintIQ
        </h2>
        
        <div className="mt-10 space-y-4">
          {personas.map((persona, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                {persona.icon}
              </div>
              <span className="text-muted-foreground">{persona.label}</span>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground mt-8">
          No technical background required.
        </p>
      </div>
    </section>
  );
};
