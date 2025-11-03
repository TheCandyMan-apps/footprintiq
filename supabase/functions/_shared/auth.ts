/**
 * Authentication utilities for API keys
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

export interface ApiContext {
  workspace_id: string;
  scopes: string[];
  key_id: string;
}

export async function getApiContext(req: Request): Promise<ApiContext | null> {
  // Internal call bypass using service role token
  const internalToken = req.headers.get('x-internal-token');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (internalToken && serviceKey && internalToken === serviceKey) {
    return {
      workspace_id: '00000000-0000-0000-0000-000000000000',
      scopes: ['*'],
      key_id: 'internal',
    };
  }

  const hdr = req.headers.get('Authorization') || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  
  if (!token) return null;
  
  // Hash the token
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const key_hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Look up in database
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
  
  const { data: apiKey, error } = await supabase
    .from('api_keys')
    .select('id, workspace_id, scopes')
    .eq('key_hash', key_hash)
    .is('revoked_at', null)
    .single();
  
  if (error || !apiKey) return null;
  
  // Update last used
  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', apiKey.id);
  
  return {
    workspace_id: apiKey.workspace_id,
    scopes: apiKey.scopes || [],
    key_id: apiKey.id,
  };
}
 
export function hasScope(ctx: ApiContext | null, required: string): boolean {
  if (!ctx) return false;
  return ctx.scopes.includes(required) || ctx.scopes.includes('*');
}
