import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GeocodeResult {
  ip: string;
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

interface UseGeocodingOptions {
  enabled?: boolean;
  highPrecisionMode?: boolean;
}

export function useGeocoding(
  ipAddresses: Array<{ ip: string; lat?: number; lon?: number }>,
  options: UseGeocodingOptions = {}
) {
  const { enabled = true, highPrecisionMode = false } = options;
  const [locations, setLocations] = useState<Map<string, GeocodeResult>>(new Map());
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Map<string, string>>(new Map());

  // Regional bounds for high-precision mode
  const getRegionalBounds = (region?: string): string | undefined => {
    if (!highPrecisionMode || !region) return undefined;

    const bounds: Record<string, string> = {
      US: "-125.0,24.0,-66.0,49.0", // US continental bounds
      EU: "-10.0,35.0,40.0,70.0", // European bounds
      "Asia-Pacific": "60.0,-50.0,180.0,60.0", // Asia-Pacific bounds
    };

    return bounds[region];
  };

  useEffect(() => {
    if (!enabled || ipAddresses.length === 0) {
      return;
    }

    const geocodeIPs = async () => {
      setLoading(true);
      const newLocations = new Map<string, GeocodeResult>();
      const newErrors = new Map<string, string>();

      for (const { ip, lat, lon } of ipAddresses) {
        // Skip if no coordinates
        if (!lat || !lon) {
          newErrors.set(ip, "No coordinates available");
          continue;
        }

        // Skip if already geocoded
        if (locations.has(ip)) {
          newLocations.set(ip, locations.get(ip)!);
          continue;
        }

        try {
          const { data, error } = await supabase.functions.invoke("geocode-location", {
            body: {
              latitude: lat,
              longitude: lon,
              bounds: getRegionalBounds(),
            },
          });

          if (error) {
            console.error(`Geocoding error for ${ip}:`, error);
            newErrors.set(ip, error.message || "Geocoding failed");
            continue;
          }

          if (data?.error) {
            newErrors.set(ip, data.fallback || data.error);
            continue;
          }

          newLocations.set(ip, { ip, ...data });
        } catch (err) {
          console.error(`Geocoding error for ${ip}:`, err);
          newErrors.set(ip, err instanceof Error ? err.message : "Unknown error");
        }
      }

      setLocations(newLocations);
      setErrors(newErrors);
      setLoading(false);

      // Show summary toast
      if (newLocations.size > 0) {
        toast.success(`Geocoded ${newLocations.size} location${newLocations.size !== 1 ? 's' : ''}`);
      }
      if (newErrors.size > 0) {
        toast.warning(`${newErrors.size} location${newErrors.size !== 1 ? 's' : ''} could not be geocoded`);
      }
    };

    geocodeIPs();
  }, [ipAddresses, enabled, highPrecisionMode]);

  return {
    locations: Array.from(locations.values()),
    loading,
    errors,
    getLocationForIP: (ip: string) => locations.get(ip) || null,
    getErrorForIP: (ip: string) => errors.get(ip) || null,
  };
}
