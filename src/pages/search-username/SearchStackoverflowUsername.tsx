import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Stack Overflow",
  slug: "search-stackoverflow-username",
  profilePattern: "stackoverflow.com/users/id/username",
  metaDesc: "Search Stack Overflow usernames to find developer profiles and discover linked accounts across 500+ platforms. Free Stack Overflow username lookup with OSINT intelligence.",
  howItWorks: (
    <>
      <p>Stack Overflow profiles are publicly accessible at <code>stackoverflow.com/users/[id]/username</code>. OSINT tools query the platform's user search and profile pages to confirm whether an account exists matching a given display name or handle.</p>
      <p>A confirmed Stack Overflow profile reveals the display name, location (if provided), bio, profile photo, reputation score, badge counts, tag expertise, question and answer history, and linked accounts. Stack Overflow's developer focus means profiles often reveal programming languages, frameworks, employer details, and technical specialisation. The reputation system provides a credibility signal — high-reputation users are established contributors.</p>
      <p>FootprintIQ extends this by simultaneously checking the same handle across 500+ other platforms, revealing whether the Stack Overflow identity connects to accounts on GitHub, LinkedIn, Twitter/X, and hundreds of other communities.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Several approaches help locate Stack Overflow profiles when you have a username:</p>
      <ul>
        <li><strong>User search.</strong> Stack Overflow's built-in user search queries display names. FootprintIQ automates this lookup programmatically.</li>
        <li><strong>Google site search.</strong> Searching <code>site:stackoverflow.com/users "username"</code> surfaces matching user profiles.</li>
        <li><strong>Cross-platform pivot.</strong> Developers frequently use matching handles on Stack Overflow, GitHub, and LinkedIn. FootprintIQ identifies these connections automatically.</li>
        <li><strong>Tag-based search.</strong> Filtering Stack Overflow users by technology tags and location narrows results for specific technical profiles.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/find-someone-by-username" className="text-primary hover:underline">guide to finding someone by username</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Stack Overflow profiles provide technical OSINT value for developer-focused investigations:</p>
      <ul>
        <li><strong>Technical profiling.</strong> Tag expertise, answer content, and question history reveal programming languages, frameworks, and technical depth.</li>
        <li><strong>Professional intelligence.</strong> Bio content, employer mentions in answers, and linked LinkedIn profiles provide career data.</li>
        <li><strong>Activity patterns.</strong> Answer timestamps reveal timezone, work schedule, and periods of professional focus.</li>
        <li><strong>Linked account detection.</strong> Stack Overflow profiles often link to GitHub, personal websites, Twitter/X, and LinkedIn — verified linked accounts are displayed publicly.</li>
        <li><strong>Reputation analysis.</strong> Reputation score and badge levels indicate community standing and technical credibility.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide for advanced workflows.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>Stack Overflow username exposure creates specific privacy risks:</p>
      <ul>
        <li><strong>Technical capability exposure.</strong> Question and answer history reveals exact technologies, frameworks, and tools you work with — useful for targeted attacks.</li>
        <li><strong>Employer and project leaks.</strong> Questions about specific codebases, APIs, or infrastructure may inadvertently reveal employer details and internal systems.</li>
        <li><strong>Cross-platform linking.</strong> Verified linked accounts (GitHub, Twitter/X) on Stack Overflow profiles create direct identity bridges.</li>
        <li><strong>Activity scheduling.</strong> Posting patterns reveal work hours and timezone, narrowing geographic location.</li>
      </ul>
      <p>To reduce exposure: use a pseudonym, avoid employer-specific details in questions, review linked accounts, and audit old questions for sensitive project information.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Stack Overflow by username?", a: "Yes. Stack Overflow has a built-in user search feature. FootprintIQ checks Stack Overflow programmatically alongside 500+ other platforms." },
    { q: "Is Stack Overflow username search free?", a: "Yes. FootprintIQ's free tier includes Stack Overflow along with 500+ other platforms. No account required for basic scans." },
    { q: "What does a Stack Overflow profile reveal?", a: "A public Stack Overflow profile shows display name, bio, location, reputation score, badges, tag expertise, question/answer history, and linked accounts." },
    { q: "Can Stack Overflow questions reveal my employer?", a: "Yes. Questions about specific APIs, internal tools, or proprietary systems can inadvertently identify your employer. Review old questions for sensitive details." },
  ],
};

export default function SearchStackoverflowUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
