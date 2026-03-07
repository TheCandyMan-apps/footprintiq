import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "OnlyFans",
  slug: "search-onlyfans-username",
  profilePattern: "onlyfans.com/username",
  metaDesc: "Search OnlyFans usernames to find profiles and discover linked accounts across 500+ platforms. Free OnlyFans username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>OnlyFans profiles follow the pattern <code>onlyfans.com/username</code>. OSINT tools query this URL to determine whether a profile exists and whether it is publicly listed. OnlyFans profiles display limited public information — typically a display name, bio, profile photo, banner image, and subscription price.</p>
      <p>Unlike most social platforms, OnlyFans content is behind a paywall. However, the existence of a profile, the username, and public bio text are discoverable without authentication. Many creators link their OnlyFans to promotional accounts on Twitter/X, Instagram, Reddit, and Linktree — creating cross-platform identity chains.</p>
      <p>FootprintIQ checks OnlyFans as part of its standard multi-platform scan, confirming profile existence alongside 500+ other platforms. This is particularly useful for self-audit investigations where users want to understand the full scope of their discoverable online presence.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Approaches for locating OnlyFans profiles from a username:</p>
      <ul>
        <li><strong>Direct URL check.</strong> Navigate to <code>onlyfans.com/username</code>. FootprintIQ automates this lookup programmatically.</li>
        <li><strong>Cross-platform pivot.</strong> OnlyFans creators heavily promote on Twitter/X, Reddit, and Instagram. Discovering the same handle on these platforms provides strong correlation evidence.</li>
        <li><strong>Link aggregator search.</strong> Many creators use Linktree, Beacons, or similar services that list their OnlyFans alongside other accounts.</li>
        <li><strong>Google search.</strong> Searching <code>site:onlyfans.com "username"</code> may surface indexed profile pages.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/find-someone-by-username" className="text-primary hover:underline">guide to finding someone by username</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>OnlyFans usernames are relevant in several OSINT contexts:</p>
      <ul>
        <li><strong>Cross-platform correlation.</strong> The same handle on OnlyFans and social media platforms confirms identity linkage.</li>
        <li><strong>Promotional network mapping.</strong> Creators maintain promotional accounts across multiple platforms, creating a discoverable network.</li>
        <li><strong>Bio and link analysis.</strong> OnlyFans bios and linked accounts provide additional identity pivot points.</li>
        <li><strong>Self-audit importance.</strong> Individuals conducting privacy audits may want to verify whether an OnlyFans profile exists under their known usernames.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide for advanced workflows.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>OnlyFans username exposure creates significant privacy risks:</p>
      <ul>
        <li><strong>Sensitive identity linking.</strong> A shared username connecting OnlyFans to mainstream social media directly links content creation to personal identity.</li>
        <li><strong>Promotional trail.</strong> Cross-platform promotion creates a permanent, searchable connection between accounts.</li>
        <li><strong>Professional risk.</strong> Discovery of an OnlyFans profile through username correlation can have professional and personal consequences.</li>
        <li><strong>Impersonation risk.</strong> Public profile photos and bio information can be used to create fake accounts.</li>
      </ul>
      <p>To reduce exposure: use a completely unique handle, avoid cross-promoting from personal accounts, and use separate email addresses for registration.</p>
    </>
  ),
  faqs: [
    { q: "Can you search OnlyFans by username?", a: "Yes. OnlyFans profiles are accessible at onlyfans.com/username. FootprintIQ checks this endpoint programmatically alongside 500+ other platforms." },
    { q: "Is OnlyFans username search free?", a: "Yes. FootprintIQ's free tier includes OnlyFans profile detection along with 500+ other platforms." },
    { q: "What does an OnlyFans profile reveal publicly?", a: "Public OnlyFans profile information includes display name, bio, profile photo, banner image, and subscription price. Content is behind a paywall." },
    { q: "Can someone find my OnlyFans from my Instagram username?", a: "If you use the same username on both platforms, yes. FootprintIQ's cross-platform scan would identify both accounts. Using unique handles prevents this." },
  ],
};

export default function SearchOnlyfansUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
