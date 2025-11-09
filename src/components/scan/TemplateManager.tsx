import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Bookmark,
  Star,
  Trash2,
  Play,
  Clock,
  Settings,
  Filter,
  X,
} from 'lucide-react';
import { useScanTemplates, ScanTemplate } from '@/hooks/useScanTemplates';
import { CategoryBadge } from './CategoryBadge';
import { TEMPLATE_CATEGORIES } from '@/constants/templateCategories';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface TemplateManagerProps {
  onApplyTemplate: (template: ScanTemplate) => void;
  onSaveTemplate: () => void;
  className?: string;
}

export function TemplateManager({
  onApplyTemplate,
  onSaveTemplate,
  className,
}: TemplateManagerProps) {
  const { templates, isLoading, deleteTemplate, toggleFavorite } = useScanTemplates();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get unique tags from all templates
  const allTags = Array.from(
    new Set(templates.flatMap((t) => t.tags || []))
  ).sort();

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    if (selectedCategory !== 'all' && template.category !== selectedCategory) {
      return false;
    }
    if (selectedTag && (!template.tags || !template.tags.includes(selectedTag))) {
      return false;
    }
    return true;
  });

  const handleDelete = async () => {
    if (templateToDelete) {
      await deleteTemplate(templateToDelete);
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const confirmDelete = (templateId: string) => {
    setTemplateToDelete(templateId);
    setDeleteDialogOpen(true);
  };

  const handleToggleFavorite = async (template: ScanTemplate) => {
    await toggleFavorite(template.id, !template.is_favorite);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedTag(null);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bookmark className="w-5 h-5" />
            Scan Templates
          </CardTitle>
          <CardDescription>Loading templates...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bookmark className="w-5 h-5" />
                Scan Templates
              </CardTitle>
              <CardDescription>
                Quick-launch your frequently used scan configurations
              </CardDescription>
            </div>
            <Button onClick={onSaveTemplate} size="sm">
              Save Current
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          {templates.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center mb-4 pb-4 border-b">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px] h-9 text-sm">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <span className="mr-2">{cat.icon}</span>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-1 items-center">
                  <span className="text-xs text-muted-foreground">Tags:</span>
                  {selectedTag ? (
                    <Badge
                      variant="default"
                      className="cursor-pointer text-xs"
                      onClick={clearFilters}
                    >
                      {selectedTag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ) : (
                    allTags.slice(0, 6).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-secondary text-xs"
                        onClick={() => setSelectedTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {filteredTemplates.length === 0 ? (
            templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No templates saved yet</p>
                <p className="text-xs mt-1">Save your current configuration to get started</p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No templates match your filters</p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={clearFilters}
                  className="mt-2"
                >
                  Clear filters
                </Button>
              </div>
            )
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={cn(
                      'group relative p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors',
                      template.is_favorite && 'border-primary/50'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-medium truncate">{template.name}</h4>
                          {template.is_favorite && (
                            <Star className="w-4 h-4 text-primary fill-primary flex-shrink-0" />
                          )}
                          <CategoryBadge category={template.category} />
                        </div>
                        {template.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {template.description}
                          </p>
                        )}
                        {template.tags && template.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {template.tags.slice(0, 4).map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs cursor-pointer hover:bg-secondary"
                                onClick={() => setSelectedTag(tag)}
                              >
                                {tag}
                              </Badge>
                            ))}
                            {template.tags.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{template.tags.length - 4}
                              </Badge>
                            )}
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Settings className="w-3 h-3" />
                            <span className="capitalize">{template.configuration.scanType}</span>
                          </div>
                          <span>•</span>
                          <Badge variant="secondary" className="text-xs">
                            {template.configuration.providers?.length || 0} providers
                          </Badge>
                          {template.configuration.selectedTool && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs capitalize">
                                {template.configuration.selectedTool}
                              </Badge>
                            </>
                          )}
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {formatDistanceToNow(new Date(template.updated_at), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleToggleFavorite(template)}
                          title={template.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Star
                            className={cn(
                              'w-4 h-4',
                              template.is_favorite && 'text-primary fill-primary'
                            )}
                          />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => onApplyTemplate(template)}
                          title="Apply template"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => confirmDelete(template.id)}
                          title="Delete template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
