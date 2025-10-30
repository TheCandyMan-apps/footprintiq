import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format a number with locale-aware separators
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Format a number as a percentage
 */
export const formatPercent = (num: number, decimals = 1): string => {
  return `${num.toFixed(decimals)}%`;
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Format a delta value with sign and color class
 */
export const formatDelta = (delta: number): { 
  text: string; 
  color: string;
  icon: '↑' | '↓' | '→';
} => {
  if (delta > 0) {
    return {
      text: `+${formatNumber(delta)}`,
      color: 'text-green-500',
      icon: '↑',
    };
  } else if (delta < 0) {
    return {
      text: formatNumber(delta),
      color: 'text-red-500',
      icon: '↓',
    };
  }
  return {
    text: '0',
    color: 'text-muted-foreground',
    icon: '→',
  };
};

/**
 * Format a date as relative time
 */
export const formatRelativeTime = (date: string | Date): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

/**
 * Format a date as absolute timestamp
 */
export const formatTimestamp = (date: string | Date, pattern = 'MMM d, yyyy h:mm a'): string => {
  return format(new Date(date), pattern);
};

/**
 * Format bytes to human-readable size
 */
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * Format milliseconds to human-readable duration
 */
export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`;
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
};

/**
 * Format a confidence score as percentage
 */
export const formatConfidence = (confidence: number): string => {
  return `${Math.round(confidence)}%`;
};
