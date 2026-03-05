import { GlossaryTemplate } from "@/components/templates/GlossaryTemplate";
import { glossaryPages } from "@/lib/seo/contentRegistry";

const entry = glossaryPages.find((e) => e.path === "/glossary/username-osint")!;

export default function GlossaryUsernameOsint() {
  return (
    <GlossaryTemplate
      entry={entry}
      definition="Username OSINT is the practice of using publicly available data to trace a username across online platforms and correlate digital identities. It is a subset of Open Source Intelligence (OSINT) focused specifically on handle-based identity enumeration."
      examples={[
        "Searching 'alex_m' across 500+ platforms to discover matching social media profiles, forum accounts, and developer profiles.",
        "Cross-referencing a username found in a data breach with public social media accounts to assess exposure.",
        "Auditing your own username to understand your digital footprint before a job interview or background check.",
      ]}
      whyItMatters="Username OSINT reveals how much of your identity is traceable from a single handle. Understanding this exposure is the first step to reducing it. For security professionals, it's a core technique in threat assessment and digital investigations."
    />
  );
}
