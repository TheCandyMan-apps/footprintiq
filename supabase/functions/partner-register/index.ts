import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, company, website, description } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create partner account
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .insert({
        name,
        email,
        company,
        website,
        description,
        status: 'pending',
      })
      .select()
      .single();

    if (partnerError) {
      if (partnerError.code === '23505') { // Unique violation
        return new Response(
          JSON.stringify({ error: 'Email already registered' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      throw partnerError;
    }

    // Generate API key
    const apiKey = `fpiq_${generateRandomString(32)}`;
    const keyHash = await hashString(apiKey);

    const { error: keyError } = await supabase
      .from('partner_keys')
      .insert({
        partner_id: partner.id,
        key_hash: keyHash,
        key_prefix: apiKey.substring(0, 12),
        name: 'Default API Key',
      });

    if (keyError) {
      console.error('Error creating API key:', keyError);
    }

    return new Response(
      JSON.stringify({ 
        partnerId: partner.id,
        apiKey, // Only returned once!
        status: partner.status,
        message: 'Partner account created. API key shown once - please save it securely.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in partner-register:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}