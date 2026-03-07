import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "DeviantArt",
  slug: "search-deviantart-username",
  profilePattern: "deviantart.com/username",
  metaDesc: "Search DeviantArt usernames to find art profiles and discover linked accounts across 500+ platforms. Free DeviantArt username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>DeviantArt profiles are publicly accessible at <code>deviantart.com/username</code>. OSINT tools query this URL to confirm whether a profile exists and contains public artwork.</p>
      <p>A confirmed DeviantArt profile reveals the display name, bio, profile photo, location, gallery of uploaded artwork, favourites, journals (blog posts), group memberships, and watchers/watching counts. DeviantArt is one of the oldest and largest art communities online, with users spanning illustration, photography, digital art, and crafts. Many artists use their DeviantArt handle consistently across creative platforms.</p>
      <p>FootprintIQ extends this by checking the same handle across 500+ platforms, revealing connections to Behance, Dribbble, Instagram, Tumblr, and other creative communities.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Approaches for locating DeviantArt profiles:</p>
      <ul>
        <li><strong>Direct URL check.</strong> Navigate to <code>deviantart.com/username</code>. FootprintIQ automates this.</li>
        <li><strong>Cross-platform pivot.</strong> Artists frequently use matching handles on DeviantArt, Tumblr, Instagram, and AO3.</li>
        <li><strong>Google image search.</strong> Reverse image searching artwork can trace images back to DeviantArt profiles.</li>
        <li><strong>Group and community search.</strong> DeviantArt groups reveal artists active in specific interest communities.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/find-someone-by-username" className="text-primary hover:underline">guide to finding someone by username</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>DeviantArt profiles provide OSINT value for creative community investigations:</p>
      <ul>
        <li><strong>Long content history.</strong> Many DeviantArt accounts span over a decade, providing extensive activity archives.</li>
        <li><strong>Journal entries.</strong> Blog-style journal posts often contain personal disclosures and life updates.</li>
        <li><strong>Commission information.</strong> Artists offering commissions may provide payment details, pricing, and contact methods.</li>
        <li><strong>Group membership.</strong> Group affiliations reveal interests, fandoms, and community connections.</li>
        <li><strong>Linked accounts.</strong> Profile pages commonly link to Patreon, Ko-fi, Instagram, and personal portfolio sites.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>DeviantArt username exposure creates privacy risks:</p>
      <ul>
        <li><strong>Decade-long archives.</strong> Artwork and journals from years ago remain publicly accessible.</li>
        <li><strong>Cross-platform linking.</strong> Consistent handles across art platforms connect creative identity to personal accounts.</li>
        <li><strong>Personal disclosures.</strong> Journal entries, commission terms, and bio information may contain personal details.</li>
        <li><strong>Artwork metadata.</strong> Digital art files may contain software and device metadata.</li>
      </ul>
      <p>To reduce exposure: audit old journals and submissions, review linked accounts, and consider whether legacy content should remain public.</p>
    </>
  ),
  faqs: [
    { q: "Can you search DeviantArt by username?", a: "Yes. DeviantArt profiles are accessible at deviantart.com/username. FootprintIQ checks this alongside 500+ platforms." },
    { q: "Is DeviantArt username search free?", a: "Yes. FootprintIQ's free tier includes DeviantArt along with 500+ other platforms." },
    { q: "What does a DeviantArt profile reveal?", a: "A public DeviantArt profile shows display name, bio, location, artwork gallery, journals, favourites, group memberships, and watcher counts." },
    { q: "How old are DeviantArt accounts?", a: "DeviantArt launched in 2000. Many active accounts have 10-20+ years of archived content, making it one of the richest historical sources for creative identity research." },
  ],
};

export default function SearchDeviantartUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
