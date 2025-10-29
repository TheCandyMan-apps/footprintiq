/**
 * Blog post hero images - generated with AI
 */

export const blogHeroImages: Record<string, string> = {
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
};

export const getBlogHeroImage = (slug: string): string | undefined => {
  return blogHeroImages[slug];
};
