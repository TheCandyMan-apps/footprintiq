import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ExternalLink, X, Sparkles, MapPin, Calendar, User, Users,
  Crosshair, Loader2, CheckCircle, HelpCircle, AlertCircle, AlertTriangle,
  Link2, Image as ImageIcon, FileText, Mail, ArrowRight
} from 'lucide-react';
import { 
  GraphNode, CorrelationGraphData, 
  CATEGORY_CONFIG, EDGE_REASON_CONFIG, EdgeReason 
} from '@/hooks/useCorrelationGraph';
import { LensVerificationResult, useForensicVerification } from '@/hooks/useForensicVerification';
import { LensStatusBadge } from '../accounts/LensStatusBadge';
import { cn } from '@/lib/utils';

interface GraphInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNode: GraphNode | null;
  graphData: CorrelationGraphData;
  username: string;
  scanId?: string;
  isFocused: boolean;
  onFocus: () => void;
  onClearFocus: () => void;
  verificationResult?: LensVerificationResult | null;
  onVerificationComplete?: (result: LensVerificationResult) => void;
}

const REASON_ICONS: Record<EdgeReason, typeof Link2> = {
  same_username: Link2,
  similar_username: Link2,
  same_image: ImageIcon,
  similar_bio: FileText,
  shared_domain: Link2,
  shared_link: Link2,
  shared_email: Mail,
  shared_id: Link2,
  cross_reference: ArrowRight,
  username_reuse: Link2,
  image_reuse: ImageIcon,
  bio_similarity: FileText,
  identity_search: Users,
  contextual_reference: AlertTriangle,
};

function getConfidenceDisplay(score: number) {
  if (score >= 80) return { 
    label: 'Strong', 
    bg: 'bg-green-500/15',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-500/30',
    icon: CheckCircle,
  };
  if (score >= 60) return { 
    label: 'Medium', 
    bg: 'bg-amber-500/15',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30',
    icon: HelpCircle,
  };
  return { 
    label: 'Weak', 
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    border: 'border-border',
    icon: AlertCircle,
  };
}

