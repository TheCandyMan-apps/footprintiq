import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateSDKCode, languageOptions } from "@/lib/sdk-templates";

export function SDKGenerator({ apiKey }: { apiKey?: string }) {
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const { toast } = useToast();

  const copyCode = () => {
    const code = generateSDKCode(selectedLanguage, apiKey);
    navigator.clipboard.writeText(code);
    toast({ title: "Copied", description: "SDK code copied to clipboard" });
  };

  const downloadCode = () => {
    const code = generateSDKCode(selectedLanguage, apiKey);
    const extensions: Record<string, string> = {
      javascript: 'js',
      python: 'py',
      go: 'go',
      curl: 'sh'
    };
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `footprintiq-client.${extensions[selectedLanguage]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: "Downloaded", description: "SDK code downloaded" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>SDK Code Generator</CardTitle>
        <CardDescription>
          Generate client code in your preferred language
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <TabsList className="grid w-full grid-cols-4">
            {languageOptions.map((lang) => (
              <TabsTrigger key={lang.value} value={lang.value}>
                <span className="mr-1">{lang.icon}</span>
                {lang.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {languageOptions.map((lang) => (
            <TabsContent key={lang.value} value={lang.value} className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={copyCode} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </Button>
                <Button onClick={downloadCode} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              
              <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs">
                  <code>{generateSDKCode(lang.value, apiKey)}</code>
                </pre>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
