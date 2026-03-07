import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Dribbble",
  slug: "search-dribbble-username",
  profilePattern: "dribbble.com/username",
  metaDesc: "Search Dribbble usernames to find design portfolios and discover linked accounts across 500+ platforms. Free Dribbble username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>Dribbble profiles are publicly accessible at <code>dribbble.com/username</code>. OSINT tools query this URL and analyse the response to confirm whether the profile exists and contains public design work.</p>
      <p>A confirmed Dribbble profile reveals the display name, location, bio, profile photo, shot portfolio (design thumbnails), likes received, follower/following counts, and skills. Dribbble is a design-focused community where many users display their real name, employer, and design specialisation. The platform's invitation-based history means verified accounts carry additional credibility signals.</p>
      <p>FootprintIQ extends this by simultaneously checking the same handle across 500+ other platforms, revealing whether the Dribbble identity connects to accounts on Behance, GitHub, LinkedIn, Twitter/X, and hundreds of other communities.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Several approaches help locate Dribbble profiles from a username:</p>
      <ul>
        <li><strong>Direct URL check.</strong> Navigate to <code>dribbble.com/username</code> to confirm profile existence. FootprintIQ automates this programmatically.</li>
        <li><strong>Google site search.</strong> Searching <code>site:dribbble.com "username"</code> surfaces profiles and shots associated with a handle.</li>
        <li><strong>Cross-platform pivot.</strong> Designers frequently use matching handles on Dribbble, Behance, Instagram, and GitHub. FootprintIQ identifies these connections automatically.</li>
        <li><strong>Team and company pages.</strong> Dribbble team pages list member designers — useful for identifying individuals associated with a specific company.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/find-someone-by-username" className="text-primary hover:underline">guide to finding someone by username</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Dribbble usernames provide professional OSINT value for design-industry investigations:</p>
      <ul>
        <li><strong>Professional identity.</strong> Real names, locations, employer details, and professional bios are standard on Dribbble profiles.</li>
        <li><strong>Design specialisation.</strong> Shot portfolios reveal design focus areas — UI/UX, branding, illustration, motion — mapping professional capabilities.</li>
        <li><strong>Employment intelligence.</strong> Team memberships and employer tags directly indicate current and past employment.</li>
        <li><strong>Network analysis.</strong> Follower/following relationships and team memberships map professional connections within the design community.</li>
        <li><strong>Linked accounts.</strong> Dribbble profiles typically link to personal websites, Twitter/X, and other portfolio platforms.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide for advanced workflows.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>Dribbble username exposure creates specific privacy risks:</p>
      <ul>
        <li><strong>Professional identity linking.</strong> Real names and employer details on Dribbble directly connect design work to personal identity.</li>
        <li><strong>Cross-platform mapping.</strong> Matching handles on Dribbble, Behance, and GitHub enable instant cross-platform identity correlation.</li>
        <li><strong>Client work exposure.</strong> Published design shots may reveal client relationships and project details.</li>
        <li><strong>Career tracking.</strong> Team membership changes and portfolio evolution reveal employment history and career progression.</li>
      </ul>
      <p>To reduce exposure: use a professional-only handle, review shot visibility, remove sensitive client work, and audit linked accounts in your bio.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Dribbble by username?", a: "Yes. Dribbble profiles are accessible at dribbble.com/username. FootprintIQ checks this endpoint programmatically alongside 500+ other platforms." },
    { q: "Is Dribbble username search free?", a: "Yes. FootprintIQ's free tier includes Dribbble along with 500+ other platforms. No account required for basic scans." },
    { q: "What does a Dribbble profile reveal?", a: "A public Dribbble profile shows display name, location, bio, design portfolio, skills, follower counts, team memberships, and linked social accounts." },
    { q: "What is the difference between Behance and Dribbble?", a: "Both are design portfolio platforms. Behance is owned by Adobe and focuses on complete case studies. Dribbble focuses on design shots (thumbnails) and community interaction. FootprintIQ checks both platforms." },
  ],
};

export default function SearchDribbbleUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
