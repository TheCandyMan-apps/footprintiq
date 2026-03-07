import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Quora",
  slug: "search-quora-username",
  profilePattern: "quora.com/profile/username",
  metaDesc: "Search Quora usernames to find profiles, answers, and linked accounts across 500+ platforms. Free Quora username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>Quora profiles are publicly accessible at <code>quora.com/profile/username</code>. OSINT tools query this URL and analyse the response to confirm whether the profile exists and contains public activity.</p>
      <p>A confirmed Quora profile reveals the user's real name (Quora encourages real names), profile photo, bio, credentials, topics followed, questions asked, and the complete answer history. Quora's Q&amp;A format often elicits detailed personal and professional disclosures — users share expertise, career history, personal experiences, and opinions across hundreds of topic areas.</p>
      <p>FootprintIQ extends this by simultaneously checking the same handle across 500+ other platforms, revealing whether the Quora identity connects to accounts on LinkedIn, Twitter/X, Medium, and hundreds of other communities.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Several approaches help locate Quora profiles when you have a username or name:</p>
      <ul>
        <li><strong>Direct URL check.</strong> Navigate to <code>quora.com/profile/First-Last</code> to check for a profile. Quora uses hyphenated real names as default URL slugs. FootprintIQ automates this lookup.</li>
        <li><strong>Google site search.</strong> Searching <code>site:quora.com "username"</code> surfaces profiles and answers associated with a specific name or handle.</li>
        <li><strong>Cross-platform pivot.</strong> Quora credentials often reference employers, universities, and professional titles — matching these to LinkedIn or personal websites provides strong correlation.</li>
        <li><strong>Topic and answer search.</strong> Browsing specific Quora topics reveals active contributors whose expertise matches a target's known profession.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/find-someone-by-username" className="text-primary hover:underline">guide to finding someone by username</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Quora profiles are valuable OSINT resources due to the platform's emphasis on detailed, personal answers:</p>
      <ul>
        <li><strong>Professional intelligence.</strong> Credentials and answer content frequently reveal employer, job title, educational background, and career trajectory.</li>
        <li><strong>Personal disclosure analysis.</strong> Answers about personal experiences, travel, family, and health create a rich profile of the individual's life circumstances.</li>
        <li><strong>Expertise mapping.</strong> Topic following and answer patterns reveal domains of knowledge, professional focus, and intellectual interests.</li>
        <li><strong>Opinion profiling.</strong> Answers on controversial topics reveal political views, ethical positions, and personal values.</li>
        <li><strong>Network indicators.</strong> Answers mentioning colleagues, institutions, or locations provide geographic and professional network intelligence.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide for advanced workflows.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>Quora username exposure creates specific privacy risks:</p>
      <ul>
        <li><strong>Real name association.</strong> Quora's real-name policy means answers are directly attributable to individuals, unlike pseudonymous platforms.</li>
        <li><strong>Professional disclosure.</strong> Credentials listing employer and role connect your Quora opinions to your professional identity.</li>
        <li><strong>Personal experience exposure.</strong> Answers about health, relationships, finances, and personal struggles are permanently public and searchable.</li>
        <li><strong>Search engine indexing.</strong> Quora answers rank highly in Google results, meaning personal disclosures appear in name searches.</li>
      </ul>
      <p>To reduce exposure: review and delete sensitive answers, anonymise personal experience posts, remove employer credentials, and audit your answer history regularly.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Quora by username?", a: "Yes. Quora profiles are accessible at quora.com/profile/username. FootprintIQ checks this endpoint programmatically alongside 500+ other platforms." },
    { q: "Is Quora username search free?", a: "Yes. FootprintIQ's free tier includes Quora along with 500+ other platforms. No account required for basic scans." },
    { q: "What does a Quora profile reveal?", a: "A public Quora profile shows the user's name, bio, credentials, profile photo, topics followed, questions asked, and complete answer history." },
    { q: "Does Quora use real names?", a: "Quora encourages real names but does not verify identity. Some users operate under pseudonyms. FootprintIQ cross-references handles to identify linked accounts." },
  ],
};

export default function SearchQuoraUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
