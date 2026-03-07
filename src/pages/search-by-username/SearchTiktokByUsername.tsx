import { Link } from "react-router-dom";
import { SearchByUsernameTemplate, type SearchByUsernamePlatformConfig } from "@/components/templates/SearchByUsernameTemplate";

const config: SearchByUsernamePlatformConfig = {
  platform: "TikTok",
  slug: "search-tiktok-by-username",
  urlPattern: "tiktok.com/@username",
  titleSuffix: "Find TikTok Profiles",
  metaDesc: "Search TikTok by username to find profiles and discover linked accounts across 500+ platforms. Free TikTok username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>TikTok profiles follow the URL pattern <code>tiktok.com/@username</code>. When you search TikTok by username, OSINT tools query this endpoint and analyse the HTTP response to confirm whether the profile exists and is publicly accessible.</p>
      <p>Public TikTok profiles display the username, display name, bio, follower and following counts, total likes received, and all public video content. With over a billion active users, TikTok represents one of the most data-rich platforms for digital footprint analysis — particularly among younger demographics.</p>
      <p>FootprintIQ extends the TikTok lookup by simultaneously checking the same handle across 500+ other platforms, revealing whether the TikTok identity connects to accounts on Instagram, Snapchat, Discord, Twitter/X, and hundreds of niche communities.</p>
    </>
  ),
  canYouFind: (
    <>
      <p>Yes. TikTok profiles are publicly accessible by default. Unless the user has enabled a private account setting, their profile information and videos are visible to anyone — even without a TikTok account.</p>
      <p>To find someone on TikTok by username:</p>
      <ol>
        <li><strong>Enter the TikTok handle.</strong> FootprintIQ checks TikTok and 500+ additional platforms, returning confidence-scored results.</li>
        <li><strong>Review the match.</strong> If the profile exists, FootprintIQ confirms its availability and identifies publicly visible metadata.</li>
        <li><strong>Analyse cross-platform results.</strong> The same handle on Instagram, Discord, or Twitch provides additional context about the user's digital identity.</li>
        <li><strong>Check handle variants.</strong> TikTok allows periods and underscores — search variations to capture the full footprint.</li>
      </ol>
      <p>For deeper methodology, see our <Link to="/reverse-username-search" className="text-primary hover:underline">reverse username search</Link> guide.</p>
    </>
  ),
  osintTechniques: (
    <>
      <p>When investigating TikTok usernames, professionals combine automated scanning with targeted analysis:</p>
      <ul>
        <li><strong>Username pivoting.</strong> Using the TikTok handle as a starting point to enumerate accounts across all indexed platforms.</li>
        <li><strong>Content metadata analysis.</strong> Examining posting times, audio selections, and any geolocation tags for intelligence value.</li>
        <li><strong>Engagement pattern analysis.</strong> Reviewing public comments, duets, and stitch interactions to map social connections.</li>
        <li><strong>Cross-platform correlation.</strong> Comparing profile photos, bios, and linked URLs across matched platforms to verify identity linkage.</li>
        <li><strong>Linked account detection.</strong> TikTok allows users to link Instagram and YouTube accounts — these connections are publicly visible on the profile.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide.</p>
    </>
  ),
  privacyTips: (
    <>
      <p>To reduce your TikTok-related digital exposure:</p>
      <ul>
        <li><strong>Use a unique handle.</strong> Don't reuse your TikTok username on other platforms — this prevents cross-platform identity correlation.</li>
        <li><strong>Set your account to private.</strong> Private TikTok accounts restrict video visibility to approved followers only.</li>
        <li><strong>Disable discoverability.</strong> Turn off "Suggest your account to others" and contact syncing in TikTok's privacy settings.</li>
        <li><strong>Unlink social accounts.</strong> Review and disconnect Instagram and YouTube accounts linked to your TikTok profile.</li>
        <li><strong>Disable location services.</strong> Prevent geographic metadata from being embedded in your content.</li>
      </ul>
      <p>Run a <Link to="/digital-footprint-checker" className="text-primary hover:underline">digital footprint check</Link> to see everything publicly visible about your identity.</p>
    </>
  ),
  faqs: [
    { q: "Can you search TikTok by username without the app?", a: "Yes. TikTok profiles are accessible via web browser at tiktok.com/@username. FootprintIQ performs this lookup programmatically without requiring the TikTok app." },
    { q: "Is TikTok username search free?", a: "Yes. FootprintIQ's free tier includes TikTok along with 500+ other platforms. No account required for basic scans." },
    { q: "What does a TikTok username reveal?", a: "A public TikTok profile shows display name, bio, follower/following counts, total likes, and public videos. Cross-referenced with other platforms, the same username can reveal a much broader digital identity." },
    { q: "Can you find a private TikTok account by username?", a: "You can confirm the account exists, but private account content is not publicly accessible. FootprintIQ only queries publicly available data." },
    { q: "Is searching for a TikTok username legal?", a: "Yes. Querying publicly accessible profile URLs is legal. FootprintIQ never bypasses authentication or accesses private content." },
  ],
};

export default function SearchTiktokByUsername() {
  return <SearchByUsernameTemplate config={config} />;
}
