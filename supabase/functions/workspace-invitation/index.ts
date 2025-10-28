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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, workspaceId, email, role, invitationToken } = await req.json();

    if (action === 'send') {
      // Verify user is admin/owner of workspace
      const { data: member } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single();

      if (!member || !['owner', 'admin'].includes(member.role)) {
        throw new Error('Insufficient permissions');
      }

      // Generate invitation token
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      // Create invitation
      const { data: invitation, error: invError } = await supabase
        .from('workspace_invitations')
        .insert({
          workspace_id: workspaceId,
          email,
          role: role || 'member',
          invited_by: user.id,
          invitation_token: token,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (invError) throw invError;

      // Get workspace details
      const { data: workspace } = await supabase
        .from('workspaces')
        .select('name')
        .eq('id', workspaceId)
        .single();

      console.log(`[workspace-invitation] Invitation created for ${email} to ${workspace?.name}`);

      // TODO: Send email via Resend
      // For now, return the invitation details
      return new Response(
        JSON.stringify({
          success: true,
          invitation: {
            ...invitation,
            inviteLink: `${supabaseUrl}/invite/${token}`,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'accept') {
      // Verify invitation token
      const { data: invitation, error: invError } = await supabase
        .from('workspace_invitations')
        .select('*, workspaces(name)')
        .eq('invitation_token', invitationToken)
        .eq('status', 'pending')
        .single();

      if (invError || !invitation) {
        throw new Error('Invalid or expired invitation');
      }

      // Check if expired
      if (new Date(invitation.expires_at) < new Date()) {
        await supabase
          .from('workspace_invitations')
          .update({ status: 'expired' })
          .eq('id', invitation.id);
        throw new Error('Invitation has expired');
      }

      // Add user to workspace
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: invitation.workspace_id,
          user_id: user.id,
          role: invitation.role,
        });

      if (memberError) {
        if (memberError.code === '23505') { // Unique constraint violation
          throw new Error('You are already a member of this workspace');
        }
        throw memberError;
      }

      // Mark invitation as accepted
      await supabase
        .from('workspace_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', invitation.id);

      console.log(`[workspace-invitation] User ${user.id} accepted invitation to ${invitation.workspace_id}`);

      return new Response(
        JSON.stringify({
          success: true,
          workspace: invitation.workspaces,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'revoke') {
      const { invitationId } = await req.json();

      // Verify user is admin/owner
      const { data: invitation } = await supabase
        .from('workspace_invitations')
        .select('workspace_id')
        .eq('id', invitationId)
        .single();

      if (!invitation) throw new Error('Invitation not found');

      const { data: member } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', invitation.workspace_id)
        .eq('user_id', user.id)
        .single();

      if (!member || !['owner', 'admin'].includes(member.role)) {
        throw new Error('Insufficient permissions');
      }

      // Revoke invitation
      await supabase
        .from('workspace_invitations')
        .update({ status: 'revoked' })
        .eq('id', invitationId);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('[workspace-invitation] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});