/**
 * Canonical sitemap route registry.
 * All public, indexable routes are listed here grouped by section.
 * Used to generate static XML sitemaps at build time.
 */

export const CANONICAL_BASE = "https://footprintiq.app";

export interface SitemapEntry {
  path: string;
  lastmod: string;
  changefreq?: string;
  priority?: number;
}

const today = "2026-03-05";

// ── Tools ──────────────────────────────────────────────
export const toolRoutes: SitemapEntry[] = [
  { path: "/", lastmod: today, priority: 1.0, changefreq: "daily" },
  { path: "/free-scan", lastmod: today, priority: 0.9 },
  { path: "/tools", lastmod: today, priority: 0.8 },
  { path: "/lens", lastmod: today, priority: 0.8 },
  { path: "/username-search", lastmod: today, priority: 0.9 },
  { path: "/email-breach-check", lastmod: today, priority: 0.9 },
  { path: "/email-exposure", lastmod: today, priority: 0.7 },
  { path: "/username-search-tools", lastmod: today },
  { path: "/email-breach-tools", lastmod: today },
  { path: "/maigret-scanner", lastmod: today },
  { path: "/digital-footprint-scanner", lastmod: today, priority: 0.9 },
  { path: "/digital-footprint-check", lastmod: today },
  { path: "/online-footprint-scanner", lastmod: today },
  { path: "/username-checker", lastmod: today },
  { path: "/reverse-username-search", lastmod: today, priority: 0.8 },
  { path: "/username-lookup", lastmod: today },
  { path: "/account-finder", lastmod: today },
  { path: "/social-media-finder", lastmod: today },
  { path: "/username-exposure", lastmod: today },
  { path: "/find-social-media-accounts", lastmod: today },
  { path: "/search-username", lastmod: today },
  { path: "/dark-web-monitoring", lastmod: today },
  { path: "/automated-removal", lastmod: today },
  { path: "/usernames", lastmod: today },
  { path: "/digital-footprint-scan", lastmod: today },
  { path: "/ai-username-search", lastmod: today },
  { path: "/osint-playground", lastmod: today },
  // Platform-specific
  { path: "/tiktok-username-search", lastmod: today },
  { path: "/instagram-username-search", lastmod: today },
  { path: "/instagram-user-search", lastmod: today },
  { path: "/instagram-username-checker", lastmod: today },
  { path: "/twitter-username-search", lastmod: today },
  { path: "/discord-username-search", lastmod: today },
  { path: "/discord-lookup", lastmod: today },
  { path: "/onlyfans-username-search", lastmod: today },
  { path: "/tinder-username-search", lastmod: today },
  { path: "/kik-username-search", lastmod: today },
  { path: "/snapchat-username-search", lastmod: today },
  { path: "/reddit-username-search", lastmod: today },
  { path: "/linkedin-username-search", lastmod: today },
  { path: "/telegram-username-search", lastmod: today },
  { path: "/youtube-username-search", lastmod: today },
  { path: "/facebook-search-without-login", lastmod: today },
  { path: "/instagram-search-without-account", lastmod: today },
  { path: "/dating-profile-lookup", lastmod: today },
  { path: "/find-dating-profiles", lastmod: today },
  { path: "/search-dating-sites-by-email", lastmod: today },
  { path: "/compare", lastmod: today },
  // Comparisons
  { path: "/aura-vs-footprintiq", lastmod: today },
  { path: "/deleteme-vs-footprintiq", lastmod: today },
  { path: "/incogni-vs-footprintiq", lastmod: today },
  { path: "/kanary-vs-footprintiq", lastmod: today },
  { path: "/usersearch-vs-footprintiq", lastmod: today },
  { path: "/people-search-vs-footprintiq", lastmod: today },
  { path: "/osint-suites-vs-footprintiq", lastmod: today },
  { path: "/comparisons/pimeyes-alternative", lastmod: today },
  { path: "/comparisons/sherlock-vs-footprintiq", lastmod: today },
  { path: "/incogni-vs-diy-data-removal", lastmod: today },
];

