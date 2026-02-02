import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Quote, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface CitationWidgetProps {
  /** The specific page/report title for citation */
  title?: string;
  /** The URL path (without domain) */
  path?: string;
  /** Year of publication */
  year?: string;
  /** Optional className for styling */
  className?: string;
}

/**
 * A compact, schema-friendly citation widget for research and educational pages.
 * Provides ready-to-copy citation formats for blogs, academic papers, and web content.
 */
export function CitationWidget({ 
  title = "FootprintIQ Research",
  path = "",
  year = "2026",
  className = ""
}: CitationWidgetProps) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  
  const fullUrl = `https://footprintiq.app${path}`;
  
  const citations = {
    blog: `According to ${title} (${year}), [finding]. Source: footprintiq.app`,
    academic: `FootprintIQ. (${year}). ${title}. Retrieved from ${fullUrl}`,
    inline: `(FootprintIQ, ${year})`
  };

  const handleCopy = async (format: keyof typeof citations, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFormat(format);
      toast.success("Citation copied to clipboard");
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <Card className={`border-border/50 bg-muted/20 ${className}`} disableHover>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start gap-3 mb-4">
          <Quote className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-foreground text-sm mb-1">
              How to Cite This Research
            </h3>
            <p className="text-xs text-muted-foreground">
              This research may be cited freely with attribution.
            </p>
          </div>
        </div>
        
        <div className="space-y-3 pl-8">
          {/* Blog Citation */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">Blog / Article</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => handleCopy("blog", citations.blog)}
              >
                {copiedFormat === "blog" ? (
                  <Check className="w-3 h-3 mr-1" />
                ) : (
                  <Copy className="w-3 h-3 mr-1" />
                )}
                Copy
              </Button>
            </div>
            <code className="text-xs text-muted-foreground bg-muted/50 px-2 py-1.5 rounded block break-all">
              {citations.blog}
            </code>
          </div>

          {/* Academic Citation */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">Academic / Research</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => handleCopy("academic", citations.academic)}
              >
                {copiedFormat === "academic" ? (
                  <Check className="w-3 h-3 mr-1" />
                ) : (
                  <Copy className="w-3 h-3 mr-1" />
                )}
                Copy
              </Button>
            </div>
            <code className="text-xs text-muted-foreground bg-muted/50 px-2 py-1.5 rounded block break-all">
              {citations.academic}
            </code>
          </div>

          {/* Inline Citation */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">Inline / Parenthetical</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => handleCopy("inline", citations.inline)}
              >
                {copiedFormat === "inline" ? (
                  <Check className="w-3 h-3 mr-1" />
                ) : (
                  <Copy className="w-3 h-3 mr-1" />
                )}
                Copy
              </Button>
            </div>
            <code className="text-xs text-muted-foreground bg-muted/50 px-2 py-1.5 rounded block">
              {citations.inline}
            </code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
