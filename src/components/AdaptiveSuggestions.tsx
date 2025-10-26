import { useState, useEffect } from "react";
import { Brain, Loader2, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Suggestion {
  entityType: string;
  value: string;
  confidence: number;
  why: string[];
}

interface AdaptiveSuggestionsProps {
  seedEntityIds: string[];
  onSelect?: (suggestion: Suggestion) => void;
}

export function AdaptiveSuggestions({ seedEntityIds, onSelect }: AdaptiveSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (seedEntityIds.length === 0) return;
    
    fetchSuggestions();
  }, [seedEntityIds]);

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("ai-predict", {
        body: { seedEntityIds },
      });

      if (invokeError) throw invokeError;

      setSuggestions(data.suggestions || []);
      
      if (data.suggestions?.length === 0) {
        setError("No suggestions available. Try adding more entities to the investigation.");
      }
    } catch (err: any) {
      console.error("Suggestions error:", err);
      setError(err.message || "Failed to generate suggestions");
      toast({
        title: "Suggestions Failed",
        description: err.message || "Unable to generate entity suggestions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return { variant: "default" as const, label: "High" };
    if (confidence >= 0.5) return { variant: "secondary" as const, label: "Medium" };
    return { variant: "outline" as const, label: "Low" };
  };

  if (seedEntityIds.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Adaptive Intelligence</CardTitle>
              <CardDescription>AI-suggested entities to investigate</CardDescription>
            </div>
          </div>
          {!loading && suggestions.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchSuggestions}
            >
              Refresh
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            {error}
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            No suggestions available yet. Add more entities to get recommendations.
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion, idx) => {
              const confidenceBadge = getConfidenceBadge(suggestion.confidence);
              
              return (
                <div
                  key={idx}
                  className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {suggestion.entityType}
                      </Badge>
                      <code className="text-sm font-mono font-medium">
                        {suggestion.value}
                      </code>
                      <Badge variant={confidenceBadge.variant} className="text-xs">
                        {confidenceBadge.label} {Math.round(suggestion.confidence * 100)}%
                      </Badge>
                    </div>
                    
                    <ul className="text-xs text-muted-foreground space-y-0.5 ml-2">
                      {suggestion.why.map((reason, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {onSelect && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelect(suggestion)}
                      className="ml-2"
                    >
                      Investigate
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}