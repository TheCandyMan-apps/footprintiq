import { Link } from "react-router-dom";
import { SearchByUsernameTemplate, type SearchByUsernamePlatformConfig } from "@/components/templates/SearchByUsernameTemplate";

const config: SearchByUsernamePlatformConfig = {
  platform: "YouTube",
  slug: "search-youtube-by-username",
  urlPattern: "youtube.com/@handle",
  titleSuffix: "Find YouTube Channels",
  metaDesc: "Search YouTube by username to find channels and discover linked accounts across 500+ platforms. Free YouTube username lookup with cross-platform OSINT scanning.",
  howItWorks: (
    <>
      <p>YouTube channels are accessible at <code>youtube.com/@handle</code>. When you search YouTube by username, OSINT tools query this URL and verify whether the channel exists and is publicly accessible.</p>
      <p>Public YouTube channels expose a wealth of information: channel name, handle, subscriber count, join date, description, featured channels, linked social accounts, and all public video content. Comments left on other channels are also publicly visible and searchable.</p>
      <p>FootprintIQ extends the YouTube lookup by simultaneously checking the same handle across 500+ additional platforms. Content creators typically maintain the same handle across YouTube, Twitter/X, Instagram, TikTok, and Twitch — making YouTube a reliable starting point for comprehensive cross-platform enumeration.</p>
    </>
  ),
  canYouFind: (
    <>
      <p>Yes. YouTube channels are publicly accessible by default. The @handle system provides a standardised, searchable identifier for every channel.</p>
      <ol>
        <li><strong>Search the YouTube handle.</strong> Enter the handle (without the @) into FootprintIQ for cross-platform enumeration across 500+ platforms.</li>
        <li><strong>Review confidence-scored results.</strong> Each match is rated based on corroborating signals — bio similarity, profile image matching, and linked URLs.</li>
        <li><strong>Check the channel's About section.</strong> YouTube channels often list links to other social profiles, providing direct confirmation of cross-platform identity.</li>
        <li><strong>Search handle variants.</strong> Creators sometimes use abbreviated or extended versions of their handle on different platforms.</li>
      </ol>
      <p>Our <Link to="/reverse-username-search" className="text-primary hover:underline">reverse username search</Link> guide covers advanced techniques.</p>
    </>
  ),
  osintTechniques: (
    <>
      <p>When researching a YouTube handle, investigators combine automated scanning with manual analysis:</p>
      <ul>
        <li><strong>Username pivoting.</strong> Using the YouTube handle as a seed to enumerate accounts across all indexed platforms.</li>
        <li><strong>Channel metadata analysis.</strong> Reviewing descriptions, featured channels, and linked social accounts for direct identity connections.</li>
        <li><strong>Comment history review.</strong> Public comments on other channels reveal interests and opinions not visible on the user's own channel.</li>
        <li><strong>Upload pattern analysis.</strong> Video upload frequency and timing indicate timezone, routine, and activity level.</li>
        <li><strong>Collaboration network mapping.</strong> Featured channels and collaboration videos reveal professional and personal connections.</li>
      </ul>
      <p>Learn more about <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques for username investigation</Link>.</p>
    </>
  ),
  privacyTips: (
    <>
      <p>To minimise your YouTube-related exposure:</p>
      <ul>
        <li><strong>Use a unique handle.</strong> If your YouTube channel is personal, avoid using the same handle on platforms where you share more sensitive content.</li>
        <li><strong>Review your channel description.</strong> Remove personal details — real name, location, email — that aren't essential.</li>
        <li><strong>Audit linked accounts.</strong> Check the Links section and remove social profiles you don't want publicly associated.</li>
        <li><strong>Manage comment visibility.</strong> Your public comments on other channels are part of your digital footprint — review and remove those revealing personal information.</li>
        <li><strong>Set video visibility.</strong> Use unlisted or private settings for videos not intended for public discovery.</li>
      </ul>
      <p>Use FootprintIQ's <Link to="/digital-footprint-checker" className="text-primary hover:underline">digital footprint checker</Link> for a comprehensive view of your online exposure.</p>
    </>
  ),
  faqs: [
    { q: "Can you search YouTube by username for free?", a: "Yes. FootprintIQ's free scan checks YouTube and 500+ other platforms simultaneously. No registration required." },
    { q: "What's the difference between a YouTube handle and channel name?", a: "A handle (prefixed with @) is the unique URL identifier. The channel name is the display name. FootprintIQ searches by handle for accurate cross-platform matching." },
    { q: "What information is visible on a YouTube channel?", a: "Public channels display the name, handle, subscriber count, join date, description, featured channels, linked accounts, and all public videos and comments." },
    { q: "Can you find someone's other accounts from their YouTube handle?", a: "If the same handle is used on other platforms, FootprintIQ detects it. Cross-platform username reuse is common and is the primary method for linking online identities." },
    { q: "Is YouTube username search legal?", a: "Yes. YouTube channels are publicly accessible. Searching publicly available profile URLs is legal and does not violate platform terms." },
  ],
};

export default function SearchYoutubeByUsername() {
  return <SearchByUsernameTemplate config={config} />;
}
