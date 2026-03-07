import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "SoundCloud",
  slug: "search-soundcloud-username",
  profilePattern: "soundcloud.com/username",
  metaDesc: "Search SoundCloud usernames to find music profiles and discover linked accounts across 500+ platforms. Free SoundCloud username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>SoundCloud profiles are publicly accessible at <code>soundcloud.com/username</code>. OSINT tools query this URL to confirm whether a profile exists and contains public tracks, playlists, or reposts.</p>
      <p>A confirmed SoundCloud profile reveals the display name, bio, profile photo, location, follower and following counts, uploaded tracks, playlists, reposts, and comments. SoundCloud's audio-first format provides unique OSINT signals — track metadata, collaboration credits, and genre preferences reveal interests and creative networks. Many artists and DJs link their SoundCloud to other platforms in their bio.</p>
      <p>FootprintIQ extends this by simultaneously checking the same handle across 500+ other platforms, revealing whether the SoundCloud identity connects to accounts on Spotify, Bandcamp, Instagram, Twitter/X, and hundreds of other communities.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Several approaches help locate SoundCloud profiles from a username:</p>
      <ul>
        <li><strong>Direct URL check.</strong> Navigate to <code>soundcloud.com/username</code> to confirm profile existence. FootprintIQ automates this programmatically.</li>
        <li><strong>SoundCloud search.</strong> The platform's built-in search queries display names, track titles, and tags.</li>
        <li><strong>Cross-platform pivot.</strong> Music producers frequently use matching handles on SoundCloud, Bandcamp, Spotify, and Instagram. FootprintIQ identifies these connections automatically.</li>
        <li><strong>Embedded players.</strong> SoundCloud embeds on blogs, social media, and websites can reveal associated profiles.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/find-someone-by-username" className="text-primary hover:underline">guide to finding someone by username</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>SoundCloud usernames provide OSINT value for music and creative community investigations:</p>
      <ul>
        <li><strong>Username correlation.</strong> Artist handles are frequently reused across SoundCloud, Bandcamp, Spotify, and social media platforms.</li>
        <li><strong>Geographic indicators.</strong> Location fields, track descriptions, and event references reveal geographic information.</li>
        <li><strong>Network mapping.</strong> Follower lists, collaborations, reposts, and comment threads map creative networks.</li>
        <li><strong>Content metadata.</strong> Track upload dates, genre tags, and description text reveal activity patterns and interests.</li>
        <li><strong>Linked accounts.</strong> SoundCloud bios commonly link to Instagram, Twitter/X, personal websites, and booking contacts.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide for advanced workflows.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>SoundCloud username exposure creates specific privacy risks:</p>
      <ul>
        <li><strong>Cross-platform identity linking.</strong> Matching handles on SoundCloud and social media connect creative output to personal identity.</li>
        <li><strong>Location disclosure.</strong> Profile location fields and event-related tracks can reveal geographic information.</li>
        <li><strong>Network exposure.</strong> Public follower lists and collaboration credits reveal social and professional connections.</li>
        <li><strong>Content permanence.</strong> Uploaded tracks and comments remain publicly accessible and indexed by search engines.</li>
      </ul>
      <p>To reduce exposure: use a stage name distinct from personal handles, remove location data, and audit bio links regularly.</p>
    </>
  ),
  faqs: [
    { q: "Can you search SoundCloud by username?", a: "Yes. SoundCloud profiles are accessible at soundcloud.com/username. FootprintIQ checks this endpoint programmatically alongside 500+ other platforms." },
    { q: "Is SoundCloud username search free?", a: "Yes. FootprintIQ's free tier includes SoundCloud along with 500+ other platforms." },
    { q: "What does a SoundCloud profile reveal?", a: "A public SoundCloud profile shows display name, bio, location, tracks, playlists, reposts, follower counts, and comments." },
    { q: "Can you find someone's real identity from SoundCloud?", a: "SoundCloud profiles may contain real names, locations, and links to other social accounts. Cross-referencing with other platforms can build a more complete identity picture." },
  ],
};

export default function SearchSoundcloudUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
