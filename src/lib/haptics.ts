/**
 * Haptic feedback utilities for mobile interactions
 * Provides vibration feedback when supported by the device
 */

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const patterns: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [10, 50, 10],
  warning: [20, 100, 20],
  error: [30, 100, 30, 100, 30],
};

/**
 * Triggers haptic feedback if supported by the device
 * @param pattern - The haptic pattern to trigger
 */
export function triggerHaptic(pattern: HapticPattern = 'light'): void {
  // Check if vibration API is supported
  if (!navigator.vibrate) {
    return;
  }

  try {
    const vibrationPattern = patterns[pattern];
    navigator.vibrate(vibrationPattern);
  } catch (error) {
    // Silently fail if vibration is not supported or blocked
    console.debug('Haptic feedback not available:', error);
  }
}

/**
 * Creates a haptic-enabled click handler
 * @param callback - The original click handler
 * @param pattern - The haptic pattern to trigger
 */
export function withHaptic<T extends (...args: any[]) => any>(
  callback: T,
  pattern: HapticPattern = 'light'
): T {
  return ((...args: any[]) => {
    triggerHaptic(pattern);
    return callback(...args);
  }) as T;
}
