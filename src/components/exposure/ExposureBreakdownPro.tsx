import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ExternalLink, AlertTriangle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExposureCategory } from "@/lib/exposureScore";
import { useState } from "react";

interface ExposureBreakdownProProps {
  categories: ExposureCategory[];
  scanId: string;
}

const CATEGORY_ICONS: Record<string, typeof Shield> = {
  public_profiles: Shield,
  identifier_reuse: AlertTriangle,
  data_broker: AlertTriangle,
  breach_association: AlertTriangle,
  metadata_signals: Shield,
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  public_profiles: "Publicly discoverable profiles and accounts linked to your identifier.",
  identifier_reuse: "The same username or email appears across multiple platforms.",
  data_broker: "Your information may be aggregated by data collection services.",
  breach_association: "Your email or credentials appeared in historical data breaches.",
  metadata_signals: "Technical signals from domains, IPs, and infrastructure.",
};

const REMEDIATION_TIPS: Record<string, string[]> = {
  public_profiles: [
    "Review privacy settings on each platform",
    "Consider removing unused or dormant accounts",
    "Use privacy-focused alternatives where possible",
  ],
  identifier_reuse: [
    "Use unique usernames for sensitive accounts",
    "Consider email aliases for different services",
    "Avoid linking accounts across platforms",
  ],
  data_broker: [
    "Submit opt-out requests to data brokers",
    "Use privacy protection services",
    "Monitor for new data broker listings",
  ],
  breach_association: [
    "Change passwords for affected accounts",
    "Enable two-factor authentication",
    "Monitor for unauthorized access",
  ],
  metadata_signals: [
    "Review domain registration privacy",
    "Use VPN for sensitive activities",
    "Audit public-facing infrastructure",
  ],
};

export function ExposureBreakdownPro({ categories, scanId }: ExposureBreakdownProProps) {
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (id: string) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const detectedCategories = categories.filter(c => c.detected);

  if (detectedCategories.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50">
        <CardContent className="py-6 text-center">
          <p className="text-sm text-muted-foreground">
            No significant exposure detected across monitored categories.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Exposure Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {detectedCategories.map((category) => {
          const Icon = CATEGORY_ICONS[category.id] || Shield;
          const isOpen = openCategories.has(category.id);
          const evidenceCount = category.evidence?.length || 0;

          return (
            <Collapsible
              key={category.id}
              open={isOpen}
              onOpenChange={() => toggleCategory(category.id)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-auto py-3 px-4 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium text-sm">{category.label}</span>
                    {evidenceCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {evidenceCount} source{evidenceCount !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    isOpen && "rotate-180"
                  )} />
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="px-4 pb-4">
                <div className="space-y-4 pt-2 border-t border-border/50">
                  {/* Description */}
                  <p className="text-sm text-muted-foreground">
                    {CATEGORY_DESCRIPTIONS[category.id]}
                  </p>

                  {/* Evidence */}
                  {category.evidence && category.evidence.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Sources Detected
                      </h5>
                      <div className="grid gap-2">
                        {category.evidence.slice(0, 5).map((finding, idx) => (
                          <div 
                            key={`${finding.id}-${idx}`}
                            className="flex items-center justify-between text-sm bg-muted/30 rounded-md px-3 py-2"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="font-medium truncate block">
                                {finding.title}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                via {finding.provider}
                              </span>
                            </div>
                            {finding.url && (
                              <a
                                href={finding.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground ml-2"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                        ))}
                        {category.evidence.length > 5 && (
                          <p className="text-xs text-muted-foreground">
                            +{category.evidence.length - 5} more sources
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Remediation Tips */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      How to Reduce Exposure
                    </h5>
                    <ul className="space-y-1">
                      {REMEDIATION_TIPS[category.id]?.map((tip, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </CardContent>
    </Card>
  );
}
