import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, Bell, Trash2, Lock } from "lucide-react";
import { useState } from "react";

interface AIAction {
  title: string;
  description: string;
  type: 'removal' | 'monitoring' | 'security' | 'privacy';
  priority: 'high' | 'medium' | 'low';
  sourceIds?: string[];
}

interface AIActionButtonProps {
  action: AIAction;
  onExecute: (action: AIAction) => Promise<void>;
}

export const AIActionButton = ({ action, onExecute }: AIActionButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const getIcon = () => {
    switch (action.type) {
      case 'removal':
        return <Trash2 className="h-4 w-4" />;
      case 'monitoring':
        return <Bell className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'privacy':
        return <Lock className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getPriorityColor = () => {
    switch (action.priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const handleClick = async () => {
    if (completed) return;
    
    setLoading(true);
    try {
      await onExecute(action);
      setCompleted(true);
    } catch (error) {
      console.error('[AIActionButton] Error executing action:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-border hover:border-primary/40 transition-all group">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h4 className="font-semibold text-sm">{action.title}</h4>
          <Badge variant={getPriorityColor()} className="text-xs">
            {action.priority}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-3">{action.description}</p>
        <Button
          onClick={handleClick}
          disabled={loading || completed}
          size="sm"
          variant={completed ? "outline" : "default"}
          className="gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Processing...
            </>
          ) : completed ? (
            <>
              {getIcon()}
              Completed
            </>
          ) : (
            <>
              {getIcon()}
              Execute
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
