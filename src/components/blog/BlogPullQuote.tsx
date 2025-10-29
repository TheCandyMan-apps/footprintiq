import { Quote } from "lucide-react";

interface BlogPullQuoteProps {
  children: React.ReactNode;
  author?: string;
}

export const BlogPullQuote = ({ children, author }: BlogPullQuoteProps) => {
  return (
    <div className="my-12 relative">
      <div className="absolute -left-4 top-0 text-primary/20">
        <Quote className="w-16 h-16" />
      </div>
      <blockquote className="pl-12 pr-8 py-6 border-l-4 border-primary bg-gradient-to-r from-primary/5 to-transparent rounded-r-2xl">
        <p className="text-xl md:text-2xl font-semibold text-foreground leading-relaxed italic">
          {children}
        </p>
        {author && (
          <cite className="block mt-4 text-sm text-muted-foreground not-italic">
            — {author}
          </cite>
        )}
      </blockquote>
    </div>
  );
};
