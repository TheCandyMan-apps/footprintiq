import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { LensConfidenceBadge } from '@/components/scan/LensConfidenceBadge';
import { RESULTS_SPACING, RESULTS_TYPOGRAPHY, RESULTS_BORDERS } from '../styles';

interface IdentitySnapshotCardProps {
  searchedValue: string;
  scanType?: string;
  aliases?: string[];
  overallScore: number;
}

export function IdentitySnapshotCard({ 
  searchedValue, 
  scanType = 'username',
  aliases = [],
  overallScore 
}: IdentitySnapshotCardProps) {
  const typeLabel = scanType === 'email' ? 'Email' : scanType === 'phone' ? 'Phone' : 'Username';
  
  return (
    <Card className={RESULTS_BORDERS.cardBorder}>
      <CardContent className={RESULTS_SPACING.cardPadding}>
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 border border-primary/20 shrink-0">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-[10px] font-normal px-1.5 py-0 h-5">
                {typeLabel}
              </Badge>
              <LensConfidenceBadge 
                score={overallScore} 
                reasoning="Overall scan confidence"
                size="sm"
              />
            </div>
            <p className={`${RESULTS_TYPOGRAPHY.cardTitle} truncate`} title={searchedValue}>
              {searchedValue}
            </p>
            {aliases.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {aliases.slice(0, 5).map((alias, idx) => (
                  <Badge 
                    key={idx} 
                    variant="outline" 
                    className="text-[10px] font-normal px-1.5 py-0 h-5 bg-muted/50"
                  >
                    {alias}
                  </Badge>
                ))}
                {aliases.length > 5 && (
                  <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0 h-5">
                    +{aliases.length - 5}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
