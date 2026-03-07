import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Discord",
  slug: "search-discord-username",
  profilePattern: "@username (no public URL)",
  metaDesc: "Search Discord usernames to discover cross-platform accounts across 500+ sites. Free Discord username lookup with OSINT intelligence and identity correlation.",
  howItWorks: (
    <>
      <p>Discord uses unique handles in the format <code>@username</code> since the 2023 migration from discriminator tags (the old <code>username#1234</code> format). Unlike most social platforms, Discord does not have publicly accessible profile pages — you cannot visit a URL to view a Discord profile without being logged in and sharing a server or friend connection.</p>
      <p>This architectural choice makes Discord one of the most challenging platforms for external OSINT. There is no public endpoint to query, no profile page to scrape, and no metadata to extract through standard web requests. However, Discord usernames remain extremely valuable as cross-platform search keys because gamers and community members frequently reuse the same handle across Discord, Steam, Twitch, Reddit, and gaming forums.</p>
      <p>FootprintIQ compensates for Discord's closed architecture by checking the same handle across 500+ platforms with publicly accessible profiles. This approach effectively maps the digital footprint that Discord itself doesn't expose — revealing the same identity on platforms where profiles are public and metadata is accessible.</p>
      <p>The system also checks for Discord bot listings, public server directories, and community platforms where Discord handles are voluntarily disclosed by users seeking connections or advertising their gaming communities.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Discord's semi-private nature requires adapted investigation techniques:</p>
      <ul>
        <li><strong>Cross-platform enumeration.</strong> The primary approach for Discord investigation. Search the Discord username across all indexed platforms using FootprintIQ to find publicly accessible profiles using the same handle on Steam, Twitch, Reddit, and gaming forums.</li>
        <li><strong>Public server directories.</strong> Platforms like Disboard, Discord.me, and Top.gg list public servers where member lists may be browsable — providing discovery pathways for specific usernames within community contexts.</li>
        <li><strong>Linked accounts within servers.</strong> Within shared servers, Discord profiles may display linked Steam, Xbox, Spotify, Twitter/X, and YouTube accounts — creating verified cross-platform connections that require no guesswork.</li>
        <li><strong>User ID and snowflake analysis.</strong> Discord's snowflake IDs encode account creation timestamps, providing temporal intelligence about when the identity was established. This creation date can be compared against account creation dates on other platforms.</li>
        <li><strong>Bot and webhook presence.</strong> Discord bots associated with a username may appear in public bot directories with descriptions, support servers, and developer contact information.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/how-to-find-someone-on-discord" className="text-primary hover:underline">guide to finding someone on Discord</Link>.</p>
    </>
  ),
  usernameReuse: (
    <>
      <p>Discord usernames sit at the centre of a unique reuse pattern. Because Discord is the primary communication platform for gaming communities, the username chosen for Discord typically becomes the identity anchor that propagates to Steam, Twitch, Minecraft, Roblox, and every multiplayer game that requires a display name.</p>
      <p>This gaming-centric reuse pattern makes Discord handles exceptionally effective as <Link to="/username-search" className="text-primary hover:underline">username search</Link> keys. A single Discord username can unlock an entire gaming identity ecosystem — revealing playtime habits, streaming activity, competitive rankings, and community participation across dozens of platforms.</p>
      <p>The 2023 migration to unique usernames amplified this effect. Under the old discriminator system, common names like <code>Alex#4521</code> were less useful as search keys. The new unique handle requirement means Discord usernames now function as globally unique identifiers — identical in utility to Twitter handles or Instagram usernames for cross-platform correlation.</p>
      <p>Content creators and streamers present the highest reuse correlation. A streamer's Discord handle almost always matches their Twitch channel name, YouTube handle, and Twitter/X username — creating a verified identity chain that a <Link to="/reverse-username-search" className="text-primary hover:underline">reverse username lookup</Link> can reconstruct in seconds.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Discord investigation requires cross-platform techniques due to the platform's closed architecture:</p>
      <ul>
        <li><strong>Gaming identity correlation.</strong> Discord usernames overlap heavily with Steam, Twitch, Xbox, PlayStation, and competitive gaming handles. FootprintIQ searches all gaming platforms simultaneously, connecting Discord identities to publicly visible gaming profiles.</li>
        <li><strong>Linked account exploitation.</strong> Discord's account linking feature (Steam, Xbox, Spotify, YouTube, Twitter/X) creates verified cross-platform connections visible to anyone in shared servers — these links are investigator-grade identity confirmations.</li>
        <li><strong>Server participation analysis.</strong> The servers someone joins reflect interests, professional affiliations, geographic communities, and ideological leanings. Public server directories reveal which communities are associated with specific interest areas.</li>
        <li><strong>Message history and behaviour analysis.</strong> Within shared servers, message content reveals writing style, timezone indicators, expertise domains, and personal details shared in casual conversation.</li>
        <li><strong>Activity status intelligence.</strong> Discord's rich presence shows current games, Spotify listening activity, and custom status text — providing real-time behavioural data when viewed from a shared server context.</li>
      </ul>
      <p>Explore our <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide for advanced investigation workflows.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>Discord username exposure creates specific risks despite the platform's semi-private design:</p>
      <ul>
        <li><strong>Gaming identity bridge.</strong> A Discord handle shared with Steam or Twitch links your semi-private Discord identity to publicly accessible gaming profiles — collapsing the privacy boundary that Discord's architecture was designed to maintain.</li>
        <li><strong>Linked account leakage.</strong> Connected accounts (Spotify, YouTube, Xbox, etc.) are visible to anyone in shared servers, potentially revealing real names, musical taste, viewing habits, and gaming activity.</li>
        <li><strong>Server membership inference.</strong> Public server directories can reveal community affiliations, interest areas, and ideological associations. A <Link to="/check-my-digital-footprint" className="text-primary hover:underline">digital footprint check</Link> helps identify these exposure points.</li>
        <li><strong>Social engineering vector.</strong> Known Discord handles enable targeted contact via friend requests or shared server infiltration — creating a direct communication channel that bypasses email and phone number privacy.</li>
        <li><strong>Historical username exposure.</strong> Previous Discord usernames (from before the 2023 migration) may still be indexed in server logs, bot databases, and archived conversations.</li>
      </ul>
      <p>To reduce exposure: use a unique Discord handle, review and remove unnecessary linked accounts, audit server memberships regularly, and restrict who can send you friend requests.</p>
    </>
  ),
  faqs: [
    { q: "Can you find someone on Discord by username?", a: "Discord doesn't have public profile URLs, but FootprintIQ checks the same username across 500+ platforms with public profiles, revealing connected accounts that share the Discord handle." },
    { q: "Is Discord username search free?", a: "Yes. FootprintIQ's free tier checks Discord handles across 500+ platforms. No account required." },
    { q: "Can you see a Discord profile without being friends?", a: "Limited profile information is visible in shared servers, including linked accounts and activity status. Full profiles require mutual server membership or friend status." },
    { q: "How do Discord usernames work now?", a: "Since 2023, Discord uses globally unique @username handles instead of the old username#1234 format. These unique handles function as effective cross-platform search keys." },
    { q: "Can OSINT investigators track Discord accounts?", a: "Not directly through Discord's closed platform. However, cross-platform username correlation, linked account analysis, and public server directories provide substantial investigative pathways." },
    { q: "Do Discord linked accounts reveal your identity?", a: "Yes. Linked Steam, Xbox, Spotify, and YouTube accounts are visible in shared servers and can reveal real names, interests, and activity patterns that connect to your broader identity." },
    { q: "Can someone find my real name from my Discord username?", a: "If your Discord handle matches accounts on platforms where you use your real name, cross-platform correlation can connect the two. Using unique handles per platform prevents this." },
    { q: "How can I protect my Discord privacy?", a: "Use a unique handle, remove unnecessary linked accounts, audit server memberships, restrict friend requests, and disable rich presence to prevent activity tracking." },
  ],
};

export default function SearchDiscordUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
