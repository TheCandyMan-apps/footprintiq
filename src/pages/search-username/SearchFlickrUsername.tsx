import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Flickr",
  slug: "search-flickr-username",
  profilePattern: "flickr.com/people/username",
  metaDesc: "Search Flickr usernames to find photography profiles and discover linked accounts across 500+ platforms. Free Flickr username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>Flickr profiles are publicly accessible at <code>flickr.com/people/username</code>. OSINT tools query this URL to confirm whether a profile exists and contains public photo content.</p>
      <p>A confirmed Flickr profile reveals the display name, bio, profile photo, location (if set), photo stream, albums, groups, favourites, and EXIF data on uploaded photos. Flickr's photography focus means uploaded images frequently contain rich metadata — camera model, GPS coordinates, timestamps, and lens information. This metadata can reveal locations visited, equipment owned, and photography patterns.</p>
      <p>FootprintIQ extends this by checking the same handle across 500+ platforms, revealing connections to Instagram, DeviantArt, 500px, and other creative communities.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Approaches for locating Flickr profiles:</p>
      <ul>
        <li><strong>Direct URL check.</strong> Navigate to <code>flickr.com/people/username</code>. FootprintIQ automates this.</li>
        <li><strong>Flickr search.</strong> The platform's search queries display names and photo tags.</li>
        <li><strong>Cross-platform pivot.</strong> Photographers use matching handles on Flickr, Instagram, and 500px. FootprintIQ identifies these connections.</li>
        <li><strong>EXIF and reverse image search.</strong> Photo metadata and reverse image searches can connect Flickr uploads to other platforms.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/find-someone-by-username" className="text-primary hover:underline">guide to finding someone by username</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Flickr profiles provide unique OSINT value due to photo metadata:</p>
      <ul>
        <li><strong>EXIF geolocation.</strong> GPS coordinates in photo EXIF data reveal exact locations where images were taken.</li>
        <li><strong>Temporal analysis.</strong> Photo timestamps map travel patterns, daily routines, and activity schedules.</li>
        <li><strong>Equipment profiling.</strong> Camera and lens data reveal photography equipment and investment level.</li>
        <li><strong>Group membership.</strong> Flickr groups reveal interests, community affiliations, and geographic connections.</li>
        <li><strong>Network analysis.</strong> Favourites, comments, and group interactions map social connections within the photography community.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>Flickr username exposure creates significant privacy risks:</p>
      <ul>
        <li><strong>Geolocation exposure.</strong> EXIF GPS data in photos reveals exact locations — including home, workplace, and frequented areas.</li>
        <li><strong>Cross-platform linking.</strong> Matching handles on Flickr and other photography platforms connect creative identities.</li>
        <li><strong>Travel pattern mapping.</strong> Photo timestamps and locations reveal travel history and movement patterns.</li>
        <li><strong>Content permanence.</strong> Uploaded photos with metadata remain publicly accessible indefinitely.</li>
      </ul>
      <p>To reduce exposure: strip EXIF data before uploading, disable geolocation on photos, use a unique handle, and review album privacy settings.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Flickr by username?", a: "Yes. Flickr profiles are accessible at flickr.com/people/username. FootprintIQ checks this alongside 500+ platforms." },
    { q: "Is Flickr username search free?", a: "Yes. FootprintIQ's free tier includes Flickr along with 500+ other platforms." },
    { q: "What does a Flickr profile reveal?", a: "A public Flickr profile shows display name, bio, location, photo stream, albums, groups, favourites, and EXIF metadata on photos." },
    { q: "Can Flickr photos reveal my location?", a: "Yes. If EXIF GPS data is not stripped, uploaded photos can contain exact geographic coordinates. Always review metadata before uploading." },
  ],
};

export default function SearchFlickrUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
