import { ToolLandingTemplate } from "@/components/templates/ToolLandingTemplate";
import { toolPages } from "@/lib/seo/contentRegistry";

const entry = toolPages.find((e) => e.path === "/digital-footprint-investigation")!;

export default function DigitalFootprintInvestigation() {
  return <ToolLandingTemplate entry={entry} />;
}
