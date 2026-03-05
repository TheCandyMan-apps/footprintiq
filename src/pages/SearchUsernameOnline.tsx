import { ToolLandingTemplate } from "@/components/templates/ToolLandingTemplate";
import { toolPages } from "@/lib/seo/contentRegistry";

const entry = toolPages.find((e) => e.path === "/search-username-online")!;

export default function SearchUsernameOnline() {
  return <ToolLandingTemplate entry={entry} />;
}
