import { GuideArticleTemplate } from "@/components/templates/GuideArticleTemplate";
import { guidePages } from "@/lib/seo/contentRegistry";
import { Link } from "react-router-dom";

const entry = guidePages.find((e) => e.path === "/guides/why-username-reuse-is-risky")!;

export default function WhyUsernameReuseIsRiskyGuide() {
  return (
    <GuideArticleTemplate entry={entry}>
      <p>
        Using the same username across multiple platforms might seem convenient, but it creates a
        significant privacy and security risk. This guide explains why and what you can do about it.
      </p>

      <h2>The Problem With Username Reuse</h2>
      <p>
        When you use the same handle everywhere, anyone can search that username and instantly discover
        all your linked public accounts. This makes it trivial to build a comprehensive profile of
        your online activity, interests, and even your location.
      </p>

      <h2>How Attackers Exploit Username Reuse</h2>
      <ul>
        <li><strong>Social engineering:</strong> Correlating accounts reveals personal details useful for phishing.</li>
        <li><strong>Credential stuffing:</strong> A breached password on one site may work on others where you use the same handle.</li>
        <li><strong>Doxxing:</strong> Cross-referencing platforms can link an anonymous handle to a real identity.</li>
      </ul>

      <h2>How to Reduce Your Risk</h2>
      <ol>
        <li>
          <Link to="/check-my-digital-footprint" className="text-primary hover:underline">Run a digital footprint scan</Link>{" "}
          to see where your username appears.
        </li>
        <li>Use unique handles for high-sensitivity accounts (banking, email, health).</li>
        <li>Consider using a password manager that also manages unique usernames.</li>
        <li>
          <Link to="/guides/how-to-remove-old-accounts" className="text-primary hover:underline">Delete old accounts</Link>{" "}
          you no longer use.
        </li>
      </ol>

      <h2>The Data</h2>
      <p>
        Our{" "}
        <Link to="/research/username-reuse-statistics" className="text-primary hover:underline">
          username reuse research
        </Link>{" "}
        shows that over 60% of users reuse the same username across 3 or more platforms, with the
        average user having 7+ discoverable accounts linked to a single handle.
      </p>
    </GuideArticleTemplate>
  );
}
