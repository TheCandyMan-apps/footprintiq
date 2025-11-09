# TheHarvester Premium OSINT Integration

## Overview
This integration adds theHarvester-style OSINT capabilities as a premium feature, enabling email, subdomain, and host discovery from multiple public sources.

## Architecture

### Edge Function: `harvester-scan`
Located: `supabase/functions/harvester-scan/index.ts`

**Features:**
- Premium-only access (requires analyst/pro/enterprise tier)
- Credits-based pricing (10 credits per scan)
- Multi-source harvesting:
  - Google Custom Search API (emails, subdomains)
  - Hunter.io (professional emails)
  - Shodan (hosts, IPs)
  - Censys (certificate transparency, subdomains)
- Real-time progress updates via Supabase Realtime
- Automatic correlation generation (email↔subdomain, subdomain↔IP)
- Results saved to `scans` table with type='harvester'

**Cost:** 10 credits per scan

### UI Components

#### 1. HarvesterTab (`src/components/scan/HarvesterTab.tsx`)
- Main scan interface
- Premium gate with upgrade teaser for free users
- Source selection (Google, Hunter, Shodan, Censys)
- Domain input and validation
- Ethical use notice
- Triggers consent dialog on first use

#### 2. HarvesterResults (`src/components/scan/HarvesterResults.tsx`)
- Tabbed view: Emails | Subdomains | Hosts | Correlations
- Statistics dashboard (counts per category)
- Copy-to-clipboard for individual findings
- Save to Cases functionality
- JSON export capability
- Correlation viewer showing relationships between findings

#### 3. HarvesterConsentDialog (`src/components/dialogs/HarvesterConsentDialog.tsx`)
- Ethical use agreement
- Explains passive OSINT methodology
- Lists acceptable use cases (security research, privacy protection)
- Prohibits malicious activities
- Required before first scan

#### 4. HarvesterDemo (`src/pages/HarvesterDemo.tsx`)
- Sample integration page
- Shows scan → progress → results flow
- Manages consent state
- Integrates with ScanProgressDialog for real-time updates

## Data Flow

```
User Input (domain + sources)
    ↓
Premium Check (user_roles table)
    ↓
Credits Check (10 credits required)
    ↓
Scan Record Created (scans table, status='running')
    ↓
Real-time Progress Broadcast (Supabase Realtime)
    ↓
Parallel Harvesting (Google, Hunter, Shodan, Censys)
    ↓
Results Merge & Deduplication
    ↓
Correlation Generation
    ↓
Scan Update (status='completed', results stored)
    ↓
Credits Deduction (credits_ledger)
    ↓
Final Progress Broadcast (scan_complete event)
    ↓
UI Displays Results (tabs, stats, correlations)
```

## Real-time Progress

Progress updates are sent via Supabase Realtime channel `scan-progress`:

```typescript
// Progress events
{
  scan_id: string,
  status: 'running' | 'completed' | 'failed',
  provider: 'google' | 'hunter' | 'shodan' | 'censys' | 'harvester',
  message: string
}

// Completion event
{
  scan_id: string,
  status: 'completed',
  results_count: number
}
```

The `ScanProgressDialog` component subscribes to these events and displays live updates like "Harvesting Google: Done ✅".

## Correlation Engine

The harvester automatically generates correlations between findings:

### Email ↔ Subdomain
```typescript
{
  type: 'email_subdomain',
  source: 'admin@example.com',
  target: 'mail.example.com',
  description: 'Email admin@example.com found on subdomain mail.example.com'
}
```

### Subdomain ↔ IP
```typescript
{
  type: 'subdomain_ip',
  source: 'mail.example.com',
  target: '192.168.1.1',
  description: 'Subdomain mail.example.com resolves to 192.168.1.1'
}
```

## Premium Features

**Free Tier:**
- Teaser UI showing capabilities
- "Upgrade for email and subdomain harvest!" message
- Displays locked features with benefits list

**Premium Tiers (Analyst/Pro/Enterprise):**
- Full access to harvester scans
- 10 credits per scan
- All sources available
- Unlimited scans (subject to credits)
- Save to cases
- Export results

## API Keys Required

Set these as Supabase Edge Function secrets:

- `GOOGLE_API_KEY` - Google Custom Search API
- `GOOGLE_SEARCH_ENGINE_ID` - Custom Search Engine ID
- `HUNTER_IO_KEY` - Hunter.io API key
- `SHODAN_API_KEY` - Shodan API key (optional)
- `CENSYS_API_KEY_UID` - Censys API ID (optional)
- `CENSYS_API_KEY_SECRET` - Censys API Secret (optional)

**Note:** Scans will skip sources without configured API keys. Minimum requirement is Google Custom Search for basic functionality.

## Ethical Considerations

**Passive Only:**
- All harvesting is passive reconnaissance
- No port scanning or active probing
- Data collected from publicly accessible sources only

**Consent Required:**
- Users must agree to ethical use terms
- Terms displayed in `HarvesterConsentDialog`
- Consent tracked per user session

**Acceptable Use:**
- Security research and vulnerability assessment
- Privacy protection and digital footprint analysis
- Corporate security auditing
- Academic research

**Prohibited:**
- Malicious hacking or unauthorized access
- Spamming, phishing, social engineering
- Harassment or stalking
- Any illegal activities

## Testing

Run tests with:
```bash
npm run test:harvester
```

Tests cover:
- Multi-target harvesting (5 mock domains)
- Email discovery validation
- Subdomain enumeration
- Correlation generation
- Credit deduction
- Premium requirement
- Progress tracking
- Domain validation
- Rate limiting
- Concurrent scans
- Performance benchmarks

## Integration with Existing Features

**Workspace Integration:**
- Pass `workspace_id` to link scans to workspaces
- Credits deducted from workspace balance
- Scan results shareable within workspace

**Cases Integration:**
- "Save to Case" button creates new case entry
- Case type: 'harvester'
- Case data includes full scan results + metadata
- Accessible from Cases page

**Progress Dialog Integration:**
- Uses existing `ScanProgressDialog` component
- Pass `scanType="harvester"` for proper labeling
- Automatically subscribes to real-time updates

## Future Enhancements

1. **Additional Sources:**
   - Bing Search
   - DuckDuckGo
   - VirusTotal
   - SecurityTrails
   - Wayback Machine

2. **Advanced Correlations:**
   - DNS resolution for all subdomains
   - Port scan integration (with permission)
   - WHOIS data enrichment
   - Certificate chain analysis

3. **Export Formats:**
   - CSV export
   - PDF report with visualizations
   - XML for third-party tools
   - STIX/TAXII for threat intelligence

4. **Visualization:**
   - Network graph of correlations
   - Timeline of findings
   - Heatmap of source coverage

## Deployment

The harvester edge function is automatically deployed with Lovable Cloud. No additional setup required beyond configuring API keys as secrets.

## Troubleshooting

**"Premium feature required":**
- Check user's `subscription_tier` in `user_roles` table
- Ensure tier is 'analyst', 'pro', or 'enterprise'

**"Insufficient credits":**
- Check workspace credit balance: `SELECT * FROM credits_ledger WHERE workspace_id = ?`
- Add credits via purchase or admin grant

**No results found:**
- Verify API keys are configured correctly
- Check edge function logs for API errors
- Ensure domain is valid and publicly accessible
- Try different sources if one fails

**Scan stuck in "running" status:**
- Check edge function logs for errors
- Verify Realtime channel subscriptions
- Manually update scan status if needed
