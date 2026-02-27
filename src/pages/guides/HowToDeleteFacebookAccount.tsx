import React from "react";
import { Link } from "react-router-dom";
import { QAGuideLayout, qaGuideLinks, type QAGuideData } from "@/components/guides/QAGuideLayout";

const data: QAGuideData = {
  slug: "guides/how-to-delete-facebook-account",
  title: "How to Delete Your Facebook Account Permanently (2026) | FootprintIQ",
  metaDescription: "Step-by-step guide to permanently deleting your Facebook account in 2026. Covers deactivation vs deletion, data download, what persists, and post-deletion privacy steps.",
  h1: "How to Delete Your Facebook Account Permanently",
  subtitle: "The complete, step-by-step process for permanent Facebook deletion — what happens to your data, what persists, and what to do before and after.",
  publishedDate: "2026-02-27",
  relatedGuides: qaGuideLinks,
  sections: [
    {
      heading: "Deactivation vs. Permanent Deletion: Key Difference",
      content: (
        <>
          <p><strong>Deactivation</strong> is temporary and reversible. Your profile disappears from search and your timeline is hidden, but Facebook retains all your data. You can reactivate at any time by simply logging back in. Messenger may remain active unless separately deactivated. This is Facebook's default "off switch" — designed to make leaving feel temporary and returning effortless.</p>
          <p><strong>Permanent deletion</strong> is irreversible (after a 30-day grace period). Facebook deletes your account, profile, photos, posts, and associated data from its servers. Some data — specifically anything shared with others (messages you sent, photos others re-shared) — remains in those other users' accounts. Log data and certain legal-compliance records are retained for up to 90 days after the deletion request.</p>
          <p>Before proceeding with either option, it's worth understanding what your Facebook account reveals publicly. A <Link to="/digital-footprint-scan" className="text-primary hover:underline font-medium">FootprintIQ digital footprint scan</Link> can show you the full scope of your public exposure across Facebook and 500+ other platforms — ensuring that deleting Facebook alone addresses your actual privacy concerns.</p>
        </>
      ),
    },
    {
      heading: "Before You Delete: Essential Preparation Steps",
      content: (
        <>
          <p>Permanent deletion is final. Complete these steps first:</p>
          <p><strong>1. Download Your Data</strong></p>
          <p>Go to Settings → Your Facebook Information → Download Your Information. Select the data categories you want (photos, posts, messages, contacts) and format (HTML for readability, JSON for portability). Request creation takes minutes to hours depending on account size. You'll receive a notification when the archive is ready.</p>
          <p><strong>2. Audit Connected Apps and Services</strong></p>
          <p>Many websites and apps use "Log in with Facebook" for authentication. After deletion, you'll lose access to any service where Facebook is your sole login method. Go to Settings → Apps and Websites to review connected services and create alternative login credentials before deleting.</p>
          <p><strong>3. Transfer Facebook Page Ownership</strong></p>
          <p>If you admin any Facebook Pages (business pages, community groups), transfer ownership to another admin before deletion. Pages with a single admin will be permanently removed when that admin's account is deleted.</p>
          <p><strong>4. Inform Key Contacts</strong></p>
          <p>If Facebook Messenger is a primary communication channel, inform important contacts of alternative ways to reach you before deletion.</p>
          <p><strong>5. Check for Linked Instagram</strong></p>
          <p>If your Instagram account is linked to Facebook, the link will break upon deletion. You won't lose your Instagram account, but cross-posting and shared login functionality will cease. Check your Instagram login credentials independently.</p>
          <p><strong>6. Run a Cross-Platform Scan</strong></p>
          <p>Use <Link to="/usernames" className="text-primary hover:underline font-medium">FootprintIQ's username search</Link> to identify other platforms where the same username or identity information exists. Deleting Facebook alone may not address your full digital exposure if the same information is publicly visible elsewhere.</p>
        </>
      ),
    },
    {
      heading: "Step-by-Step: Permanently Deleting Your Facebook Account",
      content: (
        <>
          <p><strong>Desktop:</strong></p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Log in to Facebook</li>
            <li>Click your profile picture (top right) → Settings & Privacy → Settings</li>
            <li>Select "Your Facebook Information" from the left menu</li>
            <li>Click "Deactivation and Deletion"</li>
            <li>Select "Permanently Delete Account" → Continue</li>
            <li>Click "Delete Account" → enter your password → Continue</li>
            <li>Click "Delete Account" to confirm</li>
          </ol>
          <p><strong>Mobile (iOS / Android):</strong></p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Open Facebook app → Menu (☰) → Settings & Privacy → Settings</li>
            <li>Scroll to "Your Facebook Information"</li>
            <li>Tap "Account Ownership and Control"</li>
            <li>Tap "Deactivation and Deletion"</li>
            <li>Select "Delete Account" → Continue to Account Deletion</li>
            <li>Tap "Delete Account" → enter password → Continue</li>
          </ol>
          <p><strong>Critical: The 30-Day Grace Period</strong></p>
          <p>After requesting deletion, Facebook maintains a 30-day window during which logging back in — even accidentally, even via a "Log in with Facebook" button on another site — will cancel the deletion. After 30 days, the process becomes irreversible. Up to 90 days may pass before all data is fully removed from Facebook's backup servers.</p>
        </>
      ),
    },
    {
      heading: "What Facebook Retains After Deletion",
      content: (
        <>
          <p>Permanent deletion removes your account, but some data persists beyond your control:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Messages you sent:</strong> Your sent messages remain in recipients' inboxes. Your name may appear as "Facebook User" rather than your real name.</li>
            <li><strong>Content others shared:</strong> Photos or posts that friends re-shared, downloaded, or screenshotted exist outside your account's scope.</li>
            <li><strong>Log data:</strong> Facebook retains certain log data (IP addresses, device info, timestamps) for up to 90 days for security and legal compliance purposes.</li>
            <li><strong>Legal holds:</strong> If your data is subject to a legal request or investigation, Facebook may retain relevant records beyond the standard deletion timeline.</li>
            <li><strong>Third-party data:</strong> Advertisers and partners who received your data through Facebook's platform may still hold it independently. Facebook's deletion doesn't extend to their databases.</li>
            <li><strong>Search engine caches:</strong> Google and other search engines may have cached versions of your public Facebook content. These eventually expire but can persist for weeks or months after deletion.</li>
          </ul>
          <p>This is why Facebook deletion alone doesn't eliminate your digital footprint. A comprehensive approach includes checking data broker sites, search engine caches, and other platforms. FootprintIQ's <Link to="/digital-footprint-scan" className="text-primary hover:underline font-medium">exposure scan</Link> helps identify what remains visible after account deletion.</p>
        </>
      ),
    },
    {
      heading: "After Deletion: Cleaning Up Your Broader Digital Footprint",
      content: (
        <>
          <p>Deleting Facebook is one step in a broader privacy improvement process:</p>
          <p><strong>1. Request Google removal of cached content</strong></p>
          <p>Use Google's removal tool to request deletion of cached Facebook pages from search results. This accelerates the natural cache expiration process.</p>
          <p><strong>2. Check data broker listings</strong></p>
          <p>Data brokers like Spokeo, BeenVerified, and WhitePages may still list your information derived from Facebook and other sources. Our guide on <Link to="/guides/remove-from-data-brokers" className="text-primary hover:underline">removing yourself from data broker sites</Link> covers the opt-out process.</p>
          <p><strong>3. Audit other social media accounts</strong></p>
          <p>If privacy is driving your Facebook deletion, audit your exposure on other platforms too. Run a <Link to="/usernames" className="text-primary hover:underline font-medium">username search</Link> to see where else you're publicly visible.</p>
          <p><strong>4. Update account recovery settings</strong></p>
          <p>Any service that used your Facebook account for login or recovery needs updating. Check email, phone, and alternative login methods for all connected services.</p>
          <p><strong>5. Consider ongoing monitoring</strong></p>
          <p>Digital exposure isn't static — new data broker listings, cached content, and re-appearances can occur. Our guide on <Link to="/guides/monitor-online-exposure" className="text-primary hover:underline">monitoring online exposure</Link> explains how to stay vigilant.</p>
        </>
      ),
    },
    {
      heading: "Alternatives to Full Deletion",
      content: (
        <>
          <p>If permanent deletion feels too drastic, consider these middle-ground approaches:</p>
          <p><strong>Privacy lockdown:</strong> Keep the account but maximise privacy settings — restrict all content to Friends-only, remove yourself from search engine indexing, disable profile discoverability by email and phone number, and clear your activity log of public interactions.</p>
          <p><strong>Content purge:</strong> Use Facebook's "Manage Activity" tool to bulk-delete or archive old posts, photos, and interactions. This retains the account for Messenger and login purposes while minimising public exposure.</p>
          <p><strong>Temporary deactivation:</strong> Deactivate for a trial period to see if you miss the platform. You can reactivate at any time with all data intact.</p>
          <p><strong>Selective presence:</strong> Use Facebook exclusively for specific purposes (e.g., Marketplace, Groups) and remove all personal information from your profile. A minimal profile with no photos, no posts, and restricted discoverability serves functional purposes with minimal exposure risk.</p>
          <p>Whichever approach you choose, start with a <Link to="/digital-footprint-scan" className="text-primary hover:underline font-medium">digital footprint scan</Link> to understand the full scope of your exposure. Facebook may be just one of dozens of platforms revealing your personal information publicly.</p>
        </>
      ),
    },
  ],
  faqs: [
    {
      question: "How long does it take to permanently delete a Facebook account?",
      answer: "The deletion process starts with a 30-day grace period during which you can cancel by logging back in. After 30 days, the deletion becomes irreversible. Facebook takes up to 90 days to fully remove all data from its backup servers. Some data — messages you sent, content others shared — persists in other users' accounts indefinitely.",
    },
    {
      question: "Can I recover my Facebook account after permanent deletion?",
      answer: "Only within the 30-day grace period. If you log back in during those 30 days, the deletion is cancelled and your account is fully restored. After 30 days, the deletion is permanent and irreversible — Facebook cannot restore the account even if you contact support.",
    },
    {
      question: "What happens to my Facebook Messenger if I delete my account?",
      answer: "If you permanently delete your Facebook account, your Messenger access is also removed. Messages you previously sent remain visible to recipients, but your name may appear as 'Facebook User.' If you only deactivate (rather than delete), you can optionally keep Messenger active.",
    },
    {
      question: "Does deleting Facebook remove my data from the internet?",
      answer: "No. Deleting Facebook removes your profile and content from Facebook's servers, but cached versions may persist in search engines, data brokers may still list derived information, and content shared by others remains in their accounts. A comprehensive digital cleanup requires addressing these additional sources.",
    },
    {
      question: "What's the difference between deactivating and deleting Facebook?",
      answer: "Deactivation is temporary and reversible — your profile is hidden but all data is retained, and logging back in restores everything. Permanent deletion is irreversible (after 30 days) and removes your profile, posts, photos, and associated data from Facebook's servers.",
    },
    {
      question: "Will deleting Facebook affect my Instagram account?",
      answer: "No — your Instagram account remains independent even if linked to Facebook. However, the link between the accounts will break, meaning cross-posting won't work and any 'Log in with Facebook' authentication for Instagram will need to be updated to email-based login.",
    },
    {
      question: "Should I delete Facebook for privacy?",
      answer: "It depends on your threat model. If Facebook is a significant source of public exposure, deletion helps. However, if the same information is available on other platforms, data brokers, or search engines, deletion alone won't solve the problem. Run a digital footprint scan first to understand the full scope of your exposure before deciding.",
    },
  ],
};

const HowToDeleteFacebookAccount = () => <QAGuideLayout data={data} />;
export default HowToDeleteFacebookAccount;
