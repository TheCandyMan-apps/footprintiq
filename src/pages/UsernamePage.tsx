import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, CheckCircle, XCircle, AlertCircle, ExternalLink, Upload } from "lucide-react";
import { checkUsernameAvailability, usernameSources, UsernameCheckResult } from "@/lib/usernameSources";
import { useToast } from "@/hooks/use-toast";
import { UpgradeDialog } from "@/components/UpgradeDialog";

export default function UsernamePage() {
  const [username, setUsername] = useState("");
  const [bulkUsernames, setBulkUsernames] = useState("");
  const [results, setResults] = useState<UsernameCheckResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { toast } = useToast();

  const categories = ["all", ...new Set(usernameSources.map(s => s.category))];

  const handleSearch = async () => {
    if (!username.trim()) {
      toast({ title: "Please enter a username", variant: "destructive" });
      return;
    }

    setIsSearching(true);
    try {
      const checkResults = await checkUsernameAvailability(username.trim());
      setResults(checkResults);
      toast({ title: `Found ${checkResults.filter(r => r.status === 'found').length} matches` });
    } catch (error) {
      toast({ title: "Search failed", description: "Please try again", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleBulkSearch = async () => {
    // Pro feature gate
    setShowUpgrade(true);
    toast({ 
      title: "Pro Feature", 
      description: "Bulk username checking is available in Pro plan",
      variant: "default"
    });
  };

  const filteredResults = selectedCategory === "all" 
    ? results 
    : results.filter(r => r.source.category === selectedCategory);

  const statusIcon = (status: string) => {
    switch (status) {
      case 'found': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'suspicious': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default: return <XCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <>
      <SEO
        title="Username Search — Find Social Media Profiles Across 500+ Platforms"
        description="Search usernames across Instagram, Twitter, TikTok, Reddit, GitHub and 500+ platforms. OSINT username intelligence for investigators and privacy researchers."
        canonical="https://footprintiq.app/usernames"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://footprintiq.app/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Username Search",
              "item": "https://footprintiq.app/usernames"
            }
          ]
        }}
      />
      <Header />
      <main className="min-h-screen bg-background py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Username Intelligence Search
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Search for any username across 500+ platforms including social media, gaming, dev tools, and professional networks
            </p>
          </div>

          <Card className="p-6 mb-8">
            <Tabs defaultValue="single" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="single">Single Username</TabsTrigger>
                <TabsTrigger value="bulk">
                  <Upload className="w-4 h-4 mr-2" />
                  Bulk Check (Pro)
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="single" className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Enter username to search..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} disabled={isSearching} size="lg">
                    <Search className="w-4 h-4 mr-2" />
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="bulk" className="space-y-4">
                <Textarea
                  placeholder="Enter usernames (one per line or comma-separated)..."
                  value={bulkUsernames}
                  onChange={(e) => setBulkUsernames(e.target.value)}
                  className="min-h-[120px]"
                />
                <Button onClick={handleBulkSearch} disabled={isSearching} size="lg" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Check All Usernames
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  💎 Pro feature: Check up to 100 usernames at once
                </p>
              </TabsContent>
            </Tabs>
          </Card>

          {results.length > 0 && (
            <>
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map(cat => (
                  <Badge
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat} ({cat === "all" ? results.length : results.filter(r => r.source.category === cat).length})
                  </Badge>
                ))}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResults.map((result, idx) => (
                  <Card key={idx} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {result.source.favicon && (
                          <img 
                            src={result.source.favicon} 
                            alt={result.source.name}
                            className="w-6 h-6"
                            onError={(e) => e.currentTarget.style.display = 'none'}
                          />
                        )}
                        <div>
                          <h3 className="font-semibold">{result.source.name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {result.source.category}
                          </Badge>
                        </div>
                      </div>
                      {statusIcon(result.status)}
                    </div>
                    
                    {result.status === 'found' && (
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        View Profile <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    
                    {result.status === 'suspicious' && (
                      <p className="text-xs text-muted-foreground">Rate limited or access restricted</p>
                    )}
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
      <UpgradeDialog 
        open={showUpgrade} 
        onOpenChange={setShowUpgrade}
        feature="Bulk username checking"
      />
    </>
  );
}
