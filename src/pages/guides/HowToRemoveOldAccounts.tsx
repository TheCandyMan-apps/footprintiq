import { GuideArticleTemplate } from "@/components/templates/GuideArticleTemplate";
import { guidePages } from "@/lib/seo/contentRegistry";
import { Link } from "react-router-dom";

const entry = guidePages.find((e) => e.path === "/guides/how-to-remove-old-accounts")!;

export default function HowToRemoveOldAccounts() {
  return (
    <GuideArticleTemplate entry={entry}>
      <p>
        Old, forgotten online accounts are a hidden privacy risk. They sit dormant, exposing personal
        data and increasing your attack surface. This guide shows you how to find and remove them.
      </p>

      <h2>Step 1: Discover Your Old Accounts</h2>
      <p>
        Start by running a{" "}
        <Link to="/username-search" className="text-primary hover:underline">username scan</Link>{" "}
        and an email breach check. These will surface accounts you may have forgotten about —
        forums, gaming sites, old social networks, and more.
      </p>

      <h2>Step 2: Prioritise by Risk</h2>
      <p>
        Not all old accounts carry the same risk. Prioritise those that contain:
      </p>
      <ul>
        <li>Real name, address, or phone number</li>
        <li>Financial information</li>
        <li>Private messages or photos</li>
        <li>Reused passwords from other active accounts</li>
      </ul>

      <h2>Step 3: Delete or Deactivate</h2>
      <p>
        Visit each platform's account settings to delete or deactivate your profile. If you can't
        find the option, search for "[platform name] delete account" — most have dedicated deletion pages.
      </p>

      <h2>Step 4: Request Data Removal</h2>
      <p>
        For platforms that don't offer self-service deletion, submit a data removal request under
        GDPR (EU/UK) or CCPA (California). Templates are available in our{" "}
        <Link to="/data-broker-removal-guide" className="text-primary hover:underline">
          data broker removal guide
        </Link>.
      </p>

      <h2>Step 5: Verify and Monitor</h2>
      <p>
        After deletion, run another scan to confirm the accounts are gone. Set up{" "}
        <Link to="/continuous-exposure-monitoring-explained" className="text-primary hover:underline">
          continuous monitoring
        </Link>{" "}
        to catch any that reappear.
      </p>
    </GuideArticleTemplate>
  );
}
