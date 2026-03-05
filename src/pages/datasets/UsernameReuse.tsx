import { DatasetTemplate } from "@/components/templates/DatasetTemplate";
import { datasetPages } from "@/lib/seo/contentRegistry";

const entry = datasetPages.find((e) => e.path === "/datasets/username-reuse")!;

export default function DatasetUsernameReuse() {
  return (
    <DatasetTemplate
      entry={entry}
      fields={[
        ["platform_category", "string", "Category of platform (social, forum, developer, gaming, etc.)"],
        ["reuse_rate_pct", "float", "Percentage of scanned usernames found on this platform category"],
        ["avg_platforms_per_username", "float", "Average number of platforms a reused username appears on"],
        ["cross_category_correlation", "float", "Rate at which usernames bridge different platform categories"],
        ["sample_size", "integer", "Number of anonymised scans in the aggregation window"],
        ["period", "string", "Aggregation period (e.g., 2026-Q1)"],
      ]}
      usageNotes="This dataset contains fully anonymised, aggregated statistics derived from opt-in scans. No individual usernames, emails, or identifying information are included. Data is aggregated quarterly and available under a Creative Commons BY-NC 4.0 licence. Suitable for academic research, privacy advocacy, and security awareness publications."
    />
  );
}
