import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateAuth } from '../_shared/auth-utils.ts';
import { checkRateLimit } from '../_shared/rate-limiter.ts';
import { addSecurityHeaders } from '../_shared/security-headers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RescanRequestSchema = z.object({
  username: z.string().trim().min(1).max(100),
  targetType: z.enum(['username', 'email', 'domain']).optional(),
  previousError: z.string().max(500).optional(),
});

interface RescanRequest {
  username: string;
  targetType?: 'username' | 'email' | 'domain';
  previousError?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: addSecurityHeaders(corsHeaders) });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Authentication
    const authResult = await validateAuth(req);
    if (!authResult.valid || !authResult.context) {
      return new Response(JSON.stringify({ error: authResult.error || 'Unauthorized' }), {
        status: 401,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
      });
    }

    const { userId } = authResult.context;

    // Rate limiting - 10 suggestions per hour
    const rateLimitResult = await checkRateLimit(userId, 'user', 'ai-rescan-suggest', {
      maxRequests: 10,
      windowSeconds: 3600
    });
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded', resetAt: rateLimitResult.resetAt }),
        { status: 429, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    // Input validation
    const body = await req.json();
    const validation = RescanRequestSchema.safeParse(body);
    if (!validation.success) {
      return new Response(JSON.stringify({ error: 'Invalid input', details: validation.error.issues }), {
        status: 400,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
      });
    }

    const { username, targetType = 'username', previousError } = validation.data;

    console.log(`Generating rescan suggestions for: ${username}`);

    // Construct AI prompt based on context
    const systemPrompt = `You are an OSINT expert helping users find alternative search terms when their initial scans return no results. Provide practical, actionable suggestions.`;

    const userPrompt = `The user searched for "${username}" (type: ${targetType}) but got no results${previousError ? ` with error: ${previousError}` : ''}.

Suggest 5 alternative search strategies:
1. Username variations (common patterns, typos, abbreviations)
2. Related usernames (common prefixes/suffixes)
3. Email pattern suggestions if applicable
4. Domain variations if applicable
5. Social media handle variations

Format each suggestion with:
- The alternative query
- Why it might work
- Confidence level (high/medium/low)

Keep suggestions realistic and based on common OSINT patterns.`;

    // Call Lovable AI Gateway
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Insufficient AI credits. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const suggestions = aiData.choices?.[0]?.message?.content || 'Unable to generate suggestions';

    console.log('AI suggestions generated successfully');

    // Parse suggestions into structured format
    const lines = suggestions.split('\n').filter((line: string) => line.trim());
    const structuredSuggestions = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.match(/^\d+\./)) {
        // Extract suggestion details
        const suggestion: any = {
          query: '',
          reason: '',
          confidence: 'medium'
        };
        
        // Extract query (usually in quotes or bold)
        const queryMatch = line.match(/["']([^"']+)["']|`([^`]+)`|\*\*([^*]+)\*\*/);
        if (queryMatch) {
          suggestion.query = queryMatch[1] || queryMatch[2] || queryMatch[3];
        }
        
        // Get reason from the line
        suggestion.reason = line.replace(/^\d+\./, '').replace(/["'].*?["']|`.*?`|\*\*.*?\*\*/, '').trim();
        
        // Detect confidence level
        if (line.toLowerCase().includes('high confidence') || line.toLowerCase().includes('very likely')) {
          suggestion.confidence = 'high';
        } else if (line.toLowerCase().includes('low confidence') || line.toLowerCase().includes('unlikely')) {
          suggestion.confidence = 'low';
        }
        
        if (suggestion.query) {
          structuredSuggestions.push(suggestion);
        }
      }
    }

    return new Response(
      JSON.stringify({
        original: username,
        suggestions: structuredSuggestions.length > 0 ? structuredSuggestions : [
          {
            query: username.toLowerCase(),
            reason: 'Try lowercase version',
            confidence: 'medium'
          },
          {
            query: username.replace(/[._-]/g, ''),
            reason: 'Remove special characters',
            confidence: 'medium'
          },
          {
            query: `${username}_official`,
            reason: 'Try with common suffix',
            confidence: 'low'
          }
        ],
        rawSuggestions: suggestions,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
