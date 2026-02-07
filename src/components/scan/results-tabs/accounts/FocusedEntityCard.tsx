import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crosshair, X, ExternalLink, User } from 'lucide-react';
import { ScanResult } from '@/hooks/useScanResultsData';

interface FocusedEntityCardProps {
  entity: ScanResult | null;
  onClear: () => void;
}

export function FocusedEntityCard({ entity, onClear }: FocusedEntityCardProps) {
  if (!entity) return null;

  const meta = (entity.meta || entity.metadata || {}) as Record<string, any>;
  const profileImage = meta.avatar_cached || meta.avatar_url || meta.avatar || meta.profile_image || meta.image || meta.pfp_image;

  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-primary" />
            Focused Entity
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={onClear}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <div className="flex items-center gap-3">
          {profileImage ? (
            <img 
              src={profileImage} 
              alt=""
              className="w-10 h-10 rounded-full object-cover border border-primary/30"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
              <User className="w-5 h-5 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{entity.site || 'Unknown'}</span>
              <Badge variant="outline" className="h-4 text-[10px] px-1">
                {entity.status}
              </Badge>
            </div>
            {meta.bio && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {meta.bio.slice(0, 60)}...
              </p>
            )}
          </div>
          {entity.url && (
            <Button variant="ghost" size="sm" asChild className="h-7">
              <a href={entity.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
