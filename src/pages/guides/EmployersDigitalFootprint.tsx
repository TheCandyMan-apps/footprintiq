import React from "react";
import { Link } from "react-router-dom";
import { QAGuideLayout, qaGuideLinks, type QAGuideData } from "@/components/guides/QAGuideLayout";

const data: QAGuideData = {
  slug: "guides/employers-digital-footprint",
  title: "How Employers Can See Your Digital Footprint (2026 Guide) | FootprintIQ",
  metaDescription: "Learn what employers can find about you online during hiring. Understand background checks, social media screening, and how to manage your digital footprint before job applications.",
  h1: "How Employers Can See Your Digital Footprint",
  subtitle: "What hiring managers actually look for online, what they're legally allowed to check, and how to prepare your digital presence before applying for jobs.",
  relatedGuides: qaGuideLinks,
  sections: [
    {
      heading: "Why Employers Check Your Online Presence",
      content: (
        <>
          <p>The majority of employers now conduct some form of online screening during the hiring process. According to multiple industry surveys, over 70% of hiring managers review candidates' social media profiles, and many use dedicated background check services that aggregate online information.</p>
          <p>This isn't necessarily invasive — employers have legitimate reasons for checking. They want to verify the information on your CV, assess cultural fit, check for red flags, and understand who they're potentially hiring. But it means that your digital footprint can directly impact your career prospects.</p>
          <p>Understanding what employers can see — and what they can't legally use — puts you in a stronger position when applying for jobs.</p>
        </>
      ),
    },
    {
      heading: "What Employers Typically Search For",
      content: (
        <>
          <p>When a hiring manager or recruiter looks you up, they typically check the following:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Google search results</strong> — Your name, often combined with your city or profession. The first page of results creates an immediate impression.</li>
            <li><strong>LinkedIn profile</strong> — Almost always checked. Employers look for consistency with your CV, endorsements, activity, and connections.</li>
            <li><strong>Public social media</strong> — Facebook, Instagram, X (Twitter), TikTok. They look for professionalism, controversial content, or anything that contradicts your application.</li>
            <li><strong>Professional portfolios</strong> — GitHub profiles, personal websites, published articles, public contributions to industry discussions.</li>
            <li><strong>News and media mentions</strong> — Any press coverage, court records, or public notices associated with your name.</li>
          </ul>
          <p>Importantly, most employers check what's publicly visible — they don't typically try to access private profiles or use deceptive methods. But that still means anything you haven't explicitly set to private is fair game.</p>
        </>
      ),
    },
    {
      heading: "Background Check Services Employers Use",
      content: (
        <>
          <p>Beyond manual searching, many companies use formal background check services. These services aggregate public records, social media data, and other sources into a report. Common providers include Checkr, Sterling, GoodHire, and HireRight.</p>
          <p>These services can compile:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Criminal records (where legally permitted)</li>
            <li>Employment history verification</li>
            <li>Education verification</li>
            <li>Social media screening reports</li>
            <li>Public records (court filings, property records, etc.)</li>
          </ul>
          <p>In many jurisdictions, employers are required to get your consent before running a background check. In the US, the Fair Credit Reporting Act (FCRA) governs this process. In the EU and UK, GDPR provides additional protections regarding how personal data is processed during hiring.</p>
        </>
      ),
    },
    {
      heading: "What Employers Legally Cannot Do",
      content: (
        <>
          <p>There are important legal boundaries. While laws vary by country and region, common protections include:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Protected characteristics:</strong> Employers cannot use information about race, religion, gender, sexual orientation, disability, age, or pregnancy in hiring decisions, even if they find it online.</li>
            <li><strong>Private accounts:</strong> Requesting passwords or access to private social media accounts is illegal in many US states and under EU law.</li>
            <li><strong>Spent convictions:</strong> In many jurisdictions, employers cannot consider criminal convictions that have been legally spent or expunged.</li>
            <li><strong>Consent requirements:</strong> Many background check processes require your written consent before proceeding.</li>
          </ul>
          <p>However, enforcement varies. Just because an employer shouldn't use certain information doesn't guarantee they won't see it. That's why managing your public visibility proactively is important.</p>
        </>
      ),
    },
    {
      heading: "How to Audit Your Digital Footprint Before a Job Application",
      content: (
        <>
          <p>Before applying for a position, take time to review what an employer would find. Here's a practical checklist:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Search your name in an incognito browser window and review the first three pages</li>
            <li>Review every social media profile's privacy settings — pay special attention to old posts</li>
            <li>Check if your username appears on platforms you've forgotten about using a <Link to="/username-checker" className="text-accent hover:underline">username checker</Link></li>
            <li>Google your email address and phone number to see if they appear on data broker sites</li>
            <li>Review your LinkedIn profile for accuracy and completeness</li>
            <li>Check for any public forum posts or comments under your real name</li>
          </ul>
          <p>Tools like FootprintIQ can automate much of this process. A <Link to="/scan" className="text-accent hover:underline">digital footprint scan</Link> checks hundreds of public platforms and provides a structured view of what's visible — saving you hours of manual searching.</p>
        </>
      ),
    },
    {
      heading: "How to Clean Up What Employers Might Find",
      content: (
        <>
          <p>Once you know what's visible, you can take action:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Delete or deactivate</strong> old social media accounts you no longer use</li>
            <li><strong>Set profiles to private</strong> on platforms where you want to limit visibility</li>
            <li><strong>Remove or untag</strong> photos and posts that don't represent you professionally</li>
            <li><strong>Request removal</strong> from data broker sites using their opt-out processes</li>
            <li><strong>Create positive content</strong> — a professional website, LinkedIn articles, or a portfolio can push negative results down in search rankings</li>
          </ul>
          <p>Services like DeleteMe and Incogni can automate data broker removal. FootprintIQ helps you <Link to="/guides/clean-up-online-presence" className="text-accent hover:underline">prioritise what to address</Link> by scoring exposure risk and providing a remediation roadmap.</p>
        </>
      ),
    },
    {
      heading: "The Bottom Line",
      content: (
        <>
          <p>Your digital footprint is part of your professional identity. Employers will look, and what they find shapes their perception of you — often before you've even had an interview.</p>
          <p>The good news is that you have significant control. By understanding what's publicly visible and taking proactive steps to manage it, you can ensure that your online presence works for you rather than against you.</p>
          <p>Start with a self-audit, address the highest-risk exposures first, and set up ongoing monitoring to stay ahead. Whether you do this manually, use a tool like FootprintIQ, or combine multiple services, the important thing is to take that first step.</p>
        </>
      ),
    },
  ],
  faqs: [
    { question: "Do employers really check social media before hiring?", answer: "Yes. Multiple industry surveys consistently show that over 70% of employers review candidates' social media profiles during the hiring process. This typically includes LinkedIn, Facebook, Instagram, and X (Twitter), focusing on publicly visible content." },
    { question: "Can an employer reject me based on what they find online?", answer: "Generally, yes — as long as the reason isn't related to a protected characteristic (race, religion, gender, etc.). Employers can consider publicly visible behaviour, professionalism, and consistency with your application, but they must comply with anti-discrimination laws in their jurisdiction." },
    { question: "How can I check what an employer would see about me?", answer: "Search your name in an incognito browser, review your social media privacy settings, check data broker sites, and search for your username across platforms. A digital footprint scanner like FootprintIQ automates this process across hundreds of sources." },
    { question: "Is it legal for employers to ask for my social media passwords?", answer: "In many jurisdictions, no. Several US states have passed laws specifically prohibiting employers from requesting social media passwords. EU and UK data protection laws also restrict this practice. However, employers can view anything that's publicly visible." },
  ],
};

const EmployersDigitalFootprint = () => <QAGuideLayout data={data} />;
export default EmployersDigitalFootprint;
