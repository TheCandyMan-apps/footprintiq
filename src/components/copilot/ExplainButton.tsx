import { useState } from "react";
import { HelpCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ExplainButtonProps {
  contextType: string;
  contextId: string;
  contextData?: any;
  label?: string;
}

export function ExplainButton({ 
  contextType, 
  contextId, 
  contextData,
  label = "Explain"
}: ExplainButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleExplain = async () => {
    if (explanation) {
      setIsOpen(true);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    try {
      let query = '';
      
      switch (contextType) {
        case 'entity':
          query = `Summarize the connections and risk profile for this entity`;
          break;
        case 'timeline':
          query = `Explain the pattern in this timeline`;
          break;
        case 'graph':
          query = `Narrate the campaign or pattern shown in this graph`;
          break;
        case 'forecast':
          query = `Predict the potential impact of this threat`;
          break;
        case 'finding':
          query = `Explain this security finding and its implications`;
          break;
        default:
          query = `Explain this data`;
      }

      const { data, error } = await supabase.functions.invoke('copilot-chat', {
        body: {
          query,
          contextType,
          contextId,
        }
      });

      if (error) throw error;

      setExplanation(data.response);

    } catch (error) {
      console.error('Explain error:', error);
      toast.error('Failed to generate explanation');
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExplain}
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <HelpCircle className="h-4 w-4" />
          )}
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">AI Explanation</h4>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </div>
          ) : explanation ? (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {explanation}
            </p>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}