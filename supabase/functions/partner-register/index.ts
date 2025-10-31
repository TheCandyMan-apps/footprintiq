import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_IP = 3; // 3 registrations per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetAt < now) rateLimitMap.delete(key);
    }
  }

  if (!record || record.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_IP) return false;
  record.count++;
  return true;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
             req.headers.get("x-real-ip") || "unknown";

  if (!checkRateLimit(ip)) {
    return new Response(
      JSON.stringify({ error: 'Too many registration attempts. Please try again later.' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '3600' } }
    );
  }

  try {
    const { name, email, company, website, description } = await req.json();

    // Input validation
    if (!name || name.length < 2 || name.length > 100) {
      throw new Error('Name must be between 2 and 100 characters');
    }
    if (!email || !validateEmail(email)) {
      throw new Error('Valid email address required');
    }
    if (!company || company.length < 2 || company.length > 100) {
      throw new Error('Company name must be between 2 and 100 characters');
    }
    if (website && !validateUrl(website)) {
      throw new Error('Valid website URL required');
    }
    if (description && description.length > 500) {
      throw new Error('Description must be less than 500 characters');
    }
    
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