import { AlertTriangle, UserX, KeyRound, MessagesSquare, ThumbsDown } from "lucide-react";

const risks = [
  {
    icon: <AlertTriangle className="w-5 h-5" />,
    label: "Targeted scams",
  },
  {
    icon: <UserX className="w-5 h-5" />,
    label: "Impersonation",
  },
  {
    icon: <KeyRound className="w-5 h-5" />,
    label: "Account takeover attempts",
  },
  {
    icon: <MessagesSquare className="w-5 h-5" />,
    label: "Social engineering",
  },
  {
    icon: <ThumbsDown className="w-5 h-5" />,
    label: "Reputation damage",
  },
];

export const WhyItMatters = () => {
  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
          Why digital visibility matters
        </h2>
        
        <p className="text-lg text-muted-foreground mb-8">
          Your online footprint can be used for:
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {risks.map((risk, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20 text-sm text-destructive"
            >
              {risk.icon}
              <span>{risk.label}</span>
            </div>
          ))}
        </div>

        <p className="text-lg text-muted-foreground mb-4">
          Most of this doesn't start with hacking — <span className="text-foreground font-medium">it starts with visibility.</span>
        </p>
        
        <p className="text-base text-muted-foreground">
          FootprintIQ helps you see that visibility clearly.
        </p>
      </div>
    </section>
  );
};
