import { ToolLandingTemplate } from "@/components/templates/ToolLandingTemplate";
import { toolPages } from "@/lib/seo/contentRegistry";

const entry = toolPages.find((e) => e.path === "/username-reuse-risks")!;

export default function UsernameReuseRisks() {
  return <ToolLandingTemplate entry={entry} />;
}
