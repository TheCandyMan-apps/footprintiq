import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, errorResponse, jsonResponse, getAllowedOrigins, checkOrigin } from "../../_shared/secure.ts";

/**
 * HIBP (Have I Been Pwned) Provider Edge Function
 * Securely checks email addresses against breach database
 * Returns normalized UFM findings with redacted evidence
 */

interface HibpRequest {
  target: string;
}

interface Finding {
  provider: string;
  kind: string;
  severity: "low" | "medium" | "high" | "critical";
  confidence: number;
  observedAt: string;
  latencyMs?: number;
  reason?: string;
  evidence?: Array<{ key: string; value: string }>;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  // Validate origin
  const allowedOrigins = getAllowedOrigins();
  if (!checkOrigin(req, allowedOrigins)) {
    return errorResponse('Forbidden', 403);
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const { target } = await req.json() as HibpRequest;

    // Validate email format
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!target || !emailRegex.test(target)) {
      return errorResponse('Invalid email address', 400);
    }

    // Get API key from environment
    const apiKey = Deno.env.get('HIBP_API_KEY');
    if (!apiKey) {
      console.error('HIBP_API_KEY not configured');
      return errorResponse('Server misconfigured', 500);
    }

    const startTime = Date.now();

    // Call HIBP API
    const response = await fetch(
      `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(target)}?truncateResponse=false`,
      {
        headers: {
          'hibp-api-key': apiKey,
          'user-agent': 'FootprintIQ/1.0 (+https://footprintiq.app)',
        },
      }
    );

    const latency = Date.now() - startTime;

    // Handle 404 - no breaches found
    if (response.status === 404) {
      return jsonResponse({
        findings: [
          {
            provider: "hibp",
            kind: "breach.none",
            severity: "low",
            confidence: 0.9,
            observedAt: new Date().toISOString(),
            latencyMs: latency,
            reason: "no_breaches_found",
          } as Finding,
        ],
      });
    }

    // Handle other HTTP errors
    if (!response.ok) {
      console.error(`HIBP API error: ${response.status} ${response.statusText}`);
      return jsonResponse({
        findings: [
          {
            provider: "hibp",
            kind: "breach.none",
            severity: "low",
            confidence: 0.4,
            observedAt: new Date().toISOString(),
            latencyMs: latency,
            reason: `http_${response.status}`,
          } as Finding,
        ],
      });
    }

    // Parse breaches
    const breaches = await response.json() as any[];

    // Redact sensitive breach data - keep only metadata
    const evidence = breaches.slice(0, 20).map((breach) => ({
      key: breach.Name,
      value: `Domain: ${breach.Domain || 'N/A'} | Date: ${breach.BreachDate || 'Unknown'} | Records: ~${breach.PwnCount?.toLocaleString() || 'Unknown'}`,
    }));

    // Determine severity based on sensitive data exposure
    const hasSensitiveData = breaches.some(
      (b) => b.IsSensitive || b.DataClasses?.includes('Passwords')
    );
    const severity = hasSensitiveData ? "high" : "medium";

    // Calculate confidence based on number of breaches
    const confidence = Math.min(0.95, 0.6 + breaches.length * 0.05);

    return jsonResponse({
      findings: [
        {
          provider: "hibp",
          kind: "breach.hit",
          severity,
          confidence,
          observedAt: new Date().toISOString(),
          latencyMs: latency,
          reason: `${breaches.length}_breaches_found`,
          evidence,
        } as Finding,
      ],
    });

  } catch (error) {
    console.error('HIBP function error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
});
