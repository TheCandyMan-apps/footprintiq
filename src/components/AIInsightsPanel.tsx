import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface AIInsight {
  id: string;
  type: "risk" | "action" | "success";
  message: string;
  priority: "high" | "medium" | "low";
  actions?: {
    label: string;
    href?: string;
    onClick?: () => void;
  }[];
}

interface AIInsightsPanelProps {
  jobId?: string;
  userId?: string;
  footprintData?: {
    breaches: number;
    exposures: number;
    dataBrokers: number;
    darkWeb: number;
  };
}

export function AIInsightsPanel({ jobId, userId, footprintData }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Default footprint data if not provided
  const defaultFootprint = footprintData || {
    breaches: 0,
    exposures: 0,
    dataBrokers: 0,
    darkWeb: 0,
  };

  // Auto-generate insights on mount
  useEffect(() => {
    if (userId && defaultFootprint) {
      generateInsights();
    }
  }, [userId]);

  // Mock insights as fallback
  const mockInsights: AIInsight[] = [
    {
      id: "1",
      type: "risk",
      message: "High risk detected from 47 data brokers—prioritize Spokeo removal for maximum impact",
      priority: "high",
      actions: [
        { label: "Remove from Spokeo", href: "https://www.spokeo.com/optout" },
        { label: "View All Brokers", onClick: () => console.log("View brokers") },
      ],
    },
    {
      id: "2",
      type: "action",
      message: "3 dark web mentions found. Consider enabling continuous monitoring to catch new exposures early",
      priority: "medium",
      actions: [
        { label: "Enable Monitoring", onClick: () => console.log("Enable monitoring") },
        { label: "View Details", onClick: () => console.log("View details") },
      ],
    },
    {
      id: "3",
      type: "success",
      message: "Good news! Your email hasn't appeared in recent breach databases. Keep monitoring regularly",
      priority: "low",
      actions: [
        { label: "Set Up Alerts", onClick: () => console.log("Set alerts") },
      ],
    },
  ];

  // Initialize with mock insights if no insights yet
  useEffect(() => {
    if (insights.length === 0) {
      setInsights(mockInsights);
    }
  }, []);

  // Generate insights using Lovable AI
  const generateInsights = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID is required to generate insights",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-insights', {
        body: { 
          jobId, 
          userId, 
          footprintData: defaultFootprint 
        }
      });

      if (error) {
        console.error("Error generating insights:", error);
        
        // Handle specific errors
        if (error.message?.includes("Rate limit")) {
          toast({
            title: "Rate Limit Exceeded",
            description: "Too many requests. Please wait a moment and try again.",
            variant: "destructive",
          });
        } else if (error.message?.includes("credits")) {
          toast({
            title: "Credits Exhausted",
            description: "Please add AI credits to your workspace to continue.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to generate insights. Using default recommendations.",
            variant: "destructive",
          });
        }
        
        // Keep mock insights on error
        setInsights(mockInsights);
      } else if (data?.insights) {
        setInsights(data.insights);
        toast({
          title: "Insights Generated",
          description: "AI-powered recommendations are ready!",
        });
      }
    } catch (err) {
      console.error("Exception generating insights:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Using default recommendations.",
        variant: "destructive",
      });
      setInsights(mockInsights);
    } finally {
      setIsGenerating(false);
    }
  };

  const getInsightIcon = (type: AIInsight["type"]) => {
    switch (type) {
      case "risk":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "action":
        return <Sparkles className="h-5 w-5 text-yellow-500" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getPriorityColor = (priority: AIInsight["priority"]) => {
    switch (priority) {
      case "high":
        return "from-red-500/20 to-red-500/5 border-red-500/30";
      case "medium":
        return "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30";
      case "low":
        return "from-green-500/20 to-green-500/5 border-green-500/30";
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="ai-insights" className="border-none">
        <Card className="rounded-2xl shadow-sm overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:no-underline group">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bot className="h-6 w-6 text-primary" />
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                </div>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold">AI-Powered Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Smart recommendations based on your scan results
                </p>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="px-6 pb-6 animate-accordion-down">
            <div className="space-y-4 pt-2">
              {insights.map((insight) => (
                <Card
                  key={insight.id}
                  className={cn(
                    "p-4 border-2 bg-gradient-to-br backdrop-blur-sm transition-all duration-200 hover:scale-[1.01]",
                    getPriorityColor(insight.priority)
                  )}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getInsightIcon(insight.type)}
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <p className="text-sm leading-relaxed">{insight.message}</p>
                      
                      {insight.actions && insight.actions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {insight.actions.map((action, idx) => (
                            <Button
                              key={idx}
                              size="sm"
                              variant={idx === 0 ? "default" : "outline"}
                              onClick={action.onClick}
                              asChild={!!action.href}
                            >
                              {action.href ? (
                                <a
                                  href={action.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1"
                                >
                                  {action.label}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : (
                                action.label
                              )}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {/* Placeholder for future AI generation */}
              <div className="pt-2 flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateInsights}
                  disabled={isGenerating}
                  className="text-muted-foreground"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                      Generating more insights...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate more insights
                    </>
                  )}
                </Button>
              </div>
            </div>
          </AccordionContent>
        </Card>
      </AccordionItem>
    </Accordion>
  );
}
