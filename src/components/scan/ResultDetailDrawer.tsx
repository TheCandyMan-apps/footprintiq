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
import { ConfidenceScoreBadge } from '@/components/ConfidenceScoreBadge';
import { ContextEnrichmentPanel } from '@/components/ContextEnrichmentPanel';
import { 
  ExternalLink, 
  Globe, 
  User, 
  Trash2, 
  Flag
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
  low: 'bg-accent/20 text-accent border-accent/30',
  medium: 'bg-primary/20 text-primary border-primary/30',
  high: 'bg-destructive/20 text-destructive border-destructive/30',
};

/**
 * Helper to extract the relevant URL from a result item.
 * Checks: url, profile_url, source_url, link fields.
 */
function getItemUrl(item: ResultItem | null): string | null {
  if (!item) return null;
  
  if (item.type === 'data_source') {
    return item.data.url || null;
  }
  
  if (item.type === 'social_profile') {
    return item.data.profileUrl || null;
  }
  
  return null;
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

export function ResultDetailDrawer({
  item,
  open,
  onClose,
  onRemovalRequest,
  onFlagFalsePositive,
  isFlagged = false,
}: ResultDetailDrawerProps) {
  if (!item) return null;

  const url = getItemUrl(item);
  const name = getItemName(item);
  const confidence = getItemConfidence(item);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            {item.type === 'data_source' ? (
              <Globe className="w-5 h-5 text-primary" />
            ) : (
              <User className="w-5 h-5 text-primary" />
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

        <ScrollArea className="h-[calc(100vh-120px)] pr-4 mt-6">
          <div className="space-y-6">
            {/* Summary Card */}
            <Card className="p-4">
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
                    <Badge variant="default" className="bg-primary">Predicta Search</Badge>
                  )}
                </div>

                <Separator />

                {/* Data found (for data sources) */}
                {item.type === 'data_source' && item.data.dataFound.length > 0 && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Data Found</div>
                    <div className="flex flex-wrap gap-2">
                      {item.data.dataFound.map((data, idx) => (
                        <span 
                          key={idx} 
                          className="px-3 py-1 rounded-full bg-secondary text-xs"
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

                {/* Confidence Score */}
                <div className="pt-3 border-t border-border">
                  <ConfidenceScoreBadge score={confidence} size="sm" />
                </div>
              </div>
            </Card>

            {/* Context Enrichment Section - Only shown if URL exists */}
            {url && (
              <ContextEnrichmentPanel url={url} />
            )}

            {/* Actions */}
            <div className="space-y-2 pt-4">
              {url && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open(url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Original Source
                </Button>
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
                  variant="destructive"
                  className="w-full justify-start"
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
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
