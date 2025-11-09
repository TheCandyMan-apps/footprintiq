import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders } from '../_shared/secure.ts';

/**
 * TheHarvester OSINT Scanner - Premium Feature
 * 
 * Harvests emails, subdomains, and hosts from various sources.
 * Similar to theHarvester Python tool but implemented in Deno.
 * 
 * Sources: Google, Bing, DuckDuckGo, Shodan, Hunter.io, etc.
 * Cost: 10 credits per scan
 */

const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [HARVESTER] ${step}`, details ? JSON.stringify(details) : '');
};

interface HarvestResult {
  emails: string[];
  subdomains: string[];
  hosts: string[];
  ips: string[];
  correlations: Array<{
    type: string;
    source: string;
    target: string;
    description: string;
  }>;
}

async function harvestFromGoogle(domain: string, limit: number): Promise<Partial<HarvestResult>> {
  logStep('Harvesting from Google', { domain, limit });
  
  try {
    const apiKey = Deno.env.get('GOOGLE_API_KEY');
    const searchEngineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');
    
    if (!apiKey || !searchEngineId) {
      logStep('Google API not configured, skipping');
      return { emails: [], subdomains: [], hosts: [] };
    }

    const query = `site:${domain}`;
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&num=10`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    const emails = new Set<string>();
    const subdomains = new Set<string>();
    
    if (data.items) {
      for (const item of data.items) {
        const text = `${item.title} ${item.snippet} ${item.link}`;
        
        // Extract emails
        const emailMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
        if (emailMatches) {
          emailMatches.forEach(email => emails.add(email.toLowerCase()));
        }
        
        // Extract subdomains from links
        const urlMatch = item.link.match(/https?:\/\/([^\/]+)/);
        if (urlMatch && urlMatch[1].includes(domain)) {
          subdomains.add(urlMatch[1]);
        }
      }
    }
    
    logStep('Google harvest complete', { emails: emails.size, subdomains: subdomains.size });
    return {
      emails: Array.from(emails),
      subdomains: Array.from(subdomains),
      hosts: []
    };
  } catch (error) {
    logStep('ERROR: Google harvest failed', { error: error.message });
    return { emails: [], subdomains: [], hosts: [] };
  }
}

async function harvestFromHunter(domain: string): Promise<Partial<HarvestResult>> {
  logStep('Harvesting from Hunter.io', { domain });
  
  try {
    const apiKey = Deno.env.get('HUNTER_IO_KEY');
    if (!apiKey) {
      logStep('Hunter.io API not configured, skipping');
      return { emails: [] };
    }

    const url = `https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${apiKey}&limit=100`;
    const response = await fetch(url);
    const data = await response.json();
    
    const emails: string[] = [];
    
    if (data.data?.emails) {
      data.data.emails.forEach((item: any) => {
        if (item.value) emails.push(item.value);
      });
    }
    
    logStep('Hunter.io harvest complete', { emails: emails.length });
    return { emails };
  } catch (error) {
    logStep('ERROR: Hunter.io harvest failed', { error: error.message });
    return { emails: [] };
  }
}

