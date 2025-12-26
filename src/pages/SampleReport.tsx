import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Globe, 
  Mail, 
  User, 
  ExternalLink,
  ArrowLeft,
  Search
} from "lucide-react";

const SampleReport = () => {
  const sampleFindings = [
    {
      platform: "GitHub",
      url: "https://github.com/johndoe",
      category: "Developer",
      risk: "low",
      found: true,
    },
    {
      platform: "LinkedIn",
      url: "https://linkedin.com/in/johndoe",
      category: "Professional",
      risk: "medium",
      found: true,
    },
    {
      platform: "Twitter/X",
      url: "https://x.com/johndoe",
      category: "Social",
      risk: "medium",
      found: true,
    },
    {
      platform: "Instagram",
      url: "https://instagram.com/johndoe",
      category: "Social",
      risk: "low",
      found: true,
    },
    {
      platform: "Reddit",
      url: "https://reddit.com/user/johndoe",
      category: "Forum",
      risk: "medium",
      found: true,
    },
  ];

  const breaches = [
    {
      name: "Example Data Breach 2023",
      date: "2023-06-15",
      exposedData: ["Email", "Password hash", "Username"],
    },
    {
      name: "Social Platform Leak",
      date: "2022-11-01",
      exposedData: ["Email", "Phone number"],
    },
  ];

  return (
    <>
      <Helmet>
        <title>Sample Report | FootprintIQ</title>
        <meta name="description" content="See what a FootprintIQ digital footprint report looks like. View sample findings, breach data, and risk assessments." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary" className="text-sm">Sample Report</Badge>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Digital Footprint Report
            </h1>
            <p className="text-lg text-muted-foreground">
              This is an example report showing what FootprintIQ discovers. Run your own scan to see your actual digital exposure.
            </p>
          </div>

          {/* Subject Summary */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Scan Subject
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Username</p>
                  <p className="font-medium">johndoe</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Scan Date</p>
                  <p className="font-medium">December 26, 2024</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Summary */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Risk Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-3xl font-bold text-foreground">5</p>
                  <p className="text-sm text-muted-foreground">Profiles Found</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-3xl font-bold text-foreground">2</p>
                  <p className="text-sm text-muted-foreground">Breaches Detected</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-3xl font-bold text-amber-600">Medium</p>
                  <p className="text-sm text-muted-foreground">Overall Risk</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-3xl font-bold text-foreground">100+</p>
                  <p className="text-sm text-muted-foreground">Sources Checked</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Findings */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Profile Findings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sampleFindings.map((finding, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{finding.platform}</p>
                        <p className="text-sm text-muted-foreground">{finding.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={finding.risk === "low" ? "secondary" : "outline"}
                        className={finding.risk === "medium" ? "border-amber-500 text-amber-600" : ""}
                      >
                        {finding.risk} risk
                      </Badge>
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Breach Data */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Breach Exposure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {breaches.map((breach, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-lg border border-border bg-card"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium">{breach.name}</p>
                      <Badge variant="outline">{breach.date}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {breach.exposedData.map((data, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {data}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-8 text-center">
              <Mail className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">Ready to scan your own footprint?</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Get your personalized report in minutes. See exactly what the internet knows about you.
              </p>
              <Button size="lg" asChild>
                <Link to="/auth">
                  <Search className="w-5 h-5 mr-2" />
                  Run Your Free Scan
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SampleReport;
