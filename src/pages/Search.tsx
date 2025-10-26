import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScoreBadges } from "@/components/ScoreBadges";
import { Search as SearchIcon, Network, Loader2, Mail, User, Globe, Phone, MapPin } from "lucide-react";
import { detectEntityType, searchEntities, type EntityNode } from "@/lib/graph";
import { SEO } from "@/components/SEO";

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<EntityNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [detectedType, setDetectedType] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const type = detectEntityType(searchTerm.trim());
      setDetectedType(type);

      const entities = await searchEntities(searchTerm.trim());
      setResults(entities);
    } catch (error) {
      console.error("[Search] Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const groupByType = (entities: EntityNode[]) => {
    return entities.reduce((acc, entity) => {
      if (!acc[entity.entityType]) {
        acc[entity.entityType] = [];
      }
      acc[entity.entityType].push(entity);
      return acc;
    }, {} as Record<string, EntityNode[]>);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="w-4 h-4" />;
      case "username":
        return <User className="w-4 h-4" />;
      case "domain":
        return <Globe className="w-4 h-4" />;
      case "phone":
        return <Phone className="w-4 h-4" />;
      case "ip":
        return <MapPin className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const groupedResults = groupByType(results);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Entity Search - FootprintIQ"
        description="Search and explore your OSINT correlation graph. Find connected entities, risk scores, and intelligence across your data."
      />
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Entity Search</h1>
          <p className="text-muted-foreground">
            Search your OSINT correlation graph. Auto-detects entity types and shows connected intelligence.
          </p>
        </div>

        {/* Search Bar */}
        <Card className="p-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search email, username, domain, IP, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-11"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading || !searchTerm.trim()}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching
                </>
              ) : (
                <>
                  <SearchIcon className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
          {detectedType && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              {getTypeIcon(detectedType)}
              Detected type: <Badge variant="secondary">{detectedType}</Badge>
            </div>
          )}
        </Card>

        {/* Results */}
        {results.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                {results.length} {results.length === 1 ? "Result" : "Results"}
              </h2>
              <Button variant="outline" onClick={() => navigate("/graph")}>
                <Network className="w-4 h-4 mr-2" />
                View Full Graph
              </Button>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">All ({results.length})</TabsTrigger>
                {Object.entries(groupedResults).map(([type, entities]) => (
                  <TabsTrigger key={type} value={type} className="flex items-center gap-2">
                    {getTypeIcon(type)}
                    {type} ({entities.length})
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-6">
                {results.map((entity) => (
                  <EntityCard key={entity.id} entity={entity} />
                ))}
              </TabsContent>

              {Object.entries(groupedResults).map(([type, entities]) => (
                <TabsContent key={type} value={type} className="space-y-4 mt-6">
                  {entities.map((entity) => (
                    <EntityCard key={entity.id} entity={entity} />
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}

        {!loading && searchTerm && results.length === 0 && (
          <Card className="p-12 text-center">
            <SearchIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
            <p className="text-muted-foreground">
              No entities found matching "{searchTerm}". Try a different search term or run a scan first.
            </p>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}

function EntityCard({ entity }: { entity: EntityNode }) {
  const navigate = useNavigate();

  const score = {
    riskScore: entity.riskScore,
    confidenceScore: entity.confidenceScore,
    providerCount: entity.providerCount,
    findingCount: entity.findingCount,
    severityBreakdown: entity.severityBreakdown,
    topProviders: [],
    riskLevel: getRiskLevel(entity.riskScore),
    confidenceLevel: getConfidenceLevel(entity.confidenceScore),
  };

  return (
    <Card className="p-6 hover:border-primary transition-colors cursor-pointer" onClick={() => navigate(`/graph?focus=${entity.id}`)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className="capitalize">
              {entity.entityType}
            </Badge>
            <h3 className="text-xl font-semibold">{entity.entityValue}</h3>
          </div>
          <ScoreBadges score={score} />
        </div>
        <Button variant="ghost" size="sm">
          <Network className="w-4 h-4 mr-2" />
          Expand Graph
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground block">Critical</span>
          <span className="font-semibold">{entity.severityBreakdown.critical}</span>
        </div>
        <div>
          <span className="text-muted-foreground block">High</span>
          <span className="font-semibold">{entity.severityBreakdown.high}</span>
        </div>
        <div>
          <span className="text-muted-foreground block">Medium</span>
          <span className="font-semibold">{entity.severityBreakdown.medium}</span>
        </div>
        <div>
          <span className="text-muted-foreground block">First Seen</span>
          <span className="font-semibold">{new Date(entity.firstSeen).toLocaleDateString()}</span>
        </div>
      </div>
    </Card>
  );
}

function getRiskLevel(score: number): "critical" | "high" | "medium" | "low" | "minimal" {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 40) return "medium";
  if (score >= 20) return "low";
  return "minimal";
}

function getConfidenceLevel(score: number): "very_high" | "high" | "medium" | "low" {
  if (score >= 85) return "very_high";
  if (score >= 70) return "high";
  if (score >= 50) return "medium";
  return "low";
}
