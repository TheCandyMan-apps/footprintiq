import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useSearchParams, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Copy, ChevronDown, ExternalLink, AlertTriangle, Check, X, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  toolPages, guidePages, glossaryPages, researchPages, datasetPages, aiAnswerPages,
  type ContentEntry
} from "@/lib/seo/contentRegistry";
import { platformPages, type PlatformEntry } from "@/lib/seo/platformRegistry";
import { comparisonPages, type ComparisonEntry } from "@/lib/seo/comparisonRegistry";
import {
  CANONICAL_BASE,
  toolRoutes, guideRoutes, glossaryRoutes, researchRoutes, datasetRoutes,
  aiAnswerRoutes, topicHubRoutes, faqHubRoutes, staticRoutes,
  type SitemapEntry,
} from "@/lib/seo/sitemapRoutes";
import {
  buildSoftwareApplicationSchema, buildFAQSchema, buildArticleSchema,
  buildDefinedTermSchema, buildDatasetSchema, buildBreadcrumbListSchema,
} from "@/lib/seo/schema";

const BUILD_DATE = new Date().toISOString().slice(0, 10);

// NOINDEX paths (prefix match)
const NOINDEX_PREFIXES = [
  "/seo-debug", "/scan", "/result", "/dashboard", "/admin", "/settings",
  "/account", "/auth", "/onboarding", "/workspace",
];

function isNoindex(path: string): boolean {
  return NOINDEX_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
}

// All sitemap paths for cross-check
function allSitemapPaths(): Set<string> {
  const all = [
    ...toolRoutes, ...guideRoutes, ...glossaryRoutes, ...researchRoutes,
    ...datasetRoutes, ...aiAnswerRoutes, ...topicHubRoutes, ...faqHubRoutes, ...staticRoutes,
  ];
  return new Set(all.map((e) => e.path));
}

type RowType = "Tool" | "Guide" | "Glossary" | "Research" | "Dataset" | "AI Answer" | "Topic Hub" | "FAQ Hub" | "Platform" | "Comparison";

interface DebugRow {
  type: RowType;
  path: string;
  title: string;
  description: string;
  primaryKeyword: string;
  relatedCount: number;
  canonical: string;
  indexable: boolean;
  schemas: string[];
  issues: string[];
  schemaPayloads: Record<string, unknown>[];
}

function computeCanonical(path: string): string {
  return `${CANONICAL_BASE}${path}`;
}

