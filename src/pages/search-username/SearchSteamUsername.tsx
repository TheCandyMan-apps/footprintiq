import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Steam",
  slug: "search-steam-username",
  profilePattern: "steamcommunity.com/id/username",
  metaDesc: "Search Steam usernames to find gaming profiles and discover linked accounts across 500+ platforms. Free Steam username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>Steam profiles are publicly accessible at <code>steamcommunity.com/id/username</code> for custom URLs, or via numeric Steam IDs. OSINT tools query these endpoints and analyse the HTTP response to confirm whether a profile exists and what privacy level is set.</p>
      <p>A public Steam profile reveals the display name, avatar, profile summary, game library, playtime statistics, achievement progress, friends list, group memberships, and community activity. Steam's gaming-centric data provides unique behavioural signals — play schedules reveal timezone, game preferences reveal interests, and friend networks map social connections.</p>
      <p>FootprintIQ extends this by simultaneously checking the same handle across 500+ other platforms, revealing whether the Steam identity connects to accounts on Discord, Twitch, Reddit, GitHub, and hundreds of other communities.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Several approaches help locate Steam profiles when you have a username:</p>
      <ul>
        <li><strong>Direct URL check.</strong> Navigate to <code>steamcommunity.com/id/username</code> to check for a custom URL profile. FootprintIQ automates this programmatically.</li>
        <li><strong>Steam community search.</strong> Steam's built-in search queries display names and custom URLs. Multiple results may appear for common names.</li>
        <li><strong>Cross-platform pivot.</strong> Gaming usernames frequently match across Steam, Discord, Twitch, and Xbox Live. FootprintIQ's multi-platform search identifies these connections automatically.</li>
        <li><strong>Third-party databases.</strong> Services like SteamDB and SteamID.uk index Steam profiles and provide historical username data, including previous display names.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/find-someone-by-username" className="text-primary hover:underline">guide to finding someone by username</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Steam usernames are valuable OSINT pivot points for gaming-focused investigations:</p>
      <ul>
        <li><strong>Username enumeration.</strong> Gaming handles are frequently reused across Discord, Twitch, Reddit, and forum communities — providing cross-platform correlation.</li>
        <li><strong>Behavioural analysis.</strong> Playtime statistics, achievement timestamps, and game session patterns reveal timezone, daily schedule, and leisure habits.</li>
        <li><strong>Network mapping.</strong> Public friends lists and group memberships map social connections within the gaming community.</li>
        <li><strong>Historical usernames.</strong> Steam retains previous display names, which may reveal real names, alternative handles, or geographic indicators.</li>
        <li><strong>Workshop and review activity.</strong> Published mods, game reviews, and discussion posts provide additional personality and interest data.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide for advanced workflows.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>Steam username exposure creates specific privacy risks:</p>
      <ul>
        <li><strong>Cross-platform identity linking.</strong> Reusing your Steam handle on Discord, Twitch, or forums allows anyone to connect your gaming identity to other accounts.</li>
        <li><strong>Activity profiling.</strong> Public playtime data reveals daily schedules, sleep patterns, and availability — useful for social engineering.</li>
        <li><strong>Historical name exposure.</strong> Previous display names (including real names used temporarily) remain visible on public profiles.</li>
        <li><strong>Network exposure.</strong> Public friends lists reveal social connections and can be used to map real-world relationships.</li>
      </ul>
      <p>To reduce exposure: set your profile to friends-only, use a unique handle, clear your display name history, and review friends list visibility.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Steam by username?", a: "Yes. Steam profiles with custom URLs are accessible at steamcommunity.com/id/username. FootprintIQ checks this endpoint programmatically alongside 500+ other platforms." },
    { q: "Is Steam username search free?", a: "Yes. FootprintIQ's free tier includes Steam along with 500+ other platforms. No account required for basic scans." },
    { q: "What does a Steam profile reveal?", a: "A public Steam profile shows display name, avatar, game library, playtime stats, friends list, group memberships, and community activity. Previous display names are also visible." },
    { q: "Can you see someone's Steam play history?", a: "If their profile and game details are set to public, yes. Play hours, recent activity, and achievement timestamps are all visible. FootprintIQ only accesses publicly available data." },
  ],
};

export default function SearchSteamUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
