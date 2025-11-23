import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, BookOpen, FileText, Download, Map, Gem } from "lucide-react";
import { HELP_ENTRIES } from "@/lib/help/copy";
import { HIDDEN_GEMS } from "@/lib/help/hiddenGems";
import { InteractiveFeatureMap } from "@/components/help/InteractiveFeatureMap";
import { SEO } from "@/components/SEO";
import * as LucideIcons from "lucide-react";

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    Object.values(HELP_ENTRIES).forEach(entry => cats.add(entry.category));
    return Array.from(cats).sort();
  }, []);

  const filteredEntries = useMemo(() => {
    return Object.values(HELP_ENTRIES).filter(entry => {
      const matchesSearch = searchQuery === "" || 
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = !selectedCategory || entry.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const groupedEntries = useMemo(() => {
    const groups: Record<string, typeof HELP_ENTRIES[keyof typeof HELP_ENTRIES][]> = {};
    filteredEntries.forEach(entry => {
      if (!groups[entry.category]) {
        groups[entry.category] = [];
      }
      groups[entry.category].push(entry);
    });
    return groups;
  }, [filteredEntries]);

  const handleExportDocs = () => {
    const content = Object.values(HELP_ENTRIES)
      .map(entry => `# ${entry.title}\n\n${entry.content}\n\n**Category:** ${entry.category}\n**Tags:** ${entry.tags?.join(", ") || "None"}\n\n---\n\n`)
      .join("");
    
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `footprintiq-help-docs-${new Date().toISOString().split("T")[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Help Center"
        description="Comprehensive documentation and help resources for FootprintIQ features"
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Help Center</h1>
          </div>
          <p className="text-lg text-muted-foreground mb-6">
            Comprehensive documentation for all FootprintIQ features, powered by our centralized help registry.
          </p>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search help topics, features, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 text-lg"
            />
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Export button */}
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportDocs}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export Documentation
            </Button>
          </div>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="docs" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="docs" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Documentation
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-2">
              <Map className="h-4 w-4" />
              Feature Map
            </TabsTrigger>
            <TabsTrigger value="gems" className="gap-2">
              <Gem className="h-4 w-4" />
              Hidden Gems
            </TabsTrigger>
          </TabsList>

          {/* Documentation Tab */}
          <TabsContent value="docs">
            {filteredEntries.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or category filter
                </p>
              </Card>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedEntries).map(([category, entries]) => (
                  <div key={category} id={`category-${category.toLowerCase()}`}>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Badge variant="outline" className="text-sm">
                        {entries.length}
                      </Badge>
                      {category}
                    </h2>
                    <div className="grid gap-4">
                      {entries.map(entry => (
                        <Card 
                          key={entry.key} 
                          id={`help-${entry.key}`}
                          className="p-6 hover:border-primary/50 transition-colors"
                        >
                          <h3 className="text-lg font-semibold mb-2">
                            {entry.title}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed mb-3">
                            {entry.content}
                          </p>
                          {entry.tags && entry.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {entry.tags.map(tag => (
                                <Badge 
                                  key={tag} 
                                  variant="secondary" 
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Feature Map Tab */}
          <TabsContent value="map">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Interactive Feature Map</h2>
              <p className="text-muted-foreground">
                Explore all FootprintIQ features organized by category. Click any card to navigate directly.
              </p>
            </div>
            <InteractiveFeatureMap />
          </TabsContent>

          {/* Hidden Gems Tab */}
          <TabsContent value="gems">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Gem className="h-6 w-6 text-primary" />
                Hidden Gems
              </h2>
              <p className="text-muted-foreground">
                Discover powerful features you might have missed. These lesser-known capabilities can supercharge your workflow.
              </p>
            </div>
            <div className="grid gap-4">
              {HIDDEN_GEMS.map(gem => {
                const IconComponent = (LucideIcons as any)[gem.icon];
                return (
                  <Card key={gem.id} className="p-6 hover:border-primary/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        {IconComponent && <IconComponent className="h-6 w-6 text-primary" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{gem.title}</h3>
                          {gem.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {gem.badge}
                            </Badge>
                          )}
                          {gem.shortcut && (
                            <Badge variant="outline" className="text-xs font-mono">
                              {gem.shortcut}
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-2">{gem.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {gem.category}
                          </Badge>
                          {gem.route && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.location.href = gem.route!}
                              className="h-7 text-xs"
                            >
                              Try it now →
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer stats */}
        <div className="max-w-4xl mx-auto mt-12 pt-8 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">
                {Object.keys(HELP_ENTRIES).length}
              </div>
              <div className="text-sm text-muted-foreground">Help Topics</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">
                {categories.length}
              </div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">
                v1.0
              </div>
              <div className="text-sm text-muted-foreground">Documentation Version</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
