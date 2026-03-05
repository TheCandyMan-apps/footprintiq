import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Globe, Users } from "lucide-react";

const EXAMPLE_PLATFORMS = [
  { name: "Twitter / X", status: "Found", confidence: "High" },
  { name: "GitHub", status: "Found", confidence: "High" },
  { name: "Reddit", status: "Found", confidence: "Medium" },
  { name: "Instagram", status: "Found", confidence: "High" },
  { name: "Steam", status: "Found", confidence: "Medium" },
  { name: "Keybase", status: "Not found", confidence: "" },
];

export const HomepageResultPreview = () => {
  return (
    <section className="py-20 px-6 bg-muted/30 border-y border-border">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">
            Example Output
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            What a scan looks like
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Here's a preview of what FootprintIQ returns when scanning the example username <span className="font-mono text-foreground font-medium">johndoe_92</span>.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Score card */}
          <Card className="md:col-span-1 border-primary/20">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
              <ShieldAlert className="w-10 h-10 text-warning mb-3" />
              <p className="text-sm text-muted-foreground mb-1">Digital Exposure Score</p>
              <p className="text-5xl font-bold text-foreground">62<span className="text-lg font-normal text-muted-foreground"> / 100</span></p>
              <Badge variant="outline" className="mt-3 border-warning/40 text-warning">High Exposure</Badge>
            </CardContent>
          </Card>

          {/* Platform results */}
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Platforms Discovered</h3>
                <Badge variant="secondary" className="ml-auto">5 matches</Badge>
              </div>
              <div className="space-y-2">
                {EXAMPLE_PLATFORMS.map((p) => (
                  <div key={p.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm text-foreground">{p.name}</span>
                    {p.status === "Found" ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{p.confidence}</span>
                        <Badge variant="default" className="text-xs">Found</Badge>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground">Not found</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Users className="w-4 h-4 inline-block mr-1 -mt-0.5" />
          This is example data for illustration only. Your scan will reflect real, public results.
        </p>
      </div>
    </section>
  );
};
