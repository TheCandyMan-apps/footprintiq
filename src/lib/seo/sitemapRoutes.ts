/**
 * Canonical sitemap route registry.
 * All public, indexable routes are listed here grouped by section.
 * Used by scripts/generate-sitemaps.ts to produce static XML at build time.
 *
 * IMPORTANT: Never add private/authenticated/user-specific routes here.
 */

/**
 * Canonical base URL for all sitemap entries.
 * In a Node build script context, reads VITE_PUBLIC_SITE_URL from process.env.
 * Falls back to the production URL.
 */
export const CANONICAL_BASE: string =
  (typeof process !== "undefined" && process.env?.VITE_PUBLIC_SITE_URL) ||
  "https://footprintiq.app";

export interface SitemapEntry {
  /** Absolute path, e.g. "/guides/foo" */
  path: string;
  /** ISO date string, e.g. "2026-03-05" */
  lastmod: string;
  changefreq?: string;
  priority?: number;
}

/**
 * Build-date string used as the default lastmod.
 * Resolves to the current date when the generate script runs,
 * so sitemaps always reflect the latest build.
 */
const BUILD_DATE = new Date().toISOString().slice(0, 10);

// ── Tools ──────────────────────────────────────────────
export const toolRoutes: SitemapEntry[] = [
  { path: "/", lastmod: BUILD_DATE, priority: 1.0, changefreq: "daily" },
  { path: "/free-scan", lastmod: BUILD_DATE, priority: 0.9 },
  { path: "/tools", lastmod: BUILD_DATE, priority: 0.8 },
  { path: "/lens", lastmod: BUILD_DATE, priority: 0.8 },
  { path: "/username-search", lastmod: BUILD_DATE, priority: 0.9 },
  { path: "/email-breach-check", lastmod: BUILD_DATE, priority: 0.9 },
  { path: "/email-exposure", lastmod: BUILD_DATE, priority: 0.7 },
  { path: "/username-search-tools", lastmod: BUILD_DATE },
  { path: "/email-breach-tools", lastmod: BUILD_DATE },
  { path: "/maigret-scanner", lastmod: BUILD_DATE },
  { path: "/digital-footprint-scanner", lastmod: BUILD_DATE, priority: 0.9 },
  { path: "/digital-footprint-check", lastmod: BUILD_DATE },
  { path: "/online-footprint-scanner", lastmod: BUILD_DATE },
  { path: "/username-checker", lastmod: BUILD_DATE },
  { path: "/reverse-username-search", lastmod: BUILD_DATE, priority: 0.8 },
  { path: "/username-lookup", lastmod: BUILD_DATE },
  { path: "/account-finder", lastmod: BUILD_DATE },
  { path: "/social-media-finder", lastmod: BUILD_DATE },
  { path: "/username-exposure", lastmod: BUILD_DATE },
  { path: "/find-social-media-accounts", lastmod: BUILD_DATE },
  { path: "/search-username", lastmod: BUILD_DATE },
  { path: "/dark-web-monitoring", lastmod: BUILD_DATE },
  { path: "/automated-removal", lastmod: BUILD_DATE },
  { path: "/usernames", lastmod: BUILD_DATE },
  { path: "/digital-footprint-scan", lastmod: BUILD_DATE },
  { path: "/ai-username-search", lastmod: BUILD_DATE },
  { path: "/osint-playground", lastmod: BUILD_DATE },
  // Authority cluster tool pages
  { path: "/where-is-this-username-used", lastmod: BUILD_DATE, priority: 0.8 },
  { path: "/search-username-online", lastmod: BUILD_DATE, priority: 0.8 },
  { path: "/username-availability-checker", lastmod: BUILD_DATE, priority: 0.8 },
  { path: "/social-media-account-finder", lastmod: BUILD_DATE, priority: 0.8 },
  { path: "/digital-footprint-checker", lastmod: BUILD_DATE, priority: 0.8 },
  // Platform-specific
  { path: "/tiktok-username-search", lastmod: BUILD_DATE },
  { path: "/instagram-username-search", lastmod: BUILD_DATE },
  { path: "/instagram-user-search", lastmod: BUILD_DATE },
  { path: "/instagram-username-checker", lastmod: BUILD_DATE },
  { path: "/twitter-username-search", lastmod: BUILD_DATE },
  { path: "/discord-username-search", lastmod: BUILD_DATE },
  { path: "/discord-lookup", lastmod: BUILD_DATE },
  { path: "/onlyfans-username-search", lastmod: BUILD_DATE },
  { path: "/tinder-username-search", lastmod: BUILD_DATE },
  { path: "/kik-username-search", lastmod: BUILD_DATE },
  { path: "/snapchat-username-search", lastmod: BUILD_DATE },
  { path: "/reddit-username-search", lastmod: BUILD_DATE },
  { path: "/linkedin-username-search", lastmod: BUILD_DATE },
  { path: "/telegram-username-search", lastmod: BUILD_DATE },
  { path: "/youtube-username-search", lastmod: BUILD_DATE },
  { path: "/facebook-search-without-login", lastmod: BUILD_DATE },
  { path: "/instagram-search-without-account", lastmod: BUILD_DATE },
  { path: "/dating-profile-lookup", lastmod: BUILD_DATE },
  { path: "/find-dating-profiles", lastmod: BUILD_DATE },
  { path: "/search-dating-sites-by-email", lastmod: BUILD_DATE },
  { path: "/compare", lastmod: BUILD_DATE },
  // Comparisons
  { path: "/aura-vs-footprintiq", lastmod: BUILD_DATE },
  { path: "/deleteme-vs-footprintiq", lastmod: BUILD_DATE },
  { path: "/incogni-vs-footprintiq", lastmod: BUILD_DATE },
  { path: "/kanary-vs-footprintiq", lastmod: BUILD_DATE },
  { path: "/usersearch-vs-footprintiq", lastmod: BUILD_DATE },
  { path: "/people-search-vs-footprintiq", lastmod: BUILD_DATE },
  { path: "/osint-suites-vs-footprintiq", lastmod: BUILD_DATE },
  { path: "/comparisons/pimeyes-alternative", lastmod: BUILD_DATE },
  { path: "/comparisons/sherlock-vs-footprintiq", lastmod: BUILD_DATE },
  { path: "/incogni-vs-diy-data-removal", lastmod: BUILD_DATE },
];

