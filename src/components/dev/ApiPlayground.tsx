import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Play, Copy } from "lucide-react";

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  params?: { name: string; required: boolean; description: string }[];
}

const endpoints: ApiEndpoint[] = [
  {
    method: "GET",
    path: "/api-v1/scans",
    description: "List all scans",
    params: [
      { name: "limit", required: false, description: "Number of results (default: 10)" }
    ]
  },
  {
    method: "GET",
    path: "/api-v1/scans/:id",
    description: "Get specific scan",
    params: [
      { name: "id", required: true, description: "Scan ID" }
    ]
  },
  {
    method: "GET",
    path: "/api-v1/findings",
    description: "Get findings for a scan",
    params: [
      { name: "scan_id", required: true, description: "Scan ID" },
      { name: "severity", required: false, description: "Filter by severity (low, medium, high, critical)" },
      { name: "limit", required: false, description: "Number of results" }
    ]
  },
  {
    method: "GET",
    path: "/api-v1/monitors",
    description: "List all monitors",
    params: []
  }
];

export function ApiPlayground() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(endpoints[0]);
  const [apiKey, setApiKey] = useState("");
  const [params, setParams] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const buildUrl = () => {
    const baseUrl = "https://byuzgvauaeldjqxlrjci.supabase.co/functions/v1";
    let path = selectedEndpoint.path;
    
    // Replace path params
    Object.entries(params).forEach(([key, value]) => {
      if (path.includes(`:${key}`)) {
        path = path.replace(`:${key}`, value);
      }
    });
    
    // Add query params
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value && !selectedEndpoint.path.includes(`:${key}`)) {
        queryParams.append(key, value);
      }
    });
    
    const query = queryParams.toString();
    return `${baseUrl}${path}${query ? `?${query}` : ''}`;
  };

  const executeRequest = async () => {
    if (!apiKey) {
      toast({ title: "Error", description: "API key is required", variant: "destructive" });
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const url = buildUrl();
      const res = await fetch(url, {
        method: selectedEndpoint.method,
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();
      setResponse({
        status: res.status,
        statusText: res.statusText,
        data: data
      });
    } catch (error: any) {
      setResponse({
        status: 'error',
        statusText: error.message,
        data: null
      });
    } finally {
      setLoading(false);
    }
  };

  const copyCurl = () => {
    const url = buildUrl();
    const curl = `curl -X ${selectedEndpoint.method} '${url}' \\\n  -H 'x-api-key: ${apiKey || 'YOUR_API_KEY'}'`;
    navigator.clipboard.writeText(curl);
    toast({ title: "Copied", description: "cURL command copied to clipboard" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Playground</CardTitle>
        <CardDescription>Test API endpoints interactively</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Endpoint Selection */}
        <div>
          <Label>Endpoint</Label>
          <Select
            value={endpoints.indexOf(selectedEndpoint).toString()}
            onValueChange={(v) => {
              setSelectedEndpoint(endpoints[parseInt(v)]);
              setParams({});
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {endpoints.map((endpoint, idx) => (
                <SelectItem key={idx} value={idx.toString()}>
                  <span className="font-mono text-sm">
                    <span className="font-bold text-primary">{endpoint.method}</span> {endpoint.path}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-1">{selectedEndpoint.description}</p>
        </div>

        {/* API Key */}
        <div>
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="fpiq_..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>

        {/* Parameters */}
        {selectedEndpoint.params && selectedEndpoint.params.length > 0 && (
          <div className="space-y-3">
            <Label>Parameters</Label>
            {selectedEndpoint.params.map((param) => (
              <div key={param.name}>
                <Label htmlFor={param.name} className="text-sm">
                  {param.name}
                  {param.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Input
                  id={param.name}
                  placeholder={param.description}
                  value={params[param.name] || ""}
                  onChange={(e) => setParams({ ...params, [param.name]: e.target.value })}
                />
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={executeRequest} disabled={loading}>
            <Play className="h-4 w-4 mr-2" />
            {loading ? "Executing..." : "Execute"}
          </Button>
          <Button variant="outline" onClick={copyCurl}>
            <Copy className="h-4 w-4 mr-2" />
            Copy as cURL
          </Button>
        </div>

        {/* Response */}
        {response && (
          <div>
            <Label>Response</Label>
            <div className="bg-muted rounded-lg p-4 mt-2">
              <div className="flex items-center gap-2 mb-2">
                <span className={`font-semibold ${
                  response.status === 200 ? 'text-green-600' : 'text-destructive'
                }`}>
                  Status: {response.status} {response.statusText}
                </span>
              </div>
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