// ── Guides ─────────────────────────────────────────────
export const guideRoutes: SitemapEntry[] = [
  { path: "/guides", lastmod: today, priority: 0.8 },
  { path: "/guides/how-username-search-tools-work", lastmod: today },
  { path: "/guides/interpret-osint-results", lastmod: today },
  { path: "/guides/what-osint-results-mean", lastmod: today },
  { path: "/guides/is-osint-scan-worth-it", lastmod: today },
  { path: "/guides/free-vs-paid-osint-tools", lastmod: today },
  { path: "/guides/good-osint-scan-result", lastmod: today },
  { path: "/guides/search-twitter-without-account", lastmod: today },
  { path: "/guides/reduce-digital-footprint", lastmod: today },
  { path: "/guides/check-whats-publicly-visible", lastmod: today },
  { path: "/guides/employers-digital-footprint", lastmod: today },
  { path: "/guides/clean-up-online-presence", lastmod: today },
  { path: "/guides/remove-from-data-brokers", lastmod: today },
  { path: "/guides/monitor-online-exposure", lastmod: today },
  { path: "/guides/what-google-knows-about-you", lastmod: today },
  { path: "/guides/telegram-osint-search", lastmod: today },
  { path: "/guides/how-to-search-for-people-on-instagram", lastmod: today },
  { path: "/guides/search-tiktok-without-account", lastmod: today },
  { path: "/reverse-username-search-guide", lastmod: today },
  { path: "/how-to-find-someone-online", lastmod: today },
  { path: "/how-to-remove-yourself-from-data-brokers", lastmod: today },
  { path: "/data-broker-opt-out-guide", lastmod: today },
  { path: "/data-broker-removal-guide", lastmod: today },
  { path: "/data-breach-cleanup-checklist", lastmod: today },
  { path: "/remove-personal-information-from-internet", lastmod: today },
  { path: "/remove-yourself-from-google-search", lastmod: today },
  { path: "/how-to-remove-your-address-from-google", lastmod: today },
  { path: "/remove-yourself-from-data-broker-sites", lastmod: today },
  { path: "/remove-mylife-profile", lastmod: today },
  { path: "/remove-spokeo-profile", lastmod: today },
  { path: "/remove-beenverified-profile", lastmod: today },
  { path: "/how-to-delete-facebook-account", lastmod: today },
  { path: "/how-to-delete-instagram-account", lastmod: today },
  { path: "/how-to-delete-tiktok-account", lastmod: today },
  { path: "/how-to-delete-google-account", lastmod: today },
  { path: "/delete-social-media-accounts", lastmod: today },
  { path: "/how-to-clean-up-your-digital-footprint", lastmod: today },
  { path: "/check-my-digital-footprint", lastmod: today },
  { path: "/how-to-check-whats-publicly-visible-about-you", lastmod: today },
  { path: "/how-employers-check-your-online-presence", lastmod: today },
  { path: "/see-what-google-knows-about-you", lastmod: today },
  { path: "/how-to-protect-your-digital-identity", lastmod: today },
  { path: "/how-to-check-someones-username-history", lastmod: today },
  { path: "/scan-my-online-presence", lastmod: today },
  { path: "/audit-your-digital-footprint", lastmod: today },
  { path: "/personal-data-exposure-scan", lastmod: today },
  { path: "/check-username-across-platforms", lastmod: today },
  { path: "/reduce-digital-footprint", lastmod: today },
  { path: "/stay-private-online", lastmod: today },
  { path: "/verify-someone-online", lastmod: today },
  { path: "/check-if-someone-is-a-scammer", lastmod: today },
  { path: "/can-someone-track-me-online", lastmod: today },
  { path: "/romance-scam-warning-signs", lastmod: today },
  { path: "/privacy-centre", lastmod: today },
  { path: "/privacy/google-content-removal", lastmod: today },
  { path: "/privacy/data-broker-removal-guide", lastmod: today },
  // Playbooks
  { path: "/playbooks", lastmod: today },
  { path: "/playbooks/executive-travel-check", lastmod: today },
  { path: "/playbooks/journalist-risk-audit", lastmod: today },
  { path: "/playbooks/pre-employment-exposure-review", lastmod: today },
  // Resources
  { path: "/resources", lastmod: today },
  { path: "/resources/webinars", lastmod: today },
  { path: "/resources/2026-data-broker-removal-checklist", lastmod: today },
  { path: "/resources/ethical-osint-framework", lastmod: today },
  { path: "/resources/doxxing-defense", lastmod: today },
  { path: "/resources/digital-footprint-mapping", lastmod: today },
  { path: "/resources/responsible-osint", lastmod: today },
];

