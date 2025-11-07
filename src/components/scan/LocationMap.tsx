import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, ZoomIn, Filter } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface LocationData {
  ip: string;
  formatted: string;
  address: {
    country?: string;
    country_code?: string;
  };
  region: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface LocationMapProps {
  locations: LocationData[];
  regionFilter?: string;
  onRegionFilterChange?: (region: string) => void;
  isPremium?: boolean;
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

export function LocationMap({ 
  locations, 
  regionFilter = "all",
  onRegionFilterChange,
  isPremium = false 
}: LocationMapProps) {
  const [zoom, setZoom] = useState(2);
  const [center, setCenter] = useState<[number, number]>([20, 0]);

  // Filter locations by region
  const filteredLocations = regionFilter === "all" 
    ? locations 
    : locations.filter(loc => loc.region === regionFilter);

  // Calculate center point
  useEffect(() => {
    if (filteredLocations.length > 0) {
      const avgLat = filteredLocations.reduce((sum, loc) => sum + loc.coordinates.lat, 0) / filteredLocations.length;
      const avgLng = filteredLocations.reduce((sum, loc) => sum + loc.coordinates.lng, 0) / filteredLocations.length;
      setCenter([avgLat, avgLng]);
      setZoom(filteredLocations.length === 1 ? 6 : 3);
    }
  }, [filteredLocations]);

  // Get region badge color
  const getRegionColor = (region: string) => {
    switch (region) {
      case "US": return "bg-blue-500/20 text-blue-700 dark:text-blue-300";
      case "EU": return "bg-green-500/20 text-green-700 dark:text-green-300";
      case "Asia-Pacific": return "bg-purple-500/20 text-purple-700 dark:text-purple-300";
      default: return "bg-gray-500/20 text-gray-700 dark:text-gray-300";
    }
  };

  if (!isPremium) {
    return (
      <Card className="p-8 text-center bg-muted/50 border-dashed">
        <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg mb-2">Premium Feature</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Geographic visualization requires a premium subscription
        </p>
        <Button size="sm">Upgrade to Premium</Button>
      </Card>
    );
  }

  if (locations.length === 0) {
    return (
      <Card className="p-8 text-center">
        <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">
          No location data available yet
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Map Controls */}
      <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            {filteredLocations.length} Location{filteredLocations.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {onRegionFilterChange && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={regionFilter} onValueChange={onRegionFilterChange}>
              <SelectTrigger className="w-[180px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="US">US</SelectItem>
                <SelectItem value="EU">EU</SelectItem>
                <SelectItem value="Asia-Pacific">Asia-Pacific</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setZoom(prev => Math.min(prev + 1, 18))}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
      </div>

      {/* Map */}
      <div className="h-[400px] relative">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={isPremium}
        >
          <MapController center={center} zoom={zoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredLocations.map((location, idx) => (
            <Marker
              key={`${location.ip}-${idx}`}
              position={[location.coordinates.lat, location.coordinates.lng]}
            >
              <Popup>
                <div className="p-2">
                  <p className="font-medium text-sm mb-1">{location.ip}</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {location.formatted}
                  </p>
                  <Badge className={getRegionColor(location.region)}>
                    {location.region}
                  </Badge>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Region Legend */}
      <div className="p-3 border-t border-border bg-muted/30 flex items-center gap-4 flex-wrap">
        <span className="text-xs text-muted-foreground">Regions:</span>
        <Badge className={getRegionColor("US")}>US</Badge>
        <Badge className={getRegionColor("EU")}>EU</Badge>
        <Badge className={getRegionColor("Asia-Pacific")}>Asia-Pacific</Badge>
        <Badge className={getRegionColor("Other")}>Other</Badge>
      </div>
    </Card>
  );
}
