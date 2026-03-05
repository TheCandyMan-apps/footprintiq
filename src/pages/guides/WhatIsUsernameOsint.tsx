import { GuideArticleTemplate } from "@/components/templates/GuideArticleTemplate";
import { guidePages } from "@/lib/seo/contentRegistry";
import { Link } from "react-router-dom";

const entry = guidePages.find((e) => e.path === "/guides/what-is-username-osint")!;

export default function WhatIsUsernameOsint() {
  return (
    <GuideArticleTemplate entry={entry}>
      <p>
        Username OSINT (Open Source Intelligence) is the practice of using publicly available information to trace
        a username across online platforms, correlate identities, and assess digital exposure.
      </p>

      <h2>How Username OSINT Works</h2>
      <p>
        When you search a username, tools like Maigret, Sherlock, and WhatsMyName check hundreds of platforms
        simultaneously for matching profiles. The results are then filtered for false positives and correlated
        to build a picture of the username's online presence.
      </p>

      <h2>Why It Matters</h2>
      <p>
        Understanding where a username appears online is essential for personal privacy audits,
        risk assessment, and authorised investigations. Many people reuse the same handle across
        platforms, creating a traceable digital footprint that can be exploited by bad actors.
      </p>

      <h2>Ethical Considerations</h2>
      <p>
        Username OSINT must be conducted ethically. FootprintIQ only accesses publicly available data
        and follows the principles outlined in our{" "}
        <Link to="/ethical-osint-charter" className="text-primary hover:underline">Ethical OSINT Charter</Link>.
        It should never be used for harassment, stalking, or any form of unauthorised surveillance.
      </p>

      <h2>Getting Started</h2>
      <p>
        The simplest way to start is with a{" "}
        <Link to="/username-search" className="text-primary hover:underline">free username search</Link>.
        Enter any handle and FootprintIQ will scan 500+ platforms in seconds.
      </p>
    </GuideArticleTemplate>
  );
}