function detectIssues(path: string, canonical: string, indexable: boolean, inSitemap: boolean): string[] {
  const issues: string[] = [];
  if (canonical.includes("//") && !canonical.startsWith("https://") && !canonical.startsWith("http://")) {
    issues.push("Double slashes in canonical");
  }
  // Check for double slashes after protocol
  const afterProtocol = canonical.replace(/^https?:\/\//, "");
  if (afterProtocol.includes("//")) issues.push("Double slashes in canonical path");
  if (canonical.includes("?")) issues.push("Query params in canonical");
  if (canonical.includes("#")) issues.push("Hash in canonical");
  if (indexable && !inSitemap) issues.push("Indexable but not in sitemap");
  if (!indexable && inSitemap) issues.push("NOINDEX but appears in sitemap");
  return issues;
}

function tryBuildSchema(fn: () => unknown, label: string): { result: unknown | null; error: string | null } {
  try {
    const result = fn();
    if (!result || typeof result !== "object") return { result: null, error: `${label}: invalid shape` };
    return { result, error: null };
  } catch (e) {
    return { result: null, error: `${label}: ${e instanceof Error ? e.message : "unknown error"}` };
  }
}

function buildRows(): DebugRow[] {
  const sitemapPaths = allSitemapPaths();
  const rows: DebugRow[] = [];

  const addContentEntries = (entries: ContentEntry[], type: RowType, schemaTypes: string[]) => {
    for (const e of entries) {
      const canonical = computeCanonical(e.path);
      const indexable = !isNoindex(e.path);
      const issues = detectIssues(e.path, canonical, indexable, sitemapPaths.has(e.path));
      const payloads: Record<string, unknown>[] = [];
      const schemaErrors: string[] = [];

      if (schemaTypes.includes("SoftwareApplication")) {
        const { result, error } = tryBuildSchema(buildSoftwareApplicationSchema, "SoftwareApplication");
        if (result) payloads.push(result as Record<string, unknown>);
        if (error) schemaErrors.push(error);
      }
      if (schemaTypes.includes("Article")) {
        const { result, error } = tryBuildSchema(() => buildArticleSchema({ headline: e.title, description: e.description, url: e.path }), "Article");
        if (result) payloads.push(result as Record<string, unknown>);
        if (error) schemaErrors.push(error);
      }
      if (schemaTypes.includes("FAQ") && e.faqs.length > 0) {
        const { result, error } = tryBuildSchema(() => buildFAQSchema(e.faqs), "FAQ");
        if (result) payloads.push(result as Record<string, unknown>);
        if (error) schemaErrors.push(error);
      }
      if (schemaTypes.includes("DefinedTerm")) {
        const { result, error } = tryBuildSchema(() => buildDefinedTermSchema({ name: e.title, description: e.description, url: e.path }), "DefinedTerm");
        if (result) payloads.push(result as Record<string, unknown>);
        if (error) schemaErrors.push(error);
      }
      if (schemaTypes.includes("Dataset")) {
        const { result, error } = tryBuildSchema(() => buildDatasetSchema({ name: e.title, description: e.description, url: e.path }), "Dataset");
        if (result) payloads.push(result as Record<string, unknown>);
        if (error) schemaErrors.push(error);
      }
      // Always add Breadcrumb
      const { result: bc, error: bcErr } = tryBuildSchema(() => buildBreadcrumbListSchema([{ name: "Home", path: "/" }, { name: e.title.split(" | ")[0] }]), "Breadcrumb");
      if (bc) payloads.push(bc as Record<string, unknown>);
      if (bcErr) schemaErrors.push(bcErr);

      issues.push(...schemaErrors);

      rows.push({
        type, path: e.path, title: e.title,
        description: e.description.slice(0, 120) + (e.description.length > 120 ? "…" : ""),
        primaryKeyword: e.primaryKeyword, relatedCount: e.related.length,
        canonical, indexable, schemas: schemaTypes, issues, schemaPayloads: payloads,
      });
    }
  };

  addContentEntries(toolPages, "Tool", ["SoftwareApplication", "FAQ", "Breadcrumb"]);
  addContentEntries(guidePages, "Guide", ["Article", "FAQ", "Breadcrumb"]);
  addContentEntries(glossaryPages, "Glossary", ["DefinedTerm", "Breadcrumb"]);
  addContentEntries(researchPages, "Research", ["Article", "Breadcrumb"]);
  addContentEntries(datasetPages, "Dataset", ["Dataset", "Breadcrumb"]);
  addContentEntries(aiAnswerPages, "AI Answer", ["Article", "FAQ", "Breadcrumb"]);

  // Topic hubs
  for (const entry of topicHubRoutes) {
    const canonical = computeCanonical(entry.path);
    const indexable = !isNoindex(entry.path);
    const issues = detectIssues(entry.path, canonical, indexable, sitemapPaths.has(entry.path));
    rows.push({
      type: "Topic Hub", path: entry.path, title: entry.path.split("/").pop() || "",
      description: "", primaryKeyword: "", relatedCount: 0,
      canonical, indexable, schemas: ["Article", "FAQ", "Breadcrumb"], issues, schemaPayloads: [],
    });
  }

  // FAQ hubs
  for (const entry of faqHubRoutes) {
    const canonical = computeCanonical(entry.path);
    const indexable = !isNoindex(entry.path);
    const issues = detectIssues(entry.path, canonical, indexable, sitemapPaths.has(entry.path));
    rows.push({
      type: "FAQ Hub", path: entry.path, title: entry.path.split("/").pop() || "",
      description: "", primaryKeyword: "", relatedCount: 0,
      canonical, indexable, schemas: ["FAQPage", "Breadcrumb"], issues, schemaPayloads: [],
    });
  }

  // Platforms
  for (const p of platformPages) {
    const path = `/platforms/${p.slug}/username-search`;
    const canonical = computeCanonical(path);
    const indexable = true;
    const issues = detectIssues(path, canonical, indexable, sitemapPaths.has(path));
    rows.push({
      type: "Platform", path, title: `${p.name} Username Search`,
      description: p.description.slice(0, 120) + (p.description.length > 120 ? "…" : ""),
      primaryKeyword: p.primaryKeyword, relatedCount: p.relatedTools.length + p.relatedGuides.length,
      canonical, indexable, schemas: ["SoftwareApplication", "FAQ", "Breadcrumb"], issues, schemaPayloads: [],
    });
  }

  // Comparisons
  for (const c of comparisonPages) {
    const path = `/comparisons/${c.slug}`;
    const canonical = computeCanonical(path);
    const indexable = true;
    const issues = detectIssues(path, canonical, indexable, sitemapPaths.has(path));
    rows.push({
      type: "Comparison", path, title: `${c.name} vs FootprintIQ`,
      description: c.description.slice(0, 120) + (c.description.length > 120 ? "…" : ""),
      primaryKeyword: c.primaryKeyword, relatedCount: c.relatedTools.length + c.relatedGuides.length,
      canonical, indexable, schemas: ["Article", "FAQ", "Breadcrumb"], issues, schemaPayloads: [],
    });
  }

  return rows;
}

const SITEMAPS = [
  "sitemap.xml", "sitemap-tools.xml", "sitemap-guides.xml", "sitemap-glossary.xml",
  "sitemap-research.xml", "sitemap-datasets.xml", "sitemap-ai-answers.xml",
  "sitemap-topics.xml", "sitemap-faq.xml", "sitemap-static.xml",
];

const TYPE_COLORS: Record<RowType, string> = {
  Tool: "bg-primary/10 text-primary",
  Guide: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Glossary: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  Research: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Dataset: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "AI Answer": "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  "Topic Hub": "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  "FAQ Hub": "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  Platform: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  Comparison: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="ghost" size="icon"
      className="h-6 w-6"
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
}

export default function SeoDebugPage() {
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [searchParams] = useSearchParams();
  const debugKey = import.meta.env.VITE_SEO_DEBUG_KEY || "dev";

  // Access check: admin role OR ?key=dev
  const keyParam = searchParams.get("key");
  const hasAccess = isAdmin || keyParam === debugKey;

  const [filter, setFilter] = useState("");

  const rows = useMemo(() => buildRows(), []);
  const filteredRows = useMemo(() => {
    if (!filter) return rows;
    const q = filter.toLowerCase();
    return rows.filter(
      (r) => r.path.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.primaryKeyword.toLowerCase().includes(q) || r.type.toLowerCase().includes(q)
    );
  }, [rows, filter]);

  const issueCount = rows.filter((r) => r.issues.length > 0).length;
  const typeCounts = rows.reduce<Record<string, number>>((acc, r) => { acc[r.type] = (acc[r.type] || 0) + 1; return acc; }, {});

  if (adminLoading) {
    return (
      <>
        <Helmet><meta name="robots" content="noindex,nofollow" /><title>SEO Debug</title></Helmet>
        <div className="flex items-center justify-center min-h-screen"><p className="text-muted-foreground">Loading…</p></div>
      </>
    );
  }

  if (!hasAccess) {
    return (
      <>
        <Helmet><meta name="robots" content="noindex,nofollow" /><title>Page Not Found</title></Helmet>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <h1 className="text-4xl font-bold text-foreground">404</h1>
          <p className="text-muted-foreground">Page not found</p>
          <Link to="/" className="text-primary underline">Go home</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
        <title>SEO Debug — FootprintIQ</title>
      </Helmet>

      <div className="min-h-screen bg-background p-4 md:p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">SEO Debug Dashboard</h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span><strong>BUILD_DATE:</strong> {BUILD_DATE}</span>
            <span><strong>CANONICAL_BASE:</strong> {CANONICAL_BASE}</span>
            <span><strong>Total routes:</strong> {rows.length}</span>
            <span className={issueCount > 0 ? "text-destructive font-medium" : "text-emerald-600"}>
              <strong>Issues:</strong> {issueCount}
            </span>
          </div>
        </div>

        {/* Sitemap quick links */}
        <div className="mb-6 p-4 rounded-lg border border-border bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground mb-2">Sitemap & Crawl Files</h2>
          <div className="flex flex-wrap gap-2">
            <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-muted text-muted-foreground hover:text-foreground transition-colors">
              robots.txt <ExternalLink className="h-3 w-3" />
            </a>
            {SITEMAPS.map((s) => (
              <a key={s} href={`/${s}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-muted text-muted-foreground hover:text-foreground transition-colors">
                {s} <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        </div>

        {/* Type counts */}
        <div className="mb-6 flex flex-wrap gap-2">
          {Object.entries(typeCounts).map(([type, count]) => (
            <span key={type} className={cn("text-xs font-medium px-2 py-1 rounded", TYPE_COLORS[type as RowType] || "bg-muted text-muted-foreground")}>
              {type}: {count}
            </span>
          ))}
        </div>

        {/* Filter */}
        <div className="mb-4">
          <Input
            placeholder="Filter by path, title, keyword, or type…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-24">Type</TableHead>
                <TableHead>Path</TableHead>
                <TableHead className="hidden lg:table-cell">Title</TableHead>
                <TableHead className="hidden xl:table-cell">Canonical</TableHead>
                <TableHead className="w-20 text-center">Index</TableHead>
                <TableHead className="hidden md:table-cell">Schema</TableHead>
                <TableHead className="w-24">Issues</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((row) => (
                <Collapsible key={row.path} asChild>
                  <>
                    <CollapsibleTrigger asChild>
                      <TableRow className="cursor-pointer hover:bg-muted/30 group">
                        <TableCell>
                          <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded", TYPE_COLORS[row.type])}>
                            {row.type}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Link to={row.path} className="text-sm text-primary hover:underline truncate max-w-[200px]" onClick={(e) => e.stopPropagation()}>
                              {row.path}
                            </Link>
                            <ChevronDown className="h-3 w-3 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform" />
                          </div>
                          {row.primaryKeyword && (
                            <span className="text-xs text-muted-foreground">{row.primaryKeyword}</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-xs text-muted-foreground truncate block max-w-[250px]">{row.title}</span>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">{row.canonical}</span>
                            <CopyButton text={row.canonical} />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {row.indexable ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600"><Eye className="h-3 w-3" /> Yes</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-destructive"><EyeOff className="h-3 w-3" /> No</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-xs text-muted-foreground">{row.schemas.join(", ")}</span>
                        </TableCell>
                        <TableCell>
                          {row.issues.length > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs text-destructive font-medium">
                              <AlertTriangle className="h-3 w-3" /> {row.issues.length}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                              <Check className="h-3 w-3" /> OK
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    </CollapsibleTrigger>
                    <CollapsibleContent asChild>
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/20 p-4">
                          <div className="grid gap-3 text-sm">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              <div>
                                <span className="text-xs font-medium text-muted-foreground">Canonical</span>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <code className="text-xs break-all">{row.canonical}</code>
                                  <CopyButton text={row.canonical} />
                                </div>
                              </div>
                              <div>
                                <span className="text-xs font-medium text-muted-foreground">Keyword</span>
                                <p className="text-xs mt-0.5">{row.primaryKeyword || "—"}</p>
                              </div>
                              <div>
                                <span className="text-xs font-medium text-muted-foreground">Related links</span>
                                <p className="text-xs mt-0.5">{row.relatedCount}</p>
                              </div>
                              <div>
                                <span className="text-xs font-medium text-muted-foreground">Description</span>
                                <p className="text-xs mt-0.5 text-muted-foreground">{row.description || "—"}</p>
                              </div>
                            </div>

                            {row.issues.length > 0 && (
                              <div className="p-2 rounded bg-destructive/10 border border-destructive/20">
                                <span className="text-xs font-medium text-destructive">Issues:</span>
                                <ul className="list-disc list-inside text-xs text-destructive mt-1">
                                  {row.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                                </ul>
                              </div>
                            )}

                            {row.schemaPayloads.length > 0 && (
                              <div>
                                <span className="text-xs font-medium text-muted-foreground">JSON-LD Preview</span>
                                <pre className="mt-1 p-2 rounded bg-muted text-xs overflow-auto max-h-60 border border-border">
                                  {JSON.stringify(row.schemaPayloads, null, 2)}
                                </pre>
                              </div>
                            )}

                            {row.schemaPayloads.length === 0 && (
                              <p className="text-xs text-muted-foreground italic">Schema payloads not pre-rendered for this type. Visit the page to see live JSON-LD.</p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredRows.length === 0 && (
          <p className="text-center py-8 text-muted-foreground">No routes match your filter.</p>
        )}
      </div>
    </>
  );
}
