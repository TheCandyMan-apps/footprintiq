import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Hacker News",
  slug: "search-hackernews-username",
  profilePattern: "news.ycombinator.com/user?id=username",
  metaDesc: "Search Hacker News usernames to find tech profiles and discover linked accounts across 500+ platforms. Free HN username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>Hacker News profiles are publicly accessible at <code>news.ycombinator.com/user?id=username</code>. OSINT tools query this URL to confirm whether an account exists and has public activity.</p>
      <p>A confirmed Hacker News profile reveals the username, karma score, account creation date, bio (about field), and complete submission and comment history. Hacker News is Y Combinator's tech community — its users include startup founders, engineers, researchers, and investors. The "about" field commonly contains links to personal websites, GitHub profiles, and email addresses.</p>
      <p>FootprintIQ extends this by checking the same handle across 500+ platforms, revealing connections to GitHub, Twitter/X, LinkedIn, and other developer communities.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Approaches for locating Hacker News profiles:</p>
      <ul>
        <li><strong>Direct URL check.</strong> Navigate to <code>news.ycombinator.com/user?id=username</code>. FootprintIQ automates this.</li>
        <li><strong>Cross-platform pivot.</strong> HN users frequently use matching handles on GitHub, Twitter/X, and personal domains.</li>
        <li><strong>Algolia search.</strong> Hacker News comments and submissions are searchable via hn.algolia.com.</li>
        <li><strong>About field analysis.</strong> HN bios frequently contain email addresses, website links, and GitHub profiles.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/find-someone-by-username" className="text-primary hover:underline">guide to finding someone by username</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Hacker News usernames provide professional OSINT value:</p>
      <ul>
        <li><strong>Professional intelligence.</strong> Comment history reveals technical expertise, employer mentions, and career trajectory.</li>
        <li><strong>About field links.</strong> Email addresses, personal websites, and GitHub profiles in the bio provide direct pivot points.</li>
        <li><strong>Opinion analysis.</strong> Years of comments on tech, business, and policy topics create a detailed opinion profile.</li>
        <li><strong>Karma and tenure.</strong> High karma and long account age indicate established community members.</li>
        <li><strong>Startup connections.</strong> Show HN posts and YC-related comments reveal startup ecosystem involvement.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>Hacker News username exposure creates privacy risks:</p>
      <ul>
        <li><strong>Comment permanence.</strong> Every comment is permanently indexed and searchable via Algolia.</li>
        <li><strong>Opinion trail.</strong> Years of technical and political opinions create a detailed, searchable profile.</li>
        <li><strong>About field data.</strong> Email addresses and website links in bios provide direct identity information.</li>
        <li><strong>Employer disclosure.</strong> Comments about workplace experiences, projects, and technologies can reveal employers.</li>
      </ul>
      <p>To reduce exposure: audit your about field, review old comments for sensitive disclosures, and use a unique handle.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Hacker News by username?", a: "Yes. HN profiles are accessible at news.ycombinator.com/user?id=username. FootprintIQ checks this alongside 500+ platforms." },
    { q: "Is Hacker News username search free?", a: "Yes. FootprintIQ's free tier includes Hacker News along with 500+ other platforms." },
    { q: "What does a Hacker News profile reveal?", a: "A public HN profile shows username, karma, account age, about field (often with email and website), and complete comment/submission history." },
    { q: "Are Hacker News comments permanent?", a: "Yes. All comments are permanently indexed and searchable. Deleted comments may still appear in third-party archives." },
  ],
};

export default function SearchHackernewsUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
