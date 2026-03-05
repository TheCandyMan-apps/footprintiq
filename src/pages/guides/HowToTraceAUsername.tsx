import { GuideArticleTemplate } from "@/components/templates/GuideArticleTemplate";
import { guidePages } from "@/lib/seo/contentRegistry";
import { Link } from "react-router-dom";

const entry = guidePages.find((e) => e.path === "/guides/how-to-trace-a-username")!;

export default function HowToTraceAUsername() {
  return (
    <GuideArticleTemplate entry={entry}>
      <p>
        Tracing a username across platforms is one of the most common OSINT tasks. This guide walks you
        through the process step by step, using ethical techniques and freely available tools.
      </p>

      <h2>Step 1: Start With What You Know</h2>
      <p>
        Begin with the exact username or handle you want to trace. Note any variations you've seen
        (e.g., with numbers, underscores, or different capitalisation).
      </p>

      <h2>Step 2: Run a Multi-Platform Scan</h2>
      <p>
        Use a{" "}
        <Link to="/username-search" className="text-primary hover:underline">username search tool</Link>{" "}
        to check the handle across 500+ platforms simultaneously. FootprintIQ combines multiple OSINT
        engines (Maigret, Sherlock, WhatsMyName) into a single scan.
      </p>

      <h2>Step 3: Filter False Positives</h2>
      <p>
        Common usernames will match on many platforms where different people own the handle.
        Look for corroborating signals: similar profile pictures, bios, linked accounts, or posting
        patterns to distinguish true matches from coincidental ones.
      </p>

      <h2>Step 4: Correlate and Assess</h2>
      <p>
        Once you have confirmed matches, assess the overall exposure. Consider which platforms reveal
        sensitive information and whether the username links to real-world identity data.
      </p>

      <h2>Tools Used by Investigators</h2>
      <ul>
        <li><strong>Maigret</strong> — Checks 2,500+ sites with detailed profile extraction</li>
        <li><strong>Sherlock</strong> — Fast, open-source username checker</li>
        <li><strong>WhatsMyName</strong> — Community-maintained username enumeration</li>
        <li><strong>FootprintIQ</strong> — Combines all of the above into one pipeline with AI-powered false-positive filtering</li>
      </ul>
    </GuideArticleTemplate>
  );
}
