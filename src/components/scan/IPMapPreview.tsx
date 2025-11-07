import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default marker icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface Location {
  ip: string;
  lat: number;
  lng: number;
  city?: string;
  country?: string;
  formatted?: string;
}

interface IPMapPreviewProps {
  ips: string[];
}

export const IPMapPreview = ({ ips }: IPMapPreviewProps) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ips.length === 0) return;

    const geocodeIPs = async () => {
      setLoading(true);
      setError(null);
      const results: Location[] = [];

      try {
        for (const ip of ips.slice(0, 10)) { // Limit to 10 IPs
          try {
            const { data, error } = await supabase.functions.invoke('geocode-ip', {
              body: { ip }
            });

            if (error) {
              console.error(`Geocoding failed for ${ip}:`, error);
              continue;
            }

            if (data && data.lat && data.lng) {
              results.push(data);
            }
          } catch (err) {
            console.error(`Error geocoding ${ip}:`, err);
          }
        }

        if (results.length === 0) {
          setError("Could not geocode any IP addresses");
          toast.error("Geocoding failed for all IPs");
        } else {
          setLocations(results);
          if (results.length < ips.length) {
            toast.warning(`Geocoded ${results.length} of ${ips.length} IPs`);
          }
        }
      } catch (err) {
        console.error('Geocoding error:', err);
        setError("Failed to geocode IPs");
        toast.error("Failed to geocode IPs");
      } finally {
        setLoading(false);
      }
    };

    geocodeIPs();
  }, [ips]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Geocoding IP addresses...</p>
        </div>
      </Card>
    );
  }

  if (error || locations.length === 0) {
    return null;
  }

  const center: [number, number] = locations.length > 0 
    ? [locations[0].lat, locations[0].lng]
    : [0, 0];

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">IP Locations</h3>
          </div>
          <Badge variant="secondary">{locations.length} locations</Badge>
        </div>

        <div className="h-[300px] rounded-lg overflow-hidden border border-border">
          <MapContainer
            center={center}
            zoom={locations.length === 1 ? 10 : 2}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locations.map((location, index) => (
              <Marker key={index} position={[location.lat, location.lng]}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold">{location.ip}</p>
                    {location.formatted && (
                      <p className="text-muted-foreground">{location.formatted}</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {locations.slice(0, 4).map((location, index) => (
            <div
              key={index}
              className="p-2 rounded bg-muted/50 text-xs"
            >
              <p className="font-medium">{location.ip}</p>
              <p className="text-muted-foreground truncate">
                {location.formatted || `${location.city}, ${location.country}`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
