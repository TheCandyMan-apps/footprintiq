/**
 * Blog post hero images - generated with AI
 */

export const blogHeroImages: Record<string, string> = {
  "lens-case-study-false-positive": "/blog-images/lens-case-study.webp",
  "lens-osint-confidence-wrong": "/blog-images/lens-confidence.webp",
  "lens-introduction": "/blog-images/lens-intro.webp",
  "lens-confidence-meaning": "/blog-images/lens-meaning.webp",
  "osint-ai-era-2026": "/blog-images/osint-ai-era-2026.webp",
  "what-is-digital-footprint": "/blog-images/digital-footprint.webp",
  "remove-data-brokers": "/blog-images/data-brokers.webp",
  "check-email-breach": "/blog-images/email-breach.webp",
  "dark-web-monitoring": "/blog-images/dark-web.webp",
  "osint-beginners-guide": "/blog-images/osint.webp",
  "social-media-privacy": "/blog-images/social-privacy.webp",
  "phone-number-privacy": "/blog-images/phone-privacy.webp",
  "username-security": "/blog-images/username-security.webp",
  "ip-address-security": "/blog-images/ip-security.webp",
  "identity-theft-response": "/blog-images/identity-theft.webp",
  "password-security-guide": "/blog-images/password-security.webp",
  "vpn-privacy-guide": "/blog-images/vpn-guide.webp",
  "two-factor-authentication": "/blog-images/2fa.webp",
  "secure-browsing-guide": "/blog-images/secure-browsing.webp",
};

export const getBlogHeroImage = (slug: string): string | undefined => {
  return blogHeroImages[slug];
};
