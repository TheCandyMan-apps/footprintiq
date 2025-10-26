import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify auth
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const path = url.pathname.split('/graph-api')[1] || '/';
    const method = req.method;

    console.log(`[graph-api] ${method} ${path}`);

    // GET /nodes - Get all entity nodes
    if (method === 'GET' && path === '/nodes') {
      const { data, error } = await supabaseClient
        .from('entity_nodes')
        .select('*')
        .eq('user_id', user.id)
        .order('risk_score', { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify({ nodes: data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /nodes/:id - Get specific node with connections
    if (method === 'GET' && path.startsWith('/nodes/')) {
      const nodeId = path.split('/nodes/')[1];

      const [nodeResult, edgesResult] = await Promise.all([
        supabaseClient
          .from('entity_nodes')
          .select('*')
          .eq('user_id', user.id)
          .eq('id', nodeId)
          .single(),
        supabaseClient
          .from('entity_edges')
          .select('*')
          .eq('user_id', user.id)
          .or(`source_node_id.eq.${nodeId},target_node_id.eq.${nodeId}`)
      ]);

      if (nodeResult.error) throw nodeResult.error;
      if (edgesResult.error) throw edgesResult.error;

      // Get connected nodes
      const connectedNodeIds = new Set<string>();
      edgesResult.data?.forEach((edge: any) => {
        connectedNodeIds.add(edge.source_node_id);
        connectedNodeIds.add(edge.target_node_id);
      });

      const { data: connectedNodes } = await supabaseClient
        .from('entity_nodes')
        .select('*')
        .eq('user_id', user.id)
        .in('id', Array.from(connectedNodeIds));

      return new Response(
        JSON.stringify({
          node: nodeResult.data,
          edges: edgesResult.data,
          connectedNodes: connectedNodes || []
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /search?q= - Search entities
    if (method === 'GET' && path === '/search') {
      const query = url.searchParams.get('q');
      if (!query) {
        return new Response(
          JSON.stringify({ error: 'Query parameter required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabaseClient
        .from('entity_nodes')
        .select('*')
        .eq('user_id', user.id)
        .ilike('entity_value', `%${query}%`)
        .order('risk_score', { ascending: false })
        .limit(50);

      if (error) throw error;

      return new Response(
        JSON.stringify({ results: data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /graph - Get full graph
    if (method === 'GET' && path === '/graph') {
      const [nodesResult, edgesResult] = await Promise.all([
        supabaseClient
          .from('entity_nodes')
          .select('*')
          .eq('user_id', user.id)
          .order('risk_score', { ascending: false }),
        supabaseClient
          .from('entity_edges')
          .select('*')
          .eq('user_id', user.id)
      ]);

      if (nodesResult.error) throw nodesResult.error;
      if (edgesResult.error) throw edgesResult.error;

      return new Response(
        JSON.stringify({
          nodes: nodesResult.data,
          edges: edgesResult.data,
          stats: {
            totalNodes: nodesResult.data?.length || 0,
            totalEdges: edgesResult.data?.length || 0,
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /snapshots - Get saved snapshots
    if (method === 'GET' && path === '/snapshots') {
      const { data, error } = await supabaseClient
        .from('graph_snapshots')
        .select('id, name, description, node_count, edge_count, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify({ snapshots: data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /snapshots - Create snapshot
    if (method === 'POST' && path === '/snapshots') {
      const { name, description } = await req.json();

      // Get current graph
      const [nodesResult, edgesResult] = await Promise.all([
        supabaseClient
          .from('entity_nodes')
          .select('*')
          .eq('user_id', user.id),
        supabaseClient
          .from('entity_edges')
          .select('*')
          .eq('user_id', user.id)
      ]);

      const { data, error } = await supabaseClient
        .from('graph_snapshots')
        .insert([{
          user_id: user.id,
          name: name || `Snapshot ${new Date().toISOString()}`,
          description: description || null,
          graph_data: {
            nodes: nodesResult.data,
            edges: edgesResult.data
          },
          node_count: nodesResult.data?.length || 0,
          edge_count: edgesResult.data?.length || 0
        }])
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ snapshot: data }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE /nodes/:id - Delete node and its edges
    if (method === 'DELETE' && path.startsWith('/nodes/')) {
      const nodeId = path.split('/nodes/')[1];

      const { error } = await supabaseClient
        .from('entity_nodes')
        .delete()
        .eq('user_id', user.id)
        .eq('id', nodeId);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[graph-api] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
