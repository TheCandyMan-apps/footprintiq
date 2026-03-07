import { Link } from "react-router-dom";
import { SearchByUsernameTemplate, type SearchByUsernamePlatformConfig } from "@/components/templates/SearchByUsernameTemplate";

const config: SearchByUsernamePlatformConfig = {
  platform: "Discord",
  slug: "search-discord-by-username",
  urlPattern: "N/A (closed platform)",
  titleSuffix: "Find Discord Users",
  metaDesc: "Search Discord by username across 500+ platforms. Discover linked accounts and cross-platform exposure with FootprintIQ's free OSINT scanner.",
  howItWorks: (
    <>
      <p>Discord operates differently from most social platforms. Unlike Instagram or Reddit, Discord does not provide publicly accessible profile URLs that can be queried directly. Profiles are visible only to users who share a server or have a mutual connection.</p>
      <p>This makes Discord username searching an indirect process. OSINT tools like FootprintIQ approach Discord usernames by checking whether the same handle appears on platforms that <em>are</em> publicly indexable — social media, forums, gaming networks, and developer communities. Users who maintain the same handle across Discord and public platforms create a traceable link between their semi-private Discord activity and their public online presence.</p>
      <p>Additionally, many users voluntarily share their Discord username in their Twitter/X bio, Reddit profile, Linktree, or gaming platform accounts. FootprintIQ's cross-platform scan identifies these public disclosures, providing evidence of Discord presence without directly querying Discord's closed API.</p>
    </>
  ),
  canYouFind: (
    <>
      <p>Not directly through Discord's interface — but indirectly through cross-platform correlation. Because Discord profiles are not publicly indexed, finding someone requires leveraging the username's presence elsewhere.</p>
      <ol>
        <li><strong>Search the Discord handle across platforms.</strong> Enter the username into FootprintIQ. If the same handle exists on Twitter/X, GitHub, Steam, or other platforms, the tool identifies the matches.</li>
        <li><strong>Check gaming platforms.</strong> Discord is heavily used by gamers. The same username frequently appears on Steam, Xbox, PlayStation Network, and game-specific communities.</li>
        <li><strong>Look for public bot listings.</strong> If the user operates Discord bots, bot listing sites may display their username and linked server information.</li>
        <li><strong>Review developer profiles.</strong> Discord developers often share their username on GitHub or Stack Overflow alongside their projects.</li>
      </ol>
      <p>For more advanced techniques, explore our <Link to="/reverse-username-search" className="text-primary hover:underline">reverse username search</Link> guide.</p>
    </>
  ),
  osintTechniques: (
    <>
      <p>Investigating Discord usernames requires adapted techniques due to the platform's closed architecture:</p>
      <ul>
        <li><strong>Cross-platform pivoting.</strong> Using the Discord handle as a search term across all public platforms to find correlated accounts.</li>
        <li><strong>Bio scraping.</strong> Searching for the Discord username in bios and descriptions of public profiles on Twitter/X, Instagram, Reddit, and Linktree.</li>
        <li><strong>Gaming platform correlation.</strong> Checking Steam, Epic Games, Riot Games, and other gaming platforms where Discord integration is common.</li>
        <li><strong>Server listing analysis.</strong> Public Discord server listing sites may expose usernames of server owners and administrators.</li>
        <li><strong>Developer ecosystem search.</strong> Checking GitHub, npm, and developer forums for Discord bot projects that reference the username.</li>
      </ul>
      <p>Learn more about <Link to="/username-osint-techniques" className="text-primary hover:underline">username OSINT techniques</Link>.</p>
    </>
  ),
  privacyTips: (
    <>
      <p>Discord's semi-private architecture provides inherent privacy, but username reuse can undermine it:</p>
      <ul>
        <li><strong>Use a unique Discord handle.</strong> Don't reuse it on public platforms — this is the most effective measure against cross-platform linking.</li>
        <li><strong>Don't share your Discord tag publicly.</strong> Avoid listing it in social media bios, forum signatures, or public profiles.</li>
        <li><strong>Review server membership.</strong> Large public servers expose your username to thousands of users. Leave servers you no longer actively use.</li>
        <li><strong>Manage connected accounts.</strong> Discord allows linking Spotify, Steam, GitHub, and other services. Disconnect those you don't want publicly associated.</li>
        <li><strong>Audit gaming profiles.</strong> If your Discord handle matches your Steam or Xbox username, consider changing one to break the correlation.</li>
      </ul>
      <p>Run a <Link to="/digital-footprint-checker" className="text-primary hover:underline">digital footprint check</Link> to assess your full online exposure.</p>
    </>
  ),
  faqs: [
    { q: "Are Discord profiles publicly searchable?", a: "No. Discord profiles are only visible to users who share a server or mutual connection. However, the same username on public platforms can be discovered through cross-platform OSINT." },
    { q: "Can you search Discord by username for free?", a: "Yes. FootprintIQ checks whether a Discord username exists across 500+ other public platforms. The scan is free and requires no account." },
    { q: "What is a Discord discriminator?", a: "Discord previously used 4-digit discriminators (e.g., User#1234). Since 2023, Discord uses unique usernames without discriminators, increasing username reuse across platforms." },
    { q: "How do I find someone's Discord username?", a: "If you know their username on another platform, search it with FootprintIQ. Users who reuse handles often list their Discord tag in their Twitter/X or Reddit bio." },
    { q: "Is Discord username search legal?", a: "Yes. Searching for publicly shared usernames across platforms is legal. FootprintIQ never attempts to access private Discord servers or messages." },
  ],
};

export default function SearchDiscordByUsername() {
  return <SearchByUsernameTemplate config={config} />;
}
