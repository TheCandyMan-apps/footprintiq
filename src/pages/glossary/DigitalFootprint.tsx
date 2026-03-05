import { GlossaryTemplate } from "@/components/templates/GlossaryTemplate";
import { glossaryPages } from "@/lib/seo/contentRegistry";

const entry = glossaryPages.find((e) => e.path === "/glossary/digital-footprint")!;

export default function GlossaryDigitalFootprint() {
  return (
    <GlossaryTemplate
      entry={entry}
      definition="A digital footprint is the trail of data you create through your online activity. It includes everything from social media profiles and forum posts to data broker entries, search history, and breach records. Your digital footprint can be active (data you deliberately share) or passive (data collected about you without direct action)."
      examples={[
        "A public Instagram profile with your name, location, and photos is part of your active digital footprint.",
        "A data broker listing your address and phone number, compiled from public records, is part of your passive digital footprint.",
        "An old forum account you forgot about, still indexed by Google, contributes to your digital footprint.",
      ]}
      whyItMatters="Your digital footprint determines how visible you are online. A large, unmanaged footprint increases your risk of identity theft, social engineering, doxxing, and unwanted profiling. Regular audits help you understand and reduce your exposure."
    />
  );
}
