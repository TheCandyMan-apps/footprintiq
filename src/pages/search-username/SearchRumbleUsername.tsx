import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Rumble",
  slug: "search-rumble-username",
  profilePattern: "rumble.com/user/username",
  metaDesc: "Search Rumble usernames to find video profiles and discover linked accounts across 500+ platforms. Free Rumble username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>Rumble profiles are publicly accessible at <code>rumble.com/user/username</code>. OSINT tools query this URL to confirm whether a channel exists and contains public video content.</p>
      <p>A confirmed Rumble profile reveals the display name, profile photo, channel description, subscriber count, uploaded videos, and engagement metrics. Rumble has grown as an alternative video platform, attracting creators who often maintain parallel channels on YouTube, Odysee, and Bitchute — making cross-platform username correlation highly effective.</p>
      <p>FootprintIQ extends this by simultaneously checking the same handle across 500+ platforms, revealing whether the Rumble identity connects to accounts on YouTube, Twitter/X, and hundreds of other communities.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Approaches for locating Rumble profiles from a username:</p>
      <ul>
        <li><strong>Direct URL check.</strong> Navigate to <code>rumble.com/user/username</code>. FootprintIQ automates this lookup.</li>
        <li><strong>Cross-platform pivot.</strong> Rumble creators frequently use matching handles on YouTube, Twitter/X, and Substack.</li>
        <li><strong>Google site search.</strong> Searching <code>site:rumble.com "username"</code> surfaces channels and videos.</li>
        <li><strong>Content cross-referencing.</strong> Videos posted on both Rumble and YouTube with matching titles confirm identity.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/find-someone-by-username" className="text-primary hover:underline">guide to finding someone by username</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Rumble usernames provide OSINT value for video platform investigations:</p>
      <ul>
        <li><strong>Multi-platform correlation.</strong> Creators mirroring content across Rumble and YouTube use consistent handles and titles.</li>
        <li><strong>Content analysis.</strong> Video titles, descriptions, and topics reveal interests, opinions, and affiliations.</li>
        <li><strong>Engagement patterns.</strong> Comment sections and subscriber interactions map audience networks.</li>
        <li><strong>Monetisation indicators.</strong> Rumble's revenue-sharing model means active channels indicate commercial activity.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>Rumble username exposure creates privacy risks:</p>
      <ul>
        <li><strong>Cross-platform linking.</strong> Matching handles on Rumble and YouTube connect alternative platform activity to mainstream identity.</li>
        <li><strong>Content permanence.</strong> Uploaded videos and comments remain publicly accessible and indexed.</li>
        <li><strong>Opinion exposure.</strong> Video content and commentary create a searchable archive of views and opinions.</li>
      </ul>
      <p>To reduce exposure: use a unique handle, audit video descriptions for personal details, and review comment history.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Rumble by username?", a: "Yes. Rumble channels are accessible at rumble.com/user/username. FootprintIQ checks this programmatically alongside 500+ platforms." },
    { q: "Is Rumble username search free?", a: "Yes. FootprintIQ's free tier includes Rumble along with 500+ other platforms." },
    { q: "What does a Rumble profile reveal?", a: "A public Rumble profile shows display name, channel description, subscriber count, uploaded videos, and engagement metrics." },
    { q: "Do Rumble and YouTube creators use the same username?", a: "Frequently. Creators mirroring content across platforms typically use identical or similar handles." },
  ],
};

export default function SearchRumbleUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
