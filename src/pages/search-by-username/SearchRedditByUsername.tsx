import { Link } from "react-router-dom";
import { SearchByUsernameTemplate, type SearchByUsernamePlatformConfig } from "@/components/templates/SearchByUsernameTemplate";

const config: SearchByUsernamePlatformConfig = {
  platform: "Reddit",
  slug: "search-reddit-by-username",
  urlPattern: "reddit.com/user/username",
  titleSuffix: "Find Reddit Profiles",
  metaDesc: "Search Reddit by username to find profiles and discover linked accounts across 500+ platforms. Free Reddit username lookup with cross-platform OSINT scanning.",
  howItWorks: (
    <>
      <p>Reddit profiles are accessible at <code>reddit.com/user/username</code>. When you search Reddit by username, OSINT tools query this URL and analyse the response to determine whether the account exists and is active.</p>
      <p>Reddit is pseudonymous by design — users rarely attach real names. However, the cumulative effect of months or years of posts and comments creates a detailed profile: interests, expertise areas, geographic hints, workplace references, and personal opinions accumulate into a surprisingly comprehensive identity picture.</p>
      <p>FootprintIQ checks the Reddit username and simultaneously scans 500+ additional platforms. This reveals whether the pseudonymous Reddit identity connects to more identifiable accounts elsewhere — bridging the gap between anonymous activity and a publicly attributable online presence.</p>
    </>
  ),
  canYouFind: (
    <>
      <p>Yes. Reddit profiles are publicly accessible by default. Unless an account has been deleted or suspended, visiting <code>reddit.com/user/username</code> displays the user's post and comment history, karma score, account age, and any profile customisation they've added.</p>
      <p>To find someone on Reddit by username:</p>
      <ol>
        <li><strong>Enter the exact handle.</strong> FootprintIQ checks Reddit and 500+ other platforms, returning results with confidence scores.</li>
        <li><strong>Analyse the Reddit profile.</strong> Public post and comment history reveals interests, subreddit activity, and disclosed personal details.</li>
        <li><strong>Cross-reference with other platforms.</strong> If the same handle appears on Instagram, Twitter/X, or GitHub, the combined data provides a much richer identity picture.</li>
        <li><strong>Search handle variations.</strong> Reddit allows underscores and numbers — search common variations to capture accounts the primary lookup may miss.</li>
      </ol>
      <p>See our <Link to="/reverse-username-search" className="text-primary hover:underline">reverse username search</Link> guide for advanced techniques.</p>
    </>
  ),
  osintTechniques: (
    <>
      <p>When investigating Reddit usernames, professionals employ several complementary techniques:</p>
      <ul>
        <li><strong>Username pivoting.</strong> Using the Reddit handle as a seed to enumerate presence across all indexed platforms.</li>
        <li><strong>Content analysis.</strong> Reviewing public post history for disclosed personal details — location references, workplace mentions, timezone indicators, and linguistic patterns.</li>
        <li><strong>Subreddit profiling.</strong> The subreddits a user frequents reveal professional expertise, geographic connections, hobbies, and personal circumstances.</li>
        <li><strong>Temporal analysis.</strong> Posting times and activity windows indicate timezone and daily routine, narrowing geographic possibilities.</li>
        <li><strong>Writing style analysis.</strong> Consistent vocabulary, spelling conventions, and communication style can link Reddit accounts to profiles on other platforms.</li>
      </ul>
      <p>These workflows are automated in FootprintIQ's pipeline. Learn more about <Link to="/username-osint-techniques" className="text-primary hover:underline">username OSINT techniques</Link>.</p>
    </>
  ),
  privacyTips: (
    <>
      <p>To reduce your Reddit-related digital exposure:</p>
      <ul>
        <li><strong>Use a unique Reddit handle.</strong> Don't reuse it on platforms where your real identity is visible — this is the single most effective step.</li>
        <li><strong>Audit your post history.</strong> Review old posts and comments for accidentally disclosed personal information: addresses, workplaces, or identifiable anecdotes.</li>
        <li><strong>Minimise profile details.</strong> Reddit's profile fields (avatar, banner, bio) are optional. Share as little as possible.</li>
        <li><strong>Consider periodic account rotation.</strong> For privacy-sensitive users, new accounts periodically prevent the accumulation of a long, analysable comment history.</li>
        <li><strong>Delete dormant alt accounts.</strong> Old accounts on other platforms still carry your username and contribute to your digital footprint.</li>
      </ul>
      <p>Run a <Link to="/digital-footprint-checker" className="text-primary hover:underline">digital footprint check</Link> to see your full online exposure.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Reddit by username for free?", a: "Yes. FootprintIQ offers free scans covering Reddit and 500+ other platforms. No registration required." },
    { q: "Does Reddit show your real identity?", a: "Reddit doesn't require real names. However, post history, writing style, and disclosed details can collectively reveal significant personal information over time." },
    { q: "Can you see deleted Reddit posts through a username search?", a: "FootprintIQ checks live profile availability — it does not access deleted or removed content. Third-party archive services may retain cached content independently." },
    { q: "How do I find all accounts linked to a Reddit username?", a: "Enter the Reddit username into FootprintIQ. It checks whether the same handle exists across social media, gaming, developer, and forum platforms with confidence scoring." },
    { q: "Is Reddit username search legal?", a: "Yes. Reddit profiles are publicly accessible. Searching publicly available URLs is legal and does not violate Reddit's terms of service." },
  ],
};

export default function SearchRedditByUsername() {
  return <SearchByUsernameTemplate config={config} />;
}
