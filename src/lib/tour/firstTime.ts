/**
 * First-time user detection and tour auto-start
 */

const FIRST_VISIT_KEY = "footprintiq_first_visit_v1";
const TOUR_SEEN_KEY = "footprintiq_tour_seen_v1";

export function isFirstTimeUser(): boolean {
  const hasVisited = localStorage.getItem(FIRST_VISIT_KEY);
  return !hasVisited;
}

export function markAsVisited(): void {
  localStorage.setItem(FIRST_VISIT_KEY, new Date().toISOString());
}

export function shouldAutoStartTour(): boolean {
  const tourProgress = localStorage.getItem(TOUR_SEEN_KEY);
  
  if (!tourProgress) {
    return isFirstTimeUser();
  }
  
  try {
    const progress = JSON.parse(tourProgress);
    // Auto-start if user hasn't completed onboarding tour
    return !progress.onboarding?.completed;
  } catch {
    return isFirstTimeUser();
  }
}

export function getTourAutoStartDelay(): number {
  // Wait 1 second after page load to let user see the page first
  return 1000;
}