// ── Guides ─────────────────────────────────────────────
export const guideRoutes: SitemapEntry[] = [
  { path: "/guides", lastmod: BUILD_DATE, priority: 0.8 },
  // Authority cluster guide pages
  { path: "/guides/what-is-username-osint", lastmod: BUILD_DATE },
  { path: "/guides/how-to-trace-a-username", lastmod: BUILD_DATE },
  { path: "/guides/why-username-reuse-is-risky", lastmod: BUILD_DATE },
  { path: "/guides/how-to-remove-old-accounts", lastmod: BUILD_DATE },
  { path: "/guides/how-username-search-tools-work", lastmod: BUILD_DATE },
  { path: "/guides/interpret-osint-results", lastmod: BUILD_DATE },
  { path: "/guides/what-osint-results-mean", lastmod: BUILD_DATE },
  { path: "/guides/is-osint-scan-worth-it", lastmod: BUILD_DATE },
  { path: "/guides/free-vs-paid-osint-tools", lastmod: BUILD_DATE },
  { path: "/guides/good-osint-scan-result", lastmod: BUILD_DATE },
  { path: "/guides/search-twitter-without-account", lastmod: BUILD_DATE },
  { path: "/guides/reduce-digital-footprint", lastmod: BUILD_DATE },
  { path: "/guides/check-whats-publicly-visible", lastmod: BUILD_DATE },
  { path: "/guides/employers-digital-footprint", lastmod: BUILD_DATE },
  { path: "/guides/clean-up-online-presence", lastmod: BUILD_DATE },
  { path: "/guides/remove-from-data-brokers", lastmod: BUILD_DATE },
  { path: "/guides/monitor-online-exposure", lastmod: BUILD_DATE },
  { path: "/guides/what-google-knows-about-you", lastmod: BUILD_DATE },
  { path: "/guides/telegram-osint-search", lastmod: BUILD_DATE },
  { path: "/guides/how-to-search-for-people-on-instagram", lastmod: BUILD_DATE },
  { path: "/guides/search-tiktok-without-account", lastmod: BUILD_DATE },
  { path: "/reverse-username-search-guide", lastmod: BUILD_DATE },
  { path: "/how-to-find-someone-online", lastmod: BUILD_DATE },
  { path: "/how-to-remove-yourself-from-data-brokers", lastmod: BUILD_DATE },
  { path: "/data-broker-opt-out-guide", lastmod: BUILD_DATE },
  { path: "/data-broker-removal-guide", lastmod: BUILD_DATE },
  { path: "/data-breach-cleanup-checklist", lastmod: BUILD_DATE },
  { path: "/remove-personal-information-from-internet", lastmod: BUILD_DATE },
  { path: "/remove-yourself-from-google-search", lastmod: BUILD_DATE },
  { path: "/how-to-remove-your-address-from-google", lastmod: BUILD_DATE },
  { path: "/remove-yourself-from-data-broker-sites", lastmod: BUILD_DATE },
  { path: "/remove-mylife-profile", lastmod: BUILD_DATE },
  { path: "/remove-spokeo-profile", lastmod: BUILD_DATE },
  { path: "/remove-beenverified-profile", lastmod: BUILD_DATE },
  { path: "/how-to-delete-facebook-account", lastmod: BUILD_DATE },
  { path: "/how-to-delete-instagram-account", lastmod: BUILD_DATE },
  { path: "/how-to-delete-tiktok-account", lastmod: BUILD_DATE },
  { path: "/how-to-delete-google-account", lastmod: BUILD_DATE },
  { path: "/delete-social-media-accounts", lastmod: BUILD_DATE },
  { path: "/how-to-clean-up-your-digital-footprint", lastmod: BUILD_DATE },
  { path: "/check-my-digital-footprint", lastmod: BUILD_DATE },
  { path: "/how-to-check-whats-publicly-visible-about-you", lastmod: BUILD_DATE },
  { path: "/how-employers-check-your-online-presence", lastmod: BUILD_DATE },
  { path: "/see-what-google-knows-about-you", lastmod: BUILD_DATE },
  { path: "/how-to-protect-your-digital-identity", lastmod: BUILD_DATE },
  { path: "/how-to-check-someones-username-history", lastmod: BUILD_DATE },
  { path: "/scan-my-online-presence", lastmod: BUILD_DATE },
  { path: "/audit-your-digital-footprint", lastmod: BUILD_DATE },
  { path: "/personal-data-exposure-scan", lastmod: BUILD_DATE },
  { path: "/check-username-across-platforms", lastmod: BUILD_DATE },
  { path: "/reduce-digital-footprint", lastmod: BUILD_DATE },
  { path: "/stay-private-online", lastmod: BUILD_DATE },
  { path: "/verify-someone-online", lastmod: BUILD_DATE },
  { path: "/check-if-someone-is-a-scammer", lastmod: BUILD_DATE },
  { path: "/can-someone-track-me-online", lastmod: BUILD_DATE },
  { path: "/romance-scam-warning-signs", lastmod: BUILD_DATE },
  { path: "/privacy-centre", lastmod: BUILD_DATE },
  { path: "/privacy/google-content-removal", lastmod: BUILD_DATE },
  { path: "/privacy/data-broker-removal-guide", lastmod: BUILD_DATE },
  // Playbooks
  { path: "/playbooks", lastmod: BUILD_DATE },
  { path: "/playbooks/executive-travel-check", lastmod: BUILD_DATE },
  { path: "/playbooks/journalist-risk-audit", lastmod: BUILD_DATE },
  { path: "/playbooks/pre-employment-exposure-review", lastmod: BUILD_DATE },
  // Resources
  { path: "/resources", lastmod: BUILD_DATE },
  { path: "/resources/webinars", lastmod: BUILD_DATE },
  { path: "/resources/2026-data-broker-removal-checklist", lastmod: BUILD_DATE },
  { path: "/resources/ethical-osint-framework", lastmod: BUILD_DATE },
  { path: "/resources/doxxing-defense", lastmod: BUILD_DATE },
  { path: "/resources/digital-footprint-mapping", lastmod: BUILD_DATE },
  { path: "/resources/responsible-osint", lastmod: BUILD_DATE },
];

