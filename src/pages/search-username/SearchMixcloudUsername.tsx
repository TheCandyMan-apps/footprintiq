import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Mixcloud",
  slug: "search-mixcloud-username",
  profilePattern: "mixcloud.com/username",
  metaDesc: "Search Mixcloud usernames to find DJ profiles and discover linked accounts across 500+ platforms. Free Mixcloud username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>Mixcloud profiles are publicly accessible at <code>mixcloud.com/username</code>. OSINT tools query this URL to confirm whether a profile exists and contains public mixes, shows, or playlists.</p>
      <p>A confirmed Mixcloud profile reveals the display name, bio, profile photo, location, uploaded mixes with tracklists, follower and following counts, and listening history. Mixcloud specialises in long-form audio content — DJ mixes, radio shows, and podcasts — making it a niche but valuable source for creative community investigations.</p>
      <p>FootprintIQ extends this by simultaneously checking the same handle across 500+ other platforms, revealing whether the Mixcloud identity connects to accounts on SoundCloud, Spotify, Instagram, and hundreds of other communities.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Approaches for locating Mixcloud profiles from a username:</p>
      <ul>
        <li><strong>Direct URL check.</strong> Navigate to <code>mixcloud.com/username</code>. FootprintIQ automates this programmatically.</li>
        <li><strong>Cross-platform pivot.</strong> DJs and radio hosts typically use matching handles on Mixcloud, SoundCloud, and Instagram.</li>
        <li><strong>Google site search.</strong> Searching <code>site:mixcloud.com "username"</code> surfaces profiles and uploaded mixes.</li>
        <li><strong>Event and venue connections.</strong> Mixcloud mixes often reference venues and events that can narrow identity.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/find-someone-by-username" className="text-primary hover:underline">guide to finding someone by username</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Mixcloud usernames provide niche OSINT value:</p>
      <ul>
        <li><strong>Username correlation.</strong> DJ handles are frequently consistent across Mixcloud, SoundCloud, Resident Advisor, and social media.</li>
        <li><strong>Geographic intelligence.</strong> Location fields, venue references in mix titles, and event listings reveal geographic activity.</li>
        <li><strong>Network analysis.</strong> Featured guests, collaborative mixes, and follower networks map creative communities.</li>
        <li><strong>Temporal patterns.</strong> Upload schedules reveal activity patterns and timezone indicators.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>Mixcloud username exposure creates privacy risks:</p>
      <ul>
        <li><strong>Identity linking.</strong> Matching handles connect DJ personas to personal social media accounts.</li>
        <li><strong>Location exposure.</strong> Venue and event references in mix metadata reveal geographic activity.</li>
        <li><strong>Listening history.</strong> Public favourites and listening activity reveal personal music preferences.</li>
      </ul>
      <p>To reduce exposure: use a distinct stage name, remove location details from your bio, and audit linked accounts.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Mixcloud by username?", a: "Yes. Mixcloud profiles are accessible at mixcloud.com/username. FootprintIQ checks this programmatically alongside 500+ platforms." },
    { q: "Is Mixcloud username search free?", a: "Yes. FootprintIQ's free tier includes Mixcloud along with 500+ other platforms." },
    { q: "What does a Mixcloud profile reveal?", a: "A public Mixcloud profile shows display name, bio, location, uploaded mixes with tracklists, and follower counts." },
    { q: "How is Mixcloud different from SoundCloud?", a: "Mixcloud focuses on long-form mixes and radio shows with licensed music, while SoundCloud hosts original tracks. FootprintIQ checks both platforms." },
  ],
};

export default function SearchMixcloudUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
