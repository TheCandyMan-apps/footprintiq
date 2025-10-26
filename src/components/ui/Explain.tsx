import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ExplainProps {
  topic: string;
  context?: any;
  size?: "sm" | "md" | "lg";
}

export function Explain({ topic, context, size = "sm" }: ExplainProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const fetchExplanation = async () => {
    if (explanation || loading) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-explain", {
        body: { topic, context },
      });

      if (error) throw error;

      setExplanation(data.explanation);
    } catch (error: any) {
      console.error("Explain error:", error);
      toast({
        title: "Explanation Failed",
        description: error.message || "Unable to generate explanation",
        variant: "destructive",
      });
      setExplanation("Unable to generate explanation at this time.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && !explanation) {
      fetchExplanation();
    }
  };

  const iconSize = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }[size];

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`inline-flex items-center gap-1 ${
            size === "sm" ? "h-6 px-1.5" : size === "md" ? "h-8 px-2" : "h-10 px-3"
          }`}
          aria-label="Explain this"
        >
          <Sparkles className={`${iconSize} text-primary`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" side="top" align="center">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Magic Explain</span>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {explanation || "Loading explanation..."}
            </p>
          )}
          
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Topic: <span className="font-mono">{topic}</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}