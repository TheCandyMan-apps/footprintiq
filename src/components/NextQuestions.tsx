import { useState, useEffect } from "react";
import { Lightbulb, Loader2, MessageCircleQuestion } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NextQuestionsProps {
  scope: string[];
  context?: string;
  onQuestionSelect?: (question: string) => void;
}

export function NextQuestions({ scope, context, onQuestionSelect }: NextQuestionsProps) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (scope.length === 0) return;
    
    fetchQuestions();
  }, [scope]);

  const fetchQuestions = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("ai-next-questions", {
        body: { scope, context },
      });

      if (error) throw error;

      setQuestions(data.questions || []);
    } catch (err: any) {
      console.error("Next questions error:", err);
      toast({
        title: "Questions Failed",
        description: err.message || "Unable to generate question suggestions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (scope.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <div>
              <CardTitle className="text-lg">Ask Next</CardTitle>
              <CardDescription>AI-suggested follow-up questions</CardDescription>
            </div>
          </div>
          {!loading && questions.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchQuestions}
            >
              Refresh
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : questions.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            No question suggestions available yet.
          </div>
        ) : (
          <div className="space-y-2">
            {questions.map((question, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-4"
                onClick={() => onQuestionSelect?.(question)}
              >
                <MessageCircleQuestion className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />
                <span className="text-sm">{question}</span>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}