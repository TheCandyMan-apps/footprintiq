import { Link } from "react-router-dom";
import { SearchByUsernameTemplate, type SearchByUsernamePlatformConfig } from "@/components/templates/SearchByUsernameTemplate";

const config: SearchByUsernamePlatformConfig = {
  platform: "Telegram",
  slug: "search-telegram-by-username",
  urlPattern: "t.me/username",
  titleSuffix: "Find Telegram Users",
  metaDesc: "Search Telegram by username to find profiles and discover linked accounts across 500+ platforms. Free Telegram username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>Telegram usernames are searchable via <code>t.me/username</code> for public profiles and channels. When you search Telegram by username, OSINT tools query this URL to determine whether a public profile, group, or channel exists under that handle.</p>
      <p>Telegram occupies a unique position in the OSINT landscape. While designed for privacy — with features like end-to-end encrypted chats and self-destructing messages — its public channels, groups, and bot ecosystem create significant points of discoverability. Public channel ownership, group administration, and bot listings can all expose Telegram usernames.</p>
      <p>FootprintIQ checks the Telegram username and simultaneously scans 500+ other platforms, revealing whether the Telegram identity connects to more publicly visible accounts on social media, forums, and developer communities.</p>
    </>
  ),
  canYouFind: (
    <>
      <p>Partially. Telegram offers more privacy than most social platforms, but public profiles and channels are discoverable. If someone has set a public username, their profile is accessible at <code>t.me/username</code>.</p>
      <ol>
        <li><strong>Enter the Telegram handle.</strong> FootprintIQ checks Telegram and 500+ other platforms simultaneously.</li>
        <li><strong>Review public presence.</strong> Public channels and groups owned or administered by the user may be discoverable.</li>
        <li><strong>Cross-reference with other platforms.</strong> The same handle on Twitter/X, Reddit, or GitHub connects the Telegram identity to publicly attributable profiles.</li>
        <li><strong>Check bot directories.</strong> Telegram bot developers often list their username alongside their projects on GitHub and bot catalogue sites.</li>
      </ol>
      <p>For deeper investigation techniques, see our <Link to="/guides/telegram-osint-search" className="text-primary hover:underline">Telegram OSINT search guide</Link>.</p>
    </>
  ),
  osintTechniques: (
    <>
      <p>Telegram's privacy-focused architecture requires adapted OSINT techniques:</p>
      <ul>
        <li><strong>Cross-platform pivoting.</strong> Using the Telegram handle as a search term across all publicly indexable platforms.</li>
        <li><strong>Public channel analysis.</strong> Identifying channels and groups owned or administered by the username for content and membership analysis.</li>
        <li><strong>Bot ecosystem research.</strong> Searching Telegram bot directories and GitHub repositories for projects linked to the username.</li>
        <li><strong>Forum and community correlation.</strong> Checking cryptocurrency forums, tech communities, and niche platforms where Telegram usernames are frequently shared.</li>
        <li><strong>Bio cross-referencing.</strong> Searching for the Telegram handle in the bios and descriptions of profiles on Twitter/X, Reddit, and LinkedIn.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques for username investigation</Link> guide.</p>
    </>
  ),
  privacyTips: (
    <>
      <p>To reduce your Telegram-related digital exposure:</p>
      <ul>
        <li><strong>Use a unique Telegram handle.</strong> Don't reuse it on public platforms where your real identity is visible.</li>
        <li><strong>Review your public username setting.</strong> Telegram usernames are optional — you can remove yours entirely to reduce discoverability.</li>
        <li><strong>Audit group and channel membership.</strong> Public groups and channels you've joined or administer may expose your username to a wide audience.</li>
        <li><strong>Disable phone number visibility.</strong> Ensure your phone number is hidden in Telegram's privacy settings to prevent reverse lookups.</li>
        <li><strong>Don't share your Telegram handle publicly.</strong> Avoid listing it in social media bios, forum signatures, or public profiles.</li>
      </ul>
      <p>Run a <Link to="/digital-footprint-checker" className="text-primary hover:underline">digital footprint check</Link> to see your complete online exposure.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Telegram by username?", a: "Yes. Public Telegram profiles are accessible at t.me/username. FootprintIQ also checks the same handle across 500+ other platforms for cross-platform correlation." },
    { q: "Is Telegram username search free?", a: "Yes. FootprintIQ's free tier includes Telegram along with 500+ other platforms. No account required." },
    { q: "Are Telegram profiles public?", a: "Only if the user has set a public username. Without a username, Telegram profiles are not discoverable through URL-based searches." },
    { q: "Can you find someone's phone number from their Telegram username?", a: "No. FootprintIQ only accesses publicly available information. Phone numbers are protected by Telegram's privacy settings and are not accessible through username lookups." },
    { q: "Is searching for a Telegram username legal?", a: "Yes. Querying publicly accessible t.me URLs is legal. FootprintIQ never accesses private chats, groups, or protected content." },
  ],
};

export default function SearchTelegramByUsername() {
  return <SearchByUsernameTemplate config={config} />;
}
