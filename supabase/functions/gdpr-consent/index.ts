import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders, ok, bad } from '../_shared/secure.ts';

interface ConsentUpdate {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  if (req.method !== 'POST') return bad(405, 'method_not_allowed');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) throw new Error('Unauthorized');

    const { consents } = await req.json() as { consents: ConsentUpdate };
    if (!consents) throw new Error('Missing consents data');

    // Get client IP and user agent
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    const userAgent = req.headers.get('user-agent');

    // Process each consent type with upsert to avoid conflicts
    const consentTypes: Array<keyof ConsentUpdate> = ['necessary', 'functional', 'analytics', 'marketing'];
    
    for (const consentType of consentTypes) {
      const granted = consents[consentType];
      
      // Get existing consent for history logging
      const { data: existing } = await supabase
        .from('user_consents')
        .select('granted')
        .eq('user_id', user.id)
        .eq('consent_type', consentType)
        .single();

      // Upsert consent (handles both insert and update)
      const { error: upsertError } = await supabase
        .from('user_consents')
        .upsert({
          user_id: user.id,
          consent_type: consentType,
          granted,
          granted_at: granted ? new Date().toISOString() : null,
          revoked_at: !granted ? new Date().toISOString() : null,
          ip_address: ipAddress,
          user_agent: userAgent,
        }, {
          onConflict: 'user_id,consent_type'
        });

      if (upsertError) {
        console.error(`[gdpr-consent] Upsert error for ${consentType}:`, upsertError);
        throw upsertError;
      }

      // Log to history
      await supabase.from('consent_history').insert({
        user_id: user.id,
        consent_type: consentType,
        action: granted ? 'granted' : 'revoked',
        previous_value: existing ? { granted: existing.granted } : null,
        new_value: { granted },
        ip_address: ipAddress,
        user_agent: userAgent,
      });
    }

    return ok({ success: true, message: 'Consent preferences saved' });
  } catch (error) {
    console.error('[gdpr-consent] Error:', error);
    return bad(500, error instanceof Error ? error.message : 'Unknown error');
  }
});
