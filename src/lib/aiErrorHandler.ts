/**
 * AI Error Handler
 * Provides specific, actionable error messages for AI analysis failures
 */

export interface AIErrorInfo {
  title: string;
  description: string;
  action?: string;
  canRetry?: boolean;
}

export function getAIErrorMessage(error: any): AIErrorInfo {
  const errorMessage = error?.message || error?.toString() || '';
  const errorLower = errorMessage.toLowerCase();

  // Check for specific error patterns
  if (errorLower.includes('lovable_api_key') || errorLower.includes('api key') || errorLower.includes('not configured')) {
    return {
      title: 'AI Configuration Missing',
      description: 'AI analysis requires Lovable AI to be configured. This feature may not be available on your current plan.',
      action: 'Contact support to enable AI features',
      canRetry: false
    };
  }

  if (errorLower.includes('insufficient') || errorLower.includes('credits')) {
    return {
      title: 'Insufficient Credits',
      description: 'AI analysis requires workspace credits to run.',
      action: 'Top up your workspace credits',
      canRetry: false
    };
  }

  if (errorLower.includes('rate limit') || errorLower.includes('too many')) {
    return {
      title: 'Rate Limit Exceeded',
      description: 'Too many AI requests. Please wait before trying again.',
      action: 'Try again in a few minutes',
      canRetry: true
    };
  }

  if (errorLower.includes('no findings') || errorLower.includes('no data') || errorLower.includes('empty')) {
    return {
      title: 'No Data to Analyze',
      description: 'AI analysis requires scan findings to be present.',
      action: 'Run a scan first',
      canRetry: false
    };
  }

  if (errorLower.includes('timeout') || errorLower.includes('timed out')) {
    return {
      title: 'Analysis Timeout',
      description: 'The AI analysis took too long to complete.',
      action: 'Try again with a smaller dataset',
      canRetry: true
    };
  }

  if (errorLower.includes('network') || errorLower.includes('fetch') || errorLower.includes('connection')) {
    return {
      title: 'Network Error',
      description: 'Unable to reach AI analysis service.',
      action: 'Check your connection and try again',
      canRetry: true
    };
  }

  // Generic fallback
  return {
    title: 'Analysis Failed',
    description: errorMessage || 'An unexpected error occurred during analysis.',
    action: 'Try again or contact support if the problem persists',
    canRetry: true
  };
}
