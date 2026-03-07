import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Minecraft",
  slug: "search-minecraft-username",
  profilePattern: "namemc.com/profile/username",
  metaDesc: "Search Minecraft usernames to find player profiles and discover linked accounts across 500+ platforms. Free Minecraft username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>Minecraft usernames (Java Edition) are searchable via third-party services like NameMC at <code>namemc.com/profile/username</code>. OSINT tools query these services to confirm whether a player profile exists and retrieve associated data.</p>
      <p>A confirmed Minecraft profile reveals the current username, skin (avatar), UUID, username history (all previous names), server activity, and cape ownership. NameMC also tracks which public servers a player has been seen on. Minecraft usernames are particularly valuable for OSINT because the platform records username change history — meaning even if a user changes their handle, previous names remain discoverable.</p>
      <p>FootprintIQ extends this by checking the same handle across 500+ platforms, revealing connections to Discord, YouTube, Twitch, and other gaming communities.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Approaches for locating Minecraft profiles:</p>
      <ul>
        <li><strong>NameMC lookup.</strong> Navigate to <code>namemc.com/profile/username</code>. FootprintIQ automates this.</li>
        <li><strong>UUID search.</strong> Minecraft UUIDs are permanent identifiers that persist across username changes.</li>
        <li><strong>Username history.</strong> NameMC displays all previous usernames, revealing past handles that may match other platforms.</li>
        <li><strong>Cross-platform pivot.</strong> Minecraft players frequently use identical handles on Discord, YouTube, and Twitch.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/find-someone-by-username" className="text-primary hover:underline">guide to finding someone by username</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Minecraft usernames provide gaming OSINT value:</p>
      <ul>
        <li><strong>Username history.</strong> Historical usernames may reveal real names, alternative handles, or geographic indicators used in the past.</li>
        <li><strong>Server activity.</strong> Public server logs and NameMC tracking reveal which communities a player frequents.</li>
        <li><strong>Cross-platform correlation.</strong> Minecraft handles are frequently reused on Discord, YouTube, and Twitch.</li>
        <li><strong>UUID permanence.</strong> Minecraft UUIDs are permanent — even username changes don't prevent tracking.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>Minecraft username exposure creates privacy risks:</p>
      <ul>
        <li><strong>Username history exposure.</strong> All previous usernames are permanently recorded and publicly visible.</li>
        <li><strong>Server tracking.</strong> Third-party services track which servers a player has joined.</li>
        <li><strong>Permanent UUID.</strong> Minecraft UUIDs cannot be changed, creating a permanent tracking identifier.</li>
        <li><strong>Cross-platform linking.</strong> Matching handles on Minecraft and Discord/YouTube connect gaming identity to broader presence.</li>
      </ul>
      <p>To reduce exposure: be aware that username history is permanent, use unique handles, and consider the visibility of server activity.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Minecraft by username?", a: "Yes. Minecraft profiles are searchable via NameMC and similar services. FootprintIQ checks this alongside 500+ platforms." },
    { q: "Is Minecraft username search free?", a: "Yes. FootprintIQ's free tier includes Minecraft along with 500+ other platforms." },
    { q: "Can you see someone's old Minecraft usernames?", a: "Yes. NameMC and the Mojang API record complete username change history. All previous names are publicly visible." },
    { q: "What does a Minecraft profile reveal?", a: "A Minecraft profile shows current username, UUID, skin, username history, server activity, and cape ownership." },
  ],
};

export default function SearchMinecraftUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