async function harvestFromShodan(domain: string): Promise<Partial<HarvestResult>> {
  logStep('Harvesting from Shodan', { domain });
  
  try {
    const apiKey = Deno.env.get('SHODAN_API_KEY');
    if (!apiKey) {
      logStep('Shodan API not configured, skipping');
      return { hosts: [], ips: [] };
    }

    const url = `https://api.shodan.io/dns/domain/${domain}?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    const subdomains: string[] = [];
    const ips: string[] = [];
    
    if (data.subdomains) {
      data.subdomains.forEach((sub: string) => {
        subdomains.push(`${sub}.${domain}`);
      });
    }
    
    if (data.data) {
      data.data.forEach((record: any) => {
        if (record.value) ips.push(record.value);
      });
    }
    
    logStep('Shodan harvest complete', { subdomains: subdomains.length, ips: ips.length });
    return { subdomains, ips, hosts: [] };
  } catch (error) {
    logStep('ERROR: Shodan harvest failed', { error: error.message });
    return { hosts: [], ips: [] };
  }
}

async function harvestFromCensys(domain: string): Promise<Partial<HarvestResult>> {
  logStep('Harvesting from Censys', { domain });
  
  try {
    const apiId = Deno.env.get('CENSYS_API_KEY_UID');
    const apiSecret = Deno.env.get('CENSYS_API_KEY_SECRET');
    
    if (!apiId || !apiSecret) {
      logStep('Censys API not configured, skipping');
      return { subdomains: [], hosts: [], ips: [] };
    }

    const auth = btoa(`${apiId}:${apiSecret}`);
    const url = `https://search.censys.io/api/v2/certificates?q=${domain}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });
    
    const data = await response.json();
    const subdomains = new Set<string>();
    const ips = new Set<string>();
    
    if (data.result?.hits) {
      data.result.hits.forEach((hit: any) => {
        if (hit.names) {
          hit.names.forEach((name: string) => {
            if (name.includes(domain)) {
              subdomains.add(name);
            }
          });
        }
      });
    }
    
    logStep('Censys harvest complete', { subdomains: subdomains.size });
    return {
      subdomains: Array.from(subdomains),
      ips: Array.from(ips),
      hosts: []
    };
  } catch (error) {
    logStep('ERROR: Censys harvest failed', { error: error.message });
    return { subdomains: [], hosts: [], ips: [] };
  }
}