// ── Glossary / Educational ─────────────────────────────
export const glossaryRoutes: SitemapEntry[] = [
  { path: "/digital-privacy-glossary", lastmod: BUILD_DATE, priority: 0.7 },
  { path: "/what-is-a-digital-footprint", lastmod: BUILD_DATE },
  { path: "/what-is-osint", lastmod: BUILD_DATE },
  { path: "/digital-exposure-risk-explained", lastmod: BUILD_DATE },
  { path: "/credential-reuse-risk", lastmod: BUILD_DATE },
  { path: "/username-reuse-risk", lastmod: BUILD_DATE },
  { path: "/is-username-search-accurate", lastmod: BUILD_DATE },
  { path: "/what-can-a-username-reveal", lastmod: BUILD_DATE },
  { path: "/find-someone-by-username", lastmod: BUILD_DATE },
  { path: "/after-have-i-been-pwned-what-next", lastmod: BUILD_DATE },
  { path: "/breach-vs-digital-footprint-risk", lastmod: BUILD_DATE },
  { path: "/how-to-monitor-your-online-exposure-after-a-breach", lastmod: BUILD_DATE },
  { path: "/best-way-to-monitor-your-online-exposure", lastmod: BUILD_DATE },
  { path: "/continuous-exposure-monitoring-explained", lastmod: BUILD_DATE },
  { path: "/how-username-reuse-exposes-you-online", lastmod: BUILD_DATE },
  { path: "/best-digital-footprint-scanner", lastmod: BUILD_DATE },
  { path: "/best-osint-tools", lastmod: BUILD_DATE },
  { path: "/best-online-privacy-scanner", lastmod: BUILD_DATE },
  { path: "/best-people-lookup-sites", lastmod: BUILD_DATE },
  { path: "/best-person-search-engine", lastmod: BUILD_DATE },
  { path: "/best-reverse-username-search-tools", lastmod: BUILD_DATE },
  { path: "/best-search-engine-for-finding-people", lastmod: BUILD_DATE },
  { path: "/search-engines-to-find-people", lastmod: BUILD_DATE },
  { path: "/what-can-people-find-about-me", lastmod: BUILD_DATE },
  { path: "/is-my-data-exposed", lastmod: BUILD_DATE },
  { path: "/old-data-breaches", lastmod: BUILD_DATE },
  { path: "/which-data-matters", lastmod: BUILD_DATE },
  { path: "/how-identity-theft-starts", lastmod: BUILD_DATE },
  { path: "/osint-techniques", lastmod: BUILD_DATE },
  { path: "/ethical-osint", lastmod: BUILD_DATE },
  { path: "/ethical-osint-principles", lastmod: BUILD_DATE },
  { path: "/ethical-osint-for-individuals", lastmod: BUILD_DATE },
  { path: "/ethical-osint-charter", lastmod: BUILD_DATE },
  { path: "/osint-for-activists-journalists", lastmod: BUILD_DATE },
  { path: "/osint-for-investigators", lastmod: BUILD_DATE },
];

