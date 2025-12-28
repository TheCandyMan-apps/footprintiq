import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfidenceScoreBadge } from '@/components/ConfidenceScoreBadge';
import { ContextEnrichmentPanel, UrlOption } from '@/components/ContextEnrichmentPanel';
import { GatedContent, useResultsGating } from '@/components/billing/GatedContent';
import { 
  ExternalLink, 
  Globe, 
  User, 
  Trash2, 
  Flag,
  Lock
} from 'lucide-react';

interface DataSourceItem {
  id: string;
  name: string;
  category: string;
  dataFound: string[];
  riskLevel: 'high' | 'medium' | 'low';
  url: string;
  confidenceScore?: number;
}

interface SocialProfileItem {
  id: string;
  platform: string;
  username: string;
  profileUrl: string;
  found: boolean;
  followers?: string;
  lastActive?: string;
  source?: string;
  confidenceScore?: number;
}

type ResultItem = 
  | { type: 'data_source'; data: DataSourceItem }
  | { type: 'social_profile'; data: SocialProfileItem };

interface ResultDetailDrawerProps {
  item: ResultItem | null;
  open: boolean;
  onClose: () => void;
  onRemovalRequest?: (id: string, name: string) => void;
  onFlagFalsePositive?: (id: string, type: 'data_source' | 'social_profile', name: string, score: number) => void;
  isFlagged?: boolean;
}

const RISK_COLORS: Record<string, string> = {
  low: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  medium: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  high: 'bg-red-500/10 text-red-700 border-red-500/20',
};

/**
 * Helper to extract all available URLs from a result item.
 * Returns an array of UrlOption for the dropdown.
 */
function getItemUrls(item: ResultItem | null): UrlOption[] {
  if (!item) return [];
  
  const urls: UrlOption[] = [];
  
  if (item.type === 'data_source') {
    if (item.data.url) {
      urls.push({ label: 'Source URL', url: item.data.url });
    }
  }
  
  if (item.type === 'social_profile') {
    if (item.data.profileUrl) {
      urls.push({ label: 'Profile URL', url: item.data.profileUrl });
    }
  }
  
  return urls;
}

function getItemName(item: ResultItem): string {
  if (item.type === 'data_source') {
    return item.data.name;
  }
  return item.data.platform;
}

function getItemConfidence(item: ResultItem): number {
  if (item.type === 'data_source') {
    return item.data.confidenceScore || 75;
  }
  return item.data.confidenceScore || 85;
}

/** Mask URL for free users - show domain only */
function maskUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}/••••••`;
  } catch {
    return '••••••••••••';
  }
}

export function ResultDetailDrawer({
  item,
  open,
  onClose,
  onRemovalRequest,
  onFlagFalsePositive,
  isFlagged = false,
}: ResultDetailDrawerProps) {
  const { canSeeSourceUrls, canSeeConfidenceExplanation, canSeeContextEnrichment, isFree } = useResultsGating();

  if (!item) return null;

  const urls = getItemUrls(item);
  const hasUrls = urls.length > 0;
  const primaryUrl = urls[0]?.url;
  const name = getItemName(item);
  const confidence = getItemConfidence(item);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            {item.type === 'data_source' ? (
              <Globe className="w-5 h-5 text-muted-foreground" />
            ) : (
              <User className="w-5 h-5 text-muted-foreground" />
            )}
            {item.type === 'data_source' ? 'Data Source Details' : 'Social Profile Details'}
          </SheetTitle>
          <SheetDescription>
            {item.type === 'data_source' 
              ? 'Information about this data broker listing'
              : 'Information about this social media profile'
            }
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="context" disabled={!hasUrls || !canSeeContextEnrichment}>
              Context
              {!canSeeContextEnrichment && <Lock className="w-3 h-3 ml-1.5 opacity-50" />}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-180px)] pr-4 mt-4">
            <TabsContent value="overview" className="mt-0 space-y-6">
              {/* Summary Card */}
              <Card className="p-4 bg-card">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-lg mb-1">{name}</div>
                      {item.type === 'data_source' && (
                        <div className="text-sm text-muted-foreground">{item.data.category}</div>
                      )}
                      {item.type === 'social_profile' && item.data.username && (
                        <div className="text-sm text-muted-foreground">@{item.data.username}</div>
                      )}
                    </div>
                    {item.type === 'data_source' && (
                      <Badge className={RISK_COLORS[item.data.riskLevel] || RISK_COLORS.low}>
                        {item.data.riskLevel.toUpperCase()} RISK
                      </Badge>
                    )}
                    {item.type === 'social_profile' && item.data.source === 'predicta' && (
                      <Badge variant="secondary">Predicta Search</Badge>
                    )}
                  </div>

                  <Separator />

                  {/* Data found (for data sources) - category summary is allowed */}
                  {item.type === 'data_source' && item.data.dataFound.length > 0 && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Data Found</div>
                      <div className="flex flex-wrap gap-2">
                        {item.data.dataFound.map((data, idx) => (
                          <span 
                            key={idx} 
                            className="px-3 py-1 rounded-full bg-muted text-xs text-foreground"
                          >
                            {data}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Profile details (for social profiles) */}
                  {item.type === 'social_profile' && (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {item.data.followers && (
                        <div>
                          <div className="text-muted-foreground">Followers</div>
                          <div className="font-medium">{item.data.followers}</div>
                        </div>
                      )}
                      {item.data.lastActive && (
                        <div>
                          <div className="text-muted-foreground">Last Active</div>
                          <div className="font-medium">{item.data.lastActive}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Confidence Score - numeric only for free, explanation for Pro */}
                  <div className="pt-3 border-t border-border">
                    <ConfidenceScoreBadge score={confidence} size="sm" />
                    {/* Confidence explanation gated */}
                    <GatedContent 
                      isGated={!canSeeConfidenceExplanation} 
                      contentType="confidence"
                      compact
                      className="mt-2"
                    >
                      <p className="text-xs text-muted-foreground">
                        Score based on profile completeness, activity patterns, and cross-reference validation.
                      </p>
                    </GatedContent>
                  </div>
                </div>
              </Card>

              {/* Actions - Source URL gated for free users */}
              <div className="space-y-2 pt-4">
                {primaryUrl && (
                  <GatedContent 
                    isGated={!canSeeSourceUrls} 
                    contentType="url"
                    compact
                    fallback={
                      <Button variant="outline" className="w-full justify-start" disabled>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {maskUrl(primaryUrl)}
                      </Button>
                    }
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => window.open(primaryUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Original Source
                    </Button>
                  </GatedContent>
                )}

                {onFlagFalsePositive && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                    onClick={() => onFlagFalsePositive(
                      item.type === 'data_source' ? item.data.id : item.data.id,
                      item.type,
                      name,
                      confidence
                    )}
                    disabled={isFlagged}
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    {isFlagged ? 'Flagged as False Positive' : 'Flag as False Positive'}
                  </Button>
                )}

                {onRemovalRequest && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onRemovalRequest(
                      item.type === 'data_source' ? item.data.id : item.data.id,
                      name
                    )}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Request Removal
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="context" className="mt-0">
              {!canSeeContextEnrichment ? (
                <GatedContent isGated contentType="context">
                  <div />
                </GatedContent>
              ) : hasUrls ? (
                <ContextEnrichmentPanel urls={urls} />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No URL available for this result.
                </p>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
