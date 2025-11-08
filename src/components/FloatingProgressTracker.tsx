import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { X, Minimize2, Maximize2, ExternalLink, Loader2 } from 'lucide-react';
import { useActiveScan } from '@/hooks/useActiveScan';
import { cn } from '@/lib/utils';

export function FloatingProgressTracker() {
  const navigate = useNavigate();
  const { activeScan, progress, isMinimized, clearActiveScan, toggleMinimize } = useActiveScan();

  if (!activeScan) return null;

  const percentage = progress?.totalProviders 
    ? Math.round((progress.completedProviders / progress.totalProviders) * 100)
    : 0;

  const isCompleted = progress?.status === 'completed';
  const isError = progress?.status === 'error';

  const handleViewResults = () => {
    const path = activeScan.type === 'username' 
      ? `/scan/usernames/${activeScan.scanId}`
      : `/results/${activeScan.scanId}`;
    navigate(path);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
      <Card className={cn(
        "shadow-2xl border-2 transition-all duration-300",
        isCompleted && "border-green-500",
        isError && "border-destructive",
        !isCompleted && !isError && "border-primary"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/50">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isCompleted && "bg-green-500",
              isError && "bg-destructive",
              !isCompleted && !isError && "bg-primary animate-pulse"
            )} />
            <span className="font-semibold text-sm">
              {isCompleted ? 'Scan Complete' : isError ? 'Scan Failed' : 'Scanning...'}
            </span>
            <Badge variant="outline" className="text-xs">
              {activeScan.type === 'username' ? 'Username' : 'Advanced'}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={toggleMinimize}
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={clearActiveScan}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="p-4 space-y-4">
            {/* Target Info */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Target</p>
              <p className="text-sm font-medium truncate">{activeScan.target}</p>
            </div>

            {/* Progress Bar */}
            {!isCompleted && !isError && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{percentage}%</span>
                </div>
                <Progress value={percentage} className="h-2" />
                {progress?.currentProviders && progress.currentProviders.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {progress.currentProviders.map((provider) => (
                      <Badge key={provider} variant="secondary" className="text-xs">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        {provider}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Status Message */}
            {progress?.message && (
              <p className="text-xs text-muted-foreground">
                {progress.message}
              </p>
            )}

            {/* Stats */}
            {progress && (
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Providers: </span>
                  <span className="font-medium">
                    {progress.completedProviders}/{progress.totalProviders}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Findings: </span>
                  <span className="font-medium">{progress.totalFindings}</span>
                </div>
              </div>
            )}

            {/* Action Button */}
            <Button
              onClick={handleViewResults}
              className="w-full"
              variant={isCompleted ? "default" : "outline"}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {isCompleted ? 'View Results' : 'View Progress'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
