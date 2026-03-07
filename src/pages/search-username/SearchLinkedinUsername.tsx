import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "LinkedIn",
  slug: "search-linkedin-username",
  profilePattern: "linkedin.com/in/username",
  metaDesc: "Search LinkedIn usernames to find professional profiles and discover linked accounts across 500+ platforms. Free LinkedIn username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>LinkedIn profiles are publicly accessible at <code>linkedin.com/in/username</code> (custom URL slug). OSINT tools query this URL to confirm whether a profile exists and what professional information is publicly visible.</p>
      <p>A confirmed LinkedIn profile reveals the user's real name, profile photo, headline, current and past employment, education history, skills, endorsements, certifications, volunteer experience, and connections count. LinkedIn is the most information-dense professional network — profiles function as detailed CVs that are publicly indexed by search engines.</p>
      <p>FootprintIQ extends this by checking the same handle across 500+ platforms, revealing connections to GitHub, Twitter/X, Medium, and other professional and personal communities.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Approaches for locating LinkedIn profiles:</p>
      <ul>
        <li><strong>Direct URL check.</strong> Navigate to <code>linkedin.com/in/username</code>. FootprintIQ automates this.</li>
        <li><strong>Google X-ray search.</strong> Searching <code>site:linkedin.com/in "name" "company"</code> provides powerful filtered results.</li>
        <li><strong>Cross-platform pivot.</strong> LinkedIn custom URL slugs often match GitHub usernames, Twitter handles, or personal domain names.</li>
        <li><strong>Email correlation.</strong> LinkedIn profiles are often discoverable through email-based searches and breach data correlation.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/find-someone-by-username" className="text-primary hover:underline">guide to finding someone by username</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>LinkedIn profiles are among the most valuable OSINT resources for professional investigations:</p>
      <ul>
        <li><strong>Employment intelligence.</strong> Current and past positions, companies, dates, and descriptions map complete career trajectories.</li>
        <li><strong>Education history.</strong> Universities, degrees, and graduation dates provide strong identity confirmation.</li>
        <li><strong>Skill and expertise mapping.</strong> Skills, endorsements, and certifications reveal technical capabilities and professional focus.</li>
        <li><strong>Network analysis.</strong> Connection counts, shared connections, and recommendation text map professional networks.</li>
        <li><strong>Geographic intelligence.</strong> Current location, past locations (from employment history), and education institutions reveal geographic history.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>LinkedIn username exposure creates significant professional privacy risks:</p>
      <ul>
        <li><strong>Complete career exposure.</strong> Employment history, education, and skills create a comprehensive professional profile.</li>
        <li><strong>Real name confirmation.</strong> LinkedIn encourages real names, providing direct identity confirmation.</li>
        <li><strong>Cross-platform linking.</strong> Custom URL slugs matching other platform handles connect professional identity to personal accounts.</li>
        <li><strong>Search engine indexing.</strong> LinkedIn profiles rank highly in Google name searches, often as the first result.</li>
      </ul>
      <p>To reduce exposure: customise your public profile visibility, use a unique URL slug, review what's visible to non-connections, and audit endorsement visibility.</p>
    </>
  ),
  faqs: [
    { q: "Can you search LinkedIn by username?", a: "Yes. LinkedIn profiles with custom URLs are accessible at linkedin.com/in/username. FootprintIQ checks this alongside 500+ platforms." },
    { q: "Is LinkedIn username search free?", a: "Yes. FootprintIQ's free tier includes LinkedIn along with 500+ other platforms." },
    { q: "What does a LinkedIn profile reveal?", a: "A public LinkedIn profile shows real name, photo, headline, current and past employment, education, skills, certifications, and connection count." },
    { q: "Do LinkedIn profiles appear in Google search?", a: "Yes. LinkedIn profiles are heavily indexed by search engines and frequently appear as top results for name searches." },
  ],
};

export default function SearchLinkedinUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
