import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "YouTube",
  slug: "search-youtube-username",
  profilePattern: "youtube.com/@username",
  metaDesc: "Search YouTube usernames to find channels, video history, and discover linked accounts across 500+ platforms. Free YouTube username lookup with OSINT intelligence.",
  howItWorks: (
    <>
      <p>YouTube channels are accessible at <code>youtube.com/@username</code>. When you search a YouTube username, the system queries this endpoint to confirm channel existence and extract publicly available metadata. YouTube's handle system, introduced in late 2022, provides clean, memorable URLs that function as effective cross-platform search keys.</p>
      <p>A public YouTube channel displays the channel name, description, subscriber count (unless hidden), video library, playlists, community posts, channel memberships, and — critically — linked social accounts in the "About" section. This linked accounts feature frequently contains verified connections to Twitter/X, Instagram, Facebook, websites, and business email addresses.</p>
      <p>FootprintIQ extends the YouTube lookup by simultaneously checking the same handle across 500+ platforms, connecting the YouTube identity to accounts on Instagram, Twitter/X, Twitch, Discord, and hundreds of other services. For content creators, this cross-platform scan reveals the full scope of their online brand and identity.</p>
      <p>The system also analyses channel metadata patterns — upload frequency, video descriptions, and community post activity — to provide temporal intelligence about account activity levels and content focus areas.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Investigators use several approaches to locate and verify YouTube channels:</p>
      <ul>
        <li><strong>Direct URL check.</strong> Visit <code>youtube.com/@username</code> to confirm channel existence. FootprintIQ automates this alongside 500+ other platforms in a single scan.</li>
        <li><strong>Cross-platform handle consistency.</strong> Content creators frequently use the same handle across YouTube, Twitch, Twitter/X, and Instagram for brand recognition. Finding the handle on one platform often confirms the YouTube channel.</li>
        <li><strong>Comment trail analysis.</strong> YouTube comments display the commenter's channel name and avatar, providing discovery pathways through content engagement across millions of public videos.</li>
        <li><strong>About section linked accounts.</strong> YouTube's "About" tab may link to Twitter/X, Instagram, Facebook, personal websites, and business email addresses — creating verified identity bridges.</li>
        <li><strong>Google account correlation.</strong> YouTube channels are tied to Google accounts. Google Maps reviews, Play Store reviews, and other Google services may share the same identity.</li>
      </ul>
      <p>For advanced search methodology, see our <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques guide</Link>.</p>
    </>
  ),
  usernameReuse: (
    <>
      <p>YouTube handles are frequently reused across the content creator ecosystem. Creators who build a brand on YouTube typically extend the same handle to Twitch, Twitter/X, Instagram, TikTok, and Discord — creating a consistent identity chain that a <Link to="/username-search" className="text-primary hover:underline">username search tool</Link> can map in seconds.</p>
      <p>This consistency is intentional for public figures but creates unintended exposure for casual users. Someone who created a YouTube channel years ago with their preferred handle may not realise that the same handle connects their YouTube activity to every other platform where they used it.</p>
      <p>The Google ecosystem amplifies this risk. A YouTube channel linked to a Google account may share identity signals with Google Maps reviews, Google Play reviews, Google Scholar profiles, and Blogger sites — extending the username correlation beyond social media into professional and geographic contexts.</p>
      <p>A <Link to="/reverse-username-search" className="text-primary hover:underline">reverse username lookup</Link> starting from a YouTube handle frequently reveals 10-20 connected accounts, making YouTube one of the most productive starting points for cross-platform identity mapping.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>YouTube provides unique intelligence through its video, comment, and community features:</p>
      <ul>
        <li><strong>Content analysis.</strong> Video content reveals voice, appearance (if on camera), expertise areas, opinions, production quality, and equipment — each contributing to identity assessment and demographic profiling.</li>
        <li><strong>Channel metadata intelligence.</strong> Subscriber counts, view statistics, upload frequency, and monetisation indicators signal audience size, content commitment, and potential income levels.</li>
        <li><strong>Comment trail analysis.</strong> Comments left on other channels reveal interests, opinions, social connections, and engagement patterns across the YouTube ecosystem.</li>
        <li><strong>Linked platform discovery.</strong> The "About" section frequently contains verified links to Twitter/X, Instagram, websites, and business email addresses — providing investigator-grade identity confirmation.</li>
        <li><strong>Temporal and geographic analysis.</strong> Upload schedules, community post timing, and content references (local events, weather, landmarks) indicate timezone, location, and routine patterns.</li>
      </ul>
    </>
  ),
  privacyExposure: (
    <>
      <p>YouTube username exposure carries layered privacy risks:</p>
      <ul>
        <li><strong>Cross-platform identity linking.</strong> YouTube handles reused on other platforms allow instant identity correlation. A <Link to="/check-my-digital-footprint" className="text-primary hover:underline">digital footprint check</Link> reveals exactly how many platforms share your YouTube handle.</li>
        <li><strong>Comment trail visibility.</strong> Every comment left on public videos is permanently visible and attributable to your channel — creating a years-long record of opinions and interactions.</li>
        <li><strong>Linked account exposure.</strong> Social links in the "About" section create explicit, verified identity bridges to other platforms, websites, and email addresses.</li>
        <li><strong>Content permanence.</strong> Uploaded videos remain accessible indefinitely unless explicitly deleted or set to private. Even deleted videos may persist in web archives and mirror sites.</li>
        <li><strong>Google ecosystem exposure.</strong> YouTube's integration with Google means that Maps reviews, Play Store activity, and other Google services may share the same identity — extending exposure beyond video content.</li>
      </ul>
      <p>To reduce exposure: use a unique YouTube handle, review linked accounts in your channel settings, audit your comment history, and check whether your Google account shares identity signals across other Google services.</p>
    </>
  ),
  faqs: [
    { q: "Can you search YouTube by username?", a: "Yes. YouTube channels are accessible at youtube.com/@username. FootprintIQ checks YouTube alongside 500+ platforms simultaneously." },
    { q: "Is YouTube username search free?", a: "Yes. FootprintIQ's free tier includes YouTube and 500+ other platforms. No account or payment required." },
    { q: "What does a YouTube username reveal?", a: "A YouTube channel shows the channel name, description, subscriber count, videos, playlists, community posts, and often linked social media accounts and business email addresses." },
    { q: "Can YouTube comments be traced to an identity?", a: "Yes. YouTube comments display the commenter's channel name. If that channel links to other social media, the comment trail connects to a broader real-world identity." },
    { q: "How do investigators track YouTube channels?", a: "Investigators analyse channel metadata, linked accounts, comment history, upload patterns, and cross-platform username correlation to build comprehensive identity profiles." },
    { q: "Can you find someone's email from their YouTube channel?", a: "If the channel owner has added a business email in the About section, it may be publicly visible. YouTube does not expose private account emails." },
    { q: "Does YouTube show who viewed your channel?", a: "No. YouTube does not notify channel owners when someone views their profile or videos. OSINT analysis is entirely passive." },
    { q: "How can I protect my YouTube privacy?", a: "Use a unique channel handle, review and remove linked accounts, audit your comment history across other channels, and check Google account sharing settings." },
  ],
};

export default function SearchYoutubeUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
