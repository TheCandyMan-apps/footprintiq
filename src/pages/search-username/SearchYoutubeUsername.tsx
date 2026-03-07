import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "YouTube",
  slug: "search-youtube-username",
  profilePattern: "youtube.com/@username",
  metaDesc: "Search YouTube usernames to find channels and discover linked accounts across 500+ platforms. Free YouTube username lookup with OSINT intelligence.",
  howItWorks: (
    <>
      <p>YouTube channels are accessible at <code>youtube.com/@username</code>. When you search a YouTube username, the system queries this endpoint to confirm channel existence and extract publicly available metadata.</p>
      <p>A public YouTube channel displays the channel name, description, subscriber count, video library, playlists, community posts, and linked social accounts. YouTube's "About" section frequently contains links to other platforms, websites, and contact information.</p>
      <p>FootprintIQ extends the YouTube lookup by simultaneously checking the same handle across 500+ platforms, connecting the YouTube identity to accounts on Instagram, Twitter/X, Twitch, and hundreds of other services.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>YouTube channels can be discovered through several methods:</p>
      <ul>
        <li><strong>Direct URL check.</strong> Visit <code>youtube.com/@username</code> to confirm channel existence. FootprintIQ automates this programmatically.</li>
        <li><strong>Cross-platform handle reuse.</strong> Content creators frequently use the same handle across YouTube, Twitch, Twitter/X, and Instagram. Finding the handle on one platform often confirms the YouTube channel.</li>
        <li><strong>Comment analysis.</strong> YouTube comments display the commenter's channel name, providing discovery pathways through content engagement.</li>
        <li><strong>Linked accounts.</strong> YouTube's "About" section may link to other social media, websites, and email addresses.</li>
      </ul>
      <p>For advanced search methodology, see our <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques guide</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>YouTube provides unique intelligence through its video and community features:</p>
      <ul>
        <li><strong>Content analysis.</strong> Video content reveals voice, appearance, expertise areas, opinions, and production quality — each contributing to identity assessment.</li>
        <li><strong>Channel metadata.</strong> Subscriber counts, view statistics, and upload frequency indicate audience size and content commitment.</li>
        <li><strong>Comment intelligence.</strong> Comments left on other channels reveal interests, opinions, and social connections.</li>
        <li><strong>Linked platform discovery.</strong> The "About" section frequently contains verified links to Twitter/X, Instagram, websites, and business email addresses.</li>
        <li><strong>Temporal analysis.</strong> Upload schedules and community post timing indicate timezone and routine patterns.</li>
      </ul>
    </>
  ),
  privacyExposure: (
    <>
      <p>YouTube username exposure carries specific privacy risks:</p>
      <ul>
        <li><strong>Cross-platform identity linking.</strong> YouTube handles reused on other platforms allow instant identity correlation through username search.</li>
        <li><strong>Comment trail visibility.</strong> Every comment left on public videos is permanently visible and attributable to your channel.</li>
        <li><strong>Linked account exposure.</strong> Social links in the "About" section create explicit identity bridges to other platforms.</li>
        <li><strong>Content permanence.</strong> Uploaded videos remain accessible indefinitely unless explicitly deleted or set to private.</li>
      </ul>
      <p>To reduce exposure: use a unique YouTube handle, review linked accounts in your channel settings, and audit your comment history.</p>
    </>
  ),
  faqs: [
    { q: "Can you search YouTube by username?", a: "Yes. YouTube channels are accessible at youtube.com/@username. FootprintIQ checks YouTube alongside 500+ platforms simultaneously." },
    { q: "Is YouTube username search free?", a: "Yes. FootprintIQ's free tier includes YouTube and 500+ other platforms." },
    { q: "What does a YouTube username reveal?", a: "A YouTube channel shows the channel name, description, subscriber count, videos, playlists, and often linked social media accounts and email addresses." },
    { q: "Can YouTube comments be traced to an identity?", a: "YouTube comments display the commenter's channel name. If that channel links to other social media, the comment trail connects to a broader identity." },
  ],
};

export default function SearchYoutubeUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
