import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Reddit",
  slug: "search-reddit-username",
  profilePattern: "reddit.com/user/username",
  metaDesc: "Search Reddit usernames to find profiles, post history, and linked accounts across 500+ platforms. Free Reddit username lookup with OSINT intelligence.",
  howItWorks: (
    <>
      <p>Reddit profiles follow the URL pattern <code>reddit.com/user/username</code>. When you search a Reddit username, OSINT tools query this endpoint and analyse the response to confirm account existence and public activity.</p>
      <p>Public Reddit profiles display the username, karma scores, account age, post history, comment history, and active subreddits. Reddit's pseudonymous nature makes it particularly valuable for OSINT — users share candid opinions, personal details, and location information in context-specific communities.</p>
      <p>FootprintIQ extends the Reddit lookup by simultaneously checking the same handle across 500+ other platforms, revealing whether the Reddit identity connects to accounts on Instagram, Discord, GitHub, Steam, and hundreds of other services.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Reddit profiles can be located through several methods:</p>
      <ul>
        <li><strong>Direct profile URL.</strong> Navigate to <code>reddit.com/user/username</code> to confirm existence and review public activity.</li>
        <li><strong>Cross-platform handle reuse.</strong> Many Reddit users reuse their handle on gaming platforms, Discord, and forums. FootprintIQ identifies these connections automatically.</li>
        <li><strong>Content search.</strong> Reddit's search function and third-party tools can locate posts and comments containing specific terms, helping identify accounts by content rather than username.</li>
        <li><strong>Subreddit participation.</strong> If you know someone's interests or location, checking relevant subreddits may surface their activity.</li>
      </ul>
      <p>For detailed methodology, see our <Link to="/how-to-find-someone-on-reddit" className="text-primary hover:underline">guide to finding someone on Reddit</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Reddit provides uniquely rich intelligence due to its pseudonymous, discussion-based format:</p>
      <ul>
        <li><strong>Content analysis.</strong> Post and comment histories reveal opinions, expertise areas, personal anecdotes, and geographic indicators over extended timeframes.</li>
        <li><strong>Subreddit mapping.</strong> Active communities reveal interests, profession, location, and lifestyle. Local subreddits directly indicate geographic area.</li>
        <li><strong>Temporal patterns.</strong> Posting times indicate timezone. Consistent activity during specific hours suggests work schedules and daily routines.</li>
        <li><strong>Writing style analysis.</strong> Vocabulary, spelling conventions, and technical jargon can link pseudonymous accounts to known identities or other platforms.</li>
        <li><strong>Self-disclosed information.</strong> Reddit users frequently share personal details — job, education, city, relationships — in relevant comment threads.</li>
      </ul>
      <p>Explore our <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide for advanced investigation workflows.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>Reddit username exposure carries specific risks due to the platform's candid nature:</p>
      <ul>
        <li><strong>Pseudonymity collapse.</strong> If your Reddit username matches handles on non-anonymous platforms, your pseudonymous Reddit activity becomes linked to your real identity.</li>
        <li><strong>Content permanence.</strong> Reddit posts and comments persist indefinitely unless manually deleted. Years of candid posting can be aggregated into a detailed personal profile.</li>
        <li><strong>Self-disclosure aggregation.</strong> Individual comments sharing small personal details are harmless alone, but aggregated across hundreds of posts they can reveal comprehensive personal information.</li>
        <li><strong>Alt account discovery.</strong> Similar writing styles and subreddit overlap between accounts can link main and alt accounts.</li>
      </ul>
      <p>To reduce exposure: use a unique handle for Reddit, periodically review and delete old posts, and avoid sharing identifying details in comments.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Reddit by username?", a: "Yes. Reddit profiles are publicly accessible at reddit.com/user/username. FootprintIQ checks Reddit alongside 500+ platforms simultaneously." },
    { q: "Is Reddit username search free?", a: "Yes. FootprintIQ's free tier includes Reddit and 500+ other platforms. No account required." },
    { q: "Can you see someone's Reddit post history?", a: "Yes, if the account is public. Reddit displays full post and comment history unless content has been deleted by the user or removed by moderators." },
    { q: "Can you find a Reddit account by email?", a: "Reddit does not publicly link emails to profiles. However, breach databases may correlate email addresses with Reddit usernames." },
  ],
};

export default function SearchRedditUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
