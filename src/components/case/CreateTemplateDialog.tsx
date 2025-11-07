import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { X, Plus } from "lucide-react";

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplateCreated: () => void;
  existingCase?: {
    title: string;
    description: string;
    priority: string;
    tags: string[];
  };
}

export const CreateTemplateDialog = ({
  open,
  onOpenChange,
  onTemplateCreated,
  existingCase,
}: CreateTemplateDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [templateData, setTemplateData] = useState({
    name: existingCase?.title || "",
    description: existingCase?.description || "",
    category: "custom",
    priority: existingCase?.priority || "medium",
    icon: "sparkles",
  });
  const [tags, setTags] = useState<string[]>(existingCase?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [checklistItems, setChecklistItems] = useState<string[]>([""]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleAddChecklistItem = () => {
    setChecklistItems([...checklistItems, ""]);
  };

  const handleUpdateChecklistItem = (index: number, value: string) => {
    const updated = [...checklistItems];
    updated[index] = value;
    setChecklistItems(updated);
  };

  const handleRemoveChecklistItem = (index: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== index));
  };

  const handleCreateTemplate = async () => {
    if (!templateData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a template name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Filter out empty checklist items
      const validChecklistItems = checklistItems
        .filter((item) => item.trim())
        .map((task) => ({ task, completed: false }));

      const { error } = await supabase.from("case_templates").insert({
        user_id: user.id,
        name: templateData.name,
        description: templateData.description,
        category: templateData.category,
        priority: templateData.priority,
        icon: templateData.icon,
        predefined_tags: tags,
        checklist_items: validChecklistItems,
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: "Template created",
        description: "Your custom template has been saved successfully",
      });

      onTemplateCreated();
      onOpenChange(false);
      
      // Reset form
      setTemplateData({
        name: "",
        description: "",
        category: "custom",
        priority: "medium",
        icon: "sparkles",
      });
      setTags([]);
      setChecklistItems([""]);
    } catch (error: any) {
      toast({
        title: "Error creating template",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Custom Template</DialogTitle>
          <DialogDescription>
            Save your workflow as a reusable template for future cases
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              placeholder="e.g., My Investigation Workflow"
              value={templateData.name}
              onChange={(e) =>
                setTemplateData({ ...templateData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this template is used for..."
              value={templateData.description}
              onChange={(e) =>
                setTemplateData({ ...templateData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={templateData.category}
                onValueChange={(value) =>
                  setTemplateData({ ...templateData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="intelligence">Intelligence</SelectItem>
                  <SelectItem value="brand-protection">Brand Protection</SelectItem>
                  <SelectItem value="vip-protection">VIP Protection</SelectItem>
                  <SelectItem value="risk-assessment">Risk Assessment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Default Priority</Label>
              <Select
                value={templateData.priority}
                onValueChange={(value) =>
                  setTemplateData({ ...templateData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" onClick={handleAddTag} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Checklist Items</Label>
            <div className="space-y-2">
              {checklistItems.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Step ${index + 1}...`}
                    value={item}
                    onChange={(e) =>
                      handleUpdateChecklistItem(index, e.target.value)
                    }
                  />
                  {checklistItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveChecklistItem(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddChecklistItem}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Checklist Item
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateTemplate} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
