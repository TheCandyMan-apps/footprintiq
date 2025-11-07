import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type GeocodingStatus = 'pending' | 'processing' | 'complete' | 'error';

export interface IPGeocodingStatus {
  ip: string;
  status: GeocodingStatus;
  error?: string;
  location?: string;
}

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
  const [progressItems, setProgressItems] = useState<IPGeocodingStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

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
      setProgressItems([]);
      setIsProcessing(false);
      return;
    }

    const geocodeIPs = async () => {
      setLoading(true);
      setIsProcessing(true);
      const newLocations = new Map<string, GeocodeResult>();
      const newErrors = new Map<string, string>();

      // Initialize progress items
      const initialProgress: IPGeocodingStatus[] = ipAddresses.map(({ ip, lat, lon }) => ({
        ip,
        status: !lat || !lon ? 'error' : (locations.has(ip) ? 'complete' : 'pending'),
        error: !lat || !lon ? 'No coordinates available' : undefined,
        location: locations.has(ip) ? locations.get(ip)?.formatted : undefined,
      }));
      setProgressItems(initialProgress);

      // Copy already geocoded locations
      for (const { ip } of ipAddresses) {
        if (locations.has(ip)) {
          newLocations.set(ip, locations.get(ip)!);
        }
      }

      for (let i = 0; i < ipAddresses.length; i++) {
        const { ip, lat, lon } = ipAddresses[i];

        // Skip if no coordinates
        if (!lat || !lon) {
          newErrors.set(ip, "No coordinates available");
          setProgressItems(prev => prev.map(item =>
            item.ip === ip ? { ...item, status: 'error' as GeocodingStatus, error: 'No coordinates available' } : item
          ));
          continue;
        }

        // Skip if already geocoded
        if (locations.has(ip)) {
          continue;
        }

        // Update status to processing
        setProgressItems(prev => prev.map(item =>
          item.ip === ip ? { ...item, status: 'processing' as GeocodingStatus } : item
        ));

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
            const errorMsg = error.message || "Geocoding failed";
            newErrors.set(ip, errorMsg);
            setProgressItems(prev => prev.map(item =>
              item.ip === ip ? { ...item, status: 'error' as GeocodingStatus, error: errorMsg } : item
            ));
            continue;
          }

          if (data?.error) {
            const errorMsg = data.fallback || data.error;
            newErrors.set(ip, errorMsg);
            setProgressItems(prev => prev.map(item =>
              item.ip === ip ? { ...item, status: 'error' as GeocodingStatus, error: errorMsg } : item
            ));
            continue;
          }

          const result = { ip, ...data };
          newLocations.set(ip, result);
          setProgressItems(prev => prev.map(item =>
            item.ip === ip ? { ...item, status: 'complete' as GeocodingStatus, location: result.formatted } : item
          ));
        } catch (err) {
          console.error(`Geocoding error for ${ip}:`, err);
          const errorMsg = err instanceof Error ? err.message : "Unknown error";
          newErrors.set(ip, errorMsg);
          setProgressItems(prev => prev.map(item =>
            item.ip === ip ? { ...item, status: 'error' as GeocodingStatus, error: errorMsg } : item
          ));
        }
      }

      setLocations(newLocations);
      setErrors(newErrors);
      setLoading(false);
      setIsProcessing(false);

      // Show summary toast
      const successCount = newLocations.size - locations.size;
      if (successCount > 0) {
        toast.success(`Geocoded ${successCount} location${successCount !== 1 ? 's' : ''}`);
      }
      if (newErrors.size > 0) {
        toast.warning(`${newErrors.size} location${newErrors.size !== 1 ? 's' : ''} could not be geocoded`);
      }
    };

    geocodeIPs();
  }, [ipAddresses, enabled, highPrecisionMode]);

  const completedCount = progressItems.filter(i => i.status === 'complete').length;
  const errorCount = progressItems.filter(i => i.status === 'error').length;

  return {
    locations: Array.from(locations.values()),
    loading,
    errors,
    getLocationForIP: (ip: string) => locations.get(ip) || null,
    getErrorForIP: (ip: string) => errors.get(ip) || null,
    progressItems,
    isProcessing,
    totalCount: ipAddresses.length,
    completedCount,
    errorCount,
  };
}