// ── Research ───────────────────────────────────────────
export const researchRoutes: SitemapEntry[] = [
  { path: "/research", lastmod: BUILD_DATE, priority: 0.7 },
  { path: "/research/username-reuse-report-2026", lastmod: BUILD_DATE },
  { path: "/research/username-reuse-report-2026-download", lastmod: BUILD_DATE },
  { path: "/research/media-kit", lastmod: BUILD_DATE },
  { path: "/research/fact-sheet", lastmod: BUILD_DATE },
  { path: "/research/username-reuse-statistics", lastmod: BUILD_DATE },
];

// ── Datasets / Blog ───────────────────────────────────
export const datasetRoutes: SitemapEntry[] = [
  { path: "/blog", lastmod: BUILD_DATE, priority: 0.7 },
  { path: "/blog/ai-in-osint-2025", lastmod: BUILD_DATE },
  { path: "/blog/osint-ai-era-2026", lastmod: BUILD_DATE },
  { path: "/blog/persona-dna-and-evidence-packs", lastmod: BUILD_DATE },
  { path: "/blog/what-is-osint-risk", lastmod: BUILD_DATE },
  { path: "/blog/dark-web-monitoring-explained", lastmod: BUILD_DATE },
  { path: "/blog/what-is-digital-footprint", lastmod: BUILD_DATE },
  { path: "/blog/check-email-breach", lastmod: BUILD_DATE },
  { path: "/blog/osint-beginners-guide", lastmod: BUILD_DATE },
  { path: "/blog/remove-data-brokers", lastmod: BUILD_DATE },
  { path: "/blog/social-media-privacy", lastmod: BUILD_DATE },
  { path: "/blog/phone-number-privacy", lastmod: BUILD_DATE },
  { path: "/blog/username-security", lastmod: BUILD_DATE },
  { path: "/blog/ip-address-security", lastmod: BUILD_DATE },
  { path: "/blog/identity-theft-response", lastmod: BUILD_DATE },
  { path: "/blog/password-security-guide", lastmod: BUILD_DATE },
  { path: "/blog/vpn-privacy-guide", lastmod: BUILD_DATE },
  { path: "/blog/two-factor-authentication", lastmod: BUILD_DATE },
  { path: "/blog/secure-browsing-guide", lastmod: BUILD_DATE },
  { path: "/blog/free-username-search", lastmod: BUILD_DATE },
  { path: "/blog/username-reuse", lastmod: BUILD_DATE },
  { path: "/blog/what-is-digital-exposure", lastmod: BUILD_DATE },
  { path: "/blog/username-search-misleading", lastmod: BUILD_DATE },
  { path: "/blog/lens-osint-confidence-wrong", lastmod: BUILD_DATE },
  { path: "/blog/lens-introduction", lastmod: BUILD_DATE },
  { path: "/blog/lens-confidence-meaning", lastmod: BUILD_DATE },
  { path: "/blog/lens-case-study-false-positive", lastmod: BUILD_DATE },
  { path: "/blog/dark-web-scans-noise", lastmod: BUILD_DATE },
  { path: "/blog/osint-to-insight", lastmod: BUILD_DATE },
  { path: "/blog/ethical-osint-exposure", lastmod: BUILD_DATE },
  { path: "/blog/what-is-osint", lastmod: BUILD_DATE },
  { path: "/blog/how-data-brokers-work", lastmod: BUILD_DATE },
  { path: "/blog/how-exposed-am-i-online", lastmod: BUILD_DATE },
  { path: "/blog/what-is-username-osint-scan", lastmod: BUILD_DATE },
  { path: "/blog/are-username-search-tools-accurate", lastmod: BUILD_DATE },
  { path: "/blog/remove-address-from-google", lastmod: BUILD_DATE },
  { path: "/blog/remove-from-data-brokers-uk", lastmod: BUILD_DATE },
  { path: "/blog/delete-old-accounts", lastmod: BUILD_DATE },
  { path: "/blog/what-is-digital-footprint-check", lastmod: BUILD_DATE },
  { path: "/blog/digital-exposure-report-2026", lastmod: BUILD_DATE },
  { path: "/blog/what-is-ethical-osint-scan", lastmod: BUILD_DATE },
  { path: "/blog/exposure-mapping-before-removal", lastmod: BUILD_DATE },
  { path: "/blog/public-vs-private-data-osint", lastmod: BUILD_DATE },
  { path: "/blog/remove-from-data-brokers-guide", lastmod: BUILD_DATE },
  { path: "/blog/is-footprintiq-data-broker", lastmod: BUILD_DATE },
];

