import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "GitHub",
  slug: "search-github-username",
  profilePattern: "github.com/username",
  metaDesc: "Search GitHub usernames to find developer profiles, repositories, and discover linked accounts across 500+ platforms. Free GitHub username lookup with OSINT intelligence.",
  howItWorks: (
    <>
      <p>GitHub profiles are accessible at <code>github.com/username</code>. When you search a GitHub username, the system queries both this URL and GitHub's public REST API to confirm account existence and extract comprehensive profile metadata. GitHub's API provides structured data including profile fields, repository lists, contribution statistics, and organisation memberships.</p>
      <p>A public GitHub profile displays the username, display name, bio, profile photo, location, company, website link, email (if shared), follower and following counts, public repositories, contribution graph, pinned projects, and organisation memberships. GitHub profiles are among the most metadata-rich of any platform — providing professional, technical, and sometimes personal intelligence in a single profile page.</p>
      <p>FootprintIQ extends the GitHub lookup by checking the same handle across 500+ platforms, connecting the developer identity to accounts on Discord, Reddit, Twitter/X, Stack Overflow, LinkedIn, and hundreds of other services. For developers, this cross-platform scan reveals the full scope of their professional and personal digital presence.</p>
      <p>Critically, GitHub's intelligence value extends beyond the profile page itself. Git commit histories embedded in public repositories contain author names and email addresses that may differ from the profile display — creating additional identity data points that standard profile scraping misses.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Investigators use several approaches to locate and verify GitHub accounts:</p>
      <ul>
        <li><strong>Direct URL and API check.</strong> Visit <code>github.com/username</code> or query the public API at <code>api.github.com/users/username</code> to confirm profile existence and extract structured metadata. FootprintIQ automates both approaches.</li>
        <li><strong>Cross-platform developer correlation.</strong> GitHub usernames frequently match handles on GitLab, Bitbucket, Stack Overflow, npm, PyPI, and developer forums. A <Link to="/reverse-username-search" className="text-primary hover:underline">reverse username lookup</Link> identifies these connections automatically.</li>
        <li><strong>Commit history email extraction.</strong> Git commits in public repositories contain author email addresses and real names — linking code contributions to personal identity even when the profile uses a pseudonym.</li>
        <li><strong>Organisation membership analysis.</strong> Public organisation memberships reveal current and past employers, open-source affiliations, and professional community involvement.</li>
        <li><strong>Package registry correlation.</strong> npm, PyPI, RubyGems, and other package registries link published packages to GitHub accounts, providing alternative discovery pathways.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques guide</Link>.</p>
    </>
  ),
  usernameReuse: (
    <>
      <p>GitHub handles occupy a unique position in the username reuse ecosystem. Developers who establish their identity on GitHub typically extend the same handle to GitLab, Stack Overflow, npm, Twitter/X, Discord, and personal domains — creating a professional identity chain that a <Link to="/username-search" className="text-primary hover:underline">username search tool</Link> can map comprehensively.</p>
      <p>This reuse pattern is particularly prevalent because GitHub functions as a professional portfolio. Developers are incentivised to maintain handle consistency so that employers, collaborators, and open-source contributors can find them across platforms. The same incentive that aids discoverability also creates a complete identity correlation pathway.</p>
      <p>The developer ecosystem amplifies reuse through package registries. Publishing an npm package, a PyPI module, or a Docker image under a GitHub username creates permanent, indexed records that connect the handle to specific technical work — records that persist even if the GitHub profile is later made private.</p>
      <p>GitHub-to-Reddit and GitHub-to-Discord correlations are especially common among developers who participate in open-source communities. These communities encourage members to share their GitHub profiles, creating voluntary identity disclosures that complement automated username enumeration.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>GitHub provides exceptionally rich OSINT intelligence for technical identity analysis:</p>
      <ul>
        <li><strong>Commit email extraction.</strong> Git commits contain author email addresses. Public repository commit histories can reveal personal emails, work emails, and email address patterns over time — even when the profile email is hidden.</li>
        <li><strong>Real name disclosure.</strong> Git commit author names frequently contain real names, even when the GitHub profile uses a pseudonym. Inconsistencies between profile display name and commit author name are investigatively significant.</li>
        <li><strong>Technical skill profiling.</strong> Repository languages, frameworks, dependency choices, and project types create detailed technical skill profiles. Contribution patterns indicate experience level, specialisation, and career trajectory.</li>
        <li><strong>Employment intelligence.</strong> Organisation memberships, profile company field, enterprise-pattern commit emails (e.g., user@company.com), and contribution timing patterns reveal current and past employers.</li>
        <li><strong>Contribution graph analysis.</strong> The contribution heatmap reveals working hours, timezone, weekend activity, and vacation patterns. Sustained activity during business hours in a specific timezone provides strong geolocation evidence.</li>
        <li><strong>Social graph mapping.</strong> Followers, following, starred repositories, and collaborative contributions map the developer's professional network and community influence.</li>
      </ul>
    </>
  ),
  privacyExposure: (
    <>
      <p>GitHub username exposure carries significant privacy implications for developers and technical professionals:</p>
      <ul>
        <li><strong>Email address leakage.</strong> Git commits embed author email addresses. Even if your GitHub profile hides your email, commit history may expose personal and work email addresses across every public repository you've contributed to.</li>
        <li><strong>Real name exposure.</strong> Git author names frequently contain full legal names, linking pseudonymous GitHub accounts to real identities. A <Link to="/check-my-digital-footprint" className="text-primary hover:underline">digital footprint check</Link> reveals whether your commit history contains identifying information.</li>
        <li><strong>Employment and skill profiling.</strong> Organisation memberships, repository content, and commit email domains reveal current employer, technical capabilities, project involvement, and career history.</li>
        <li><strong>Cross-platform developer identity.</strong> The same handle on GitHub, GitLab, npm, Stack Overflow, and dev.to creates a comprehensive developer profile that connects code contributions to community activity and opinions.</li>
        <li><strong>Contribution timing analysis.</strong> Commit timestamps reveal timezone, working hours, and availability patterns — providing geographic and lifestyle intelligence.</li>
      </ul>
      <p>To reduce exposure: configure Git to use a noreply email address, use a separate handle for personal projects, review commit history for leaked emails and real names, audit organisation memberships, and check package registry records.</p>
    </>
  ),
  faqs: [
    { q: "Can you search GitHub by username?", a: "Yes. GitHub profiles are accessible at github.com/username and via public API. FootprintIQ checks GitHub alongside 500+ platforms simultaneously." },
    { q: "Is GitHub username search free?", a: "Yes. FootprintIQ's free tier includes GitHub and 500+ other platforms. No account or payment required." },
    { q: "What does a GitHub username reveal?", a: "A GitHub profile reveals display name, bio, location, company, website, email, repositories, contribution history, organisation memberships, and social connections — one of the most metadata-rich profiles of any platform." },
    { q: "Can you find someone's email from their GitHub?", a: "If the user hasn't configured a noreply email, their commit history may contain personal or work email addresses. The profile may also display an email if the user has chosen to make it public." },
    { q: "How do investigators analyse GitHub accounts?", a: "Investigators examine commit history for emails and real names, analyse contribution patterns for timezone intelligence, review organisation memberships, and correlate the handle across developer platforms." },
    { q: "Can GitHub commits reveal your real name?", a: "Yes. Git commit author fields frequently contain real names, even when the GitHub profile uses a pseudonym. Historical commits may contain names from before the user configured their Git identity." },
    { q: "Does GitHub show who viewed your profile?", a: "No. GitHub does not notify users when someone views their profile or repositories. OSINT analysis of public GitHub data is entirely passive." },
    { q: "How can I protect my GitHub privacy?", a: "Configure Git to use GitHub's noreply email, audit commit history for leaked personal information, use separate handles for personal and professional work, and review organisation memberships." },
  ],
};

export default function SearchGithubUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
