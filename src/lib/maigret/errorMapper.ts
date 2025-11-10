export interface MappedError {
  title: string;
  description: string;
  action: string;
  severity: 'error' | 'warning' | 'info';
}

export function mapWorkerError(error: any): MappedError {
  const status = error.status || error.statusCode;
  
  switch(status) {
    case 401:
    case 403:
      return {
        title: 'Authentication Error',
        description: 'Worker auth misconfigured. Check WORKER_TOKEN in Edge Function and Cloud Run.',
        action: 'Contact administrator',
        severity: 'error',
      };
    case 404:
      return {
        title: 'Route Not Found',
        description: 'Worker route missing (/scan). Verify Cloud Run deployment.',
        action: 'Check worker logs',
        severity: 'error',
      };
    case 500:
    case 502:
    case 503:
    case 504:
      return {
        title: 'Worker Error',
        description: 'Worker crashed or is unavailable. Check Cloud Run logs.',
        action: 'Try again in a few minutes',
        severity: 'error',
      };
    case 429:
      return {
        title: 'Rate Limited',
        description: 'Too many requests to the worker.',
        action: 'Wait a moment and try again',
        severity: 'warning',
      };
    default:
      if (error.message?.includes('fetch') || error.message?.includes('network') || error.message?.includes('unreachable')) {
        return {
          title: 'Connection Error',
          description: 'Worker URL unreachable. Check MAIGRET_WORKER_URL.',
          action: 'Verify network connectivity',
          severity: 'error',
        };
      }
      return {
        title: 'Unknown Error',
        description: error.message || error.details || 'An unexpected error occurred',
        action: 'Copy diagnostics and contact support',
        severity: 'error',
      };
  }
}

export interface DiagnosticsInfo {
  timestamp: string;
  request: {
    url: string;
    method: string;
    body: any;
  };
  response?: {
    status: number;
    statusText: string;
    body: any;
  };
  error?: {
    message: string;
    type: string;
  };
}

export function copyDiagnostics(diagnostics: DiagnosticsInfo): void {
  const sanitized = {
    ...diagnostics,
    request: {
      ...diagnostics.request,
      body: diagnostics.request.body ? { ...diagnostics.request.body, username: '***' } : null,
    },
  };
  
  const text = JSON.stringify(sanitized, null, 2);
  navigator.clipboard.writeText(text);
}
