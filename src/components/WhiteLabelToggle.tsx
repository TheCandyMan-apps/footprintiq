import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export const WhiteLabelToggle = () => {
  const [enabled, setEnabled] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [logo, setLogo] = useState("");

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">White-Label Branding</h3>
            <p className="text-sm text-muted-foreground">
              Customize reports with your company branding
            </p>
          </div>
          <Badge variant="secondary">£49/mo</Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Switch 
            id="white-label" 
            checked={enabled}
            onCheckedChange={setEnabled}
          />
          <Label htmlFor="white-label">Enable white-label branding</Label>
        </div>

        {enabled && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                placeholder="Your Company Ltd"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo-url">Logo URL</Label>
              <Input
                id="logo-url"
                placeholder="https://yoursite.com/logo.png"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Your branding will appear on all exported reports and PDF documents
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
