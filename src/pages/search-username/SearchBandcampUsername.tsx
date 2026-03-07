import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Bandcamp",
  slug: "search-bandcamp-username",
  profilePattern: "username.bandcamp.com",
  metaDesc: "Search Bandcamp usernames to find music profiles and discover linked accounts across 500+ platforms. Free Bandcamp username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>Bandcamp artist pages are accessible at <code>username.bandcamp.com</code>. OSINT tools query this subdomain to confirm whether an artist or fan profile exists.</p>
      <p>A confirmed Bandcamp profile reveals the artist or fan name, bio, location, discography (albums, EPs, singles), merchandise listings, and supporter/following activity. Bandcamp is an independent music platform where artists sell directly to fans — profiles reveal both creative output and purchasing patterns. Fan profiles display a collection of purchased music, revealing listening preferences.</p>
      <p>FootprintIQ extends this by checking the same handle across 500+ platforms, revealing connections to SoundCloud, Spotify, Instagram, and other music communities.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Approaches for locating Bandcamp profiles:</p>
      <ul>
        <li><strong>Direct subdomain check.</strong> Navigate to <code>username.bandcamp.com</code>. FootprintIQ automates this.</li>
        <li><strong>Cross-platform pivot.</strong> Musicians use matching handles on Bandcamp, SoundCloud, and social media.</li>
        <li><strong>Google search.</strong> Searching <code>site:bandcamp.com "artist name"</code> surfaces artist pages and releases.</li>
        <li><strong>Fan collection analysis.</strong> Bandcamp fan profiles display purchased music, which can be publicly visible.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/find-someone-by-username" className="text-primary hover:underline">guide to finding someone by username</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Bandcamp profiles provide music community OSINT value:</p>
      <ul>
        <li><strong>Geographic intelligence.</strong> Artist location fields reveal geographic information.</li>
        <li><strong>Purchase history.</strong> Fan collections expose listening preferences and spending patterns.</li>
        <li><strong>Network mapping.</strong> Label affiliations, supporter lists, and collaboration credits map music industry connections.</li>
        <li><strong>Linked accounts.</strong> Artist pages commonly link to social media, personal websites, and other music platforms.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>Bandcamp username exposure creates privacy risks:</p>
      <ul>
        <li><strong>Purchase transparency.</strong> Fan collections publicly reveal music purchasing habits and genre preferences.</li>
        <li><strong>Location disclosure.</strong> Artist location fields reveal geographic information.</li>
        <li><strong>Identity linking.</strong> Matching handles across Bandcamp and social media connect music identity to personal identity.</li>
      </ul>
      <p>To reduce exposure: review fan collection privacy settings, use a unique handle, and audit linked social accounts.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Bandcamp by username?", a: "Yes. Bandcamp pages are accessible at username.bandcamp.com. FootprintIQ checks this alongside 500+ platforms." },
    { q: "Is Bandcamp username search free?", a: "Yes. FootprintIQ's free tier includes Bandcamp along with 500+ other platforms." },
    { q: "What does a Bandcamp profile reveal?", a: "Artist profiles show name, bio, location, discography, and merchandise. Fan profiles show purchased music collections." },
    { q: "Can someone see what music I've bought on Bandcamp?", a: "By default, fan collections are publicly visible. You can adjust privacy settings to hide purchases." },
  ],
};

export default function SearchBandcampUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
