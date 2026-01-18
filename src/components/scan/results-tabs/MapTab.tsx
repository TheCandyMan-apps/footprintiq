import { useState } from 'react';
import { LocationMap } from '@/components/scan/LocationMap';

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

interface MapTabProps {
  locations: LocationData[];
  isPremium?: boolean;
}

export function MapTab({ locations, isPremium = true }: MapTabProps) {
  const [regionFilter, setRegionFilter] = useState('all');

  return (
    <div className="space-y-4">
      <LocationMap
        locations={locations}
        regionFilter={regionFilter}
        onRegionFilterChange={setRegionFilter}
        isPremium={isPremium}
      />
    </div>
  );
}

export default MapTab;
