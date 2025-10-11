import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, ExternalLink, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DataSource {
  id: string;
  name: string;
  category: string;
  dataFound: string[];
  riskLevel: "high" | "medium" | "low";
  url: string;
}

const mockResults: DataSource[] = [
  {
    id: "1",
    name: "PeopleSearchNow",
    category: "People Search",
    dataFound: ["Name", "Email", "Phone", "Address"],
    riskLevel: "high",
    url: "https://example.com",
  },
  {
    id: "2",
    name: "WhitePages",
    category: "Public Records",
    dataFound: ["Name", "Phone", "Age"],
    riskLevel: "high",
    url: "https://example.com",
  },
  {
    id: "3",
    name: "Spokeo",
    category: "Data Broker",
    dataFound: ["Name", "Email", "Relatives"],
    riskLevel: "medium",
    url: "https://example.com",
  },
  {
    id: "4",
    name: "BeenVerified",
    category: "Background Check",
    dataFound: ["Name", "Address History"],
    riskLevel: "medium",
    url: "https://example.com",
  },
  {
    id: "5",
    name: "Intelius",
    category: "Data Broker",
    dataFound: ["Name", "Email"],
    riskLevel: "low",
    url: "https://example.com",
  },
];

export const ScanResults = () => {
  const { toast } = useToast();
  const [removedSources, setRemovedSources] = useState<Set<string>>(new Set());

  const handleRemovalRequest = (sourceId: string, sourceName: string) => {
    setRemovedSources(prev => new Set(prev).add(sourceId));
    toast({
      title: "Removal Request Initiated",
      description: `We've started the removal process for ${sourceName}. This may take 7-30 days.`,
    });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "secondary";
    }
  };

  const activeResults = mockResults.filter(r => !removedSources.has(r.id));
  const removedCount = removedSources.size;

  return (
    <div className="min-h-screen px-6 py-20">
      <div className="max-w-6xl mx-auto">
        {/* Summary */}
        <Card className="p-8 mb-8 bg-gradient-card border-border shadow-card">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-3">Scan Complete</h2>
            <p className="text-lg text-muted-foreground mb-6">
              We found your personal information on <span className="text-foreground font-semibold">{mockResults.length} websites</span>
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="text-2xl font-bold text-destructive">
                  {mockResults.filter(r => r.riskLevel === "high").length}
                </div>
                <div className="text-sm text-muted-foreground">High Risk</div>
              </div>
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="text-2xl font-bold text-primary">
                  {mockResults.filter(r => r.riskLevel === "medium").length}
                </div>
                <div className="text-sm text-muted-foreground">Medium Risk</div>
              </div>
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <div className="text-2xl font-bold text-accent">
                  {removedCount}
                </div>
                <div className="text-sm text-muted-foreground">Removal Requested</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Results List */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">Data Sources Found</h3>
          
          {activeResults.map((source) => (
            <Card key={source.id} className="p-6 bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold">{source.name}</h4>
                    <Badge variant={getRiskColor(source.riskLevel) as any}>
                      {source.riskLevel.toUpperCase()} RISK
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{source.category}</p>
                  <div className="flex flex-wrap gap-2">
                    {source.dataFound.map((data, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1 rounded-full bg-secondary text-xs"
                      >
                        {data}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(source.url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                    View
                  </Button>
                  <Button 
                    variant="accent"
                    size="sm"
                    onClick={() => handleRemovalRequest(source.id, source.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Request Removal
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {removedCount > 0 && (
            <Card className="p-6 bg-accent/10 border-accent/20">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-accent" />
                <div>
                  <h4 className="font-semibold">Removal Requests in Progress</h4>
                  <p className="text-sm text-muted-foreground">
                    {removedCount} removal {removedCount === 1 ? 'request has' : 'requests have'} been initiated. 
                    You'll be notified when complete.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