// ── AI Answers ─────────────────────────────────────────
export const aiAnswerRoutes: SitemapEntry[] = [
  { path: "/ai-answers-hub", lastmod: BUILD_DATE, priority: 0.7 },
  { path: "/ai-answers/what-is-a-username-osint-scan", lastmod: BUILD_DATE },
  { path: "/ai-answers/why-username-reuse-is-risky", lastmod: BUILD_DATE },
  { path: "/ai-answers/are-username-search-tools-accurate", lastmod: BUILD_DATE },
  { path: "/ai-answers/is-username-osint-legal", lastmod: BUILD_DATE },
  { path: "/ai-answers/ethical-osint-tools", lastmod: BUILD_DATE },
  { path: "/ai-answers/common-osint-misconceptions", lastmod: BUILD_DATE },
  { path: "/ai-answers/when-not-to-use-osint", lastmod: BUILD_DATE },
  { path: "/ai-answers/what-is-an-identity-risk-score", lastmod: BUILD_DATE },
  { path: "/ai-answers/does-osint-include-dark-web-data", lastmod: BUILD_DATE },
  { path: "/ai-answers/instagram-username-osint", lastmod: BUILD_DATE },
  { path: "/ai", lastmod: BUILD_DATE },
  { path: "/ai/digital-exposure", lastmod: BUILD_DATE },
  { path: "/ai/digital-footprint", lastmod: BUILD_DATE },
  { path: "/ai/what-is-osint", lastmod: BUILD_DATE },
  { path: "/ai/what-is-identity-profiling", lastmod: BUILD_DATE },
  { path: "/ai/what-are-data-brokers", lastmod: BUILD_DATE },
];

