import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Loader2, XCircle, Clock, MapPin } from "lucide-react";

export type GeocodingStatus = 'pending' | 'processing' | 'complete' | 'error';

export interface IPGeocodingStatus {
  ip: string;
  status: GeocodingStatus;
  error?: string;
  location?: string;
}

interface GeocodingProgressProps {
  items: IPGeocodingStatus[];
  totalCount: number;
  completedCount: number;
  errorCount: number;
  isActive: boolean;
}

export function GeocodingProgress({
  items,
  totalCount,
  completedCount,
  errorCount,
  isActive
}: GeocodingProgressProps) {
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const processingCount = items.filter(i => i.status === 'processing').length;

  const getStatusIcon = (status: GeocodingStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case 'complete':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: GeocodingStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-xs">Pending</Badge>;
      case 'processing':
        return <Badge className="text-xs bg-primary">Processing</Badge>;
      case 'complete':
        return <Badge variant="outline" className="text-xs border-green-500 text-green-700 dark:text-green-300">Complete</Badge>;
      case 'error':
        return <Badge variant="destructive" className="text-xs">Error</Badge>;
    }
  };

  if (!isActive && items.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 space-y-4 border-primary/20 bg-primary/5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-sm">Geocoding Progress</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{completedCount} / {totalCount} complete</span>
          {errorCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {errorCount} error{errorCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="space-y-2">
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {processingCount > 0 && `${processingCount} processing...`}
          </span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
      </div>

      {/* Individual IP Status List */}
      <div className="space-y-1 max-h-[200px] overflow-y-auto pr-2">
        {items.map((item) => (
          <div
            key={item.ip}
            className="flex items-center justify-between p-2 rounded-md bg-background/50 hover:bg-background transition-colors"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {getStatusIcon(item.status)}
              <span className="text-sm font-mono truncate">{item.ip}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {item.location && item.status === 'complete' && (
                <span className="text-xs text-muted-foreground max-w-[150px] truncate">
                  {item.location}
                </span>
              )}
              {item.error && item.status === 'error' && (
                <span className="text-xs text-destructive max-w-[150px] truncate">
                  {item.error}
                </span>
              )}
              {getStatusBadge(item.status)}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      {!isActive && completedCount === totalCount && (
        <div className="pt-2 border-t border-border flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>{completedCount} succeeded</span>
          </div>
          {errorCount > 0 && (
            <div className="flex items-center gap-1.5 text-destructive">
              <XCircle className="w-4 h-4" />
              <span>{errorCount} failed</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
