import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ShieldAlert, 
  UserSearch, 
  Eye, 
  Bug, 
  Shield, 
  Link as LinkIcon,
  Sparkles,
  Plus,
  MoreVertical,
  Trash2,
  Star
} from "lucide-react";
import { CreateTemplateDialog } from "./CreateTemplateDialog";
import { useToast } from "@/hooks/use-toast";

interface CaseTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: string;
  icon: string;
  predefined_tags: string[];
  checklist_items: { task: string; completed: boolean }[];
  user_id?: string | null;
}

interface CaseTemplatesProps {
  onSelectTemplate: (template: CaseTemplate | null) => void;
  selectedTemplateId: string | null;
}

const iconMap: Record<string, React.ReactNode> = {
  "shield-alert": <ShieldAlert className="w-5 h-5" />,
  "user-search": <UserSearch className="w-5 h-5" />,
  "eye": <Eye className="w-5 h-5" />,
  "bug": <Bug className="w-5 h-5" />,
  "shield": <Shield className="w-5 h-5" />,
  "link": <LinkIcon className="w-5 h-5" />,
};

export const CaseTemplates = ({ onSelectTemplate, selectedTemplateId }: CaseTemplatesProps) => {
  const [templates, setTemplates] = useState<CaseTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("case_templates")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      
      // Transform the data to match our interface
      const typedTemplates: CaseTemplate[] = (data || []).map((t: any) => ({
        ...t,
        checklist_items: t.checklist_items as { task: string; completed: boolean }[],
      }));
      
      setTemplates(typedTemplates);
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "security": return "bg-destructive/10 text-destructive";
      case "intelligence": return "bg-primary/10 text-primary";
      case "brand-protection": return "bg-accent/10 text-accent";
      case "vip-protection": return "bg-secondary/10 text-secondary";
      case "risk-assessment": return "bg-muted text-muted-foreground";
      case "custom": return "bg-primary/10 text-primary";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleDeleteTemplate = async (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("Delete this template? This cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("case_templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;

      toast({
        title: "Template deleted",
        description: "Your custom template has been removed",
      });

      loadTemplates();
    } catch (error: any) {
      toast({
        title: "Error deleting template",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading templates...</div>;
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="w-4 h-4 text-primary" />
            Choose a Template (Optional)
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>
      
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-2">
          <Card
            className={`p-3 cursor-pointer border-2 transition-colors hover:border-primary/50 ${
              selectedTemplateId === null ? "border-primary bg-primary/5" : "border-border"
            }`}
            onClick={() => onSelectTemplate(null)}
          >
            <div className="flex items-center gap-3">
              <div className="text-muted-foreground">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium">Blank Case</div>
                <div className="text-xs text-muted-foreground">Start from scratch</div>
              </div>
            </div>
          </Card>

          {templates.map((template) => (
            <Card
              key={template.id}
              className={`p-3 cursor-pointer border-2 transition-colors hover:border-primary/50 ${
                selectedTemplateId === template.id ? "border-primary bg-primary/5" : "border-border"
              }`}
              onClick={() => onSelectTemplate(template)}
            >
              <div className="flex items-start gap-3">
                <div className="text-primary mt-0.5">
                  {iconMap[template.icon] || <Sparkles className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-sm">{template.name}</div>
                      {template.user_id && (
                        <Badge variant="outline" className="text-xs bg-primary/5">
                          <Star className="w-3 h-3 mr-1" />
                          Custom
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className={`text-xs ${getCategoryColor(template.category)}`}>
                        {template.category.replace("-", " ")}
                      </Badge>
                      {template.user_id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => handleDeleteTemplate(template.id, e)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {template.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {template.predefined_tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
      </div>

      <CreateTemplateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onTemplateCreated={loadTemplates}
      />
    </>
  );
};
