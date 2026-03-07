import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Instagram",
  slug: "search-instagram-username",
  profilePattern: "instagram.com/username",
  metaDesc: "Search Instagram usernames to find profiles and discover linked accounts across 500+ platforms. Free Instagram username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>Instagram profiles are publicly accessible at <code>instagram.com/username</code>. When you search an Instagram username, OSINT tools query this URL endpoint and analyse the HTTP response to confirm whether the profile exists and is publicly visible.</p>
      <p>A confirmed public Instagram profile reveals the display name, bio, profile photo, follower and following counts, post grid, story highlights, and tagged photos. Instagram's visual-first format makes it one of the richest platforms for profile intelligence — profile photos, location tags, and tagged accounts all contribute to identity analysis.</p>
      <p>FootprintIQ extends this by simultaneously checking the same handle across 500+ other platforms, revealing whether the Instagram identity connects to accounts on Twitter/X, Reddit, TikTok, Discord, GitHub, and hundreds of niche communities.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>There are several approaches to finding Instagram profiles when you have a username or partial information:</p>
      <ul>
        <li><strong>Direct URL check.</strong> Navigate to <code>instagram.com/username</code> to confirm profile existence. FootprintIQ automates this programmatically.</li>
        <li><strong>Cross-platform pivot.</strong> If someone uses the same handle on other platforms, discovering it elsewhere provides strong evidence for the Instagram account. FootprintIQ's multi-platform search identifies these connections automatically.</li>
        <li><strong>Name and hashtag search.</strong> Instagram's in-app search queries display names, usernames, and hashtags. Combining name search with location or niche hashtags narrows results significantly.</li>
        <li><strong>Profile photo correlation.</strong> Reverse image searching an Instagram profile photo can identify matching images on other platforms, confirming cross-platform identity.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/how-to-find-someone-on-instagram" className="text-primary hover:underline">guide to finding someone on Instagram</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Instagram usernames are valuable OSINT pivot points due to the platform's rich public metadata:</p>
      <ul>
        <li><strong>Username enumeration.</strong> The Instagram handle serves as a search key across all indexed platforms. A single confirmed username can reveal dozens of connected accounts.</li>
        <li><strong>Geolocation intelligence.</strong> Location-tagged posts, story check-ins, and geotagged photos reveal movement patterns and frequently visited locations.</li>
        <li><strong>Network mapping.</strong> Tagged users, frequent commenters, and collaborative posts map the account's social network and personal relationships.</li>
        <li><strong>Content metadata analysis.</strong> Posting patterns reveal timezone, daily routine, and lifestyle indicators. Hashtag usage reveals interests and community affiliations.</li>
        <li><strong>Linked account detection.</strong> Instagram profiles may link to Facebook, external websites, or link aggregators — each providing additional investigative leads.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide for advanced investigation workflows.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>Instagram username exposure creates specific privacy risks:</p>
      <ul>
        <li><strong>Cross-platform identity linking.</strong> Reusing your Instagram handle on other platforms allows anyone to map your entire digital presence with a single search.</li>
        <li><strong>Location disclosure.</strong> Geotagged photos and story check-ins reveal real-world locations, routines, and travel patterns.</li>
        <li><strong>Social engineering material.</strong> Public profile details — employer, school, interests, relationships — provide material for targeted phishing and impersonation.</li>
        <li><strong>Impersonation risk.</strong> Public profile photos and personal details can be harvested to create convincing fake accounts on other platforms.</li>
      </ul>
      <p>To reduce exposure: use a unique handle for Instagram, set your account to private if appropriate, disable contact syncing, and review tagged photo permissions.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Instagram by username without an account?", a: "Yes. Public Instagram profiles are accessible via web browser at instagram.com/username without requiring an Instagram account. FootprintIQ performs this lookup programmatically." },
    { q: "Is Instagram username search free?", a: "Yes. FootprintIQ's free tier includes Instagram along with 500+ other platforms. No account required for basic scans." },
    { q: "What does an Instagram username reveal?", a: "A public Instagram profile shows display name, bio, profile photo, follower/following counts, post grid, story highlights, and tagged photos. Cross-referenced with other platforms, the same username can reveal a much broader digital identity." },
    { q: "Can you find a private Instagram account by username?", a: "You can confirm the account exists, but private account content is not publicly accessible. FootprintIQ only queries publicly available data." },
  ],
};

export default function SearchInstagramUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
