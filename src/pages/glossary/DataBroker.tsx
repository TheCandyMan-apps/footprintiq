import { GlossaryTemplate } from "@/components/templates/GlossaryTemplate";
import { glossaryPages } from "@/lib/seo/contentRegistry";

const entry = glossaryPages.find((e) => e.path === "/glossary/data-broker")!;

export default function GlossaryDataBroker() {
  return (
    <GlossaryTemplate
      entry={entry}
      definition="A data broker is a company that collects personal information from public records, social media, commercial transactions, and other sources, then aggregates, packages, and sells or licenses this data to third parties. Data brokers operate legally in most jurisdictions but often without the knowledge or explicit consent of the individuals whose data they trade."
      examples={[
        "Spokeo, BeenVerified, and MyLife are well-known consumer data brokers that compile profiles from public records.",
        "Marketing data brokers sell consumer segmentation data to advertisers based on browsing habits and purchase history.",
        "Background check services like Checkr aggregate data broker information for employer screening.",
      ]}
      whyItMatters="Data brokers make your personal information available to anyone willing to pay. This can include your home address, phone number, email, relatives' names, and even income estimates. Opting out of data broker databases is a critical step in reducing your digital footprint and protecting against identity theft, stalking, and unwanted contact."
    />
  );
}
