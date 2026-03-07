import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Steam",
  slug: "search-steam-username",
  profilePattern: "steamcommunity.com/id/username",
  metaDesc: "Search Steam usernames to find gaming profiles, game libraries, and discover linked accounts across 500+ platforms. Free Steam username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>Steam profiles are publicly accessible at <code>steamcommunity.com/id/username</code> for custom URLs, or via numeric Steam IDs at <code>steamcommunity.com/profiles/[steamid]</code>. OSINT tools query both endpoints and analyse the HTTP response to confirm whether a profile exists and what privacy level is configured — public, friends-only, or private.</p>
      <p>A public Steam profile reveals the display name, avatar, profile summary, real name (if set), location (if set), game library with individual playtime statistics, achievement progress, friends list, group memberships, inventory items, screenshots, workshop contributions, and community activity. Steam's gaming-centric data provides unique behavioural signals — play schedules reveal timezone, game preferences reveal interests and spending patterns, and friend networks map social connections within the gaming ecosystem.</p>
      <p>FootprintIQ extends this by simultaneously checking the same handle across 500+ other platforms, revealing whether the Steam identity connects to accounts on Discord, Twitch, Reddit, GitHub, and hundreds of other communities. Gaming usernames exhibit some of the highest cross-platform reuse rates of any user demographic.</p>
      <p>The system also analyses Steam-specific metadata that other platforms lack: previous display names (Steam retains historical name changes), Steam level, years of service badge, and VAC ban status — each providing unique investigative data points.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Investigators use several approaches to locate and verify Steam profiles:</p>
      <ul>
        <li><strong>Direct URL check.</strong> Navigate to <code>steamcommunity.com/id/username</code> to check for a custom URL profile. FootprintIQ automates this programmatically alongside 500+ other platforms.</li>
        <li><strong>Steam community search.</strong> Steam's built-in search queries display names and custom URLs. Multiple results may appear for common names, but custom URL uniqueness confirms specific accounts.</li>
        <li><strong>Cross-platform gaming pivot.</strong> Gaming usernames frequently match across Steam, Discord, Twitch, Xbox Live, and competitive gaming platforms. A <Link to="/reverse-username-search" className="text-primary hover:underline">reverse username lookup</Link> identifies these connections automatically.</li>
        <li><strong>Third-party indexing services.</strong> Services like SteamDB, SteamID.uk, and SteamRep index Steam profiles and provide historical data including previous display names, ban history, and trading reputation.</li>
        <li><strong>Workshop and review discovery.</strong> Steam Workshop contributions and game reviews are indexed by search engines, providing alternative discovery pathways when direct username searches are inconclusive.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/find-someone-by-username" className="text-primary hover:underline">guide to finding someone by username</Link>.</p>
    </>
  ),
  usernameReuse: (
    <>
      <p>Steam custom URLs represent the anchor of the gaming identity ecosystem. Gamers who choose a custom Steam URL typically carry the same handle to Discord, Twitch, Reddit, and every multiplayer game that supports custom display names — creating one of the most consistent username reuse patterns across any user demographic.</p>
      <p>This pattern makes Steam handles exceptionally productive as <Link to="/username-search" className="text-primary hover:underline">username search</Link> starting points. A single Steam custom URL frequently maps to 10-20 connected accounts across gaming, streaming, social media, and community platforms.</p>
      <p>Competitive gaming amplifies reuse. Players in competitive scenes (CS2, Valorant, League of Legends, Dota 2) use the same handle on Steam, in-game, on tournament platforms, on team websites, and in community forums — creating a verified identity chain that spans the entire competitive ecosystem.</p>
      <p>Steam's historical display name feature adds a unique dimension. Even if a user changes their current display name, previous names remain visible — potentially revealing real names, alternative handles, and older identity markers that connect to accounts on other platforms. A <Link to="/check-my-digital-footprint" className="text-primary hover:underline">digital footprint check</Link> reveals how these historical names correlate across your digital presence.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Steam usernames are valuable OSINT pivot points for gaming-focused investigations:</p>
      <ul>
        <li><strong>Username enumeration.</strong> Gaming handles are frequently reused across Discord, Twitch, Reddit, and forum communities — providing cross-platform correlation that connects semi-anonymous gaming activity to identifiable profiles elsewhere.</li>
        <li><strong>Behavioural analysis.</strong> Playtime statistics, achievement timestamps, and game session patterns reveal timezone, daily schedule, sleep patterns, and leisure habits with remarkable precision.</li>
        <li><strong>Network mapping.</strong> Public friends lists and group memberships map social connections within the gaming community. Friend network overlaps with known individuals can confirm identity.</li>
        <li><strong>Historical username intelligence.</strong> Steam retains previous display names, which may reveal real names, alternative handles, geographic indicators, or clan/team affiliations from earlier periods.</li>
        <li><strong>Workshop, review, and discussion activity.</strong> Published mods, game reviews, and discussion forum posts provide writing samples, opinion data, and technical skill indicators.</li>
        <li><strong>Spending pattern analysis.</strong> Game library size, inventory value, and DLC purchases indicate gaming spending patterns and disposable income levels.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide for advanced workflows.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>Steam username exposure creates specific privacy risks within the gaming ecosystem:</p>
      <ul>
        <li><strong>Cross-platform identity linking.</strong> Reusing your Steam handle on Discord, Twitch, or forums allows anyone to connect your gaming identity to social media, professional, and personal accounts through a single search.</li>
        <li><strong>Activity and schedule profiling.</strong> Public playtime data reveals daily schedules, sleep patterns, work hours, and availability — information exploitable for social engineering or physical security assessment.</li>
        <li><strong>Historical name exposure.</strong> Previous display names — including real names used temporarily, clan tags, or alternative handles — remain visible on public profiles indefinitely.</li>
        <li><strong>Network and relationship exposure.</strong> Public friends lists reveal social connections and can be cross-referenced with other platforms to map real-world relationships.</li>
        <li><strong>Financial indicator leakage.</strong> Game library size, inventory items (particularly in games with trading economies), and account level indicate spending patterns and account value.</li>
      </ul>
      <p>To reduce exposure: set your profile to friends-only, use a unique custom URL, clear your display name history, review friends list visibility, and audit group memberships.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Steam by username?", a: "Yes. Steam profiles with custom URLs are accessible at steamcommunity.com/id/username. FootprintIQ checks this endpoint programmatically alongside 500+ other platforms." },
    { q: "Is Steam username search free?", a: "Yes. FootprintIQ's free tier includes Steam along with 500+ other platforms. No account required for basic scans." },
    { q: "What does a Steam profile reveal?", a: "A public Steam profile shows display name, avatar, game library, playtime stats, friends list, group memberships, previous display names, and community activity including reviews and workshop contributions." },
    { q: "Can you see someone's Steam play history?", a: "If their profile and game details are set to public, yes. Play hours, recent activity, achievement timestamps, and game session patterns are all visible." },
    { q: "How do investigators track Steam accounts?", a: "Investigators analyse playtime patterns for timezone intelligence, review historical display names, map friend networks, and correlate the custom URL across gaming and social platforms." },
    { q: "Can Steam show previous usernames?", a: "Yes. Steam retains and publicly displays previous display names on profile pages. These historical names may reveal real names, alternative handles, or clan affiliations." },
    { q: "Does Steam show who viewed your profile?", a: "No. Steam does not notify users when someone views their profile. OSINT analysis of public Steam profiles is entirely passive." },
    { q: "How can I protect my Steam privacy?", a: "Set your profile to friends-only or private, use a unique custom URL, clear display name history, restrict friends list visibility, and audit group memberships." },
  ],
};

export default function SearchSteamUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
