import { ToolLandingTemplate } from "@/components/templates/ToolLandingTemplate";
import { toolPages } from "@/lib/seo/contentRegistry";

const entry = toolPages.find((e) => e.path === "/where-is-this-username-used")!;

export default function WhereIsThisUsernameUsed() {
  return <ToolLandingTemplate entry={entry} />;
}
