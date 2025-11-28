import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Save } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";

const Policies = () => {
  const [policies, setPolicies] = useState({
    allowDarkwebSources: false,
    aiAnalystEnabled: true,
    darkWebScoreThreshold: 60,
    vtReputationThreshold: 40,
    whoisAgeThreshold: 60,
    monitorAlertThreshold: 5,
  });
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    loadPolicies();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadPolicies = () => {
    const saved = sessionStorage.getItem("footprintiq_policies");
    if (saved) {
      setPolicies(JSON.parse(saved));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      sessionStorage.setItem("footprintiq_policies", JSON.stringify(policies));
      
      toast({
        title: "Policies updated",
        description: "Your policy settings have been saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <SEO
        title="Policy Controls — FootprintIQ Admin"
        description="Configure security policies and thresholds"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="hidden lg:block w-64 shrink-0">
              <AdminNav />
            </aside>

            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
                    <Shield className="w-7 h-7 text-primary" />
                    Policy Controls
                  </h1>
                  <p className="text-muted-foreground">
                    Configure security policies, feature gates, and alert thresholds
                  </p>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-6">
                {/* Feature Gates */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Feature Gates</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Dark Web Sources</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable IntelX, DeHashed, and DarkSearch intelligence
                        </p>
                      </div>
                      <Switch
                        checked={policies.allowDarkwebSources}
                        onCheckedChange={(checked) => 
                          setPolicies({ ...policies, allowDarkwebSources: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">AI Analyst</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable RAG-powered intelligence analysis
                        </p>
                      </div>
                      <Switch
                        checked={policies.aiAnalystEnabled}
                        onCheckedChange={(checked) => 
                          setPolicies({ ...policies, aiAnalystEnabled: checked })
                        }
                      />
                    </div>
                  </div>
                </Card>

                {/* Alert Thresholds */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Alert Thresholds</h2>
                  <div className="space-y-4">
                    <div>
                      <Label>Dark Web Score Alert Threshold</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Alert when dark web signal score exceeds this value (0-100)
                      </p>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={policies.darkWebScoreThreshold}
                        onChange={(e) => 
                          setPolicies({ ...policies, darkWebScoreThreshold: parseInt(e.target.value) })
                        }
                      />
                    </div>

                    <div>
                      <Label>VirusTotal Reputation Threshold</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Alert when VT reputation score falls below this value (0-100)
                      </p>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={policies.vtReputationThreshold}
                        onChange={(e) => 
                          setPolicies({ ...policies, vtReputationThreshold: parseInt(e.target.value) })
                        }
                      />
                    </div>

                    <div>
                      <Label>Domain Age Threshold (days)</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Alert when domain age is less than this many days
                      </p>
                      <Input
                        type="number"
                        min="0"
                        value={policies.whoisAgeThreshold}
                        onChange={(e) => 
                          setPolicies({ ...policies, whoisAgeThreshold: parseInt(e.target.value) })
                        }
                      />
                    </div>

                    <div>
                      <Label>Monitor Alert Threshold</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Alert when number of new findings exceeds this value
                      </p>
                      <Input
                        type="number"
                        min="1"
                        value={policies.monitorAlertThreshold}
                        onChange={(e) => 
                          setPolicies({ ...policies, monitorAlertThreshold: parseInt(e.target.value) })
                        }
                      />
                    </div>
                  </div>
                </Card>

                {/* Info Card */}
                <Card className="p-6 border-primary/50">
                  <h3 className="font-semibold mb-2">Policy Notes</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Dark web sources provide metadata only - no raw PII exposed</li>
                    <li>• AI Analyst uses RAG with redacted context</li>
                    <li>• Thresholds apply to monitoring alerts and automated scans</li>
                    <li>• Changes take effect immediately for new operations</li>
                  </ul>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Policies;
