/**
 * Build-time sitemap generator.
 * Run: npx tsx scripts/generate-sitemaps.ts
 * Outputs static XML files to public/ so they're served at root.
 */
import { writeFileSync } from "fs";
import { resolve } from "path";
import {
  buildSitemapXml,
  buildSitemapIndexXml,
  toolRoutes,
  guideRoutes,
  glossaryRoutes,
  researchRoutes,
  datasetRoutes,
  aiAnswerRoutes,
  staticRoutes,
} from "../src/lib/seo/sitemapRoutes";

const out = (name: string, content: string) => {
  const p = resolve(__dirname, "../public", name);
  writeFileSync(p, content, "utf-8");
  console.log(`✓ ${name} (${content.length} bytes)`);
};

out("sitemap.xml", buildSitemapIndexXml());
out("sitemap-tools.xml", buildSitemapXml(toolRoutes));
out("sitemap-guides.xml", buildSitemapXml(guideRoutes));
out("sitemap-glossary.xml", buildSitemapXml(glossaryRoutes));
out("sitemap-research.xml", buildSitemapXml(researchRoutes));
out("sitemap-datasets.xml", buildSitemapXml(datasetRoutes));
out("sitemap-ai-answers.xml", buildSitemapXml(aiAnswerRoutes));
out("sitemap-static.xml", buildSitemapXml(staticRoutes));

console.log("\nAll sitemaps generated.");
