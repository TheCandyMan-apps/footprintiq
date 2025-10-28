export interface SDKTemplate {
  language: string;
  code: string;
}

export function generateSDKCode(language: string, apiKey: string = 'YOUR_API_KEY'): string {
  const baseUrl = 'https://byuzgvauaeldjqxlrjci.supabase.co/functions/v1';
  
  const templates: Record<string, string> = {
    javascript: `// FootprintIQ JavaScript SDK
import axios from 'axios';

class FootprintIQClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = '${baseUrl}';
  }

  async listScans(limit = 10) {
    const response = await axios.get(\`\${this.baseUrl}/api-v1/scans\`, {
      params: { limit },
      headers: { 'x-api-key': this.apiKey }
    });
    return response.data;
  }

  async getScan(scanId) {
    const response = await axios.get(\`\${this.baseUrl}/api-v1/scans/\${scanId}\`, {
      headers: { 'x-api-key': this.apiKey }
    });
    return response.data;
  }

  async getFindings(scanId, filters = {}) {
    const response = await axios.get(\`\${this.baseUrl}/api-v1/findings\`, {
      params: { scan_id: scanId, ...filters },
      headers: { 'x-api-key': this.apiKey }
    });
    return response.data;
  }

  async listMonitors() {
    const response = await axios.get(\`\${this.baseUrl}/api-v1/monitors\`, {
      headers: { 'x-api-key': this.apiKey }
    });
    return response.data;
  }
}

// Usage
const client = new FootprintIQClient('${apiKey}');

// List scans
const scans = await client.listScans(10);
console.log(scans);

// Get specific scan
const scan = await client.getScan('scan-id');
console.log(scan);`,

    python: `# FootprintIQ Python SDK
import requests
from typing import Optional, Dict, List

class FootprintIQClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = '${baseUrl}'
        self.headers = {'x-api-key': api_key}
    
    def list_scans(self, limit: int = 10) -> Dict:
        """List all scans"""
        response = requests.get(
            f"{self.base_url}/api-v1/scans",
            params={'limit': limit},
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()
    
    def get_scan(self, scan_id: str) -> Dict:
        """Get a specific scan"""
        response = requests.get(
            f"{self.base_url}/api-v1/scans/{scan_id}",
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()
    
    def get_findings(self, scan_id: str, filters: Optional[Dict] = None) -> Dict:
        """Get findings for a scan"""
        params = {'scan_id': scan_id}
        if filters:
            params.update(filters)
        
        response = requests.get(
            f"{self.base_url}/api-v1/findings",
            params=params,
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()
    
    def list_monitors(self) -> Dict:
        """List all monitors"""
        response = requests.get(
            f"{self.base_url}/api-v1/monitors",
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

# Usage
client = FootprintIQClient('${apiKey}')

# List scans
scans = client.list_scans(limit=10)
print(scans)

# Get specific scan
scan = client.get_scan('scan-id')
print(scan)`,

    go: `// FootprintIQ Go SDK
package footprintiq

import (
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "net/url"
)

type Client struct {
    APIKey  string
    BaseURL string
    client  *http.Client
}

func NewClient(apiKey string) *Client {
    return &Client{
        APIKey:  apiKey,
        BaseURL: "${baseUrl}",
        client:  &http.Client{},
    }
}

func (c *Client) doRequest(method, path string, params url.Values) ([]byte, error) {
    req, err := http.NewRequest(method, c.BaseURL+path, nil)
    if err != nil {
        return nil, err
    }
    
    req.Header.Set("x-api-key", c.APIKey)
    if params != nil {
        req.URL.RawQuery = params.Encode()
    }
    
    resp, err := c.client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("API error: %d", resp.StatusCode)
    }
    
    return io.ReadAll(resp.Body)
}

func (c *Client) ListScans(limit int) (interface{}, error) {
    params := url.Values{}
    params.Set("limit", fmt.Sprintf("%d", limit))
    
    data, err := c.doRequest("GET", "/api-v1/scans", params)
    if err != nil {
        return nil, err
    }
    
    var result interface{}
    if err := json.Unmarshal(data, &result); err != nil {
        return nil, err
    }
    
    return result, nil
}

func (c *Client) GetScan(scanID string) (interface{}, error) {
    data, err := c.doRequest("GET", "/api-v1/scans/"+scanID, nil)
    if err != nil {
        return nil, err
    }
    
    var result interface{}
    if err := json.Unmarshal(data, &result); err != nil {
        return nil, err
    }
    
    return result, nil
}

func (c *Client) GetFindings(scanID string) (interface{}, error) {
    params := url.Values{}
    params.Set("scan_id", scanID)
    
    data, err := c.doRequest("GET", "/api-v1/findings", params)
    if err != nil {
        return nil, err
    }
    
    var result interface{}
    if err := json.Unmarshal(data, &result); err != nil {
        return nil, err
    }
    
    return result, nil
}

// Usage
func main() {
    client := NewClient("${apiKey}")
    
    // List scans
    scans, err := client.ListScans(10)
    if err != nil {
        panic(err)
    }
    fmt.Println(scans)
}`,

    curl: `# FootprintIQ API Examples using cURL

# List all scans
curl -X GET '${baseUrl}/api-v1/scans?limit=10' \\
  -H 'x-api-key: ${apiKey}'

# Get specific scan
curl -X GET '${baseUrl}/api-v1/scans/SCAN_ID' \\
  -H 'x-api-key: ${apiKey}'

# Get findings for a scan
curl -X GET '${baseUrl}/api-v1/findings?scan_id=SCAN_ID' \\
  -H 'x-api-key: ${apiKey}'

# Get findings with filters
curl -X GET '${baseUrl}/api-v1/findings?scan_id=SCAN_ID&severity=high&limit=50' \\
  -H 'x-api-key: ${apiKey}'

# List all monitors
curl -X GET '${baseUrl}/api-v1/monitors' \\
  -H 'x-api-key: ${apiKey}'

# Get monitor details
curl -X GET '${baseUrl}/api-v1/monitors/MONITOR_ID' \\
  -H 'x-api-key: ${apiKey}'`
  };

  return templates[language] || templates.javascript;
}

export const languageOptions = [
  { value: 'javascript', label: 'JavaScript/Node.js', icon: '⚡' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'go', label: 'Go', icon: '🔷' },
  { value: 'curl', label: 'cURL', icon: '🌐' }
];
