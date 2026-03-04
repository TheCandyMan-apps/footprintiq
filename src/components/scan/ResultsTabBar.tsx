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
  MessageCircle,
} from 'lucide-react';

import { TabCounts } from '@/hooks/useScanResultsData';
import { ResultsToolbar } from './ResultsToolbar';

interface ResultsTabBarProps {
  tabCounts: TabCounts;
  hasGeoData: boolean;
  showTimeline?: boolean;
  messagingCount?: number;
  onExportJSON?: () => void;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  onNewScan?: () => void;
  onShare?: () => void;
  actionsDisabled?: boolean;
}

/* ── shared base + mobile-enhanced trigger classes ── */
const TRIGGER_BASE =
  'flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-1.5 text-sm ' +
  /* mobile: 44px min tap target, wider spacing, subtle active bg */
  'max-md:min-h-[44px] max-md:px-[14px] max-md:rounded-lg max-md:data-[state=active]:bg-primary/90';

/* ~10% larger icons on mobile */
const ICON_CLASS = 'h-3.5 w-3.5 max-md:h-4 max-md:w-4';

export function ResultsTabBar({ 
  tabCounts, 
  hasGeoData, 
  showTimeline = true,
  messagingCount = 1,
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
        {/* Tabs – extra horizontal gap on mobile */}
        <TabsList className="h-auto flex-wrap justify-start gap-1 max-md:gap-2 bg-transparent p-0">
          <TabsTrigger value="summary" className={TRIGGER_BASE}>
            <LayoutDashboard className={ICON_CLASS} />
            <span className="hidden sm:inline">Summary</span>
          </TabsTrigger>

          <TabsTrigger value="accounts" className={TRIGGER_BASE}>
            <Users className={ICON_CLASS} />
            <span className="hidden sm:inline">Accounts</span>
            {tabCounts.accounts > 0 && (
              <Badge variant="secondary" className="ml-0.5 h-4 px-1 text-[10px]">
                {tabCounts.accounts}
              </Badge>
            )}
          </TabsTrigger>

          <TabsTrigger value="connections" className={TRIGGER_BASE}>
            <Network className={ICON_CLASS} />
            <span className="hidden sm:inline">Connections</span>
          </TabsTrigger>

          {showTimeline && (
            <TabsTrigger value="timeline" className={TRIGGER_BASE}>
              <Clock className={ICON_CLASS} />
              <span className="hidden sm:inline">Timeline</span>
            </TabsTrigger>
          )}

          <TabsTrigger value="breaches" className={TRIGGER_BASE}>
            <ShieldAlert className={ICON_CLASS} />
            <span className="hidden sm:inline">Breaches</span>
            {tabCounts.breaches > 0 && (
              <Badge variant="destructive" className="ml-0.5 h-4 px-1 text-[10px]">
                {tabCounts.breaches}
              </Badge>
            )}
          </TabsTrigger>

          {hasGeoData && (
            <TabsTrigger value="map" className={TRIGGER_BASE}>
              <MapPin className={ICON_CLASS} />
              <span className="hidden sm:inline">Map</span>
              {tabCounts.map > 0 && (
                <Badge variant="secondary" className="ml-0.5 h-4 px-1 text-[10px]">
                  {tabCounts.map}
                </Badge>
              )}
            </TabsTrigger>
          )}

          <TabsTrigger value="messaging" className={TRIGGER_BASE}>
            <MessageCircle className={ICON_CLASS} />
            <span className="hidden sm:inline">Messaging</span>
            {messagingCount > 0 && (
              <Badge
                variant="secondary"
                className={`ml-0.5 h-4 px-1 text-[10px] ${
                  messagingCount >= 3
                    ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30'
                    : messagingCount === 2
                      ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {messagingCount}
              </Badge>
            )}
          </TabsTrigger>

          <TabsTrigger value="remediation" className={TRIGGER_BASE}>
            <ClipboardList className={ICON_CLASS} />
            <span className="hidden sm:inline">Remediation Plan</span>
          </TabsTrigger>

          <TabsTrigger value="privacy" className={TRIGGER_BASE}>
            <Shield className={ICON_CLASS} />
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
