import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Users, 
  Network, 
  Clock, 
  ShieldAlert, 
  MapPin 
} from 'lucide-react';
import { TabCounts } from '@/hooks/useScanResultsData';

interface ResultsTabBarProps {
  tabCounts: TabCounts;
  hasGeoData: boolean;
  showTimeline?: boolean;
}

export function ResultsTabBar({ tabCounts, hasGeoData, showTimeline = true }: ResultsTabBarProps) {
  return (
    <div className="sticky top-0 z-40 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-3 bg-background/95 backdrop-blur-sm border-b shadow-sm">
      <TabsList className="w-full h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
        <TabsTrigger 
          value="summary" 
          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span className="hidden sm:inline">Summary</span>
        </TabsTrigger>

        <TabsTrigger 
          value="accounts" 
          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
        >
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Accounts</span>
          {tabCounts.accounts > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {tabCounts.accounts}
            </Badge>
          )}
        </TabsTrigger>

        <TabsTrigger 
          value="connections" 
          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
        >
          <Network className="h-4 w-4" />
          <span className="hidden sm:inline">Connections</span>
        </TabsTrigger>

        {showTimeline && (
          <TabsTrigger 
            value="timeline" 
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
          >
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Timeline</span>
          </TabsTrigger>
        )}

        <TabsTrigger 
          value="breaches" 
          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
        >
          <ShieldAlert className="h-4 w-4" />
          <span className="hidden sm:inline">Breaches</span>
          {tabCounts.breaches > 0 && (
            <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
              {tabCounts.breaches}
            </Badge>
          )}
        </TabsTrigger>

        {hasGeoData && (
          <TabsTrigger 
            value="map" 
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
          >
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Map</span>
            {tabCounts.map > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {tabCounts.map}
              </Badge>
            )}
          </TabsTrigger>
        )}
      </TabsList>
    </div>
  );
}
