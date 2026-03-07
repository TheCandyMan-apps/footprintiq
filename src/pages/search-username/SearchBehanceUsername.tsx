import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Behance",
  slug: "search-behance-username",
  profilePattern: "behance.net/username",
  metaDesc: "Search Behance usernames to find creative portfolios and discover linked accounts across 500+ platforms. Free Behance username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>Behance profiles are publicly accessible at <code>behance.net/username</code>. OSINT tools query this URL and analyse the response to confirm whether the profile exists and contains public project work.</p>
      <p>A confirmed Behance profile reveals the user's real name, location, profile photo, professional headline, skills, tools used, project portfolio, appreciations received, and follower network. As Adobe's primary creative portfolio platform, Behance profiles often represent professional identities — many users display their full name, employer, and client work.</p>
      <p>FootprintIQ extends this by simultaneously checking the same handle across 500+ other platforms, revealing whether the Behance identity connects to accounts on Dribbble, LinkedIn, Instagram, GitHub, and hundreds of other communities.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Several approaches help locate Behance profiles from a username:</p>
      <ul>
        <li><strong>Direct URL check.</strong> Navigate to <code>behance.net/username</code> to confirm profile existence. FootprintIQ automates this programmatically.</li>
        <li><strong>Google site search.</strong> Searching <code>site:behance.net "username"</code> surfaces profiles and project pages associated with a handle or name.</li>
        <li><strong>Cross-platform pivot.</strong> Creative professionals frequently use matching handles on Behance, Dribbble, Instagram, and personal portfolio sites. FootprintIQ identifies these connections automatically.</li>
        <li><strong>Skill and location filtering.</strong> Behance's search supports filtering by creative field and location, useful when you know a target's profession and region.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/find-someone-by-username" className="text-primary hover:underline">guide to finding someone by username</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Behance profiles provide professional OSINT value due to the platform's portfolio-focused design:</p>
      <ul>
        <li><strong>Professional identity.</strong> Real names, employer details, job titles, and location data are standard on Behance profiles — providing direct professional intelligence.</li>
        <li><strong>Client and project intelligence.</strong> Published projects reveal client relationships, project timelines, and professional capabilities.</li>
        <li><strong>Tool and skill profiling.</strong> Listed tools (Adobe Creative Suite, Figma, etc.) and tagged skills map professional competencies.</li>
        <li><strong>Network mapping.</strong> Team members tagged on collaborative projects, appreciations, and follower networks reveal professional connections.</li>
        <li><strong>Linked account detection.</strong> Behance profiles often link to LinkedIn, personal websites, Instagram, and other social platforms.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide for advanced workflows.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>Behance username exposure creates specific privacy risks:</p>
      <ul>
        <li><strong>Professional identity exposure.</strong> Real names, employers, and locations are standard on Behance, directly connecting creative work to personal identity.</li>
        <li><strong>Client confidentiality.</strong> Published projects may inadvertently reveal client relationships and project details.</li>
        <li><strong>Cross-platform linking.</strong> Matching handles on Behance, Dribbble, and Instagram allow instant cross-platform identity mapping.</li>
        <li><strong>Portfolio permanence.</strong> Published projects remain publicly accessible and indexed by search engines long after completion.</li>
      </ul>
      <p>To reduce exposure: use a professional-only handle, review project visibility settings, remove client-sensitive work, and audit linked social accounts.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Behance by username?", a: "Yes. Behance profiles are accessible at behance.net/username. FootprintIQ checks this endpoint programmatically alongside 500+ other platforms." },
    { q: "Is Behance username search free?", a: "Yes. FootprintIQ's free tier includes Behance along with 500+ other platforms. No account required for basic scans." },
    { q: "What does a Behance profile reveal?", a: "A public Behance profile shows real name, location, professional headline, skills, tools, project portfolio, appreciations, and follower network." },
    { q: "Is Behance owned by Adobe?", a: "Yes. Behance is Adobe's creative portfolio platform and integrates with Adobe Creative Cloud. Many professionals use it as their primary online portfolio." },
  ],
};

export default function SearchBehanceUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
