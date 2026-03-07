import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "GitHub",
  slug: "search-github-username",
  profilePattern: "github.com/username",
  metaDesc: "Search GitHub usernames to find developer profiles, repositories, and discover linked accounts across 500+ platforms. Free GitHub username lookup with OSINT intelligence.",
  howItWorks: (
    <>
      <p>GitHub profiles are accessible at <code>github.com/username</code>. When you search a GitHub username, the system queries this URL and GitHub's public API to confirm account existence and extract comprehensive profile metadata.</p>
      <p>A public GitHub profile displays the username, display name, bio, profile photo, location, company, website link, email (if shared), follower and following counts, public repositories, contribution graph, and organisation memberships. GitHub profiles are among the most metadata-rich of any platform.</p>
      <p>FootprintIQ extends the GitHub lookup by checking the same handle across 500+ platforms, connecting the developer identity to accounts on Discord, Reddit, Twitter/X, Stack Overflow, and hundreds of other services.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>GitHub profiles can be located through several approaches:</p>
      <ul>
        <li><strong>Direct URL check.</strong> Visit <code>github.com/username</code> to confirm profile existence. GitHub also provides a comprehensive public API for programmatic lookups.</li>
        <li><strong>Cross-platform developer correlation.</strong> GitHub usernames frequently match handles on GitLab, Stack Overflow, npm, and developer forums. FootprintIQ identifies these connections automatically.</li>
        <li><strong>Commit history analysis.</strong> Git commits often contain author email addresses and real names, linking code contributions to personal identity.</li>
        <li><strong>Organisation membership.</strong> Public organisation memberships reveal employer and professional affiliations.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques guide</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>GitHub provides exceptionally rich OSINT intelligence for technical identity analysis:</p>
      <ul>
        <li><strong>Commit email extraction.</strong> Git commits contain author email addresses. Public repository commit histories can reveal personal email addresses, work emails, and email address patterns over time.</li>
        <li><strong>Real name disclosure.</strong> Git commit author names frequently contain real names, even when the GitHub profile uses a pseudonym.</li>
        <li><strong>Technical skill profiling.</strong> Repository languages, frameworks, and project types create detailed technical skill profiles. Contribution patterns indicate experience level and specialisation.</li>
        <li><strong>Employment intelligence.</strong> Organisation memberships, profile company field, and enterprise-pattern commit emails reveal current and past employers.</li>
        <li><strong>Contribution pattern analysis.</strong> The contribution graph reveals working hours, timezone, and activity patterns. Gaps may indicate holidays or job transitions.</li>
        <li><strong>Social graph mapping.</strong> Followers, following, starred repositories, and collaborative contributions map the developer's professional network.</li>
      </ul>
    </>
  ),
  privacyExposure: (
    <>
      <p>GitHub username exposure carries significant privacy implications for developers:</p>
      <ul>
        <li><strong>Email address leakage.</strong> Git commits embed author email addresses. Even if your GitHub profile hides your email, commit history may expose it across every public repository you've contributed to.</li>
        <li><strong>Real name exposure.</strong> Git author names frequently contain full names, linking pseudonymous GitHub accounts to real identities.</li>
        <li><strong>Employment and skill profiling.</strong> Organisation memberships and repository content reveal employer, technical capabilities, and project involvement.</li>
        <li><strong>Cross-platform developer identity.</strong> The same handle on GitHub, GitLab, npm, and Stack Overflow creates a comprehensive developer profile.</li>
      </ul>
      <p>To reduce exposure: configure Git to use a noreply email, use a separate handle for personal projects, review commit history for leaked emails, and audit organisation memberships.</p>
    </>
  ),
  faqs: [
    { q: "Can you search GitHub by username?", a: "Yes. GitHub profiles are accessible at github.com/username and via public API. FootprintIQ checks GitHub alongside 500+ platforms simultaneously." },
    { q: "Is GitHub username search free?", a: "Yes. FootprintIQ's free tier includes GitHub and 500+ other platforms." },
    { q: "What does a GitHub username reveal?", a: "A GitHub profile can reveal display name, bio, location, company, website, email, repositories, contribution history, and organisation memberships — one of the most metadata-rich profiles of any platform." },
    { q: "Can you find someone's email from their GitHub?", a: "If the user hasn't configured a noreply email, their commit history may contain personal or work email addresses. The profile may also display an email if the user has chosen to make it public." },
  ],
};

export default function SearchGithubUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
