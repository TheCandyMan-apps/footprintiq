/**
 * Capture and normalise the document.referrer to hostname only.
 * Returns undefined if no referrer is present or if it's same-origin.
 */
export function getReferrerHostname(): string | undefined {
  try {
    const ref = document.referrer;
    if (!ref) return undefined;

    const url = new URL(ref);
    const hostname = url.hostname.replace(/^www\./, '');

    // Ignore same-origin referrers
    if (hostname === window.location.hostname.replace(/^www\./, '')) {
      return undefined;
    }

    return hostname || undefined;
  } catch {
    return undefined;
  }
}
