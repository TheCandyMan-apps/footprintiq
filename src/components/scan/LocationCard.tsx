import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, DollarSign, Clock } from "lucide-react";

interface LocationData {
  formatted: string;
  address: {
    road?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
  region: string;
  continent?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  timezone?: {
    name: string;
    offset_string: string;
  };
  currency?: {
    name: string;
    iso_code: string;
  };
  confidence: number;
}

interface LocationCardProps {
  ip: string;
  location: LocationData | null;
  loading: boolean;
  error: string | null;
}

export function LocationCard({ ip, location, loading, error }: LocationCardProps) {
  if (loading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-muted rounded w-1/2"></div>
      </Card>
    );
  }

  if (error || !location) {
    return (
      <Card className="p-4 border-muted-foreground/20">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-medium text-sm">{ip}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {error || "Location data unavailable—check provider"}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 hover:border-primary/50 transition-colors">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-sm">{ip}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {location.formatted}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {location.region}
          </Badge>
        </div>

        {/* Location Details */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {location.address.country && (
            <div className="flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                {location.address.country} ({location.address.country_code})
              </span>
            </div>
          )}
          
          {location.timezone && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                {location.timezone.name}
              </span>
            </div>
          )}

          {location.currency && (
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                {location.currency.iso_code}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">
              Confidence: {location.confidence}%
            </span>
          </div>
        </div>

        {/* Coordinates */}
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground font-mono">
            {location.coordinates.lat.toFixed(6)}, {location.coordinates.lng.toFixed(6)}
          </p>
        </div>
      </div>
    </Card>
  );
}
