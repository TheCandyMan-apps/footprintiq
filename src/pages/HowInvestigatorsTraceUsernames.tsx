import { ToolLandingTemplate } from "@/components/templates/ToolLandingTemplate";
import { toolPages } from "@/lib/seo/contentRegistry";

const entry = toolPages.find((e) => e.path === "/how-investigators-trace-usernames")!;

export default function HowInvestigatorsTraceUsernames() {
  return <ToolLandingTemplate entry={entry} />;
}