export function GraphInspector({
  isOpen,
  onClose,
  selectedNode,
  graphData,
  username,
  scanId,
  isFocused,
  onFocus,
  onClearFocus,
  verificationResult,
  onVerificationComplete,
}: GraphInspectorProps) {
  const { verify, isVerifying } = useForensicVerification();
  const [localVerifying, setLocalVerifying] = useState(false);
  
  const handleVerify = async () => {
    if (!selectedNode?.url || isVerifying || localVerifying || !scanId || !selectedNode.result) return;
    
    setLocalVerifying(true);
    const result = await verify({ 
      url: selectedNode.url, 
      platform: selectedNode.platform || 'Unknown', 
      scanId, 
      findingId: selectedNode.result.id,
    });
    if (result && onVerificationComplete) {
      onVerificationComplete(result);
    }
    setLocalVerifying(false);
  };
  
  const isVerifyingNow = isVerifying || localVerifying;

  // Get connected edges for this node (excluding identity edges for type breakdown)
  const connectedEdges = selectedNode 
    ? graphData.edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
    : [];
  
  // Filter to only correlation edges (not identity-search edges)
  const correlationEdges = connectedEdges.filter(e => 
    e.reason !== 'identity_search' && e.source !== 'identity-root' && e.target !== 'identity-root'
  );
  
  // Calculate connection type breakdown: type → { count, avgConfidence }
  const connectionTypeBreakdown = correlationEdges.reduce((acc, edge) => {
    const key = edge.reason;
    if (!acc[key]) {
      acc[key] = { count: 0, totalConfidence: 0, avgConfidence: 0 };
    }
    acc[key].count += 1;
    acc[key].totalConfidence += edge.confidence;
    acc[key].avgConfidence = Math.round(acc[key].totalConfidence / acc[key].count);
    return acc;
  }, {} as Record<string, { count: number; totalConfidence: number; avgConfidence: number }>);
  
  // Check if only bio similarity exists (for showing improvement hint)
  const connectionTypes = Object.keys(connectionTypeBreakdown);
  const onlyBioSimilarity = connectionTypes.length === 1 && 
    (connectionTypes[0] === 'bio_similarity' || connectionTypes[0] === 'similar_bio');

  // Get category config
  const categoryConfig = selectedNode 
    ? (CATEGORY_CONFIG[selectedNode.category] || CATEGORY_CONFIG.other)
    : null;

  const confidence = selectedNode 
    ? getConfidenceDisplay(Math.round(selectedNode.confidence * 100))
    : null;

  return (
    <div
      className={cn(
        "flex-shrink-0 border-l border-border bg-card transition-all duration-200 overflow-hidden",
        isOpen ? "w-80" : "w-0"
      )}
    >
      {isOpen && (
        <div className="w-80 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
            <span className="text-sm font-medium">
              {selectedNode ? 'Entity Details' : 'Inspector'}
            </span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3 space-y-4">
              {selectedNode && selectedNode.type !== 'identity' ? (
                <>
                  {/* Profile Header */}
                  <div className="flex items-start gap-3">
                    {selectedNode.imageUrl ? (
                      <img 
                        src={selectedNode.imageUrl} 
                        alt={`${selectedNode.platform || selectedNode.label || 'Profile'} photo`}
                        className="w-14 h-14 rounded-full object-cover border-2 shadow-sm"
                        style={{ borderColor: categoryConfig?.color }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div 
                        className="w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-sm"
                        style={{ 
                          backgroundColor: categoryConfig?.color + '20',
                          borderColor: categoryConfig?.color,
                        }}
                      >
                        <span className="text-base font-bold" style={{ color: categoryConfig?.color }}>
                          {(selectedNode.platform || selectedNode.label || 'UN').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">
                          {selectedNode.platform || selectedNode.label}
                        </span>
                        <div 
                          className="w-2 h-2 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: categoryConfig?.color }}
                          title={categoryConfig?.label}
                        />
                      </div>
                      {selectedNode.meta?.username && (
                        <span className="text-xs text-muted-foreground">@{selectedNode.meta.username}</span>
                      )}
                      <div className="mt-1">
                        <Badge variant="secondary" className="text-[10px] h-5">
                          {categoryConfig?.label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Confidence Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    {confidence && (
                      <Badge 
                        variant="outline" 
                        className={cn(
                          'h-6 px-2 gap-1 text-xs font-medium',
                          confidence.bg, 
                          confidence.text, 
                          confidence.border
                        )}
                      >
                        <confidence.icon className="w-3 h-3" />
                        {confidence.label} ({selectedNode.confidence}%)
                      </Badge>
                    )}
                    {(verificationResult || selectedNode.lensStatus) && (
                      <LensStatusBadge 
                        status={selectedNode.lensStatus}
                        score={verificationResult?.confidenceScore}
                        compact={false}
                      />
                    )}
                  </div>

                  {/* Connection Types Breakdown */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Connection Types
                    </h4>
                    <div className="p-2.5 rounded-lg bg-muted/40 space-y-2">
                      {Object.keys(connectionTypeBreakdown).length > 0 ? (
                        <>
                          {Object.entries(connectionTypeBreakdown).map(([reason, data]) => {
                            const config = EDGE_REASON_CONFIG[reason as EdgeReason];
                            const Icon = REASON_ICONS[reason as EdgeReason] || Link2;
                            return (
                              <div key={reason} className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                  <span className="text-xs font-medium truncate">
                                    {config?.label || reason.replace(/_/g, ' ')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                                    {data.count}×
                                  </Badge>
                                  <span className="text-[10px] text-muted-foreground w-8 text-right">
                                    {data.avgConfidence}%
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                          
                          {/* Hint when only bio similarity */}
                          {onlyBioSimilarity && (
                            <div className="mt-2 pt-2 border-t border-border/50">
                              <p className="text-[10px] text-amber-600 dark:text-amber-400 leading-relaxed">
                                💡 Currently linked via bio similarity only. Add stronger signals 
                                (image reuse, username reuse, shared links) to improve confidence.
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          Direct discovery from search — no cross-account correlations detected yet.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Individual Edge Details */}
                  {correlationEdges.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Match Details
                      </h4>
                      <div className="p-2.5 rounded-lg bg-muted/40 space-y-2">
                        {correlationEdges.slice(0, 5).map((edge) => {
                          const config = EDGE_REASON_CONFIG[edge.reason];
                          const Icon = REASON_ICONS[edge.reason] || Link2;
                          return (
                            <div key={edge.id} className="flex items-start gap-2">
                              <Icon className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium">{config?.label || edge.reasonLabel}</p>
                                {edge.details && (
                                  <p className="text-[10px] text-muted-foreground line-clamp-2">
                                    {edge.details}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {correlationEdges.length > 5 && (
                          <p className="text-[10px] text-muted-foreground italic">
                            +{correlationEdges.length - 5} more connections
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Key Fields */}
                  {selectedNode.meta && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Profile Data
                      </h4>
                      <div className="p-2.5 rounded-lg bg-muted/40 space-y-2">
                        {selectedNode.meta.bio && (
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase">Bio</span>
                            <p className="text-xs line-clamp-3">{selectedNode.meta.bio}</p>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1.5">
                          {selectedNode.meta.followers !== undefined && (
                            <Badge variant="outline" className="text-[10px] gap-1 h-5">
                              <User className="w-2.5 h-2.5" />
                              {selectedNode.meta.followers.toLocaleString()}
                            </Badge>
                          )}
                          {selectedNode.meta.location && (
                            <Badge variant="outline" className="text-[10px] gap-1 h-5">
                              <MapPin className="w-2.5 h-2.5" />
                              {selectedNode.meta.location}
                            </Badge>
                          )}
                          {selectedNode.meta.joined && (
                            <Badge variant="outline" className="text-[10px] gap-1 h-5">
                              <Calendar className="w-2.5 h-2.5" />
                              {typeof selectedNode.meta.joined === 'string' 
                                ? selectedNode.meta.joined 
                                : new Date(selectedNode.meta.joined).getFullYear()}
                            </Badge>
                          )}
                        </div>
                        {!selectedNode.meta.bio && !selectedNode.meta.followers && !selectedNode.meta.location && (
                          <p className="text-xs text-muted-foreground/60 italic">No metadata available</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Actions
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={isFocused ? "default" : "outline"}
                        size="sm"
                        className="gap-1.5 text-xs h-8"
                        onClick={isFocused ? onClearFocus : onFocus}
                      >
                        <Crosshair className="w-3.5 h-3.5" />
                        {isFocused ? 'Unfocus' : 'Focus'}
                      </Button>
                      
                      {selectedNode.url && !verificationResult && onVerificationComplete && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs h-8"
                          onClick={handleVerify}
                          disabled={isVerifyingNow}
                        >
                          {isVerifyingNow ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                          LENS Verify
                        </Button>
                      )}
                      
                      {selectedNode.url && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs h-8 col-span-2"
                          onClick={() => window.open(selectedNode.url, '_blank')}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open Profile
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* URL */}
                  {selectedNode.url && (
                    <div className="pt-2 border-t border-border/30">
                      <span className="text-[10px] text-muted-foreground uppercase block mb-1">Profile URL</span>
                      <a 
                        href={selectedNode.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline break-all line-clamp-2"
                      >
                        {selectedNode.url}
                      </a>
                    </div>
                  )}
                </>
              ) : selectedNode?.type === 'identity' ? (
                <>
                  {/* Identity Node Selected */}
                  <div className="text-center p-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto mb-3">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold">{username}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Search Identity</p>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <div className="text-xl font-bold text-primary">{graphData.stats.totalNodes - 1}</div>
                      <div className="text-[10px] text-muted-foreground">Accounts</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <div className="text-xl font-bold text-primary">{graphData.stats.totalEdges}</div>
                      <div className="text-[10px] text-muted-foreground">Connections</div>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      By Category
                    </h4>
                    <div className="space-y-1.5">
                      {Object.entries(graphData.stats.byCategory)
                        .filter(([_, count]) => count > 0)
                        .sort((a, b) => b[1] - a[1])
                        .map(([category, count]) => {
                          const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other;
                          return (
                            <div key={category} className="flex items-center gap-2 text-xs">
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: config.color }}
                              />
                              <span className="flex-1">{config.label}</span>
                              <span className="text-muted-foreground">{count}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Connection Types */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Connection Signals
                    </h4>
                    <div className="space-y-1.5">
                      {Object.entries(graphData.stats.byReason)
                        .filter(([_, count]) => count > 0)
                        .map(([reason, count]) => {
                          const config = EDGE_REASON_CONFIG[reason as EdgeReason];
                          const Icon = REASON_ICONS[reason as EdgeReason] || Link2;
                          if (!config) return null;
                          return (
                            <div key={reason} className="flex items-center gap-2 text-xs">
                              <Icon className="w-3 h-3 text-muted-foreground" />
                              <span className="flex-1">{config.label}</span>
                              <span className="text-muted-foreground">{count}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* No Selection - Overview */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Graph Overview
                    </h4>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <div className="text-3xl font-bold text-primary">{graphData.stats.totalNodes - 1}</div>
                      <div className="text-xs text-muted-foreground">Connected Entities</div>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      By Category
                    </h4>
                    <div className="space-y-1.5">
                      {Object.entries(graphData.stats.byCategory)
                        .filter(([_, count]) => count > 0)
                        .sort((a, b) => b[1] - a[1])
                        .map(([category, count]) => {
                          const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other;
                          return (
                            <div key={category} className="flex items-center gap-2 text-xs">
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: config.color }}
                              />
                              <span className="flex-1">{config.label}</span>
                              <span className="text-muted-foreground">{count}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Tips
                    </h4>
                    <ul className="text-xs text-muted-foreground space-y-1.5 p-2 rounded-lg bg-muted/30">
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        Click a node to inspect
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        Use Focus to highlight paths
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        Double-click to open profile
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        Toggle grouping with <span className="font-mono text-[10px]">⊞</span>
                      </li>
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
