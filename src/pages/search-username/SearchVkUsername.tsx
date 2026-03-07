import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "VK",
  slug: "search-vk-username",
  profilePattern: "vk.com/username",
  metaDesc: "Search VK usernames to find profiles and discover linked accounts across 500+ platforms. Free VK (VKontakte) username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>VK (VKontakte) profiles are publicly accessible at <code>vk.com/username</code> or <code>vk.com/id[number]</code>. OSINT tools query these endpoints and analyse the response to confirm whether a profile exists and what information is publicly visible.</p>
      <p>A public VK profile can reveal the user's real name, profile and cover photos, date of birth, city, university, workplace, relationship status, phone number, friends list, group memberships, photo albums, wall posts, and music preferences. VK is the dominant social network across Russia and CIS countries, with over 100 million monthly active users. Its default privacy settings are historically more open than Western platforms.</p>
      <p>FootprintIQ extends this by simultaneously checking the same handle across 500+ other platforms, revealing whether the VK identity connects to accounts on Telegram, Instagram, Twitter/X, and hundreds of other communities worldwide.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Several approaches help locate VK profiles when you have a username:</p>
      <ul>
        <li><strong>Direct URL check.</strong> Navigate to <code>vk.com/username</code> to confirm profile existence. FootprintIQ automates this programmatically.</li>
        <li><strong>VK people search.</strong> VK's built-in search supports filtering by name, city, age, university, and workplace — providing highly targeted results.</li>
        <li><strong>Cross-platform pivot.</strong> VK usernames frequently match handles used on Telegram and other Russian-language platforms. FootprintIQ identifies these connections automatically.</li>
        <li><strong>Google site search.</strong> Searching <code>site:vk.com "username"</code> surfaces profiles and public posts associated with a handle.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/find-someone-by-username" className="text-primary hover:underline">guide to finding someone by username</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>VK profiles are exceptionally valuable for OSINT investigations due to the platform's rich public data:</p>
      <ul>
        <li><strong>Personal data density.</strong> VK profiles frequently contain real name, date of birth, location, employer, university, and relationship status — significantly more than most Western platforms.</li>
        <li><strong>Network mapping.</strong> Public friends lists, group memberships, and wall post interactions map social and professional networks in detail.</li>
        <li><strong>Media intelligence.</strong> Photo albums, tagged photos, and video uploads provide visual intelligence including locations, events, and associates.</li>
        <li><strong>Geographic intelligence.</strong> City, university, and workplace fields, combined with geotagged photos, provide strong location data.</li>
        <li><strong>Phone number exposure.</strong> VK profiles may display phone numbers, providing a direct communication and identity pivot point.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide for advanced workflows.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>VK username exposure creates significant privacy risks:</p>
      <ul>
        <li><strong>Extensive personal disclosure.</strong> VK's default settings expose more personal data than most platforms — including date of birth, phone number, and relationship status.</li>
        <li><strong>Friends list exposure.</strong> Public friends lists reveal personal and professional networks, enabling social engineering.</li>
        <li><strong>Photo and location intelligence.</strong> Photo albums and geotagged images reveal real-world locations, travel, and daily routines.</li>
        <li><strong>Cross-platform identity linking.</strong> VK handles used on Telegram and other platforms connect Russian-language social activity to a broader digital identity.</li>
      </ul>
      <p>To reduce exposure: review VK privacy settings, restrict profile to friends only, remove phone number visibility, and audit photo album permissions.</p>
    </>
  ),
  faqs: [
    { q: "Can you search VK by username?", a: "Yes. VK profiles are accessible at vk.com/username. FootprintIQ checks this endpoint programmatically alongside 500+ other platforms." },
    { q: "Is VK username search free?", a: "Yes. FootprintIQ's free tier includes VK along with 500+ other platforms. No account required for basic scans." },
    { q: "What does a VK profile reveal?", a: "A public VK profile can show real name, date of birth, city, employer, university, relationship status, phone number, friends list, photos, and group memberships." },
    { q: "Is VK only used in Russia?", a: "VK is primarily used in Russia and CIS countries but has users worldwide. It has over 100 million monthly active users. FootprintIQ checks VK as part of its global platform coverage." },
  ],
};

export default function SearchVkUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
