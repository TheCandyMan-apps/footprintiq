import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SensitiveConsentModal } from "@/components/providers/SensitiveConsentModal";
import { Search, Shield, Zap, Database, Globe, Lock } from "lucide-react";

export default function AdvancedScan() {
  const navigate = useNavigate();
  const [scanType, setScanType] = useState<string>("email");
  const [target, setTarget] = useState("");
  const [providers, setProviders] = useState<string[]>(["hibp", "dehashed", "intelx"]);
  const [sensitiveSources, setSensitiveSources] = useState<string[]>([]);
  const [darkwebEnabled, setDarkwebEnabled] = useState(false);
  const [darkwebDepth, setDarkwebDepth] = useState(2);
  const [isScanning, setIsScanning] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [pendingSensitiveSources, setPendingSensitiveSources] = useState<string[]>([]);

  const availableProviders = [
    { id: "hibp", name: "Have I Been Pwned", icon: Shield },
    { id: "dehashed", name: "DeHashed", icon: Database },
    { id: "intelx", name: "Intelligence X", icon: Globe },
    { id: "apify-social", name: "Social Media Finder Pro (400+ platforms)", icon: Search, premium: true, description: "Discover profiles across Facebook, Instagram, Twitter, TikTok, LinkedIn, GitHub, Reddit, and 400+ more" },
    { id: "apify-osint", name: "OSINT Scraper (Paste sites)", icon: Database, premium: true, description: "Search Pastebin, GitHub Gist, Codepad, and other paste sites for exposed data" },
  ];

  const toggleProvider = (id: string) => {
    setProviders(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSensitiveSourceToggle = (source: string) => {
    if (sensitiveSources.includes(source)) {
      setSensitiveSources(prev => prev.filter(s => s !== source));
    } else {
      // Show consent modal
      setPendingSensitiveSources([source]);
      setShowConsentModal(true);
    }
  };

  const handleConsentConfirm = async (confirmedCategories: string[]) => {
    try {
      // Save consent to database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.functions.invoke("consent/manage", {
        body: { categories: confirmedCategories },
      });

      if (error) throw error;

      // Update UI
      setSensitiveSources(prev => [...prev, ...confirmedCategories]);
      setShowConsentModal(false);
      toast.success("Consent recorded. Sensitive sources enabled.");
    } catch (error) {
      console.error("Error saving consent:", error);
      toast.error("Failed to save consent");
    }
  };

  const handleScan = async () => {
    if (!target.trim()) {
      toast.error("Please enter a target to scan");
      return;
    }

    setIsScanning(true);

    try {
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("scan/orchestrate", {
        body: {
          type: scanType,
          value: target,
          workspaceId: user.id, // TODO: Get actual workspace ID
          options: {
            providers,
            sensitiveSources,
            darkweb: darkwebEnabled ? {
              enabled: true,
              depth: darkwebDepth,
              maxPages: 10,
            } : undefined,
          },
        },
      });

      if (error) throw error;

      toast.success(`Scan initiated! Found ${data.counts?.total || 0} results`);
      
      // Navigate to results
      if (data.scanId) {
        navigate(`/results/${data.scanId}`);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Scan error:", error);
      toast.error(error instanceof Error ? error.message : "Scan failed");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Advanced Scan | FootprintIQ"
        description="Perform comprehensive OSINT scans across 400+ sources including dark web monitoring, social media, breaches, and more."
      />
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-elegant">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Advanced OSINT Scan
              </h1>
              <p className="text-muted-foreground mt-2">
                Comprehensive intelligence gathering across 400+ sources
              </p>
            </div>
          </div>

          {/* Main Form */}
          <Card className="p-6 space-y-6">
            {/* Target Input */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Scan Type
                <span className="text-xs text-muted-foreground">(Choose the type of identifier you want to investigate)</span>
              </Label>
              <Select value={scanType} onValueChange={setScanType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email Address</SelectItem>
                  <SelectItem value="username">Username</SelectItem>
                  <SelectItem value="domain">Domain</SelectItem>
                  <SelectItem value="phone">Phone Number</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Value</Label>
              <Input
                placeholder={`Enter ${scanType}...`}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="text-lg"
              />
            </div>

            {/* Provider Selection */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                Data Providers
                <span className="text-xs text-muted-foreground">(Select which OSINT providers to query)</span>
              </Label>
              <div className="grid md:grid-cols-2 gap-3">
                {availableProviders.map((provider) => {
                  const Icon = provider.icon;
                  return (
                  <Card
                    key={provider.id}
                    className={`p-4 cursor-pointer transition-all ${
                      providers.includes(provider.id)
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground/50"
                    }`}
                    onClick={() => toggleProvider(provider.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox checked={providers.includes(provider.id)} className="mt-1" />
                      <Icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{provider.name}</span>
                          {provider.premium && <Badge variant="secondary">Premium</Badge>}
                        </div>
                        {provider.description && (
                          <p className="text-xs text-muted-foreground mt-1">{provider.description}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                  );
                })}
              </div>
            </div>

            {/* Sensitive Sources */}
            <div className="space-y-3 p-4 border border-warning/30 rounded-lg bg-warning/5">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-warning" />
                <Label className="flex items-center gap-2">
                  Sensitive Sources (Consent Required)
                  <span className="text-xs text-muted-foreground">(Require explicit consent)</span>
                </Label>
              </div>
              <div className="space-y-2">
                {["dating", "nsfw", "darkweb"].map((source) => (
                  <label key={source} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={sensitiveSources.includes(source)}
                      onCheckedChange={() => handleSensitiveSourceToggle(source)}
                    />
                    <span className="capitalize">{source} Sources</span>
                    <Badge variant="outline" className="ml-auto">-1 credit/reveal</Badge>
                  </label>
                ))}
              </div>
            </div>

            {/* Dark Web Options */}
            {darkwebEnabled && (
              <Card className="p-4 bg-destructive/5 border-destructive/30">
                <div className="space-y-3">
                  <Label>Dark Web Crawl Depth</Label>
                  <Select value={darkwebDepth.toString()} onValueChange={(v) => setDarkwebDepth(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Shallow (1 level)</SelectItem>
                      <SelectItem value="2">Medium (2 levels)</SelectItem>
                      <SelectItem value="3">Deep (3 levels)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleScan}
                disabled={isScanning || !target.trim()}
                className="flex-1"
                size="lg"
              >
                <Zap className="w-5 h-5 mr-2" />
                {isScanning ? "Scanning..." : "Start Comprehensive Scan"}
              </Button>
            </div>
          </Card>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-4">
              <Shield className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">400+ Sources</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive coverage across social media, breaches, and dark web
              </p>
            </Card>
            <Card className="p-4">
              <Lock className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Privacy First</h3>
              <p className="text-sm text-muted-foreground">
                All sensitive scans require explicit consent and are audited
              </p>
            </Card>
            <Card className="p-4">
              <Zap className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Real-Time Results</h3>
              <p className="text-sm text-muted-foreground">
                Parallel execution delivers results in under 15 seconds
              </p>
            </Card>
          </div>
        </div>
      </main>

      <SensitiveConsentModal
        open={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        onConfirm={handleConsentConfirm}
      />
    </div>
  );
}
