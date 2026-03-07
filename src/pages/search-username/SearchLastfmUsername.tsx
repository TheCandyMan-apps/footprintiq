import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Last.fm",
  slug: "search-lastfm-username",
  profilePattern: "last.fm/user/username",
  metaDesc: "Search Last.fm usernames to find music profiles and discover linked accounts across 500+ platforms. Free Last.fm username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>Last.fm profiles are publicly accessible at <code>last.fm/user/username</code>. OSINT tools query this URL to confirm whether a profile exists and contains public listening data.</p>
      <p>A confirmed Last.fm profile reveals the display name, bio, profile photo, location, total scrobble count, listening history (recent tracks, top artists, top albums, top tracks), library statistics, and friend connections. Last.fm's scrobbling feature creates one of the most detailed behavioural profiles of any platform — it records every song a user listens to, with timestamps, creating a minute-by-minute activity log spanning years.</p>
      <p>FootprintIQ extends this by checking the same handle across 500+ platforms, revealing connections to Spotify, SoundCloud, and other music communities.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Approaches for locating Last.fm profiles:</p>
      <ul>
        <li><strong>Direct URL check.</strong> Navigate to <code>last.fm/user/username</code>. FootprintIQ automates this.</li>
        <li><strong>Cross-platform pivot.</strong> Music listeners use matching handles on Last.fm, Spotify, and RateYourMusic.</li>
        <li><strong>Compatibility features.</strong> Last.fm's music compatibility tool can surface friends and neighbours with similar taste.</li>
        <li><strong>Google search.</strong> Searching <code>site:last.fm/user "username"</code> surfaces profiles and listening data.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/find-someone-by-username" className="text-primary hover:underline">guide to finding someone by username</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Last.fm profiles provide exceptional behavioural OSINT data:</p>
      <ul>
        <li><strong>Activity timeline.</strong> Scrobble timestamps create a minute-by-minute activity log revealing timezone, sleep patterns, and daily routines.</li>
        <li><strong>Interest profiling.</strong> Top artists, genres, and listening patterns reveal detailed personal preferences.</li>
        <li><strong>Geographic indicators.</strong> Location fields and local artist preferences reveal geographic information.</li>
        <li><strong>Network analysis.</strong> Friends lists and music compatibility connections map social relationships.</li>
        <li><strong>Temporal analysis.</strong> Listening patterns over years reveal lifestyle changes, mood patterns, and routine shifts.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>Last.fm username exposure creates significant privacy risks:</p>
      <ul>
        <li><strong>Minute-by-minute activity tracking.</strong> Scrobble data reveals exact timestamps of music listening, mapping daily routines and sleep schedules.</li>
        <li><strong>Comprehensive interest profiling.</strong> Years of listening data create one of the most detailed interest profiles of any platform.</li>
        <li><strong>Cross-platform linking.</strong> Matching handles on Last.fm and Spotify connect listening data to broader identity.</li>
        <li><strong>Historical depth.</strong> Many Last.fm accounts span 10-15+ years of continuous listening data.</li>
      </ul>
      <p>To reduce exposure: review recent tracks visibility, use a unique handle, and consider whether years of scrobble data should remain public.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Last.fm by username?", a: "Yes. Last.fm profiles are accessible at last.fm/user/username. FootprintIQ checks this alongside 500+ platforms." },
    { q: "Is Last.fm username search free?", a: "Yes. FootprintIQ's free tier includes Last.fm along with 500+ other platforms." },
    { q: "What does a Last.fm profile reveal?", a: "A public Last.fm profile shows listening history with timestamps, top artists/albums/tracks, total scrobbles, location, and friend connections." },
    { q: "Can Last.fm data reveal my daily schedule?", a: "Yes. Scrobble timestamps create a precise activity timeline. Listening gaps typically correspond to sleep, work, or travel — revealing daily routines." },
  ],
};

export default function SearchLastfmUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
