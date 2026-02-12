import { Shield, Fingerprint, AlertTriangle, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/JsonLd";

const capabilities = [
  {
    icon: Shield,
    title: "Identity Risk Scoring",
    description:
      "FootprintIQ generates an identity risk score based on publicly observable correlation signals, account exposure patterns, and contextual indicators.",
  },
  {
    icon: Fingerprint,
    title: "Digital Footprint Discovery",
    description:
      "Scans identify publicly accessible accounts, reused usernames, and exposure patterns across platforms.",
  },
  {
    icon: AlertTriangle,
    title: "Dark Web & Breach Signal Detection",
    description:
      "Where available, breach and exposure indicators are surfaced as part of risk analysis.",
  },
  {
    icon: BookOpen,
    title: "Interpretation-First Design",
    description:
      "Scores and results are presented with context, limitations, and ethical guidance.",
  },
];

function buildCapabilitiesItemListSchema(origin: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "FootprintIQ Platform Capabilities",
    "description":
      "Core capabilities of the FootprintIQ ethical digital footprint intelligence platform.",
    "url": `${origin}/#capabilities`,
    "numberOfItems": capabilities.length,
    "itemListElement": capabilities.map((cap, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": cap.title,
      "description": cap.description,
    })),
  };
}

interface PlatformCapabilitiesProps {
  /** When true, renders JSON-LD schema (use on one page only, e.g. homepage) */
  includeSchema?: boolean;
}

export function PlatformCapabilities({ includeSchema = false }: PlatformCapabilitiesProps) {
  return (
    <section id="capabilities" className="py-16 px-6">
      {includeSchema && (
        <JsonLd data={buildCapabilitiesItemListSchema("https://footprintiq.app")} />
      )}

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Platform Capabilities
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Core capabilities that power FootprintIQ's ethical digital footprint analysis.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <Card key={cap.title} className="border-border/60">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary/10 p-2.5 flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1.5">{cap.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {cap.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
