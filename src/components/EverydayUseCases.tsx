import { Heart, Briefcase, ShieldAlert, Users, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const useCases = [
  {
    icon: Heart,
    title: "Dating & Online Safety",
    description:
      "See what a date, match, or new contact could find about you with a quick search. Reduce your exposure before meeting someone new.",
  },
  {
    icon: Briefcase,
    title: "Job Searches & Career Moves",
    description:
      "Employers Google candidates. Check what shows up for your name and clean up old profiles before your next interview.",
  },
  {
    icon: ShieldAlert,
    title: "After a Data Breach",
    description:
      "Been notified of a breach? See exactly where your email and passwords are exposed — and get a step-by-step cleanup plan.",
  },
  {
    icon: Users,
    title: "Protecting Your Family",
    description:
      "Check what's publicly visible about your children or elderly relatives, and take action before someone else does.",
  },
  {
    icon: Search,
    title: "Curious About Your Footprint",
    description:
      "Ever Googled yourself and wondered what else is out there? FootprintIQ checks hundreds of sources you'd never find on your own.",
  },
];

export function EverydayUseCases() {
  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Real Reasons People Use FootprintIQ
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            You don't need to be a security expert. Most people scan for everyday reasons.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((uc) => {
            const Icon = uc.icon;
            return (
              <Card key={uc.title} className="border-border/60">
                <CardContent className="p-6">
                  <div className="rounded-lg bg-primary/10 p-2.5 w-fit mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{uc.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {uc.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
