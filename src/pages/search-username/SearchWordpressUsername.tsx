import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "WordPress",
  slug: "search-wordpress-username",
  profilePattern: "profiles.wordpress.org/username",
  metaDesc: "Search WordPress usernames to find contributor profiles and discover linked accounts across 500+ platforms. Free WordPress username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>WordPress.org contributor profiles are publicly accessible at <code>profiles.wordpress.org/username</code>. WordPress.com blogs follow the pattern <code>username.wordpress.com</code>. OSINT tools query these endpoints to confirm whether a profile or blog exists.</p>
      <p>A confirmed WordPress.org profile reveals the display name, bio, Gravatar image, plugins and themes authored, support forum activity, and contribution badges. WordPress.com blogs reveal the blog title, content, author name, and writing history. As the world's most popular CMS, WordPress usernames are extremely common and span developers, writers, and site administrators.</p>
      <p>FootprintIQ extends this by checking the same handle across 500+ platforms, revealing connections to GitHub, Gravatar, and other developer and blogging communities.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Approaches for locating WordPress profiles:</p>
      <ul>
        <li><strong>WordPress.org profile.</strong> Navigate to <code>profiles.wordpress.org/username</code>. FootprintIQ automates this.</li>
        <li><strong>WordPress.com blog.</strong> Check <code>username.wordpress.com</code> for hosted blogs.</li>
        <li><strong>Gravatar correlation.</strong> WordPress accounts share Gravatar images, which can be cross-referenced via email hash.</li>
        <li><strong>Plugin and theme search.</strong> WordPress.org plugin/theme directories list author profiles.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/find-someone-by-username" className="text-primary hover:underline">guide to finding someone by username</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>WordPress profiles provide developer and publishing OSINT value:</p>
      <ul>
        <li><strong>Developer intelligence.</strong> WordPress.org plugin/theme authorship reveals technical skills and open-source contributions.</li>
        <li><strong>Gravatar linkage.</strong> Gravatar images are shared across WordPress, GitHub, and any service using Gravatar — providing cross-platform profile photo correlation.</li>
        <li><strong>Support forum activity.</strong> Forum posts reveal technical expertise, problem-solving approach, and project involvement.</li>
        <li><strong>Blog content analysis.</strong> WordPress.com blog posts reveal opinions, expertise, and personal information.</li>
        <li><strong>Contribution history.</strong> WordPress.org badges and contribution logs map community involvement over time.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>WordPress username exposure creates privacy risks:</p>
      <ul>
        <li><strong>Gravatar cross-referencing.</strong> Gravatar images linked to email addresses appear across multiple platforms.</li>
        <li><strong>Blog content permanence.</strong> WordPress.com blog posts are indexed by search engines and persist indefinitely.</li>
        <li><strong>Developer identity linking.</strong> Plugin/theme authorship on WordPress.org connects to GitHub and professional identity.</li>
        <li><strong>Support forum disclosures.</strong> Technical support posts may reveal project details, infrastructure information, or employer connections.</li>
      </ul>
      <p>To reduce exposure: use a unique handle, review Gravatar settings, audit blog content, and consider whether plugin authorship should be pseudonymous.</p>
    </>
  ),
  faqs: [
    { q: "Can you search WordPress by username?", a: "Yes. WordPress.org profiles are accessible at profiles.wordpress.org/username. FootprintIQ checks this alongside 500+ platforms." },
    { q: "Is WordPress username search free?", a: "Yes. FootprintIQ's free tier includes WordPress along with 500+ other platforms." },
    { q: "What does a WordPress profile reveal?", a: "A WordPress.org profile shows display name, bio, Gravatar, authored plugins/themes, support forum activity, and contribution badges." },
    { q: "What is Gravatar and why does it matter?", a: "Gravatar is a global avatar service linked to email addresses. The same image appears on WordPress, GitHub, and any Gravatar-enabled service — enabling cross-platform profile photo correlation." },
  ],
};

export default function SearchWordpressUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
