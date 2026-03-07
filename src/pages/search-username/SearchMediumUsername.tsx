import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Medium",
  slug: "search-medium-username",
  profilePattern: "medium.com/@username",
  metaDesc: "Search Medium usernames to find articles, publications, and linked accounts across 500+ platforms. Free Medium username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>Medium profiles are publicly accessible at <code>medium.com/@username</code>. OSINT tools query this URL and analyse the response to confirm whether the profile exists and contains published content.</p>
      <p>A confirmed Medium profile reveals the display name, bio, profile photo, follower and following counts, published articles, responses, and publication memberships. Medium's long-form writing format produces rich content trails — articles often reveal professional expertise, personal opinions, career history, and industry connections. The platform's recommendation algorithm also surfaces clap and highlight activity.</p>
      <p>FootprintIQ extends this by simultaneously checking the same handle across 500+ other platforms, revealing whether the Medium identity connects to accounts on Twitter/X, LinkedIn, GitHub, and hundreds of other communities.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Several approaches help locate Medium profiles from a username:</p>
      <ul>
        <li><strong>Direct URL check.</strong> Navigate to <code>medium.com/@username</code> to confirm profile existence. FootprintIQ automates this programmatically.</li>
        <li><strong>Google site search.</strong> Searching <code>site:medium.com "@username"</code> surfaces articles and profile pages associated with a handle.</li>
        <li><strong>Cross-platform pivot.</strong> Medium bios frequently link to Twitter/X, LinkedIn, and personal websites. FootprintIQ's multi-platform search identifies these connections automatically.</li>
        <li><strong>Publication search.</strong> Browsing Medium publications in a specific industry can surface writers whose expertise matches a target's known profession.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/find-someone-by-username" className="text-primary hover:underline">guide to finding someone by username</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Medium usernames are valuable OSINT resources for professional and thought-leadership investigations:</p>
      <ul>
        <li><strong>Professional intelligence.</strong> Published articles reveal expertise, industry knowledge, employer context, and career progression.</li>
        <li><strong>Opinion and thought profiling.</strong> Long-form articles capture detailed opinions, predictions, and positions on professional and personal topics.</li>
        <li><strong>Network analysis.</strong> Publication memberships, article claps, and response threads map professional networks and intellectual communities.</li>
        <li><strong>Linked account detection.</strong> Medium bios consistently link to Twitter/X handles, LinkedIn profiles, personal websites, and newsletters.</li>
        <li><strong>Temporal analysis.</strong> Article publication dates and frequency reveal professional focus shifts and career transitions.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide for advanced workflows.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>Medium username exposure creates specific privacy risks:</p>
      <ul>
        <li><strong>Professional identity exposure.</strong> Articles are indexed by search engines and appear in name searches, linking your writing to your professional identity.</li>
        <li><strong>Opinion trail.</strong> Published opinions on controversial or evolving topics remain permanently accessible and may be quoted out of context.</li>
        <li><strong>Bio link chains.</strong> Twitter/X, LinkedIn, and website links in Medium bios create direct identity bridges across platforms.</li>
        <li><strong>Clap and response activity.</strong> Public engagement with other writers' content reveals interests and professional network connections.</li>
      </ul>
      <p>To reduce exposure: use a pseudonym for sensitive topics, audit old articles, remove bio links to personal accounts, and review clap/response visibility.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Medium by username?", a: "Yes. Medium profiles are accessible at medium.com/@username. FootprintIQ checks this endpoint programmatically alongside 500+ other platforms." },
    { q: "Is Medium username search free?", a: "Yes. FootprintIQ's free tier includes Medium along with 500+ other platforms. No account required for basic scans." },
    { q: "What does a Medium profile reveal?", a: "A public Medium profile shows display name, bio, profile photo, published articles, follower/following counts, and publication memberships. Bios often link to other accounts." },
    { q: "Can you find deleted Medium articles?", a: "Deleted articles are removed from Medium. However, cached versions may persist in search engine results or web archives. FootprintIQ only accesses currently public data." },
  ],
};

export default function SearchMediumUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
