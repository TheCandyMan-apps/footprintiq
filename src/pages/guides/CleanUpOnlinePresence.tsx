import React from "react";
import { Link } from "react-router-dom";
import { QAGuideLayout, qaGuideLinks, type QAGuideData } from "@/components/guides/QAGuideLayout";

const data: QAGuideData = {
  slug: "guides/clean-up-online-presence",
  title: "How To Clean Up Your Online Presence (Step-by-Step, 2026) | FootprintIQ",
  metaDescription: "Learn how to clean up your online presence step by step. Remove old accounts, fix privacy settings, opt out of data brokers, and reduce your digital footprint.",
  h1: "How To Clean Up Your Online Presence",
  subtitle: "A complete, practical guide to reducing your digital footprint — from deleting old accounts to removing yourself from data broker sites.",
  relatedGuides: qaGuideLinks,
  sections: [
    {
      heading: "Why Cleaning Up Your Online Presence Matters",
      content: (
        <>
          <p>Your online presence is more than just your active social media profiles. It includes every account you've ever created, every forum post you've made, every data broker that's listed your personal details, and every mention of your name in public records, news articles, or cached web pages.</p>
          <p>Over time, this accumulates into a digital footprint that can affect your job prospects, personal relationships, and vulnerability to identity theft. Old accounts with weak passwords become potential entry points for hackers. Data broker listings put your home address and phone number in the hands of anyone willing to pay — or sometimes anyone willing to search.</p>
          <p>Cleaning up your online presence is about reducing unnecessary exposure. You don't need to disappear from the internet entirely — just ensure that what's visible is intentional and appropriate.</p>
        </>
      ),
    },
    {
      heading: "Step 1: Audit Your Current Digital Footprint",
      content: (
        <>
          <p>Before you can clean up, you need to know what's out there. This means conducting a thorough audit of your public visibility.</p>
          <p>Start with these steps:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Search your name in Google (use incognito mode for unbiased results)</li>
            <li>Search your most common email addresses</li>
            <li>Search your phone number</li>
            <li>Search your common usernames across platforms</li>
            <li>Check major data broker sites (Spokeo, Whitepages, BeenVerified, PeopleFinder)</li>
          </ul>
          <p>This process can be time-consuming manually. Tools like FootprintIQ automate much of this by scanning hundreds of platforms simultaneously and presenting results in a structured format. Have I Been Pwned can check whether your email addresses have appeared in data breaches.</p>
          <p>Document everything you find. A simple spreadsheet with the platform name, what's visible, and the action needed is enough to keep track.</p>
        </>
      ),
    },
    {
      heading: "Step 2: Delete Old and Unused Accounts",
      content: (
        <>
          <p>Most people have far more online accounts than they actively use. Social networks you joined and abandoned, shopping sites you used once, forums you posted on years ago — each of these is a potential exposure point.</p>
          <p>For each old account:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Log in and look for a "Delete Account" or "Close Account" option in settings</li>
            <li>If you can't remember your password, use the password reset process</li>
            <li>If the site doesn't offer account deletion, contact their support team directly</li>
            <li>For EU/UK users, you can submit a GDPR data deletion request (Article 17 — Right to Erasure)</li>
            <li>For US users in California, CCPA provides similar rights</li>
          </ul>
          <p>Resources like JustDeleteMe provide direct links to the deletion pages of hundreds of services, along with difficulty ratings. This can save significant time.</p>
        </>
      ),
    },
    {
      heading: "Step 3: Tighten Privacy Settings on Active Accounts",
      content: (
        <>
          <p>For accounts you want to keep, review and restrict the privacy settings:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Facebook:</strong> Set your profile to "Friends Only," disable search engine indexing, review your tagged photos, and limit who can see your friends list</li>
            <li><strong>Instagram:</strong> Switch to a private account if personal. Review who's following you. Remove tagged photos you didn't approve.</li>
            <li><strong>LinkedIn:</strong> Limit what non-connections can see. Turn off activity broadcasts if you don't want connections seeing your changes.</li>
            <li><strong>X (Twitter):</strong> If personal, consider protecting your tweets. Review your followers and block suspicious accounts.</li>
            <li><strong>Google:</strong> Review your Google Account activity controls, location history, and ad personalisation settings.</li>
          </ul>
          <p>Each platform updates its privacy settings regularly, so what was private last year might not be today. Make a habit of reviewing settings every few months.</p>
        </>
      ),
    },
    {
      heading: "Step 4: Opt Out of Data Broker Sites",
      content: (
        <>
          <p>Data brokers aggregate personal information from public records, social media, and commercial sources. Opting out is legal and free, but each site has its own process.</p>
          <p>The most common data brokers to address first:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Spokeo — requires email verification</li>
            <li>Whitepages — requires phone verification</li>
            <li>BeenVerified — online opt-out form</li>
            <li>PeopleFinder — email-based removal</li>
            <li>Radaris — requires account creation to remove</li>
            <li>MyLife — phone call required for some profiles</li>
          </ul>
          <p>If this process feels overwhelming, automated services can help. <strong>DeleteMe</strong> and <strong>Incogni</strong> submit opt-out requests on your behalf and monitor for re-listing. <strong>Kanary</strong> focuses on finding and removing personal data.</p>
          <p>FootprintIQ doesn't submit removal requests directly but helps you <Link to="/guides/remove-from-data-brokers" className="text-accent hover:underline">prioritise which brokers to address first</Link> based on the severity of the information exposed.</p>
        </>
      ),
    },
    {
      heading: "Step 5: Clean Up Search Engine Results",
      content: (
        <>
          <p>Even after removing the original source, outdated information can linger in search engine results through caching.</p>
          <p>To address this:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Use Google's <strong>Remove Outdated Content</strong> tool to request removal of cached pages that no longer exist</li>
            <li>Submit a <strong>"Results About You"</strong> request through Google if results contain your personal contact information</li>
            <li>For EU/UK users, submit a <strong>Right to be Forgotten</strong> request if the information is inadequate, irrelevant, or excessive</li>
            <li>Create positive content (professional website, LinkedIn articles) to push unwanted results down in rankings</li>
          </ul>
          <p>It's important to understand the distinction between <em>de-indexing</em> (removing from search results) and <em>source deletion</em> (removing from the original website). De-indexing hides the result from search engines but doesn't delete the underlying data. For complete removal, you need both.</p>
        </>
      ),
    },
    {
      heading: "Step 6: Secure Your Remaining Accounts",
      content: (
        <>
          <p>Cleaning up isn't just about removing things — it's also about securing what remains:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Use a <strong>password manager</strong> (1Password, Bitwarden, Dashlane) to generate unique passwords for every account</li>
            <li>Enable <strong>two-factor authentication</strong> on every service that supports it</li>
            <li>Review <strong>app permissions</strong> — revoke access for apps you no longer use</li>
            <li>Check for <strong>breach exposure</strong> at Have I Been Pwned and change any compromised passwords immediately</li>
          </ul>
        </>
      ),
    },
    {
      heading: "Step 7: Set Up Ongoing Monitoring",
      content: (
        <>
          <p>Privacy maintenance is an ongoing process, not a one-time task. Data brokers re-list information, new breaches happen, and old accounts can resurface.</p>
          <p>Set up monitoring with:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Google Alerts</strong> for your name (free)</li>
            <li><strong>Have I Been Pwned</strong> notifications for your email addresses (free)</li>
            <li><strong>FootprintIQ Pro</strong> for continuous digital footprint monitoring with exposure trend tracking</li>
            <li><strong>DeleteMe or Incogni</strong> for ongoing data broker monitoring and re-removal</li>
          </ul>
          <p>The combination of detection (knowing when something new appears) and intelligence (understanding what matters most) is the most effective approach to long-term privacy management.</p>
        </>
      ),
    },
  ],
  faqs: [
    { question: "How long does it take to clean up your online presence?", answer: "An initial audit and cleanup can take several hours to a few days, depending on how many accounts and data broker listings you have. Automated tools like FootprintIQ (for scanning) and DeleteMe/Incogni (for removal) can significantly reduce the time required. Ongoing maintenance takes about 30 minutes per month." },
    { question: "Can I completely remove myself from the internet?", answer: "Complete removal is extremely difficult and often impractical. Public records, news articles, and information shared by others are hard to control. However, you can dramatically reduce your exposure by deleting old accounts, opting out of data brokers, and tightening privacy settings on active profiles." },
    { question: "Is it worth paying for a cleanup service?", answer: "It depends on your situation. If you have extensive data broker exposure, automated removal services like DeleteMe or Incogni save significant time. If you want to understand your full exposure first, a tool like FootprintIQ provides the intelligence to make informed decisions. Many people benefit from using both — intelligence first, then targeted removal." },
    { question: "How do I stop my information from reappearing after removal?", answer: "Data brokers often re-list information from public records and other sources. Ongoing monitoring with services that automatically re-submit removal requests (DeleteMe, Incogni) is the most effective approach. Regular privacy audits and setting up alerts for your name and email also help catch reappearances early." },
  ],
};

const CleanUpOnlinePresence = () => <QAGuideLayout data={data} />;
export default CleanUpOnlinePresence;
