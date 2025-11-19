import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PartialResultsBannerProps {
  successfulProviders: string[];
  failedProviders: string[];
  totalResults: number;
}

export function PartialResultsBanner({ 
  successfulProviders, 
  failedProviders, 
  totalResults 
}: PartialResultsBannerProps) {
  if (failedProviders.length === 0) {
    return null;
  }

  const hasResults = totalResults > 0;

  return (
    <Alert variant={hasResults ? "default" : "destructive"} className="mb-6">
      <div className="flex items-start gap-3">
        {hasResults ? (
          <CheckCircle2 className="h-5 w-5 mt-0.5 text-green-500" />
        ) : (
          <AlertTriangle className="h-5 w-5 mt-0.5" />
        )}
        <div className="flex-1">
          <AlertTitle className="mb-1">
            {hasResults ? 'Partial Results Available' : 'All Providers Failed'}
          </AlertTitle>
          <AlertDescription>
            {hasResults ? (
              <>
                <p className="mb-2">
                  Successfully retrieved {totalResults} results from {successfulProviders.join(', ')}.
                </p>
                <p className="text-sm opacity-80">
                  {failedProviders.length} provider{failedProviders.length > 1 ? 's' : ''} encountered errors: {failedProviders.join(', ')}.
                  These providers may be temporarily unavailable or experiencing issues.
                </p>
              </>
            ) : (
              <p>
                All selected providers ({failedProviders.join(', ')}) encountered errors. 
                Please try again later or contact support if this persists.
              </p>
            )}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
