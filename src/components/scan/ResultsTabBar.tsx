import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Users, 
  Network, 
  Clock, 
  ShieldAlert, 
  MapPin,
  Shield,
  ClipboardList,
  Send,
} from 'lucide-react';
import { TabCounts } from '@/hooks/useScanResultsData';
import { ResultsToolbar } from './ResultsToolbar';

interface ResultsTabBarProps {
  tabCounts: TabCounts;
  hasGeoData: boolean;
  showTimeline?: boolean;
  onExportJSON?: () => void;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  onNewScan?: () => void;
  onShare?: () => void;
  actionsDisabled?: boolean;
}

export function ResultsTabBar({ 
  tabCounts, 
  hasGeoData, 
  showTimeline = true,
  onExportJSON,
  onExportCSV,
  onExportPDF,
  onNewScan,
  onShare,
  actionsDisabled = false,
}: ResultsTabBarProps) {
  const hasActions = onExportJSON || onExportCSV || onExportPDF || onNewScan;

  return (
    <div className="sticky top-0 z-40 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-2 bg-background/95 backdrop-blur-sm border-b shadow-sm">
      <div className="flex items-center justify-between gap-2">
        {/* Tabs */}
        <TabsList className="h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
          <TabsTrigger 
            value="summary" 
            className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-1.5 text-sm"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Summary</span>
          </TabsTrigger>

          <TabsTrigger 
            value="accounts" 
            className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-1.5 text-sm"
          >
            <Users className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Accounts</span>
            {tabCounts.accounts > 0 && (
              <Badge variant="secondary" className="ml-0.5 h-4 px-1 text-[10px]">
                {tabCounts.accounts}
              </Badge>
            )}
          </TabsTrigger>

          <TabsTrigger 
            value="connections" 
            className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-1.5 text-sm"
          >
            <Network className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Connections</span>
          </TabsTrigger>

          {showTimeline && (
            <TabsTrigger 
              value="timeline" 
              className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-1.5 text-sm"
            >
              <Clock className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Timeline</span>
            </TabsTrigger>
          )}

          <TabsTrigger 
            value="breaches" 
            className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-1.5 text-sm"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Breaches</span>
            {tabCounts.breaches > 0 && (
              <Badge variant="destructive" className="ml-0.5 h-4 px-1 text-[10px]">
                {tabCounts.breaches}
              </Badge>
            )}
          </TabsTrigger>

          {hasGeoData && (
            <TabsTrigger 
              value="map" 
              className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-1.5 text-sm"
            >
              <MapPin className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Map</span>
              {tabCounts.map > 0 && (
                <Badge variant="secondary" className="ml-0.5 h-4 px-1 text-[10px]">
                  {tabCounts.map}
                </Badge>
              )}
            </TabsTrigger>
          )}

          <TabsTrigger 
            value="telegram" 
            className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-1.5 text-sm"
          >
            <Send className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Messaging Intelligence</span>
          </TabsTrigger>

          <TabsTrigger 
            value="remediation" 
            className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-1.5 text-sm"
          >
            <ClipboardList className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Remediation Plan</span>
          </TabsTrigger>

          <TabsTrigger 
            value="privacy" 
            className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-1.5 text-sm"
          >
            <Shield className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Privacy Center</span>
          </TabsTrigger>
        </TabsList>

        {/* Compact Toolbar */}
        {hasActions && (
          <ResultsToolbar
            onExportJSON={onExportJSON || (() => {})}
            onExportCSV={onExportCSV || (() => {})}
            onExportPDF={onExportPDF || (() => {})}
            onNewScan={onNewScan || (() => {})}
            onShare={onShare}
            disabled={actionsDisabled}
          />
        )}
      </div>
    </div>
  );
}
