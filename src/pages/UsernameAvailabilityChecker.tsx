import { ToolLandingTemplate } from "@/components/templates/ToolLandingTemplate";
import { toolPages } from "@/lib/seo/contentRegistry";

const entry = toolPages.find((e) => e.path === "/username-availability-checker")!;

export default function UsernameAvailabilityChecker() {
  return <ToolLandingTemplate entry={entry} />;
}
