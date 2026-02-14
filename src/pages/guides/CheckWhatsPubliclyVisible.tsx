import React from "react";
import { Link } from "react-router-dom";
import { QAGuideLayout, qaGuideLinks, type QAGuideData } from "@/components/guides/QAGuideLayout";

const data: QAGuideData = {
  slug: "guides/check-whats-publicly-visible",
  title: "How To Check What's Publicly Visible About You Online (2026 Guide) | FootprintIQ",
  metaDescription: "Learn how to find out what personal information is publicly visible about you online. Step-by-step guide covering search engines, social media, data brokers, and more.",
  h1: "How To Check What's Publicly Visible About You Online",
  subtitle: "A practical, step-by-step guide to discovering what anyone can find about you on the internet — and what to do about it.",
  relatedGuides: qaGuideLinks,
  sections: [
    {
      heading: "Why You Should Know What's Visible",
      content: (
        <>
          <p>Most people have far more personal information publicly available than they realise. Every social media profile you've created, every forum post you've made, every data broker that's scraped your details — it all adds up to a digital footprint that anyone with an internet connection can access.</p>
          <p>Understanding what's visible isn't about paranoia. It's about awareness. Whether you're applying for a job, concerned about identity theft, or simply want more control over your online presence, the first step is always the same: find out what's already out there.</p>
          <p>This guide walks you through every major method for checking your public visibility, from simple search engine queries to dedicated scanning tools.</p>
        </>
      ),
    },
    {
      heading: "Step 1: Search Your Name on Google",
      content: (
        <>
          <p>The simplest starting point is to search for yourself. Open an incognito or private browsing window (to avoid personalised results) and search for your full name in quotes. Try variations:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>"Jane Smith" + your city</li>
            <li>"Jane Smith" + your employer</li>
            <li>"Jane Smith" + your username</li>
          </ul>
          <p>Check the first three pages of results. Most people never go beyond page one, but information on page two or three is still accessible to anyone who looks.</p>
          <p>Google also offers specific tools. <strong>Google Alerts</strong> lets you set up notifications whenever your name appears in new search results. <strong>Google's "Results About You"</strong> feature (available in some regions) lets you request removal of results containing your personal contact information.</p>
        </>
      ),
    },
    {
      heading: "Step 2: Check Your Social Media Privacy Settings",
      content: (
        <>
          <p>Social media platforms are among the biggest sources of publicly visible personal information. Even if you think your profiles are private, default settings frequently expose more than you'd expect.</p>
          <p>For each platform you use — Facebook, Instagram, X (Twitter), LinkedIn, TikTok, Reddit — take the following steps:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>View your profile in a logged-out browser to see what strangers see</li>
            <li>Review your privacy settings (who can see your posts, friends list, photos)</li>
            <li>Check whether your profile appears in search engine results</li>
            <li>Review tagged photos and mentions by others</li>
            <li>Check if your email or phone number is searchable</li>
          </ul>
          <p>LinkedIn is worth special attention. By default, most profile information is public and indexed by Google. This is useful for professional networking but may expose more than you intend.</p>
        </>
      ),
    },
    {
      heading: "Step 3: Search for Your Usernames",
      content: (
        <>
          <p>If you use the same username across multiple platforms — and most people do — searching for that username can reveal accounts you've forgotten about. Old forum posts, gaming profiles, review sites, and community memberships can all appear.</p>
          <p>You can search manually by entering your username into Google, or use dedicated tools. Services like <Link to="/username-checker" className="text-accent hover:underline">username checkers</Link> scan hundreds of platforms at once to find matches.</p>
          <p>Tools like FootprintIQ, Namechk, and KnowEm can help identify where your username appears publicly. FootprintIQ goes further by scoring the confidence of each match and filtering likely false positives — which is important because common usernames often appear on platforms you've never used.</p>
        </>
      ),
    },
    {
      heading: "Step 4: Check Data Broker Sites",
      content: (
        <>
          <p>Data brokers collect and sell personal information — names, addresses, phone numbers, email addresses, relatives, and more. In the US, sites like Spokeo, Whitepages, BeenVerified, and PeopleFinder are the most common. In the UK and EU, similar services exist but are subject to stricter data protection rules under GDPR.</p>
          <p>Visit the major data broker sites and search for yourself. You may be surprised at how much information is listed. Most brokers allow you to opt out, but the process can be time-consuming — each site has its own procedure.</p>
          <p>Services like DeleteMe, Incogni, and Kanary automate the removal process. FootprintIQ takes a different approach by <Link to="/remove-personal-information-from-internet" className="text-accent hover:underline">mapping your exposure first</Link> and providing a prioritised list of where to focus your removal efforts.</p>
        </>
      ),
    },
    {
      heading: "Step 5: Check for Breach Exposure",
      content: (
        <>
          <p>Data breaches are a reality of modern internet use. Even if you've been careful, services you've used may have been compromised. Checking whether your email appears in known breaches is an essential step.</p>
          <p>Have I Been Pwned (HIBP) is the most well-known free tool for this. Enter your email address and it will show you which breaches included your data. Mozilla Monitor (formerly Firefox Monitor) offers a similar service.</p>
          <p>Breach exposure tells you what's been leaked, but it doesn't tell you what's publicly visible right now. That's why combining breach checking with a <Link to="/after-have-i-been-pwned-what-next" className="text-accent hover:underline">broader digital footprint scan</Link> gives you a more complete picture.</p>
        </>
      ),
    },
    {
      heading: "Step 6: Use a Digital Footprint Scanner",
      content: (
        <>
          <p>Manual searching is valuable but time-consuming and easy to miss things. Digital footprint scanners automate the process, checking hundreds of platforms and data sources in minutes.</p>
          <p>Several options exist at different price points:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>FootprintIQ</strong> — Ethical OSINT platform that maps your public exposure across usernames, emails, and data brokers. Offers free scans with Pro intelligence features.</li>
            <li><strong>Have I Been Pwned</strong> — Free breach database lookup for email addresses.</li>
            <li><strong>DeleteMe / Incogni</strong> — Paid services focused on automated data broker removal.</li>
            <li><strong>Aura</strong> — All-in-one identity protection suite including credit monitoring.</li>
          </ul>
          <p>The best approach depends on your needs. If you want to understand your exposure before deciding what to remove, an intelligence-first tool like FootprintIQ is a strong starting point. If you already know you want data broker listings removed, a service like DeleteMe or Incogni is more directly actionable.</p>
        </>
      ),
    },
    {
      heading: "Step 7: Review and Take Action",
      content: (
        <>
          <p>Once you've completed your audit, you'll likely have a list of things to address. Prioritise based on risk:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>High priority:</strong> Active accounts with real personal data, data broker listings with your home address, breached passwords still in use</li>
            <li><strong>Medium priority:</strong> Old social media profiles you no longer use, public posts with personal details</li>
            <li><strong>Low priority:</strong> Forum profiles with minimal information, usernames on platforms you've never actually used</li>
          </ul>
          <p>Remember that removal is an ongoing process, not a one-time event. Data brokers frequently re-list information, and new breaches happen regularly. Setting up monitoring — whether through Google Alerts, Have I Been Pwned notifications, or a service like FootprintIQ — helps you stay informed.</p>
        </>
      ),
    },
  ],
  faqs: [
    { question: "How can I check what personal information is publicly visible about me?", answer: "Start by searching your name in an incognito browser window, check major data broker sites (Spokeo, Whitepages, BeenVerified), review your social media privacy settings, and search for your common usernames. For a comprehensive check, use a digital footprint scanner like FootprintIQ that automates the process across hundreds of platforms." },
    { question: "Is it free to check your digital footprint?", answer: "Yes — many tools offer free basic checks. Google search is free, Have I Been Pwned is free for breach checks, and FootprintIQ offers free scans for public exposure. More detailed analysis and automated removal services typically require a paid subscription." },
    { question: "How often should I check my online visibility?", answer: "At minimum, once every six months. Data brokers frequently update their listings, new breaches occur regularly, and privacy settings on platforms can change. Setting up automated monitoring is the most effective long-term approach." },
    { question: "Can I remove everything about me from the internet?", answer: "Complete removal is extremely difficult, but you can significantly reduce your visibility. Focus on removing high-risk exposures first — data broker listings, old accounts with personal data, and public posts with sensitive information. Some information (public records, news articles) may be protected and harder to remove." },
  ],
};

const CheckWhatsPubliclyVisible = () => <QAGuideLayout data={data} />;
export default CheckWhatsPubliclyVisible;
