import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Code2, Calendar, CheckCircle2 } from "lucide-react";

interface ApiVersionBadgeProps {
  version: string;
  releaseDate?: string;
  isLatest?: boolean;
  deprecated?: boolean;
  sunsetDate?: string;
}

export function ApiVersionBadge({
  version,
  releaseDate,
  isLatest = false,
  deprecated = false,
  sunsetDate,
}: ApiVersionBadgeProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Badge
          variant={deprecated ? "destructive" : isLatest ? "default" : "secondary"}
          className="cursor-help"
        >
          <Code2 className="h-3 w-3 mr-1" />
          {version}
          {isLatest && <CheckCircle2 className="h-3 w-3 ml-1" />}
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">API Version {version}</h4>
            {isLatest && (
              <Badge variant="outline" className="text-xs">
                Latest
              </Badge>
            )}
          </div>

          {releaseDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Released: {releaseDate}</span>
            </div>
          )}

          {deprecated && (
            <div className="space-y-2">
              <p className="text-sm text-destructive font-medium">
                ⚠️ This version is deprecated
              </p>
              {sunsetDate && (
                <p className="text-sm text-muted-foreground">
                  End of support: {sunsetDate}
                </p>
              )}
            </div>
          )}

          {!deprecated && (
            <p className="text-sm text-muted-foreground">
              This version is actively maintained and receives security updates.
            </p>
          )}

          <div className="pt-2 border-t">
            <a
              href={`/docs/api/v${version}`}
              className="text-sm text-primary hover:underline"
            >
              View documentation →
            </a>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