// ── Glossary / Educational ─────────────────────────────
export const glossaryRoutes: SitemapEntry[] = [
  { path: "/digital-privacy-glossary", lastmod: today, priority: 0.7 },
  { path: "/what-is-a-digital-footprint", lastmod: today },
  { path: "/what-is-osint", lastmod: today },
  { path: "/digital-exposure-risk-explained", lastmod: today },
  { path: "/credential-reuse-risk", lastmod: today },
  { path: "/username-reuse-risk", lastmod: today },
  { path: "/is-username-search-accurate", lastmod: today },
  { path: "/what-can-a-username-reveal", lastmod: today },
  { path: "/find-someone-by-username", lastmod: today },
  { path: "/after-have-i-been-pwned-what-next", lastmod: today },
  { path: "/breach-vs-digital-footprint-risk", lastmod: today },
  { path: "/how-to-monitor-your-online-exposure-after-a-breach", lastmod: today },
  { path: "/best-way-to-monitor-your-online-exposure", lastmod: today },
  { path: "/continuous-exposure-monitoring-explained", lastmod: today },
  { path: "/how-username-reuse-exposes-you-online", lastmod: today },
  { path: "/best-digital-footprint-scanner", lastmod: today },
  { path: "/best-osint-tools", lastmod: today },
  { path: "/best-online-privacy-scanner", lastmod: today },
  { path: "/best-people-lookup-sites", lastmod: today },
  { path: "/best-person-search-engine", lastmod: today },
  { path: "/best-reverse-username-search-tools", lastmod: today },
  { path: "/best-search-engine-for-finding-people", lastmod: today },
  { path: "/search-engines-to-find-people", lastmod: today },
  { path: "/what-can-people-find-about-me", lastmod: today },
  { path: "/is-my-data-exposed", lastmod: today },
  { path: "/old-data-breaches", lastmod: today },
  { path: "/which-data-matters", lastmod: today },
  { path: "/how-identity-theft-starts", lastmod: today },
  { path: "/osint-techniques", lastmod: today },
  { path: "/ethical-osint", lastmod: today },
  { path: "/ethical-osint-principles", lastmod: today },
  { path: "/ethical-osint-for-individuals", lastmod: today },
  { path: "/ethical-osint-charter", lastmod: today },
  { path: "/osint-for-activists-journalists", lastmod: today },
  { path: "/osint-for-investigators", lastmod: today },
];

// ── Research ───────────────────────────────────────────
export const researchRoutes: SitemapEntry[] = [
  { path: "/research", lastmod: today, priority: 0.7 },
  { path: "/research/username-reuse-report-2026", lastmod: today },
  { path: "/research/username-reuse-report-2026-download", lastmod: today },
  { path: "/research/media-kit", lastmod: today },
  { path: "/research/fact-sheet", lastmod: today },
  { path: "/research/username-reuse-statistics", lastmod: today },
];

// ── Datasets / Blog ───────────────────────────────────
export const datasetRoutes: SitemapEntry[] = [
  { path: "/blog", lastmod: today, priority: 0.7 },
  { path: "/blog/ai-in-osint-2025", lastmod: today },
  { path: "/blog/osint-ai-era-2026", lastmod: today },
  { path: "/blog/persona-dna-and-evidence-packs", lastmod: today },
  { path: "/blog/what-is-osint-risk", lastmod: today },
  { path: "/blog/dark-web-monitoring-explained", lastmod: today },
  { path: "/blog/what-is-digital-footprint", lastmod: today },
  { path: "/blog/check-email-breach", lastmod: today },
  { path: "/blog/osint-beginners-guide", lastmod: today },
  { path: "/blog/remove-data-brokers", lastmod: today },
  { path: "/blog/social-media-privacy", lastmod: today },
  { path: "/blog/phone-number-privacy", lastmod: today },
  { path: "/blog/username-security", lastmod: today },
  { path: "/blog/ip-address-security", lastmod: today },
  { path: "/blog/identity-theft-response", lastmod: today },
  { path: "/blog/password-security-guide", lastmod: today },
  { path: "/blog/vpn-privacy-guide", lastmod: today },
  { path: "/blog/two-factor-authentication", lastmod: today },
  { path: "/blog/secure-browsing-guide", lastmod: today },
  { path: "/blog/free-username-search", lastmod: today },
  { path: "/blog/username-reuse", lastmod: today },
  { path: "/blog/what-is-digital-exposure", lastmod: today },
  { path: "/blog/username-search-misleading", lastmod: today },
  { path: "/blog/lens-osint-confidence-wrong", lastmod: today },
  { path: "/blog/lens-introduction", lastmod: today },
  { path: "/blog/lens-confidence-meaning", lastmod: today },
  { path: "/blog/lens-case-study-false-positive", lastmod: today },
  { path: "/blog/dark-web-scans-noise", lastmod: today },
  { path: "/blog/osint-to-insight", lastmod: today },
  { path: "/blog/ethical-osint-exposure", lastmod: today },
  { path: "/blog/what-is-osint", lastmod: today },
  { path: "/blog/how-data-brokers-work", lastmod: today },
  { path: "/blog/how-exposed-am-i-online", lastmod: today },
  { path: "/blog/what-is-username-osint-scan", lastmod: today },
  { path: "/blog/are-username-search-tools-accurate", lastmod: today },
  { path: "/blog/remove-address-from-google", lastmod: today },
  { path: "/blog/remove-from-data-brokers-uk", lastmod: today },
  { path: "/blog/delete-old-accounts", lastmod: today },
  { path: "/blog/what-is-digital-footprint-check", lastmod: today },
  { path: "/blog/digital-exposure-report-2026", lastmod: today },
  { path: "/blog/what-is-ethical-osint-scan", lastmod: today },
  { path: "/blog/exposure-mapping-before-removal", lastmod: today },
  { path: "/blog/public-vs-private-data-osint", lastmod: today },
  { path: "/blog/remove-from-data-brokers-guide", lastmod: today },
  { path: "/blog/is-footprintiq-data-broker", lastmod: today },
];

