import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Spotify",
  slug: "search-spotify-username",
  profilePattern: "open.spotify.com/user/username",
  metaDesc: "Search Spotify usernames to find music profiles and discover linked accounts across 500+ platforms. Free Spotify username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>Spotify profiles are accessible at <code>open.spotify.com/user/username</code>. OSINT tools query this URL to confirm whether a profile exists and contains public playlists or follower data.</p>
      <p>A confirmed Spotify profile reveals the display name, profile photo, public playlists, follower count, and following list. While Spotify assigns alphanumeric user IDs by default, many users set custom display names or link their Facebook accounts. Public playlists reveal listening preferences, mood patterns, and cultural interests — and playlist names, descriptions, and cover images can contain personal information.</p>
      <p>FootprintIQ extends this by checking the same handle across 500+ platforms, revealing connections to Last.fm, SoundCloud, Instagram, and other communities.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Approaches for locating Spotify profiles:</p>
      <ul>
        <li><strong>Direct URL check.</strong> Navigate to <code>open.spotify.com/user/username</code>. FootprintIQ automates this.</li>
        <li><strong>Spotify search.</strong> The platform's user search queries display names across the network.</li>
        <li><strong>Cross-platform pivot.</strong> Users who share Spotify playlists on social media create direct profile links.</li>
        <li><strong>Last.fm correlation.</strong> Users often connect Spotify to Last.fm with matching or similar usernames.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/find-someone-by-username" className="text-primary hover:underline">guide to finding someone by username</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Spotify profiles provide music-based OSINT intelligence:</p>
      <ul>
        <li><strong>Interest profiling.</strong> Public playlists reveal music preferences, workout routines, mood patterns, and cultural interests.</li>
        <li><strong>Social connections.</strong> Following lists and collaborative playlists reveal social and romantic relationships.</li>
        <li><strong>Facebook linking.</strong> Spotify accounts linked to Facebook may expose real names and profile photos.</li>
        <li><strong>Playlist metadata.</strong> Playlist names, descriptions, and cover images can contain personal details and inside references.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>Spotify username exposure creates privacy risks:</p>
      <ul>
        <li><strong>Playlist exposure.</strong> Public playlists reveal personal interests, mood patterns, and cultural preferences.</li>
        <li><strong>Following list.</strong> Public following lists reveal social connections and music preferences.</li>
        <li><strong>Facebook identity link.</strong> Spotify accounts linked to Facebook may expose real names.</li>
        <li><strong>Collaborative playlist leaks.</strong> Shared playlists reveal relationships and social connections.</li>
      </ul>
      <p>To reduce exposure: set playlists to private, review your display name, disconnect from Facebook if desired, and audit your following list visibility.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Spotify by username?", a: "Yes. Spotify profiles are accessible at open.spotify.com/user/username. FootprintIQ checks this alongside 500+ platforms." },
    { q: "Is Spotify username search free?", a: "Yes. FootprintIQ's free tier includes Spotify along with 500+ other platforms." },
    { q: "What does a Spotify profile reveal?", a: "A public Spotify profile shows display name, profile photo, public playlists, follower count, and following list." },
    { q: "Can Spotify reveal my real name?", a: "If your Spotify is linked to Facebook, your real name and photo may be displayed. Review account settings to update your display name." },
  ],
};

export default function SearchSpotifyUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
