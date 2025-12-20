import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ABSTRACT_API_URL = 'https://phoneintelligence.abstractapi.com/v1/';
const TEST_PHONE = '+14155552671'; // Standard test number

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    apiKeyConfigured: { status: 'pass' | 'fail'; message: string };
    apiKeyValid: { status: 'pass' | 'fail' | 'skipped'; message: string; details?: any };
    testCall: { status: 'pass' | 'fail' | 'skipped'; message: string; responseTime?: number; details?: any };
  };
  summary: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const result: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      apiKeyConfigured: { status: 'fail', message: '' },
      apiKeyValid: { status: 'skipped', message: '' },
      testCall: { status: 'skipped', message: '' },
    },
    summary: '',
  };

  try {
    // Check 1: API Key Configured
    const apiKey = Deno.env.get('ABSTRACTAPI_PHONE_VALIDATION_KEY');
    
    if (!apiKey) {
      result.checks.apiKeyConfigured = {
        status: 'fail',
        message: 'ABSTRACTAPI_PHONE_VALIDATION_KEY is not configured',
      };
      result.status = 'unhealthy';
      result.summary = 'API key not configured. Add ABSTRACTAPI_PHONE_VALIDATION_KEY to secrets.';
      
      return new Response(JSON.stringify(result, null, 2), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    result.checks.apiKeyConfigured = {
      status: 'pass',
      message: `API key configured (${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)})`,
    };

    // Check 2: Validate API Key with test call
    const testStartTime = Date.now();
    
    try {
      const response = await fetch(
        `${ABSTRACT_API_URL}?api_key=${apiKey}&phone=${encodeURIComponent(TEST_PHONE)}`,
        {
          method: 'GET',
          headers: { 'User-Agent': 'FootprintIQ-HealthCheck' },
        }
      );

      const responseTime = Date.now() - testStartTime;
      const responseText = await response.text();
      
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { raw: responseText };
      }

      if (response.ok) {
        const normalized = {
          phone: data.phone ?? data.phone_number ?? data.phone_format?.international ?? TEST_PHONE,
          valid: data.valid ?? data.phone_validation?.is_valid,
          format: data.format ?? data.phone_format,
          country: data.country ?? data.phone_location,
          carrier: data.carrier ?? data.phone_carrier?.name,
          type: data.type ?? data.phone_carrier?.line_type,
          isVoip: data.is_voip ?? data.phone_validation?.is_voip,
        };

        const looksValid =
          typeof normalized.valid === 'boolean' ||
          typeof data.phone_number === 'string' ||
          typeof data.phone === 'string';

        if (looksValid) {
          result.checks.apiKeyValid = {
            status: 'pass',
            message: 'API key is valid and working',
          };

          result.checks.testCall = {
            status: 'pass',
            message: `Test call successful (${responseTime}ms)`,
            responseTime,
            details: normalized,
          };
        } else {
          result.checks.apiKeyValid = {
            status: 'pass',
            message: 'API responded but with unexpected format',
            details: data,
          };
          result.checks.testCall = {
            status: 'pass',
            message: `Call completed with unexpected response format (${responseTime}ms)`,
            responseTime,
            details: data,
          };
          result.status = 'degraded';
        }
      } else if (response.status === 401 || response.status === 403) {
        result.checks.apiKeyValid = {
          status: 'fail',
          message: `Invalid API key: ${response.status} ${response.statusText}`,
          details: data,
        };
        result.checks.testCall = {
          status: 'fail',
          message: 'Authentication failed',
          responseTime,
        };
        result.status = 'unhealthy';
      } else if (response.status === 429) {
        result.checks.apiKeyValid = {
          status: 'pass',
          message: 'API key valid but rate limited',
          details: data,
        };
        result.checks.testCall = {
          status: 'fail',
          message: `Rate limited (${responseTime}ms)`,
          responseTime,
        };
        result.status = 'degraded';
      } else {
        result.checks.apiKeyValid = {
          status: 'fail',
          message: `API error: ${response.status} ${response.statusText}`,
          details: data,
        };
        result.checks.testCall = {
          status: 'fail',
          message: `HTTP ${response.status}`,
          responseTime,
        };
        result.status = 'unhealthy';
      }
    } catch (fetchError: any) {
      result.checks.apiKeyValid = {
        status: 'fail',
        message: `Network error: ${fetchError.message}`,
      };
      result.checks.testCall = {
        status: 'fail',
        message: `Failed to reach API: ${fetchError.message}`,
      };
      result.status = 'unhealthy';
    }

    // Generate summary
    const passCount = Object.values(result.checks).filter(c => c.status === 'pass').length;
    const totalChecks = Object.keys(result.checks).length;
    
    if (result.status === 'healthy') {
      result.summary = `All ${passCount}/${totalChecks} checks passed. Abstract Phone API is fully operational.`;
    } else if (result.status === 'degraded') {
      result.summary = `${passCount}/${totalChecks} checks passed. Some issues detected but API may still work.`;
    } else {
      result.summary = `${passCount}/${totalChecks} checks passed. Abstract Phone API is not working correctly.`;
    }

    const httpStatus = result.status === 'healthy' ? 200 : result.status === 'degraded' ? 200 : 503;
    
    return new Response(JSON.stringify(result, null, 2), {
      status: httpStatus,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[abstract-phone-health] Unexpected error:', error);
    result.status = 'unhealthy';
    result.summary = `Unexpected error: ${error.message}`;
    
    return new Response(JSON.stringify(result, null, 2), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
