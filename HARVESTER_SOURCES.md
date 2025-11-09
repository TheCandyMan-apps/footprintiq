# Harvester OSINT Sources

The Harvester integration now includes **8 premium OSINT sources** for comprehensive reconnaissance:

## Available Sources

### 1. **Google Search** (`google`)
- **Type**: Search Engine Scraping
- **Discovers**: Emails, Subdomains
- **API Required**: Google Custom Search API
- **Secrets Needed**: 
  - `GOOGLE_API_KEY`
  - `GOOGLE_SEARCH_ENGINE_ID`

### 2. **Hunter.io** (`hunter`)
- **Type**: Email Discovery
- **Discovers**: Professional emails, corporate addresses
- **API Required**: Hunter.io API
- **Secrets Needed**: `HUNTER_IO_KEY`

### 3. **Shodan** (`shodan`)
- **Type**: Internet-Connected Devices
- **Discovers**: Subdomains, IPs, open ports
- **API Required**: Shodan API
- **Secrets Needed**: `SHODAN_API_KEY`

### 4. **Censys** (`censys`)
- **Type**: Internet Infrastructure
- **Discovers**: Subdomains from SSL certificates
- **API Required**: Censys API
- **Secrets Needed**: 
  - `CENSYS_API_KEY_UID`
  - `CENSYS_API_KEY_SECRET`

### 5. **VirusTotal** (`virustotal`) ✨ NEW
- **Type**: Threat Intelligence
- **Discovers**: Subdomains, malicious domains
- **API Required**: VirusTotal API v3
- **Secrets Needed**: `VIRUSTOTAL_API_KEY`
- **Endpoint**: `https://www.virustotal.com/api/v3/domains/{domain}/subdomains`

### 6. **SecurityTrails** (`securitytrails`) ✨ NEW
- **Type**: DNS & Subdomain History
- **Discovers**: Historical subdomains, DNS records
- **API Required**: SecurityTrails API
- **Secrets Needed**: `SECURITYTRAILS_API_KEY`
- **Endpoint**: `https://api.securitytrails.com/v1/domain/{domain}/subdomains`

### 7. **Wayback Machine** (`wayback`) ✨ NEW
- **Type**: Historical Web Archives
- **Discovers**: Historical URLs, subdomains from archived pages
- **API Required**: None (public API)
- **Secrets Needed**: None
- **Endpoint**: `https://web.archive.org/cdx/search/cdx`
- **Data**: Up to 1000 historical URLs per domain

### 8. **Certificate Transparency** (`certransparency`) ✨ NEW
- **Type**: SSL Certificate Logs
- **Discovers**: Subdomains from certificate transparency logs (crt.sh)
- **API Required**: None (public API)
- **Secrets Needed**: None
- **Endpoint**: `https://crt.sh/?q=%.{domain}&output=json`
- **Data**: All certificates issued for the domain

## Setup Instructions

### Required Secrets

To use all sources, add the following secrets via the Lovable Cloud secrets manager:

```bash
# Already configured (if you followed the initial setup):
GOOGLE_API_KEY
GOOGLE_SEARCH_ENGINE_ID
HUNTER_IO_KEY
SHODAN_API_KEY
CENSYS_API_KEY_UID
CENSYS_API_KEY_SECRET

# New secrets needed:
VIRUSTOTAL_API_KEY      # Get from https://www.virustotal.com/gui/my-apikey
SECURITYTRAILS_API_KEY  # Get from https://securitytrails.com/app/account/credentials
```

### Free Sources

The following sources work without API keys:
- **Wayback Machine**: Public archive data
- **Certificate Transparency**: Public SSL certificate logs

These sources are **always available** and provide excellent subdomain discovery.

## Usage

### Via UI (HarvesterTab Component)

1. Navigate to the Harvester Recon tab
2. Enter target domain (e.g., `example.com`)
3. Select sources to use (all 8 available)
4. Click "Start Harvester Scan"
5. Cost: **10 credits per scan**

### Via Edge Function

```typescript
const { data, error } = await supabase.functions.invoke('harvester-scan', {
  body: {
    domain: 'example.com',
    sources: ['virustotal', 'securitytrails', 'wayback', 'certransparency'],
    workspace_id: 'your-workspace-id'
  }
});
```

## Results Format

```typescript
interface HarvestResult {
  emails: string[];          // Found email addresses
  subdomains: string[];      // Discovered subdomains
  hosts: string[];           // URLs and hostnames
  ips: string[];             // IP addresses
  correlations: Array<{      // Relationships found
    type: string;            // e.g., 'email_subdomain', 'subdomain_ip'
    source: string;
    target: string;
    description: string;
  }>;
}
```

## Best Practices

1. **Start with free sources**: Use `wayback` and `certransparency` first to avoid API costs
2. **Combine multiple sources**: Different sources provide different data - use at least 3-4 for comprehensive results
3. **Rate limiting**: Each source has its own rate limits - use responsibly
4. **Data freshness**: 
   - Real-time: Google, Hunter, Shodan, Censys, VirusTotal, SecurityTrails
   - Historical: Wayback Machine, Certificate Transparency

## Troubleshooting

### Source Not Returning Data

1. **Check API key configuration**: Verify secrets are set correctly
2. **Check API limits**: Some sources have free tier limits
3. **Domain format**: Use root domain only (e.g., `example.com` not `www.example.com`)
4. **Check logs**: Review edge function logs for specific errors

### Recommended Source Combinations

**For Email Discovery:**
```
['google', 'hunter']
```

**For Infrastructure Mapping:**
```
['shodan', 'censys', 'securitytrails']
```

**For Subdomain Enumeration:**
```
['virustotal', 'securitytrails', 'wayback', 'certransparency']
```

**Comprehensive Scan (All Sources):**
```
['google', 'hunter', 'shodan', 'censys', 'virustotal', 'securitytrails', 'wayback', 'certransparency']
```

## Credits Cost

- **10 credits per scan** regardless of number of sources selected
- Premium feature only
- Results cached for 24 hours (same domain re-scanned uses cache)

## Privacy & Ethics

All sources collect data from **publicly available information only**. This tool performs **passive reconnaissance** and does not:
- Exploit vulnerabilities
- Access private systems
- Violate terms of service
- Store sensitive data long-term

Use responsibly for security research and privacy protection purposes only.