// ── AI Answers ─────────────────────────────────────────
export const aiAnswerRoutes: SitemapEntry[] = [
  { path: "/ai-answers-hub", lastmod: today, priority: 0.7 },
  { path: "/ai-answers/what-is-a-username-osint-scan", lastmod: today },
  { path: "/ai-answers/why-username-reuse-is-risky", lastmod: today },
  { path: "/ai-answers/are-username-search-tools-accurate", lastmod: today },
  { path: "/ai-answers/is-username-osint-legal", lastmod: today },
  { path: "/ai-answers/ethical-osint-tools", lastmod: today },
  { path: "/ai-answers/common-osint-misconceptions", lastmod: today },
  { path: "/ai-answers/when-not-to-use-osint", lastmod: today },
  { path: "/ai-answers/what-is-an-identity-risk-score", lastmod: today },
  { path: "/ai-answers/does-osint-include-dark-web-data", lastmod: today },
  { path: "/ai-answers/instagram-username-osint", lastmod: today },
  { path: "/ai", lastmod: today },
  { path: "/ai/digital-exposure", lastmod: today },
  { path: "/ai/digital-footprint", lastmod: today },
  { path: "/ai/what-is-osint", lastmod: today },
  { path: "/ai/what-is-identity-profiling", lastmod: today },
  { path: "/ai/what-are-data-brokers", lastmod: today },
];

// ── Static / Marketing pages ───────────────────────────
export const staticRoutes: SitemapEntry[] = [
  { path: "/pricing", lastmod: today, priority: 0.8 },
  { path: "/features", lastmod: today, priority: 0.8 },
  { path: "/enterprise", lastmod: today },
  { path: "/sample-report", lastmod: today },
  { path: "/about-footprintiq", lastmod: today },
  { path: "/press", lastmod: today },
  { path: "/trust", lastmod: today },
  { path: "/trust-safety", lastmod: today },
  { path: "/trust/ai-agents", lastmod: today },
  { path: "/trust/data-ethics", lastmod: today },
  { path: "/data-lifecycle", lastmod: today },
  { path: "/how-we-source-data", lastmod: today },
  { path: "/data-sources", lastmod: today },
  { path: "/responsible-use", lastmod: today },
  { path: "/ethics", lastmod: today },
  { path: "/editorial-ethics-policy", lastmod: today },
  { path: "/privacy-policy", lastmod: today },
  { path: "/terms-of-service", lastmod: today },
  { path: "/legal/dpa", lastmod: today },
  { path: "/support", lastmod: today },
  { path: "/contact", lastmod: today },
  { path: "/help", lastmod: today },
  { path: "/for-individuals", lastmod: today },
  { path: "/for-professionals", lastmod: today },
  { path: "/for-protected-users", lastmod: today },
  { path: "/for/crypto", lastmod: today },
  { path: "/for/job-seekers", lastmod: today },
  { path: "/for/developers", lastmod: today },
  { path: "/for/executives", lastmod: today },
  { path: "/partners", lastmod: today },
  { path: "/global-index", lastmod: today },
  { path: "/developers", lastmod: today },
  { path: "/api", lastmod: today },
  { path: "/integrations", lastmod: today },
  { path: "/marketplace", lastmod: today },
  { path: "/install", lastmod: today },
  { path: "/system-status", lastmod: today },
];

/** Build a single sitemap XML string from entries */
export function buildSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries.map(e => `  <url>
    <loc>${CANONICAL_BASE}${e.path}</loc>
    <lastmod>${e.lastmod}</lastmod>${e.changefreq ? `\n    <changefreq>${e.changefreq}</changefreq>` : ""}${e.priority != null ? `\n    <priority>${e.priority}</priority>` : ""}
  </url>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

/** Build sitemap index XML */
export function buildSitemapIndexXml(): string {
  const sitemaps = [
    "sitemap-tools.xml",
    "sitemap-guides.xml",
    "sitemap-glossary.xml",
    "sitemap-research.xml",
    "sitemap-datasets.xml",
    "sitemap-ai-answers.xml",
    "sitemap-static.xml",
  ];

  const entries = sitemaps.map(s => `  <sitemap>
    <loc>${CANONICAL_BASE}/${s}</loc>
    <lastmod>2026-03-05</lastmod>
  </sitemap>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`;
}
