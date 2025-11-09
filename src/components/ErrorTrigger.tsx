import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

/**
 * ErrorTrigger - Development component for testing error boundaries
 * 
 * Usage: Add to any page temporarily to test error boundary behavior
 * <ErrorTrigger />
 */
export function ErrorTrigger() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('Test error triggered manually for error boundary testing');
  }

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <Card className="p-4 border-dashed border-2 border-destructive/50">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-destructive" />
        <div className="flex-1">
          <p className="text-sm font-medium">Error Boundary Test</p>
          <p className="text-xs text-muted-foreground">Development only</p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShouldThrow(true)}
        >
          Trigger Error
        </Button>
      </div>
    </Card>
  );
}
