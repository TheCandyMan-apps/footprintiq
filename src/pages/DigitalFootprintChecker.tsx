import { ToolLandingTemplate } from "@/components/templates/ToolLandingTemplate";
import { toolPages } from "@/lib/seo/contentRegistry";

const entry = toolPages.find((e) => e.path === "/digital-footprint-checker")!;

export default function DigitalFootprintChecker() {
  return <ToolLandingTemplate entry={entry} />;
}
