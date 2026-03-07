import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Roblox",
  slug: "search-roblox-username",
  profilePattern: "roblox.com/users/profile?username=username",
  metaDesc: "Search Roblox usernames to find gaming profiles and discover linked accounts across 500+ platforms. Free Roblox username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>Roblox profiles are publicly accessible via the platform's user search or direct profile URLs. OSINT tools query the Roblox API or web interface to confirm whether an account exists with a given username.</p>
      <p>A confirmed Roblox profile reveals the display name, username, profile description, avatar, friends list, group memberships, badges, created games, inventory (if public), and account creation date. Roblox is one of the largest gaming platforms globally, with a user base skewing younger — making username reuse between Roblox and other platforms (Discord, TikTok, YouTube) particularly common among younger demographics.</p>
      <p>FootprintIQ extends this by checking the same handle across 500+ platforms, revealing connections to Discord, YouTube, TikTok, and other gaming communities.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Approaches for locating Roblox profiles:</p>
      <ul>
        <li><strong>Roblox user search.</strong> The platform's built-in search queries usernames and display names. FootprintIQ automates this.</li>
        <li><strong>Cross-platform pivot.</strong> Roblox users frequently use identical handles on Discord, YouTube, and TikTok.</li>
        <li><strong>Third-party trackers.</strong> Services like RoMonitor and Bloxflip index Roblox profiles and statistics.</li>
        <li><strong>Group search.</strong> Roblox group directories reveal members associated with specific communities.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/find-someone-by-username" className="text-primary hover:underline">guide to finding someone by username</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Roblox usernames provide gaming-focused OSINT value:</p>
      <ul>
        <li><strong>Username reuse patterns.</strong> Younger users frequently reuse Roblox handles across Discord, YouTube, and TikTok.</li>
        <li><strong>Friends list analysis.</strong> Public friends lists map social connections within the gaming community.</li>
        <li><strong>Group memberships.</strong> Group affiliations reveal interests, community involvement, and social circles.</li>
        <li><strong>Account age.</strong> Creation date reveals how long a user has been active on the platform.</li>
        <li><strong>Game creation.</strong> Published Roblox games reveal development skills and creative interests.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>Roblox username exposure creates privacy risks, particularly for younger users:</p>
      <ul>
        <li><strong>Cross-platform linking.</strong> Identical handles on Roblox and Discord/TikTok connect gaming identity to broader online presence.</li>
        <li><strong>Friends list exposure.</strong> Public friends lists reveal real-world social connections.</li>
        <li><strong>Profile description.</strong> Bio text may contain personal details, social media links, or age indicators.</li>
        <li><strong>Inventory and spending.</strong> Public inventory reveals virtual item purchases and spending patterns.</li>
      </ul>
      <p>To reduce exposure: set profile to friends-only, use a unique handle, remove personal details from the bio, and restrict inventory visibility.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Roblox by username?", a: "Yes. Roblox has a built-in user search. FootprintIQ checks Roblox alongside 500+ other platforms." },
    { q: "Is Roblox username search free?", a: "Yes. FootprintIQ's free tier includes Roblox along with 500+ other platforms." },
    { q: "What does a Roblox profile reveal?", a: "A public Roblox profile shows username, display name, bio, avatar, friends list, groups, badges, created games, and account age." },
    { q: "Should children use unique usernames on Roblox?", a: "Absolutely. Children should use unique handles on Roblox that don't match their names on Discord, TikTok, or other platforms to prevent cross-platform identity linking." },
  ],
};

export default function SearchRobloxUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
