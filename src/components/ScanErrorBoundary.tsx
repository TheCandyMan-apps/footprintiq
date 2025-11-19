import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import * as Sentry from '@sentry/react';

interface Props {
  children: ReactNode;
  context?: 'scan' | 'results';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

export class ScanErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ScanErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Report to Sentry with scan context
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
        scan: {
          context: this.props.context,
          retryCount: this.state.retryCount,
        },
      },
      tags: {
        errorBoundary: 'scan',
        scanContext: this.props.context || 'unknown',
      },
      level: 'error',
    });
    
    // Show user-friendly toast based on error type and code
    const errorMsg = error.message?.toLowerCase() || '';
    const errorCode = (error as any).code?.toLowerCase() || '';
    
    // Handle structured error codes from edge functions
    if (errorCode === 'no_providers_available_for_tier' || errorMsg.includes('no_providers_available_for_tier')) {
      toast.error('Provider not available on your plan', {
        description: 'The selected tool requires a Pro or Business plan. Please select Maigret or upgrade.',
        duration: 6000,
      });
    } else if (errorCode === 'subscription_required' || errorMsg.includes('subscription_required')) {
      toast.error('Upgrade required', {
        description: 'This feature requires a higher subscription tier.',
        duration: 6000,
      });
    } else if (errorCode === 'quota_exceeded' || errorMsg.includes('quota_exceeded')) {
      toast.error('Usage limit reached', {
        description: 'You have reached your plan limit. Please upgrade or wait for quota reset.',
        duration: 6000,
      });
    } else if (errorCode === 'validation_error' || errorMsg.includes('validation')) {
      toast.error('Invalid input', {
        description: 'Please check your input and try again.',
        duration: 5000,
      });
    } else if (errorCode === 'provider_error' || errorMsg.includes('provider_error')) {
      toast.warning('Partial results available', {
        description: 'Some providers encountered errors. Displaying successful results.',
        duration: 5000,
      });
    } else if (errorCode === 'worker_unreachable' || errorMsg.includes('worker_unreachable')) {
      toast.error('OSINT tool temporarily unavailable', {
        description: 'The scanning service is unreachable. Please try again in a moment.',
        duration: 6000,
      });
    } else if (errorCode === 'timeout' || errorMsg.includes('timeout') || errorMsg.includes('timed out') || errorMsg.includes('504')) {
      toast.error('Request timed out', {
        description: 'The scan is taking longer than expected. Try again or use fewer providers.',
        duration: 5000,
      });
    } else if (errorCode === 'rate_limited' || errorMsg.includes('rate limit') || errorMsg.includes('429')) {
      toast.error('Rate limit reached', {
        description: 'Too many requests. Please wait a moment and try again.',
        duration: 5000,
      });
    } else if (errorCode === '406' || errorMsg.includes('not acceptable') || errorMsg.includes('406')) {
      toast.error('Access restricted', {
        description: "You don't have permission to access this resource. Try refreshing or contact your workspace admin.",
        duration: 6000,
      });
    } else if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorCode === 'bad_gateway' || errorMsg.includes('502')) {
      toast.error('Connection issue', {
        description: 'Unable to connect to the server. Check your connection and try again.',
        duration: 5000,
      });
    } else if (errorCode === 'unauthorized' || errorMsg.includes('unauthorized') || errorMsg.includes('401')) {
      toast.error('Authentication required', {
        description: 'Please sign in to continue.',
        duration: 5000,
      });
    } else if (errorCode === 'forbidden' || errorMsg.includes('forbidden') || errorMsg.includes('403')) {
      toast.error('Access denied', {
        description: 'You don\'t have permission to perform this action.',
        duration: 5000,
      });
    } else if (errorCode === 'not_found' || errorMsg.includes('not found') || errorMsg.includes('404')) {
      toast.error('Resource not found', {
        description: 'The requested resource could not be found.',
        duration: 5000,
      });
    } else {
      const context = this.props.context || 'operation';
      toast.error(`${context} error`, {
        description: 'Something went wrong. Please try again.',
        duration: 5000,
      });
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
    
    toast.info('Retrying...', {
      description: 'Attempting to recover from the error.',
      duration: 2000,
    });
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      const context = this.props.context || 'operation';
      const isTimeout = this.state.error?.message?.includes('timeout');
      const isRateLimit = this.state.error?.message?.includes('rate limit');
      const isNetwork = this.state.error?.message?.includes('network') || this.state.error?.message?.includes('fetch');

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4 sm:p-6 md:p-8">
          <Card className="max-w-lg w-full p-6 sm:p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-destructive" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                {isTimeout && 'Provider Timeout'}
                {isRateLimit && 'Rate Limit Reached'}
                {isNetwork && 'Connection Issue'}
                {!isTimeout && !isRateLimit && !isNetwork && `${context} Error`}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                {isTimeout && 'Some providers are taking longer than expected. This is normal for comprehensive scans.'}
                {isRateLimit && 'You\'ve made too many requests. Please wait a moment before trying again.'}
                {isNetwork && 'Unable to connect to the server. Please check your internet connection.'}
                {!isTimeout && !isRateLimit && !isNetwork && 'We encountered an unexpected error during the operation.'}
              </p>
            </div>

            {this.state.error && (
              <details className="text-left">
                <summary className="cursor-pointer text-xs sm:text-sm text-muted-foreground hover:text-foreground">
                  Technical details
                </summary>
                <pre className="mt-2 text-xs bg-muted p-3 sm:p-4 rounded-md overflow-auto max-h-32">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleRetry}
                variant="default"
                className="w-full sm:w-auto"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button
                onClick={this.handleGoBack}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Go Back
              </Button>
            </div>

            {this.state.retryCount > 0 && (
              <p className="text-xs text-muted-foreground">
                Retry attempts: {this.state.retryCount}
              </p>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
