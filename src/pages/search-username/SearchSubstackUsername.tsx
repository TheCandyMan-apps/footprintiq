import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Substack",
  slug: "search-substack-username",
  profilePattern: "username.substack.com",
  metaDesc: "Search Substack usernames to find newsletters and discover linked accounts across 500+ platforms. Free Substack username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>Substack publications are publicly accessible at <code>username.substack.com</code> or via custom domains. OSINT tools query the subdomain to confirm whether a newsletter exists and contains public posts.</p>
      <p>A confirmed Substack profile reveals the writer's name, bio, profile photo, publication name, subscriber count (if displayed), post archive, and about page. Substack's newsletter format produces professional, long-form content that frequently reveals expertise, opinions, and professional affiliations. Many Substack writers operate under their real names, making the platform particularly valuable for identity research.</p>
      <p>FootprintIQ extends this by simultaneously checking the same handle across 500+ platforms, revealing whether the Substack identity connects to accounts on Twitter/X, LinkedIn, Medium, and hundreds of other communities.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Approaches for locating Substack publications from a username:</p>
      <ul>
        <li><strong>Direct subdomain check.</strong> Navigate to <code>username.substack.com</code>. FootprintIQ automates this.</li>
        <li><strong>Substack search.</strong> Substack's discovery features and recommendations surface publications by topic.</li>
        <li><strong>Cross-platform pivot.</strong> Newsletter writers actively promote on Twitter/X, LinkedIn, and Medium. FootprintIQ identifies these connections.</li>
        <li><strong>Google search.</strong> Searching <code>site:substack.com "author name"</code> surfaces publications and posts.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/find-someone-by-username" className="text-primary hover:underline">guide to finding someone by username</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Substack profiles provide professional OSINT value:</p>
      <ul>
        <li><strong>Real name association.</strong> Most Substack writers publish under their real names, providing direct identity confirmation.</li>
        <li><strong>Professional intelligence.</strong> Newsletter content reveals expertise, industry connections, and career focus.</li>
        <li><strong>Opinion profiling.</strong> Long-form posts capture detailed positions on professional, political, and personal topics.</li>
        <li><strong>Network analysis.</strong> Guest posts, recommendations, and subscriber interactions map professional networks.</li>
        <li><strong>Linked accounts.</strong> About pages typically link to Twitter/X, LinkedIn, and personal websites.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>Substack username exposure creates privacy risks:</p>
      <ul>
        <li><strong>Real name publishing.</strong> Most newsletters are published under real names, creating a permanent, searchable content archive.</li>
        <li><strong>Opinion trail.</strong> Published positions on sensitive topics remain permanently accessible.</li>
        <li><strong>Professional identity linking.</strong> About page links connect newsletter identity to other platforms.</li>
        <li><strong>Subscriber network.</strong> Public recommendations and notes reveal professional associations.</li>
      </ul>
      <p>To reduce exposure: consider publishing under a pen name for sensitive topics, audit about page links, and review recommendation visibility.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Substack by username?", a: "Yes. Substack publications are accessible at username.substack.com. FootprintIQ checks this programmatically alongside 500+ platforms." },
    { q: "Is Substack username search free?", a: "Yes. FootprintIQ's free tier includes Substack along with 500+ other platforms." },
    { q: "What does a Substack profile reveal?", a: "A public Substack shows the writer's name, bio, profile photo, publication name, post archive, and linked social accounts." },
    { q: "Do Substack writers use real names?", a: "Most do. Substack encourages real-name publishing, though pseudonymous newsletters exist. FootprintIQ cross-references handles to identify linked accounts." },
  ],
};

export default function SearchSubstackUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
