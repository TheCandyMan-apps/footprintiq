import React from "react";
import { Link } from "react-router-dom";
import { QAGuideLayout, qaGuideLinks, type QAGuideData } from "@/components/guides/QAGuideLayout";

const data: QAGuideData = {
  slug: "guides/what-google-knows-about-you",
  title: "How To See What Google Knows About You (2026 Guide) | FootprintIQ",
  metaDescription: "Find out what personal information Google has about you and how to manage it. Step-by-step guide to reviewing your Google data, activity history, and privacy settings.",
  h1: "How To See What Google Knows About You",
  subtitle: "A complete guide to finding, understanding, and managing the personal data Google collects — including search history, location data, and everything in between.",
  relatedGuides: qaGuideLinks,
  sections: [
    {
      heading: "What Data Does Google Actually Collect?",
      content: (
        <>
          <p>If you use Google services — and most people do — the company has a remarkably detailed profile of your activities, interests, and movements. This isn't speculation; Google makes this data available for you to review.</p>
          <p>The types of data Google collects include:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Search history:</strong> Every query you've typed into Google Search (unless you've paused this)</li>
            <li><strong>Location history:</strong> A detailed timeline of where you've been, tracked via your phone and Google Maps</li>
            <li><strong>YouTube history:</strong> Every video you've watched and searched for</li>
            <li><strong>Voice recordings:</strong> Audio snippets captured when using Google Assistant or voice search</li>
            <li><strong>App and web activity:</strong> Websites you've visited while signed into Chrome, apps you've used on Android</li>
            <li><strong>Device information:</strong> Details about your phones, computers, and tablets</li>
            <li><strong>Emails (Gmail):</strong> Content of your emails (used for search and organisation, though no longer for ad targeting)</li>
            <li><strong>Contacts:</strong> Names, phone numbers, and email addresses from your contacts list</li>
            <li><strong>Photos (Google Photos):</strong> Images, including facial recognition data and location metadata</li>
            <li><strong>Purchase history:</strong> Inferred from Gmail receipts and Google Pay transactions</li>
          </ul>
          <p>The scale of this collection is significant. For an active Google user, the data can span years and include thousands of data points.</p>
        </>
      ),
    },
    {
      heading: "How To Access Your Google Data",
      content: (
        <>
          <p>Google provides several dashboards to review and manage your data. Here's where to find everything:</p>
          <p><strong>Google My Activity (myactivity.google.com):</strong> This is the main hub. It shows your search history, YouTube history, and app activity in chronological order. You can filter by date, product, and search within your activity.</p>
          <p><strong>Google Dashboard (myaccount.google.com/dashboard):</strong> A summary of all Google services you use and the data stored in each one, including Gmail, Drive, Photos, and Calendar.</p>
          <p><strong>Google Takeout (takeout.google.com):</strong> This lets you download a complete copy of all your Google data in a portable format. It's the most thorough way to see everything Google has, and it includes data that doesn't appear in the other dashboards.</p>
          <p><strong>Google Ads Settings (adssettings.google.com):</strong> Shows how Google categorises you for advertising purposes — your inferred age, gender, interests, and topics.</p>
          <p><strong>Location Timeline (timeline.google.com):</strong> A visual map of everywhere you've been, with dates and times. This is often the most surprising page for people who haven't checked it before.</p>
        </>
      ),
    },
    {
      heading: "Step-by-Step: Reviewing Your Google Data",
      content: (
        <>
          <p>Take 15–20 minutes to review each of these areas:</p>
          <p><strong>1. Check My Activity:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Go to myactivity.google.com</li>
            <li>Scroll through your recent activity</li>
            <li>Use the filter options to check specific products (Search, YouTube, Maps)</li>
            <li>Note anything surprising — searches you don't remember, websites you forgot visiting</li>
          </ul>
          <p><strong>2. Check Location History:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Go to timeline.google.com</li>
            <li>Browse through dates to see where Google tracked you</li>
            <li>Check how detailed the tracking is — some people find precise routes and timestamps</li>
          </ul>
          <p><strong>3. Check Ad Personalisation:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Go to adssettings.google.com</li>
            <li>Review the topics and interests Google has inferred about you</li>
            <li>Check your inferred demographics (age range, gender)</li>
          </ul>
          <p><strong>4. Download Your Complete Data:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Go to takeout.google.com</li>
            <li>Select the services you want to download (or select all)</li>
            <li>Request an export — Google will prepare a download link (this can take hours for large datasets)</li>
            <li>Review the downloaded files to understand the full scope of collected data</li>
          </ul>
        </>
      ),
    },
    {
      heading: "How To Manage and Delete Your Google Data",
      content: (
        <>
          <p>Once you've reviewed what Google has, you can decide what to keep and what to delete:</p>
          <p><strong>Delete specific activities:</strong> In My Activity, click the three-dot menu next to any item and select "Delete." You can also delete by date range or product.</p>
          <p><strong>Set up auto-delete:</strong> Google offers automatic deletion of activity data after 3, 18, or 36 months. Go to myactivity.google.com → Activity Controls and set your preference for each type of data.</p>
          <p><strong>Pause data collection:</strong> In Activity Controls, you can pause collection for each category — Web & App Activity, Location History, YouTube History, etc. Pausing stops new data from being saved but doesn't delete existing data.</p>
          <p><strong>Delete Location History:</strong> In Timeline settings, you can delete all location history or specific date ranges.</p>
          <p><strong>Turn off Ad Personalisation:</strong> In Ads Settings, toggle off ad personalisation. Google will still show ads, but they won't be based on your activity profile.</p>
          <p><strong>Delete your Google Account entirely:</strong> If you want to remove everything, you can delete your entire Google Account at myaccount.google.com/delete-services. This is a drastic step — make sure to download your data first and transition any services you depend on.</p>
        </>
      ),
    },
    {
      heading: "What Google Shows Others About You",
      content: (
        <>
          <p>There's an important distinction between what Google knows about you (your private data) and what Google shows others about you (your public visibility in search results).</p>
          <p>Even if you lock down your Google account settings, other people can still find information about you through Google Search — because Google indexes information from other websites, not just its own services.</p>
          <p>To understand what others can find:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Search your name in an incognito browser window</li>
            <li>Search your email addresses and phone numbers</li>
            <li>Search your common usernames</li>
            <li>Use Google's "Results About You" feature (available in some regions) to request removal of results containing your contact information</li>
          </ul>
          <p>For a comprehensive view of your public visibility beyond just Google results, tools like <Link to="/scan" className="text-accent hover:underline">FootprintIQ</Link> scan hundreds of platforms simultaneously. This includes sources that Google may not index, such as data broker databases and niche community platforms.</p>
        </>
      ),
    },
    {
      heading: "Google vs Your Broader Digital Footprint",
      content: (
        <>
          <p>Google is just one piece of your digital footprint puzzle. While managing your Google data is important, your online exposure extends far beyond what Google collects:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Social media platforms</strong> have their own data collection and public visibility settings</li>
            <li><strong>Data brokers</strong> compile information from public records independently of Google</li>
            <li><strong>Breach databases</strong> contain leaked credentials that exist outside of any platform's control</li>
            <li><strong>Username reuse</strong> connects your identity across platforms in ways that no single service can fully reveal</li>
          </ul>
          <p>Managing Google's data about you is an excellent first step. But for a <Link to="/guides/check-whats-publicly-visible" className="text-accent hover:underline">complete picture of what's publicly visible</Link>, you need to audit your presence across all the places your information appears — not just Google's ecosystem.</p>
          <p>FootprintIQ, Have I Been Pwned, DeleteMe, and other tools each cover different aspects of your digital footprint. Used together, they provide comprehensive visibility and protection.</p>
        </>
      ),
    },
    {
      heading: "Privacy Settings You Should Change Today",
      content: (
        <>
          <p>If you do nothing else, change these settings in your Google Account right now:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Enable auto-delete</strong> for Web & App Activity, Location History, and YouTube History (set to 3 months for maximum privacy or 18 months for a balance)</li>
            <li><strong>Turn off Location History</strong> if you don't actively use Google Maps Timeline</li>
            <li><strong>Review app permissions</strong> — revoke access for apps you no longer use (go to myaccount.google.com/permissions)</li>
            <li><strong>Turn off ad personalisation</strong> if you're uncomfortable with interest-based targeting</li>
            <li><strong>Enable 2-Step Verification</strong> to protect your account from unauthorised access</li>
            <li><strong>Review your Google Profile</strong> — check what's publicly visible on your Google Account profile page</li>
          </ul>
          <p>These changes take about 10 minutes and significantly reduce the amount of data Google retains about you going forward.</p>
        </>
      ),
    },
  ],
  faqs: [
    { question: "How do I see everything Google knows about me?", answer: "Visit myactivity.google.com for your activity history, timeline.google.com for location data, adssettings.google.com for ad profiling, and takeout.google.com to download a complete copy of all your Google data." },
    { question: "Can I delete everything Google has on me?", answer: "Yes — you can delete specific data through My Activity, set up auto-deletion, or delete your entire Google Account. Be aware that deleting your account removes access to all Google services (Gmail, Drive, Photos, etc.), so download your data first." },
    { question: "Does Google sell my personal data?", answer: "Google states that it does not sell personal data directly. However, it uses your data to build detailed advertising profiles and target ads. The practical effect is that your data drives Google's advertising revenue, even if it's not 'sold' in the traditional sense." },
    { question: "How is Google data different from my digital footprint?", answer: "Google data is what Google specifically collects about you through its services. Your digital footprint is broader — it includes social media profiles, data broker listings, breach exposure, username reuse patterns, and any other publicly visible information. Managing both is important for comprehensive privacy." },
  ],
};

const WhatGoogleKnowsAboutYou = () => <QAGuideLayout data={data} />;
export default WhatGoogleKnowsAboutYou;