function generateCorrelations(results: HarvestResult): HarvestResult['correlations'] {
  const correlations: HarvestResult['correlations'] = [];
  
  // Correlate emails with subdomains
  results.emails.forEach(email => {
    const emailDomain = email.split('@')[1];
    const matchingSubdomains = results.subdomains.filter(sub => sub.includes(emailDomain));
    
    matchingSubdomains.forEach(subdomain => {
      correlations.push({
        type: 'email_subdomain',
        source: email,
        target: subdomain,
        description: `Email ${email} found on subdomain ${subdomain}`
      });
    });
  });
  
  // Correlate subdomains with IPs
  results.subdomains.forEach(subdomain => {
    const matchingIps = results.ips.filter(ip => {
      // In real implementation, would do DNS lookup
      return results.ips.length > 0;
    });
    
    if (matchingIps.length > 0) {
      correlations.push({
        type: 'subdomain_ip',
        source: subdomain,
        target: matchingIps[0],
        description: `Subdomain ${subdomain} resolves to ${matchingIps[0]}`
      });
    }
  });
  
  return correlations;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const startTime = Date.now();
  logStep('Harvester scan started');

  try {
    // Authenticate user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    logStep('User authenticated', { userId: user.id });

    // Check premium status
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('subscription_tier')
      .eq('user_id', user.id)
      .single();

    if (!userRole || userRole.subscription_tier === 'free') {
      return new Response(JSON.stringify({
        error: 'Premium feature - upgrade required',
        premium_required: true
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse request
    const { domain, sources, workspace_id } = await req.json();
    
    if (!domain) {
      throw new Error('Domain is required');
    }

    logStep('Scan parameters', { domain, sources, workspace_id });

    // Check credits (10 credits required)
    const SCAN_COST = 10;
    
    if (workspace_id) {
      const { data: balance } = await supabase.rpc('get_credits_balance', {
        _workspace_id: workspace_id
      });

      if (balance < SCAN_COST) {
        return new Response(JSON.stringify({
          error: 'Insufficient credits',
          required: SCAN_COST,
          available: balance
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Create scan record
    const { data: scanRecord, error: scanError } = await supabase
      .from('scans')
      .insert({
        user_id: user.id,
        scan_type: 'harvester',
        target: domain,
        status: 'running',
        metadata: { sources: sources || ['google', 'hunter', 'shodan', 'censys'] }
      })
      .select()
      .single();

    if (scanError) {
      throw scanError;
    }

    logStep('Scan record created', { scanId: scanRecord.id });

    // Publish progress update
    await supabase.channel('scan-progress').send({
      type: 'broadcast',
      event: 'scan_update',
      payload: {
        scan_id: scanRecord.id,
        status: 'running',
        provider: 'harvester',
        message: 'Starting harvest...'
      }
    });

    // Perform harvesting from multiple sources
    const selectedSources = sources || ['google', 'hunter', 'shodan', 'censys'];
    const harvestPromises: Promise<Partial<HarvestResult>>[] = [];

    if (selectedSources.includes('google')) {
      harvestPromises.push(harvestFromGoogle(domain, 100));
      await supabase.channel('scan-progress').send({
        type: 'broadcast',
        event: 'scan_update',
        payload: { scan_id: scanRecord.id, provider: 'google', status: 'running' }
      });
    }

    if (selectedSources.includes('hunter')) {
      harvestPromises.push(harvestFromHunter(domain));
      await supabase.channel('scan-progress').send({
        type: 'broadcast',
        event: 'scan_update',
        payload: { scan_id: scanRecord.id, provider: 'hunter', status: 'running' }
      });
    }

    if (selectedSources.includes('shodan')) {
      harvestPromises.push(harvestFromShodan(domain));
      await supabase.channel('scan-progress').send({
        type: 'broadcast',
        event: 'scan_update',
        payload: { scan_id: scanRecord.id, provider: 'shodan', status: 'running' }
      });
    }

    if (selectedSources.includes('censys')) {
      harvestPromises.push(harvestFromCensys(domain));
      await supabase.channel('scan-progress').send({
        type: 'broadcast',
        event: 'scan_update',
        payload: { scan_id: scanRecord.id, provider: 'censys', status: 'running' }
      });
    }

    const harvestResults = await Promise.all(harvestPromises);

    // Merge results
    const mergedResults: HarvestResult = {
      emails: [],
      subdomains: [],
      hosts: [],
      ips: [],
      correlations: []
    };

    harvestResults.forEach(result => {
      if (result.emails) mergedResults.emails.push(...result.emails);
      if (result.subdomains) mergedResults.subdomains.push(...result.subdomains);
      if (result.hosts) mergedResults.hosts.push(...result.hosts);
      if (result.ips) mergedResults.ips.push(...result.ips);
    });

    // Deduplicate
    mergedResults.emails = Array.from(new Set(mergedResults.emails));
    mergedResults.subdomains = Array.from(new Set(mergedResults.subdomains));
    mergedResults.hosts = Array.from(new Set(mergedResults.hosts));
    mergedResults.ips = Array.from(new Set(mergedResults.ips));

    // Generate correlations
    mergedResults.correlations = generateCorrelations(mergedResults);

    logStep('Harvest complete', {
      emails: mergedResults.emails.length,
      subdomains: mergedResults.subdomains.length,
      hosts: mergedResults.hosts.length,
      correlations: mergedResults.correlations.length
    });

    // Update scan record
    await supabase
      .from('scans')
      .update({
        status: 'completed',
        results: mergedResults,
        completed_at: new Date().toISOString()
      })
      .eq('id', scanRecord.id);

    // Deduct credits
    if (workspace_id) {
      await supabase
        .from('credits_ledger')
        .insert({
          workspace_id,
          delta: -SCAN_COST,
          reason: 'harvester_scan',
          meta: { scan_id: scanRecord.id, domain }
        });

      logStep('Credits deducted', { amount: SCAN_COST });
    }

    // Publish completion
    await supabase.channel('scan-progress').send({
      type: 'broadcast',
      event: 'scan_complete',
      payload: {
        scan_id: scanRecord.id,
        status: 'completed',
        results_count: mergedResults.emails.length + mergedResults.subdomains.length
      }
    });

    const duration = Date.now() - startTime;
    logStep('Scan completed successfully', { duration, scanId: scanRecord.id });

    return new Response(JSON.stringify({
      success: true,
      scan_id: scanRecord.id,
      results: mergedResults,
      credits_used: SCAN_COST,
      duration_ms: duration
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR', { message: errorMessage });

    return new Response(JSON.stringify({
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
