import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2 } from "lucide-react";
import { Playbook, PlaybookStep } from "@/lib/playbooks";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface RemediationPlaybookProps {
  playbook: Playbook;
}

export const RemediationPlaybook = ({ playbook }: RemediationPlaybookProps) => {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isOpen, setIsOpen] = useState(false);

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const progress = (completedSteps.size / playbook.steps.length) * 100;

  const getPriorityColor = (priority: PlaybookStep["priority"]) => {
    switch (priority) {
      case "critical":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-start justify-between w-full">
              <div className="text-left flex-1">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  {playbook.name}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  {playbook.description}
                </CardDescription>
              </div>
              <Badge variant="outline" className="ml-2">
                {completedSteps.size}/{playbook.steps.length}
              </Badge>
            </div>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {/* Progress Bar */}
            {completedSteps.size > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Steps */}
            <div className="space-y-3">
              {playbook.steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    completedSteps.has(idx) ? "bg-muted/50" : "bg-card"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`step-${playbook.id}-${idx}`}
                      checked={completedSteps.has(idx)}
                      onCheckedChange={() => toggleStep(idx)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={`step-${playbook.id}-${idx}`}
                        className={`text-sm font-medium cursor-pointer ${
                          completedSteps.has(idx) ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {step.title}
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={getPriorityColor(step.priority)} className="text-xs">
                          {step.priority}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {step.estimatedTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
