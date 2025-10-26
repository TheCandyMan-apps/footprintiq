import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getPreferences, setPreferences, UserPreferences } from "@/lib/preferences";
import { useToast } from "@/hooks/use-toast";
import { HelpIcon } from "@/components/ui/help-icon";

export default function Preferences() {
  const [prefs, setPrefs] = useState<UserPreferences>(getPreferences());
  const { toast } = useToast();

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setPrefs(e.detail);
    };
    window.addEventListener('preferences-changed' as any, handler);
    return () => window.removeEventListener('preferences-changed' as any, handler);
  }, []);

  const handleSave = () => {
    setPreferences(prefs);
    toast({ title: "Preferences saved" });
  };

  return (
    <>
      <SEO
        title="Preferences — FootprintIQ"
        description="Customize your FootprintIQ experience with theme, language, and display preferences."
      />
      <Header />
      
      <main className="min-h-screen bg-background py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Preferences</h1>
            <p className="text-muted-foreground">
              Customize your FootprintIQ experience
            </p>
          </div>

          <div className="space-y-6">
            {/* Theme */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="theme">Theme</Label>
                  <HelpIcon text="Choose your preferred color scheme" />
                </div>
                <Select value={prefs.theme} onValueChange={(value: any) => setPrefs({ ...prefs, theme: value })}>
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto (System)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Density */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="density">Display Density</Label>
                  <HelpIcon text="Control spacing and information density" />
                </div>
                <Select value={prefs.density} onValueChange={(value: any) => setPrefs({ ...prefs, density: value })}>
                  <SelectTrigger id="density">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cozy">Cozy</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Tooltips */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="tooltips">Tooltips</Label>
                  <HelpIcon text="Control how much help text you see" />
                </div>
                <Select value={prefs.tooltips} onValueChange={(value: any) => setPrefs({ ...prefs, tooltips: value })}>
                  <SelectTrigger id="tooltips">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brief">Brief</SelectItem>
                    <SelectItem value="verbose">Verbose</SelectItem>
                    <SelectItem value="off">Off</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Language */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="language">Language</Label>
                  <HelpIcon text="Choose your preferred language" />
                </div>
                <Select value={prefs.language} onValueChange={(value) => setPrefs({ ...prefs, language: value })}>
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español (Coming soon)</SelectItem>
                    <SelectItem value="fr">Français (Coming soon)</SelectItem>
                    <SelectItem value="de">Deutsch (Coming soon)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Privacy */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="hide-adult">Hide Adult Sources</Label>
                    <HelpIcon text="Filter out adult content sources from searches" />
                  </div>
                  <Switch
                    id="hide-adult"
                    checked={prefs.hideAdultSources}
                    onCheckedChange={(checked) => setPrefs({ ...prefs, hideAdultSources: checked })}
                  />
                </div>
              </div>
            </Card>

            {/* Save */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setPrefs(getPreferences())}>
                Reset
              </Button>
              <Button onClick={handleSave}>
                Save Preferences
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
