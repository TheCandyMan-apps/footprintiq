import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Tumblr",
  slug: "search-tumblr-username",
  profilePattern: "username.tumblr.com",
  metaDesc: "Search Tumblr usernames to find blogs and discover linked accounts across 500+ platforms. Free Tumblr username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>Tumblr blogs are publicly accessible at <code>username.tumblr.com</code>. OSINT tools query this subdomain and analyse the HTTP response to confirm whether the blog exists and contains public content.</p>
      <p>A confirmed Tumblr profile reveals the blog title, description, avatar, post archive, tags used, and reblog activity. Tumblr's microblogging format produces rich content trails — text posts, image uploads, embedded media, and curated reblogs all reveal interests, opinions, and community affiliations. The platform's long history means many accounts have years of archived content.</p>
      <p>FootprintIQ extends this by simultaneously checking the same handle across 500+ other platforms, revealing whether the Tumblr identity connects to accounts on Twitter/X, Reddit, Instagram, DeviantArt, and hundreds of niche communities.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Several approaches help locate Tumblr profiles from a username:</p>
      <ul>
        <li><strong>Direct subdomain check.</strong> Navigate to <code>username.tumblr.com</code> to confirm blog existence. FootprintIQ automates this programmatically.</li>
        <li><strong>Tag and search queries.</strong> Tumblr's search and tag system indexes public posts. Searching for a username within specific tags can surface activity.</li>
        <li><strong>Cross-platform pivot.</strong> Tumblr usernames frequently match handles used on Twitter/X, DeviantArt, and AO3. FootprintIQ identifies these connections automatically.</li>
        <li><strong>Archived content.</strong> Tumblr's <code>/archive</code> page provides a visual timeline of all public posts, useful for rapid content review.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/find-someone-by-username" className="text-primary hover:underline">guide to finding someone by username</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Tumblr usernames provide unique OSINT value due to the platform's long content history:</p>
      <ul>
        <li><strong>Username enumeration.</strong> The Tumblr handle is a reliable search key across creative and fandom communities where users frequently reuse handles.</li>
        <li><strong>Content archaeology.</strong> Years of posts, reblogs, and tags reveal evolving interests, opinions, and community affiliations over time.</li>
        <li><strong>Network analysis.</strong> Reblog chains and mutual interactions map social connections within specific interest communities.</li>
        <li><strong>Interest profiling.</strong> Tag usage and reblog patterns reveal detailed interests, aesthetic preferences, and community membership.</li>
        <li><strong>Linked account detection.</strong> Tumblr bios and sidebar widgets frequently link to Twitter/X, Instagram, Ko-fi, Patreon, and personal websites.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide for advanced workflows.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>Tumblr username exposure creates specific privacy risks:</p>
      <ul>
        <li><strong>Cross-platform identity linking.</strong> Reusing your Tumblr handle on other platforms connects your blogging activity to your broader digital identity.</li>
        <li><strong>Content archive exposure.</strong> Years of posts — including those created as a teenager — remain publicly accessible and searchable.</li>
        <li><strong>Interest and opinion profiling.</strong> Reblog activity and tag usage create a detailed profile of personal interests, beliefs, and community affiliations.</li>
        <li><strong>Linked account chains.</strong> Bio links to personal sites, Ko-fi, or Twitter/X create direct identity bridges.</li>
      </ul>
      <p>To reduce exposure: use a unique handle, audit old posts, remove sidebar links, and consider making sensitive secondary blogs private.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Tumblr by username?", a: "Yes. Tumblr blogs are accessible at username.tumblr.com. FootprintIQ checks this endpoint programmatically alongside 500+ other platforms." },
    { q: "Is Tumblr username search free?", a: "Yes. FootprintIQ's free tier includes Tumblr along with 500+ other platforms. No account required for basic scans." },
    { q: "What does a Tumblr profile reveal?", a: "A public Tumblr blog shows the blog title, description, avatar, full post archive, tags used, and reblog activity. Bio sidebars often link to other accounts." },
    { q: "Can you see deleted Tumblr posts?", a: "Deleted posts are removed from Tumblr. However, reblogs of deleted original posts may persist on other blogs. FootprintIQ only accesses currently public data." },
  ],
};

export default function SearchTumblrUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
