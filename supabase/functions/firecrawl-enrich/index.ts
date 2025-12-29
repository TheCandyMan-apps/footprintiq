import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Known domains that typically block automated access
const KNOWN_BLOCKED_DOMAINS = [
  'reddit.com', 'twitter.com', 'x.com', 'linkedin.com', 'facebook.com', 
  'instagram.com', 'tiktok.com', 'pinterest.com', 'snapchat.com'
];

function getErrorCode(status: number, errorMessage: string): string {
  const lowerMsg = errorMessage.toLowerCase();
  
  if (lowerMsg.includes('not currently supported') || lowerMsg.includes('not supported')) {
    return 'UNSUPPORTED_SITE';
  }
  if (status === 403 || status === 401 || lowerMsg.includes('blocked') || lowerMsg.includes('forbidden')) {
    return 'ACCESS_DENIED';
  }
  if (status === 404 || lowerMsg.includes('not found')) {
    return 'NOT_FOUND';
  }
  if (lowerMsg.includes('timeout') || lowerMsg.includes('timed out')) {
    return 'TIMEOUT';
  }
  return 'GENERIC';
}

function getDomainFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace('www.', '');
  } catch {
    return '';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required', errorCode: 'INVALID_INPUT' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Context enrichment service not configured', errorCode: 'CONFIG_ERROR' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const domain = getDomainFromUrl(formattedUrl);
    const isKnownBlocked = KNOWN_BLOCKED_DOMAINS.some(d => domain.includes(d));

    console.log('Enriching context for URL:', formattedUrl, isKnownBlocked ? '(known blocked domain)' : '');

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown', 'html'],
        onlyMainContent: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      const errorMessage = data.error || `Request failed with status ${response.status}`;
      const errorCode = getErrorCode(response.status, errorMessage);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage,
          errorCode,
          domain,
          isKnownBlocked
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract content from response
    const content = data.data || data;
    const result = {
      success: true,
      sourceUrl: formattedUrl,
      fetchedAt: new Date().toISOString(),
      title: content.metadata?.title || 'Unknown',
      description: content.metadata?.description || '',
      markdown: content.markdown || '',
      html: content.html || '',
      metadata: content.metadata || {},
    };

    console.log('Context enrichment successful for:', formattedUrl);
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error enriching context:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to enrich context';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage, errorCode: 'GENERIC' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
