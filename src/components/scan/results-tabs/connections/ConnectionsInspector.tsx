import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ExternalLink, X, Link2, Image, FileText, Users, Sparkles,
  MapPin, Calendar, User
} from 'lucide-react';
import { ScanResult } from '@/hooks/useScanResultsData';
import { cn } from '@/lib/utils';

interface ConnectionsInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProfile: ScanResult | null;
  username: string;
  categoryStats: Record<string, number>;
  connectionStats: Record<string, number>;
  totalProfiles: number;
}

const CONNECTION_LABELS: Record<string, { label: string; icon: typeof Link2 }> = {
  username_reuse: { label: 'Username Reuse', icon: Link2 },
  image_match: { label: 'Image Match', icon: Image },
  bio_similarity: { label: 'Bio Similarity', icon: FileText },
  email_link: { label: 'Email Link', icon: Users },
  cross_reference: { label: 'Cross-Reference', icon: Sparkles },
};

const CATEGORY_COLORS: Record<string, string> = {
  social: '#3b82f6',
  professional: '#8b5cf6',
  media: '#ec4899',
  gaming: '#10b981',
  forum: '#f59e0b',
  other: '#6b7280',
};

const CATEGORY_LABELS: Record<string, string> = {
  social: 'Social Media',
  professional: 'Professional',
  media: 'Media & Content',
  gaming: 'Gaming',
  forum: 'Forums',
  other: 'Other',
};

export function ConnectionsInspector({
  isOpen,
  onClose,
  selectedProfile,
  username,
  categoryStats,
  connectionStats,
  totalProfiles,
}: ConnectionsInspectorProps) {
  const meta = (selectedProfile?.meta || selectedProfile?.metadata || {}) as Record<string, any>;

  return (
    <div
      className={cn(
        "flex-shrink-0 border-l border-border bg-card transition-all duration-200 overflow-hidden",
        isOpen ? "w-72" : "w-0"
      )}
    >
      {isOpen && (
        <div className="w-72 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-border">
            <span className="text-sm font-medium">Inspector</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3 space-y-4">
              {selectedProfile ? (
                <>
                  {/* Selected Node Details */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Selected Node
                    </h4>
                    <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: CATEGORY_COLORS[categorizePlatform(selectedProfile.site || '')] }}
                        />
                        <span className="font-medium text-sm">{selectedProfile.site}</span>
                      </div>
                      
                      {meta.bio && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {meta.bio}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-1.5">
                        {meta.followers && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <User className="w-3 h-3" />
                            {meta.followers}
                          </Badge>
                        )}
                        {meta.location && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <MapPin className="w-3 h-3" />
                            {meta.location}
                          </Badge>
                        )}
                        {meta.created_at && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(meta.created_at).getFullYear()}
                          </Badge>
                        )}
                      </div>

                      {selectedProfile.url && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2 text-xs h-7"
                          onClick={() => window.open(selectedProfile.url, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3" />
                          Visit Profile
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Overview Stats */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Graph Summary
                    </h4>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <div className="text-2xl font-bold text-primary">{totalProfiles}</div>
                      <div className="text-xs text-muted-foreground">Connected Profiles</div>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      By Category
                    </h4>
                    <div className="space-y-1.5">
                      {Object.entries(categoryStats)
                        .filter(([_, count]) => count > 0)
                        .sort((a, b) => b[1] - a[1])
                        .map(([category, count]) => (
                          <div key={category} className="flex items-center gap-2 text-xs">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: CATEGORY_COLORS[category] }}
                            />
                            <span className="flex-1">{CATEGORY_LABELS[category] || category}</span>
                            <span className="text-muted-foreground">{count}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Connection Types */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Connection Types
                    </h4>
                    <div className="space-y-1.5">
                      {Object.entries(connectionStats)
                        .filter(([_, count]) => count > 0)
                        .map(([type, count]) => {
                          const info = CONNECTION_LABELS[type];
                          if (!info) return null;
                          const Icon = info.icon;
                          return (
                            <div key={type} className="flex items-center gap-2 text-xs">
                              <Icon className="w-3 h-3 text-muted-foreground" />
                              <span className="flex-1">{info.label}</span>
                              <span className="text-muted-foreground">{count}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </>
              )}

              {/* Tips */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Tips
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Hover nodes for details</li>
                  <li>• Click nodes to visit profiles</li>
                  <li>• Drag to pan, scroll to zoom</li>
                </ul>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

function categorizePlatform(site: string): string {
  const siteLower = site.toLowerCase();
  const categories: Record<string, string[]> = {
    social: ['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok', 'snapchat', 'mastodon', 'threads', 'pinterest'],
    professional: ['linkedin', 'github', 'gitlab', 'behance', 'dribbble', 'stackoverflow', 'npm', 'pypi'],
    media: ['youtube', 'vimeo', 'soundcloud', 'spotify', 'deviantart', 'flickr', 'medium', 'substack'],
    gaming: ['steam', 'xbox', 'playstation', 'twitch', 'discord', 'roblox', 'epic', 'battlenet', 'minecraft'],
    forum: ['reddit', 'quora', 'hackernews', 'lobsters', '4chan', 'discourse'],
  };
  
  for (const [category, platforms] of Object.entries(categories)) {
    if (platforms.some(p => siteLower.includes(p))) {
      return category;
    }
  }
  return 'other';
}

export default ConnectionsInspector;
