import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { LensConfidenceBadge } from '@/components/scan/LensConfidenceBadge';
import { cn } from '@/lib/utils';

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
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 border border-primary/20 shrink-0">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs font-normal px-2 py-0.5">
                {typeLabel}
              </Badge>
              <LensConfidenceBadge 
                score={overallScore} 
                reasoning="Overall scan confidence"
                size="sm"
              />
            </div>
            <p className="font-semibold text-base truncate" title={searchedValue}>
              {searchedValue}
            </p>
            {aliases.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {aliases.slice(0, 5).map((alias, idx) => (
                  <Badge 
                    key={idx} 
                    variant="outline" 
                    className="text-xs font-normal px-1.5 py-0 h-5 bg-muted/50"
                  >
                    {alias}
                  </Badge>
                ))}
                {aliases.length > 5 && (
                  <Badge variant="outline" className="text-xs font-normal px-1.5 py-0 h-5">
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
