import { Card, CardContent } from "@/components/ui/card";
import { Fingerprint, Network, BarChart3, SearchCheck } from "lucide-react";

const sections = [
  {
    icon: <Fingerprint className="w-7 h-7" />,
    title: "Why usernames reveal digital footprints",
    body: "A single username reused across platforms creates a traceable web of identity signals. Attackers and data brokers exploit this to build detailed profiles. Understanding your username exposure is the first step toward reducing risk.",
  },
  {
    icon: <SearchCheck className="w-7 h-7" />,
    title: "How investigators trace usernames across platforms",
    body: "OSINT practitioners use automated tools — like Maigret, Sherlock, and WhatsMyName — to check hundreds of platforms simultaneously. FootprintIQ applies this methodology ethically, correlating results and filtering false positives so you get accurate, actionable intelligence.",
  },
  {
    icon: <Network className="w-7 h-7" />,
    title: "Identity correlation mapping",
    body: "When the same handle appears on GitHub, Reddit, Twitter, and a forum, those accounts can be cross-referenced to reveal patterns — location hints, interests, employment, or associated email addresses. This is identity correlation, and it's exactly what FootprintIQ maps for you.",
  },
  {
    icon: <BarChart3 className="w-7 h-7" />,
    title: "Understanding your Digital Exposure Score",
    body: "Your score (0–100) reflects how discoverable and linkable your online presence is. It factors in the number of detected profiles, username reuse patterns, cross-platform correlations, and public identity indicators. A higher score means greater exposure — and a clearer need to act.",
  },
];

export const HomepageEducational = () => {
  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            How username intelligence works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Learn how a single username can expose your digital identity — and how FootprintIQ helps you take control.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {sections.map((s) => (
            <Card key={s.title} disableHover>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {s.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
