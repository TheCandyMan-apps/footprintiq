import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { trackPaymentError } from '@/lib/sentry';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class PaymentErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Payment ErrorBoundary caught an error:', error, errorInfo);
    
    // Track to Sentry
    trackPaymentError(error, {
      errorType: 'error_boundary',
      errorCode: 'react_error',
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <Alert variant="destructive" className="max-w-2xl">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-lg font-semibold">Upgrade Failed</AlertTitle>
            <AlertDescription className="mt-4 space-y-4">
              <p>There was an error processing your upgrade. Please retry or contact support@footprintiq.app for assistance.</p>
              {this.state.error && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium mb-2">
                    Error details
                  </summary>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
              <div className="flex gap-3 mt-4">
                <Button onClick={this.handleReset} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a href="mailto:support@footprintiq.app">
                    Contact Support
                  </a>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PaymentErrorBoundary;