// ── Static / Marketing pages ───────────────────────────
export const staticRoutes: SitemapEntry[] = [
  { path: "/pricing", lastmod: BUILD_DATE, priority: 0.8 },
  { path: "/features", lastmod: BUILD_DATE, priority: 0.8 },
  { path: "/enterprise", lastmod: BUILD_DATE },
  { path: "/sample-report", lastmod: BUILD_DATE },
  { path: "/about-footprintiq", lastmod: BUILD_DATE },
  { path: "/press", lastmod: BUILD_DATE },
  { path: "/trust", lastmod: BUILD_DATE },
  { path: "/trust-safety", lastmod: BUILD_DATE },
  { path: "/trust/ai-agents", lastmod: BUILD_DATE },
  { path: "/trust/data-ethics", lastmod: BUILD_DATE },
  { path: "/data-lifecycle", lastmod: BUILD_DATE },
  { path: "/how-we-source-data", lastmod: BUILD_DATE },
  { path: "/data-sources", lastmod: BUILD_DATE },
  { path: "/responsible-use", lastmod: BUILD_DATE },
  { path: "/ethics", lastmod: BUILD_DATE },
  { path: "/editorial-ethics-policy", lastmod: BUILD_DATE },
  { path: "/privacy-policy", lastmod: BUILD_DATE },
  { path: "/terms-of-service", lastmod: BUILD_DATE },
  { path: "/legal/dpa", lastmod: BUILD_DATE },
  { path: "/support", lastmod: BUILD_DATE },
  { path: "/contact", lastmod: BUILD_DATE },
  { path: "/help", lastmod: BUILD_DATE },
  { path: "/for-individuals", lastmod: BUILD_DATE },
  { path: "/for-professionals", lastmod: BUILD_DATE },
  { path: "/for-protected-users", lastmod: BUILD_DATE },
  { path: "/for/crypto", lastmod: BUILD_DATE },
  { path: "/for/job-seekers", lastmod: BUILD_DATE },
  { path: "/for/developers", lastmod: BUILD_DATE },
  { path: "/for/executives", lastmod: BUILD_DATE },
  { path: "/partners", lastmod: BUILD_DATE },
  { path: "/global-index", lastmod: BUILD_DATE },
  { path: "/developers", lastmod: BUILD_DATE },
  { path: "/api", lastmod: BUILD_DATE },
  { path: "/integrations", lastmod: BUILD_DATE },
  { path: "/marketplace", lastmod: BUILD_DATE },
  { path: "/install", lastmod: BUILD_DATE },
  { path: "/system-status", lastmod: BUILD_DATE },
];

/** Build a single sitemap XML string from entries */
export function buildSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${CANONICAL_BASE}${e.path}</loc>\n    <lastmod>${e.lastmod}</lastmod>${
          e.changefreq ? `\n    <changefreq>${e.changefreq}</changefreq>` : ""
        }${e.priority != null ? `\n    <priority>${e.priority}</priority>` : ""}\n  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/** Build sitemap index XML */
export function buildSitemapIndexXml(): string {
  const buildDate = new Date().toISOString().slice(0, 10);
  const sitemaps = [
    "sitemap-tools.xml",
    "sitemap-guides.xml",
    "sitemap-glossary.xml",
    "sitemap-research.xml",
    "sitemap-datasets.xml",
    "sitemap-ai-answers.xml",
    "sitemap-static.xml",
  ];

  const entries = sitemaps
    .map(
      (s) =>
        `  <sitemap>\n    <loc>${CANONICAL_BASE}/${s}</loc>\n    <lastmod>${buildDate}</lastmod>\n  </sitemap>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>\n`;
}
