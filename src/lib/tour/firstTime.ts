/**
 * First-time user detection and tour auto-start
 */

const FIRST_VISIT_KEY = "footprintiq_first_visit_v1";
const TOUR_SEEN_KEY = "footprintiq_tour_seen_v1";
const ONBOARDING_SHOWN_KEY = "fpiq_onboarding_shown_v1";

export function isFirstTimeUser(): boolean {
  const hasVisited = localStorage.getItem(FIRST_VISIT_KEY);
  return !hasVisited;
}

export function markAsVisited(): void {
  localStorage.setItem(FIRST_VISIT_KEY, new Date().toISOString());
}

export function markOnboardingShown(): void {
  localStorage.setItem(ONBOARDING_SHOWN_KEY, 'true');
}

export function shouldAutoStartTour(): boolean {
  // Only ever show once after signup
  if (localStorage.getItem(ONBOARDING_SHOWN_KEY)) {
    return false;
  }

  // Check if tour was already triggered this session
  const sessionTourTriggered = sessionStorage.getItem('fpiq_tour_triggered');
  if (sessionTourTriggered) {
    return false;
  }

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

export function markTourTriggered(): void {
  sessionStorage.setItem('fpiq_tour_triggered', 'true');
}

export function getTourAutoStartDelay(): number {
  // Wait 1 second after page load to let user see the page first
  return 1000;
}
