import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ExternalLink, Shield, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EnrichmentData {
  context: string;
  links: Array<{
    title: string;
    url: string;
    description?: string;
  }>;
  remediation_steps: string[];
  attack_vectors: string[];
}

interface EnrichmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrichment: EnrichmentData | null;
  isLoading: boolean;
  creditsSpent?: number;
}

export function EnrichmentDialog({
  open,
  onOpenChange,
  enrichment,
  isLoading,
  creditsSpent
}: EnrichmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Deep Enrichment Analysis
          </DialogTitle>
          <DialogDescription>
            AI-powered security analysis and recommendations
            {creditsSpent && (
              <Badge variant="secondary" className="ml-2">
                {creditsSpent} credits used
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-2">
                <Sparkles className="h-8 w-8 animate-pulse text-primary" />
                <p className="text-sm text-muted-foreground">Analyzing finding...</p>
              </div>
            </div>
          ) : enrichment ? (
            <div className="space-y-6 p-1">
              {/* Context */}
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Threat Context
                </h3>
                <p className="text-sm text-muted-foreground">{enrichment.context}</p>
              </div>

              {/* Attack Vectors */}
              {enrichment.attack_vectors?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Potential Attack Vectors
                  </h3>
                  <ul className="space-y-2">
                    {enrichment.attack_vectors.map((vector, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-destructive">•</span>
                        <span>{vector}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Remediation Steps */}
              {enrichment.remediation_steps?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Remediation Steps</h3>
                  <ol className="space-y-2">
                    {enrichment.remediation_steps.map((step, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                        <span className="font-medium text-foreground">{idx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* External Links */}
              {enrichment.links?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Additional Resources
                  </h3>
                  <div className="space-y-2">
                    {enrichment.links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{link.title}</p>
                            {link.description && (
                              <p className="text-xs text-muted-foreground mt-1">{link.description}</p>
                            )}
                          </div>
                          <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </ScrollArea>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
