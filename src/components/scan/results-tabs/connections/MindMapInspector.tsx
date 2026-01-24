import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ExternalLink, X, HelpCircle, CheckCircle, AlertCircle, Sparkles,
  Network, Target, TrendingUp, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProfileEntity, LegData, ConfidenceLevel } from './MindMapGraph';

interface MindMapInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEntity: ProfileEntity | null;
  selectedLeg: LegData | null;
  totalProfiles: number;
  totalLegs: number;
  categoryBreakdown: Array<[string, number]>;
  onOpenProfile?: (url: string) => void;
}

function getConfidenceConfig(level: ConfidenceLevel) {
  switch (level) {
    case 'strong':
      return { 
        label: 'Strong', 
        icon: CheckCircle,
        bg: 'bg-green-500/10',
        text: 'text-green-600 dark:text-green-400',
        border: 'border-green-500/30',
      };
    case 'medium':
      return { 
        label: 'Medium', 
        icon: HelpCircle,
        bg: 'bg-amber-500/10',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-500/30',
      };
    default:
      return { 
        label: 'Weak', 
        icon: AlertCircle,
        bg: 'bg-gray-500/10',
        text: 'text-gray-500',
        border: 'border-gray-500/30',
      };
  }
}

export function MindMapInspector({
  isOpen,
  onClose,
  selectedEntity,
  selectedLeg,
  totalProfiles,
  totalLegs,
  categoryBreakdown,
  onOpenProfile,
}: MindMapInspectorProps) {
  const confidence = selectedEntity ? getConfidenceConfig(selectedEntity.confidenceLevel) : null;
  const ConfidenceIcon = confidence?.icon || HelpCircle;

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
            <span className="text-sm font-medium">
              {selectedEntity ? 'Profile Details' : selectedLeg ? 'Group Details' : 'Mind Map Summary'}
            </span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3 space-y-4">
              {selectedEntity ? (
                <>
                  {/* Profile Header */}
                  <div className="flex items-center gap-3">
                    {selectedEntity.avatar ? (
                      <img 
                        src={selectedEntity.avatar} 
                        alt=""
                        className="w-12 h-12 rounded-full object-cover border border-border shadow-sm"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-border">
                        <span className="text-sm font-semibold text-primary">
                          {selectedEntity.initials}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{selectedEntity.platform}</div>
                      {selectedEntity.displayName && (
                        <span className="text-xs text-muted-foreground">@{selectedEntity.displayName}</span>
                      )}
                      <Badge variant="outline" className="mt-1 text-[10px] h-4">
                        {selectedEntity.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Why Connected */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                      <HelpCircle className="w-3 h-3" />
                      Why connected?
                    </h4>
                    <div className="p-2.5 rounded-lg bg-muted/40">
                      <p className="text-xs leading-relaxed">{selectedEntity.reasoning}</p>
                    </div>
                  </div>

                  {/* Confidence Breakdown */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3" />
                      Confidence
                    </h4>
                    <div className="space-y-2">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          'h-6 px-2 gap-1 text-xs font-medium',
                          confidence?.bg, 
                          confidence?.text, 
                          confidence?.border
                        )}
                      >
                        <ConfidenceIcon className="w-3 h-3" />
                        {confidence?.label} ({selectedEntity.confidenceScore}%)
                      </Badge>
                      
                      <div className="p-2.5 rounded-lg bg-muted/30 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs">
                          <span className={selectedEntity.confidenceSignals.usernameMatch ? 'text-green-600' : 'text-muted-foreground'}>
                            {selectedEntity.confidenceSignals.usernameMatch ? '✓' : '✗'}
                          </span>
                          <span className={selectedEntity.confidenceSignals.usernameMatch ? 'text-foreground' : 'text-muted-foreground'}>
                            Username match
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={selectedEntity.confidenceSignals.emailMatch ? 'text-green-600' : 'text-muted-foreground'}>
                            {selectedEntity.confidenceSignals.emailMatch ? '✓' : '✗'}
                          </span>
                          <span className={selectedEntity.confidenceSignals.emailMatch ? 'text-foreground' : 'text-muted-foreground'}>
                            Email match
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={selectedEntity.confidenceSignals.displayNameReuse ? 'text-green-600' : 'text-muted-foreground'}>
                            {selectedEntity.confidenceSignals.displayNameReuse ? '✓' : '✗'}
                          </span>
                          <span className={selectedEntity.confidenceSignals.displayNameReuse ? 'text-foreground' : 'text-muted-foreground'}>
                            Display name reuse
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={selectedEntity.confidenceSignals.bioSimilarity ? 'text-green-600' : 'text-muted-foreground'}>
                            {selectedEntity.confidenceSignals.bioSimilarity ? '✓' : '✗'}
                          </span>
                          <span className={selectedEntity.confidenceSignals.bioSimilarity ? 'text-foreground' : 'text-muted-foreground'}>
                            Bio similarity
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio preview */}
                  {selectedEntity.bio && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Bio
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-3 p-2 bg-muted/30 rounded-lg">
                        {selectedEntity.bio}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Actions
                    </h4>
                    <div className="flex gap-2">
                      {selectedEntity.url && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1.5 text-xs h-8"
                          onClick={() => onOpenProfile?.(selectedEntity.url)}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open Profile
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* URL */}
                  {selectedEntity.url && (
                    <div className="pt-2 border-t border-border/30">
                      <span className="text-[10px] text-muted-foreground uppercase block mb-1">Profile URL</span>
                      <a 
                        href={selectedEntity.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline break-all line-clamp-2"
                      >
                        {selectedEntity.url}
                      </a>
                    </div>
                  )}
                </>
              ) : selectedLeg ? (
                <>
                  {/* Leg Header */}
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center border-2"
                      style={{ borderColor: selectedLeg.color, backgroundColor: `${selectedLeg.color}20` }}
                    >
                      <Target className="w-5 h-5" style={{ color: selectedLeg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{selectedLeg.label}</div>
                      <Badge variant="outline" className="mt-1 text-[10px] h-4">
                        {selectedLeg.type}
                      </Badge>
                    </div>
                  </div>

                  {/* Leg Reason */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                      <HelpCircle className="w-3 h-3" />
                      Group Reason
                    </h4>
                    <div className="p-2.5 rounded-lg bg-muted/40">
                      <p className="text-xs leading-relaxed">{selectedLeg.reasoning}</p>
                    </div>
                  </div>

                  {/* Top profiles */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Top Profiles ({selectedLeg.profiles.length})
                    </h4>
                    <div className="space-y-1">
                      {selectedLeg.profiles.slice(0, 6).map((profile) => {
                        const conf = getConfidenceConfig(profile.confidenceLevel);
                        return (
                          <div 
                            key={profile.id}
                            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/50 cursor-pointer group"
                            onClick={() => onOpenProfile?.(profile.url)}
                          >
                            <div 
                              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium"
                              style={{ backgroundColor: `${selectedLeg.color}30`, color: selectedLeg.color }}
                            >
                              {profile.initials}
                            </div>
                            <span className="flex-1 text-xs truncate">{profile.platform}</span>
                            <Badge variant="outline" className={cn('text-[9px] h-4 px-1', conf.bg, conf.text, conf.border)}>
                              {conf.label}
                            </Badge>
                            <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        );
                      })}
                      {selectedLeg.profiles.length > 6 && (
                        <div className="text-[10px] text-muted-foreground text-center py-1">
                          +{selectedLeg.profiles.length - 6} more profiles
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Graph Summary */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                      <Network className="w-3 h-3" />
                      Graph Summary
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-lg bg-muted/50 text-center">
                        <div className="text-2xl font-bold text-primary">{totalProfiles}</div>
                        <div className="text-[10px] text-muted-foreground">Profiles</div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 text-center">
                        <div className="text-2xl font-bold text-foreground">{totalLegs}</div>
                        <div className="text-[10px] text-muted-foreground">Groups</div>
                      </div>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      By Category
                    </h4>
                    <div className="space-y-1.5">
                      {categoryBreakdown
                        .filter(([_, count]) => count > 0)
                        .slice(0, 8)
                        .map(([category, count]) => (
                          <div key={category} className="flex items-center gap-2 text-xs">
                            <div
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: getCategoryColorSimple(category) }}
                            />
                            <span className="flex-1 truncate">{category}</span>
                            <span className="text-muted-foreground font-mono">{count}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      Tips
                    </h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Click profiles to see "Why connected?"</li>
                      <li>• Click groups to focus on a branch</li>
                      <li>• Double-click to open profile URL</li>
                      <li>• Toggle "All edges" for full view</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

// Simple color helper for summary
function getCategoryColorSimple(category: string): string {
  const PALETTE = [
    '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6',
    '#06b6d4', '#f97316', '#22c55e', '#ef4444', '#a855f7',
  ];
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = ((hash << 5) - hash) + category.charCodeAt(i);
    hash |= 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export default MindMapInspector;
