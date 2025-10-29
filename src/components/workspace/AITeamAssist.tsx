import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Lightbulb, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AITeamAssistProps {
  caseId: string;
}

export function AITeamAssist({ caseId }: AITeamAssistProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [summary, setSummary] = useState<string>("");

  const suggestTasksMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: {
          prompt: `Based on case ${caseId}, suggest 3-5 investigation tasks for the team. Format as JSON array with: title, priority, rationale.`,
          context: { caseId },
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      try {
        const parsed = JSON.parse(data.response);
        setSuggestions(Array.isArray(parsed) ? parsed : []);
      } catch {
        setSuggestions([]);
      }
    },
  });

  const summarizeMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: {
          prompt: `Summarize recent team activity on case ${caseId}. Focus on: comments, tasks completed, new evidence. Keep it brief.`,
          context: { caseId },
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setSummary(data.response || "");
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Team Assistant
          </CardTitle>
          <CardDescription>
            Get AI-powered suggestions and summaries for your investigation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={() => suggestTasksMutation.mutate()}
              disabled={suggestTasksMutation.isPending}
              variant="outline"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Suggest Tasks
            </Button>
            <Button
              onClick={() => summarizeMutation.mutate()}
              disabled={summarizeMutation.isPending}
              variant="outline"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Summarize Activity
            </Button>
          </div>
        </CardContent>
      </Card>

      {suggestTasksMutation.isPending && (
        <Card>
          <CardHeader>
            <CardTitle>Generating Suggestions...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      )}

      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Suggested Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {suggestions.map((task: any, idx: number) => (
                  <Card key={idx}>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-1">{task.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {task.rationale}
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Create Task
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {summarizeMutation.isPending && (
        <Card>
          <CardHeader>
            <CardTitle>Generating Summary...</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      )}

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Activity Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
