// Circuit breaker state
const circuitBreakers = new Map<string, { failures: number; openUntil?: number }>();
const CIRCUIT_THRESHOLD = 5;
const CIRCUIT_COOLDOWN_MS = 60000;

export function getCircuitStatus(): string[] {
  const now = Date.now();
  const open: string[] = [];
  
  for (const [providerId, state] of circuitBreakers.entries()) {
    if (state.openUntil && state.openUntil > now) {
      open.push(providerId);
    }
  }
  
  return open;
}

export function recordCircuitFailure(providerId: string): void {
  const state = circuitBreakers.get(providerId) || { failures: 0 };
  state.failures++;
  
  if (state.failures >= CIRCUIT_THRESHOLD) {
    state.openUntil = Date.now() + CIRCUIT_COOLDOWN_MS;
  }
  
  circuitBreakers.set(providerId, state);
}

export function recordCircuitSuccess(providerId: string): void {
  const state = circuitBreakers.get(providerId);
  if (state) {
    state.failures = 0;
    state.openUntil = undefined;
    circuitBreakers.set(providerId, state);
  }
}

export function isCircuitOpen(providerId: string): boolean {
  const state = circuitBreakers.get(providerId);
  if (!state || !state.openUntil) return false;
  
  const now = Date.now();
  if (state.openUntil > now) return true;
  
  // Circuit cooldown expired, reset
  state.openUntil = undefined;
  state.failures = 0;
  circuitBreakers.set(providerId, state);
  return false;
}
