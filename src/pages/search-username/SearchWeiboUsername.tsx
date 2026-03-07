import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Weibo",
  slug: "search-weibo-username",
  profilePattern: "weibo.com/username",
  metaDesc: "Search Weibo usernames to find profiles and discover linked accounts across 500+ platforms. Free Sina Weibo username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>Weibo profiles are accessible at <code>weibo.com/username</code> or via numeric user IDs. OSINT tools query these endpoints and analyse the response to confirm whether a profile exists and what information is publicly visible.</p>
      <p>Sina Weibo is China's dominant microblogging platform with over 580 million monthly active users. A public Weibo profile reveals the display name, verified status, bio, profile photo, follower and following counts, post history, and interaction metrics. Weibo's verified account system (blue and orange badges) provides additional identity confirmation. The platform's short-form post format, similar to Twitter/X, produces dense content trails.</p>
      <p>FootprintIQ extends this by simultaneously checking the same handle across 500+ other platforms, revealing whether the Weibo identity connects to accounts on other Chinese platforms (Zhihu, Bilibili) and international services like Twitter/X, Instagram, and LinkedIn.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Several approaches help locate Weibo profiles when you have a username:</p>
      <ul>
        <li><strong>Direct URL check.</strong> Navigate to <code>weibo.com/username</code> to check for a profile. FootprintIQ automates this lookup programmatically.</li>
        <li><strong>Weibo search.</strong> Weibo's built-in search queries display names and handles. Results can be filtered by verified status and account type.</li>
        <li><strong>Cross-platform pivot.</strong> Users active on both Chinese and international platforms may use matching handles. FootprintIQ's multi-platform search identifies these connections automatically.</li>
        <li><strong>Google and Baidu search.</strong> Searching <code>site:weibo.com "username"</code> on both Google and Baidu surfaces profiles and public posts.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/find-someone-by-username" className="text-primary hover:underline">guide to finding someone by username</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Weibo profiles provide unique OSINT value for investigations involving Chinese-language digital identities:</p>
      <ul>
        <li><strong>Identity verification.</strong> Weibo's verified account system (for celebrities, organisations, and media) provides additional identity confirmation layers.</li>
        <li><strong>Content analysis.</strong> Post history, reposts, and comments reveal opinions, interests, professional activity, and social connections.</li>
        <li><strong>Network mapping.</strong> Follower/following relationships, comment threads, and repost chains map social and professional networks.</li>
        <li><strong>Geographic indicators.</strong> Location tags, local event references, and IP-based location badges (introduced in 2022) provide geographic intelligence.</li>
        <li><strong>Cross-platform bridge.</strong> Weibo profiles may connect to other Chinese platforms (WeChat, Zhihu, Douyin) and international services, bridging separate digital ecosystems.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide for advanced workflows.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>Weibo username exposure creates specific privacy risks:</p>
      <ul>
        <li><strong>IP-based location disclosure.</strong> Since 2022, Weibo displays IP-based location badges on posts, revealing the province or country of the poster.</li>
        <li><strong>Cross-ecosystem identity linking.</strong> Matching handles across Chinese and international platforms connect separate digital identities.</li>
        <li><strong>Content permanence.</strong> Public posts, reposts, and comments create a searchable archive of opinions and interactions.</li>
        <li><strong>Network exposure.</strong> Follower/following lists and interaction patterns reveal social and professional connections.</li>
      </ul>
      <p>To reduce exposure: use a unique handle, review privacy settings, audit old posts, and be aware that IP-based location tags are automatically applied.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Weibo by username?", a: "Yes. Weibo profiles are accessible at weibo.com/username. FootprintIQ checks this endpoint programmatically alongside 500+ other platforms." },
    { q: "Is Weibo username search free?", a: "Yes. FootprintIQ's free tier includes Weibo along with 500+ other platforms. No account required for basic scans." },
    { q: "What does a Weibo profile reveal?", a: "A public Weibo profile shows display name, verified status, bio, profile photo, follower/following counts, post history, and IP-based location badges." },
    { q: "Is Weibo accessible outside China?", a: "Yes. Weibo is accessible internationally, though some features may require a Chinese phone number. FootprintIQ checks Weibo as part of its global platform coverage." },
  ],
};

export default function SearchWeiboUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
