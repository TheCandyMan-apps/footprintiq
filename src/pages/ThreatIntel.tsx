import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Database, Eye } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function ThreatIntel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [darkwebFindings, setDarkwebFindings] = useState<any[]>([]);
  const [compromisedCreds, setCompromisedCreds] = useState<any[]>([]);
  const [threatIndicators, setThreatIndicators] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
    loadThreatData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) navigate("/auth");
  };

  const loadThreatData = async () => {
    try {
      const { data: darkweb } = await supabase
        .from("darkweb_findings")
        .select("*")
        .order("discovered_at", { ascending: false })
        .limit(10);

      const { data: creds } = await supabase
        .from("compromised_credentials")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      const { data: indicators } = await supabase
        .from("threat_indicators")
        .select("*")
        .eq("threat_level", "high")
        .order("last_seen", { ascending: false })
        .limit(10);

      setDarkwebFindings(darkweb || []);
      setCompromisedCreds(creds || []);
      setThreatIndicators(indicators || []);
    } catch (error) {
      console.error("Error loading threat data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "secondary";
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8">Loading threat intelligence...</div>;
  }

  return (
    <>
      <SEO 
        title="Threat Intelligence — Real-Time Threat Monitoring | FootprintIQ"
        description="Real-time threat monitoring and intelligence. Track emerging threats, dark web mentions, and security vulnerabilities affecting your digital footprint."
        canonical="https://footprintiq.app/threat-intel"
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
              "name": "Threat Intelligence",
              "item": "https://footprintiq.app/threat-intel"
            }
          ]
        }}
      />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Threat Intelligence</h1>
            <p className="text-muted-foreground">Real-time monitoring and threat detection</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Dark Web Findings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{darkwebFindings.length}</p>
                <p className="text-sm text-muted-foreground">Active threats</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-yellow-500" />
                  Compromised Credentials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{compromisedCreds.length}</p>
                <p className="text-sm text-muted-foreground">Breached accounts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  Threat Indicators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{threatIndicators.length}</p>
                <p className="text-sm text-muted-foreground">High-risk IoCs</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Dark Web Findings</CardTitle>
            </CardHeader>
            <CardContent>
              {darkwebFindings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No dark web findings detected
                </p>
              ) : (
                <div className="space-y-3">
                  {darkwebFindings.map((finding) => (
                    <div key={finding.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{finding.finding_type}</p>
                          <p className="text-sm text-muted-foreground">
                            Discovered: {new Date(finding.discovered_at).toLocaleDateString()}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {finding.data_exposed?.map((data: string, idx: number) => (
                              <Badge key={idx} variant="outline">{data}</Badge>
                            ))}
                          </div>
                        </div>
                        <Badge variant={getSeverityColor(finding.severity)}>
                          {finding.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compromised Credentials</CardTitle>
            </CardHeader>
            <CardContent>
              {compromisedCreds.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No compromised credentials detected
                </p>
              ) : (
                <div className="space-y-3">
                  {compromisedCreds.map((cred) => (
                    <div key={cred.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{cred.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Breach: {cred.breach_name}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {cred.data_classes?.map((dc: string, idx: number) => (
                              <Badge key={idx} variant="secondary">{dc}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {cred.breach_date && new Date(cred.breach_date).toLocaleDateString()}
                          </p>
                          {cred.is_verified && (
                            <Badge variant="default" className="mt-1">Verified</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>High-Risk Threat Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              {threatIndicators.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No high-risk indicators detected
                </p>
              ) : (
                <div className="space-y-3">
                  {threatIndicators.map((indicator) => (
                    <div key={indicator.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{indicator.indicator_type}</Badge>
                            <code className="text-sm">{indicator.indicator_value}</code>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Source: {indicator.source} | Confidence: {(indicator.confidence_score * 100).toFixed(0)}%
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {indicator.tags?.map((tag: string, idx: number) => (
                              <Badge key={idx} variant="secondary">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                        <Badge variant="destructive">{indicator.threat_level}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
