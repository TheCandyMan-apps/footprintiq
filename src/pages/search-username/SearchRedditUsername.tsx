import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Reddit",
  slug: "search-reddit-username",
  profilePattern: "reddit.com/user/username",
  metaDesc: "Search Reddit usernames to find profiles, post history, and discover linked accounts across 500+ platforms. Free Reddit username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>Reddit profiles follow the URL pattern <code>reddit.com/user/username</code>. When you search a Reddit username, OSINT tools query this endpoint and analyse the response to confirm account existence, public visibility, and activity status. A 200 response confirms the profile exists; a 404 indicates the handle is available or has been permanently deleted.</p>
      <p>Public Reddit profiles display the username, karma scores (post and comment karma separately), account creation date, post history, comment history, active subreddits, and any trophies or awards. Reddit's pseudonymous nature makes it uniquely valuable for OSINT — users share candid opinions, personal details, and location information in context-specific communities where they feel protected by anonymity.</p>
      <p>FootprintIQ extends the Reddit lookup by simultaneously checking the same handle across 500+ other platforms, revealing whether the Reddit identity connects to accounts on Instagram, Discord, GitHub, Steam, and hundreds of other services. This cross-platform correlation is particularly powerful because Reddit users who maintain pseudonymity on Reddit often use the same handle on less anonymous platforms.</p>
      <p>The system also flags suspended and shadowbanned accounts, which return distinct response patterns. This status intelligence helps investigators understand whether an account was removed for policy violations — a relevant data point in threat assessment and abuse investigation workflows.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Investigators use multiple techniques to locate and verify Reddit accounts:</p>
      <ul>
        <li><strong>Direct profile URL.</strong> Navigate to <code>reddit.com/user/username</code> to confirm existence and review public activity. FootprintIQ automates this check alongside 500+ other platforms.</li>
        <li><strong>Cross-platform handle reuse.</strong> Many Reddit users reuse their handle on gaming platforms, Discord, and forums. A <Link to="/reverse-username-search" className="text-primary hover:underline">reverse username lookup</Link> identifies these connections automatically.</li>
        <li><strong>Content search and indexing.</strong> Reddit posts are extensively indexed by Google and third-party archival services. Searching <code>site:reddit.com "username"</code> surfaces posts and comments even if the user has since deleted them from their profile.</li>
        <li><strong>Subreddit participation mapping.</strong> If you know someone's interests, profession, or location, checking relevant subreddits — particularly local community, industry, or hobby subreddits — may surface their activity through posting patterns.</li>
        <li><strong>Award and trophy analysis.</strong> Reddit trophies indicate account age, verification status, and participation in specific events — providing temporal and behavioural intelligence.</li>
      </ul>
      <p>For detailed methodology, see our <Link to="/how-to-find-someone-on-reddit" className="text-primary hover:underline">guide to finding someone on Reddit</Link>.</p>
    </>
  ),
  usernameReuse: (
    <>
      <p>Reddit presents a unique case for username reuse analysis. Many users create Reddit accounts with the same handle they use on gaming platforms, Discord servers, and community forums — often assuming that Reddit's pseudonymous culture protects them from identity correlation. This assumption is incorrect when the same handle appears on platforms that require real-name verification or display profile photos.</p>
      <p>The gaming-to-Reddit pipeline is particularly common. Users who choose a handle for Steam, Xbox Live, or PlayStation Network frequently carry it to Reddit, Discord, and Twitch. FootprintIQ's <Link to="/username-search" className="text-primary hover:underline">username search tool</Link> detects these cross-platform patterns automatically, connecting pseudonymous Reddit activity to identifiable gaming and social media profiles.</p>
      <p>Even when Reddit users choose a unique handle, they sometimes reference their other platform identities in comments, flair text, or subreddit-specific profile fields. These self-disclosures create manual correlation points that complement automated username enumeration.</p>
      <p>Professional subreddits add another dimension. Developers who use the same handle on Reddit and GitHub inadvertently link their candid Reddit opinions to their professional coding identity — a connection that can surface during employer background checks.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Reddit provides uniquely rich intelligence due to its pseudonymous, discussion-based format:</p>
      <ul>
        <li><strong>Content analysis.</strong> Post and comment histories reveal opinions, expertise areas, personal anecdotes, and geographic indicators over extended timeframes. Years of commenting create a detailed psychological and demographic profile.</li>
        <li><strong>Subreddit mapping.</strong> Active communities reveal interests, profession, location, and lifestyle. Local subreddits directly indicate geographic area. Professional subreddits confirm industry and expertise.</li>
        <li><strong>Temporal pattern analysis.</strong> Posting times indicate timezone. Consistent activity during specific hours suggests work schedules, sleep patterns, and daily routines — particularly useful for geolocation inference.</li>
        <li><strong>Writing style fingerprinting.</strong> Vocabulary, spelling conventions (British vs. American English), technical jargon, and sentence structure can link pseudonymous Reddit accounts to known identities or accounts on other platforms.</li>
        <li><strong>Self-disclosed information aggregation.</strong> Reddit users frequently share personal details — job title, education, city, relationship status, medical conditions — in relevant comment threads. Individually innocuous, these disclosures aggregate into comprehensive personal profiles over time.</li>
      </ul>
      <p>Explore our <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide for advanced investigation workflows.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>Reddit username exposure carries significant risks precisely because users treat the platform as pseudonymous:</p>
      <ul>
        <li><strong>Pseudonymity collapse.</strong> If your Reddit username matches handles on non-anonymous platforms like Instagram or LinkedIn, your pseudonymous Reddit activity becomes linked to your real identity. A single <Link to="/check-my-digital-footprint" className="text-primary hover:underline">digital footprint check</Link> reveals this exposure instantly.</li>
        <li><strong>Content permanence.</strong> Reddit posts and comments persist indefinitely unless manually deleted — and even deleted content often survives in web archives, cached search results, and third-party indexing services.</li>
        <li><strong>Self-disclosure aggregation.</strong> Individual comments sharing small personal details are harmless alone, but aggregated across hundreds of posts over years they compose a detailed personal profile including location, employer, education, family status, and political views.</li>
        <li><strong>Alt account discovery.</strong> Similar writing styles, overlapping subreddit activity, and correlated posting schedules between accounts can link main and alternative accounts, collapsing compartmentalised identities.</li>
        <li><strong>Employer and background check risk.</strong> Controversial opinions, workplace complaints, and candid personal disclosures on Reddit can surface during professional background checks when the handle is correlated to a real identity.</li>
      </ul>
      <p>To reduce exposure: use a unique handle for Reddit, periodically review and delete old posts, avoid sharing identifying details in comments, and maintain strict separation between Reddit and professional identities.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Reddit by username?", a: "Yes. Reddit profiles are publicly accessible at reddit.com/user/username. FootprintIQ checks Reddit alongside 500+ platforms simultaneously to reveal cross-platform connections." },
    { q: "Is Reddit username search free?", a: "Yes. FootprintIQ's free tier includes Reddit and 500+ other platforms. No account or payment required." },
    { q: "Can you see someone's Reddit post history?", a: "Yes, if the account is public. Reddit displays full post and comment history unless content has been deleted by the user or removed by moderators." },
    { q: "Can you find a Reddit account by email?", a: "Reddit does not publicly link emails to profiles. However, breach databases may correlate email addresses with Reddit usernames. FootprintIQ only accesses publicly available data." },
    { q: "How do OSINT investigators analyse Reddit accounts?", a: "Investigators examine post history, comment patterns, subreddit participation, posting times, writing style, and self-disclosed personal details to build a profile. Cross-platform username correlation extends this analysis." },
    { q: "Can deleted Reddit posts still be found?", a: "Often yes. Third-party archival services and cached search results may retain deleted content. Users should assume that published Reddit content may persist indefinitely." },
    { q: "Does Reddit show who viewed your profile?", a: "No. Reddit does not notify users when someone views their profile. OSINT analysis of public Reddit profiles leaves no trace on the target account." },
    { q: "How can I protect my Reddit identity?", a: "Use a unique handle, avoid sharing identifying details, periodically purge old comments, and never link your Reddit account to platforms that use your real name." },
  ],
};

export default function SearchRedditUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
