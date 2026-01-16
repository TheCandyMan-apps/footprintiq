import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Shield, Clock, ChevronRight, Search, RefreshCw, CheckCircle, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useVerificationHistory, VerificationHistoryItem } from '@/hooks/useVerificationHistory';
import { ForensicModal } from './ForensicModal';
import { LensVerificationResult } from '@/hooks/useForensicVerification';

interface VerificationHistoryPanelProps {
  scanId?: string;
  limit?: number;
  className?: string;
}

// Get confidence indicator based on score
const getConfidenceIndicator = (score: number) => {
  if (score >= 75) {
    return { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-500/10', label: 'High' };
  }
  if (score >= 50) {
    return { icon: Info, color: 'text-amber-500', bgColor: 'bg-amber-500/10', label: 'Moderate' };
  }
  if (score >= 31) {
    return { icon: AlertCircle, color: 'text-orange-500', bgColor: 'bg-orange-500/10', label: 'Low' };
  }
  return { icon: AlertCircle, color: 'text-destructive', bgColor: 'bg-destructive/10', label: 'Unreliable' };
};

// Convert history item to LensVerificationResult for modal
const historyToResult = (item: VerificationHistoryItem): LensVerificationResult => ({
  confidenceScore: item.confidence_score,
  verificationHash: item.verification_hash,
  hashedContent: item.hashed_content || '',
  verifiedAt: item.verified_at,
  cached: false,
  metadata: {
    sourceAge: item.source_age || 'Unknown',
    sslStatus: item.ssl_status || 'Unknown',
    platformConsistency: item.platform_consistency || 'Unknown',
  },
});

export function VerificationHistoryPanel({
  scanId,
  limit = 50,
  className,
}: VerificationHistoryPanelProps) {
  const { history, isLoading, error, refetch } = useVerificationHistory(scanId, limit);
  const [selectedItem, setSelectedItem] = useState<VerificationHistoryItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleViewDetails = (item: VerificationHistoryItem) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-primary" />
            Verification History
          </CardTitle>
          <CardDescription>Loading previous verifications...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-primary" />
            Verification History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">{error}</p>
            <Button variant="outline" size="sm" onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-primary" />
                Verification History
              </CardTitle>
              <CardDescription className="mt-1">
                {history.length} verified {history.length === 1 ? 'finding' : 'findings'}
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={refetch} className="h-8 w-8">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8">
              <Search className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm font-medium mb-1">No verifications yet</p>
              <p className="text-xs text-muted-foreground">
                Verify findings using LENS to see them here
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-3">
              <div className="space-y-2">
                {history.map((item) => {
                  const indicator = getConfidenceIndicator(item.confidence_score);
                  const Icon = indicator.icon;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleViewDetails(item)}
                      className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        {/* Confidence indicator */}
                        <div className={`p-2 rounded-full ${indicator.bgColor} shrink-0`}>
                          <Icon className={`h-4 w-4 ${indicator.color}`} />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              {item.confidence_score}% confidence
                            </span>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${indicator.bgColor} ${indicator.color} border-0`}
                            >
                              {indicator.label}
                            </Badge>
                          </div>
                          
                          {/* Hash preview */}
                          <p className="text-xs font-mono text-muted-foreground truncate mb-1.5">
                            {item.verification_hash.substring(0, 32)}...
                          </p>
                          
                          {/* Timestamp */}
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span title={format(new Date(item.verified_at), 'PPpp')}>
                              {formatDistanceToNow(new Date(item.verified_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        
                        {/* Arrow */}
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-2" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      {selectedItem && (
        <ForensicModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          result={historyToResult(selectedItem)}
          platform={selectedItem.platform_consistency || undefined}
        />
      )}
    </>
  );
}
