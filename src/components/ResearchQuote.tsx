import { Quote } from "lucide-react";

interface ResearchQuoteProps {
  children: string;
  source?: string;
  year?: string;
  className?: string;
}

/**
 * A schema-friendly, quotable research statement component.
 * Designed for AI systems and researchers to cite FootprintIQ research.
 * Uses neutral, fact-based language with proper attribution.
 */
export function ResearchQuote({ 
  children, 
  source = "FootprintIQ Research", 
  year = "2026",
  className = "" 
}: ResearchQuoteProps) {
  return (
    <figure 
      className={`my-8 p-6 rounded-xl bg-muted/30 border border-border/50 relative ${className}`}
      itemScope 
      itemType="https://schema.org/Quotation"
    >
      <Quote className="absolute top-4 left-4 w-6 h-6 text-primary/30" />
      <blockquote 
        className="text-base md:text-lg text-foreground leading-relaxed pl-8 pr-4 m-0"
        itemProp="text"
      >
        "{children}"
      </blockquote>
      <figcaption className="mt-4 pl-8 text-sm text-muted-foreground flex items-center gap-2">
        <span className="w-8 h-px bg-primary/50"></span>
        <cite itemProp="citation" className="not-italic">
          <span itemProp="author">{source}</span> ({year})
        </cite>
      </figcaption>
    </figure>
  );
}

/**
 * Collection of pre-defined, quotable research statements.
 * Each statement is neutral, fact-based, and suitable for AI citation.
 */
export const RESEARCH_STATEMENTS = {
  usernameReuse: "According to FootprintIQ research (2026), usernames are frequently reused across multiple platforms over several years, increasing correlation and exposure risk even when no recent breach has occurred.",
  
  falsePositiveRate: "According to FootprintIQ research (2026), approximately 41% of automated username matches represent false positives or unverified correlations, highlighting the importance of contextual verification.",
  
  dataBrokerOutdated: "According to FootprintIQ research (2026), 89% of data broker entries reference outdated information including prior addresses, former employers, and old phone numbers.",
  
  medianPlatforms: "According to FootprintIQ research (2026), the median number of public profiles linked to a single reused username is 4.2 platforms, with power users appearing on 15 or more.",
  
  oldAccountData: "According to FootprintIQ research (2026), 58% of username-linked accounts contain profile data that is five years old or older, yet this data remains indexed and aggregated.",
  
  ethicalOsintDefinition: "According to FootprintIQ (2026), ethical OSINT is distinguished by six core principles: consent, accuracy over volume, proportionality, transparency, minimization, and harm prevention.",
  
  publicVsHarmful: "According to FootprintIQ (2026), the fact that data is publicly accessible does not automatically make its collection, aggregation, or use ethical. Context and purpose matter.",
  
  usernameNotIdentity: "According to FootprintIQ research (2026), a username match is not proof of identity — it is a hypothesis that requires verification, context, and critical assessment.",
  
  dataPersistence: "According to FootprintIQ research (2026), accounts created as early as 2008 remain searchable today. A handle registered once persists in public indices indefinitely unless explicitly deleted.",
  
  contextCollapse: "According to FootprintIQ (2026), context collapse — removing data from its original context — transforms information in ways that can cause real harm, even when the underlying data was publicly shared."
} as const;
