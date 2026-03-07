import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "TikTok",
  slug: "search-tiktok-username",
  profilePattern: "tiktok.com/@username",
  metaDesc: "Search TikTok usernames to find profiles and discover linked accounts across 500+ platforms. Free TikTok username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>TikTok profiles follow the URL pattern <code>tiktok.com/@username</code>. When you search a TikTok username, the system queries this endpoint and analyses the response to confirm profile existence and public visibility.</p>
      <p>Public TikTok profiles display the username, display name, bio, follower and following counts, total likes, and all public video content. TikTok also allows users to link their Instagram and YouTube accounts — these linked connections are publicly visible on the profile.</p>
      <p>FootprintIQ extends this by checking the same handle across 500+ platforms simultaneously, revealing cross-platform identity connections beyond TikTok's own linked account feature.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>TikTok profiles can be discovered through multiple approaches:</p>
      <ul>
        <li><strong>Direct URL check.</strong> Visit <code>tiktok.com/@username</code> in any browser — no TikTok account required.</li>
        <li><strong>Cross-platform correlation.</strong> TikTok users frequently reuse handles from Instagram, Snapchat, or Discord. Finding the handle on one platform often confirms the TikTok identity.</li>
        <li><strong>Linked account discovery.</strong> TikTok profiles displaying linked Instagram or YouTube accounts create verified cross-platform connections.</li>
        <li><strong>Sound and hashtag search.</strong> Searching specific sounds, hashtags, or trends can surface accounts that participated in specific content.</li>
      </ul>
      <p>For a complete guide, see <Link to="/how-to-find-someone-on-tiktok" className="text-primary hover:underline">how to find someone on TikTok</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>TikTok's video-centric format provides unique OSINT intelligence opportunities:</p>
      <ul>
        <li><strong>Visual intelligence.</strong> Video content reveals physical appearance, voice, accent, room environments, and background details that text-based platforms cannot provide.</li>
        <li><strong>Geolocation indicators.</strong> Background details — street signs, landmarks, vegetation, architecture — provide geographic intelligence even without explicit location tags.</li>
        <li><strong>Engagement analysis.</strong> Duets, stitches, and comment interactions map social connections and community relationships.</li>
        <li><strong>Temporal patterns.</strong> Posting schedules reveal timezone and routine. Content themes indicate lifestyle, occupation, and interests.</li>
        <li><strong>Cross-platform pivoting.</strong> Linked Instagram and YouTube accounts provide direct identity bridges for broader investigation.</li>
      </ul>
      <p>Explore our <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide for advanced workflows.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>TikTok username exposure carries notable privacy implications:</p>
      <ul>
        <li><strong>Visual identity exposure.</strong> Video content reveals physical appearance and voice — significantly more identifying than text-based platforms.</li>
        <li><strong>Handle reuse risk.</strong> The same TikTok handle on Instagram or Snapchat enables instant cross-platform identity correlation.</li>
        <li><strong>Linked account transparency.</strong> Connected Instagram and YouTube accounts are publicly visible, creating explicit identity bridges.</li>
        <li><strong>Content permanence.</strong> Posted videos remain accessible unless explicitly deleted. Even deleted content may persist in third-party caches.</li>
      </ul>
      <p>To reduce exposure: use a unique TikTok handle, set your account to private, unlink external accounts, and disable discoverability features.</p>
    </>
  ),
  faqs: [
    { q: "Can you search TikTok by username without the app?", a: "Yes. TikTok profiles are accessible via web browser at tiktok.com/@username. FootprintIQ performs this lookup programmatically without requiring the app." },
    { q: "Is TikTok username search free?", a: "Yes. FootprintIQ's free tier includes TikTok along with 500+ other platforms." },
    { q: "What does a TikTok username reveal?", a: "A public TikTok profile shows display name, bio, follower/following counts, total likes, public videos, and linked Instagram/YouTube accounts." },
    { q: "Can you find a private TikTok by username?", a: "You can confirm the account exists, but private account content is not accessible. FootprintIQ only queries publicly available data." },
  ],
};

export default function SearchTiktokUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
