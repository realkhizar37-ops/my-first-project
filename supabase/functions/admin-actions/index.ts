// Supabase Edge Function: admin-actions
// Verifies JWT + profiles.role === 'admin' on the server before executing
// privileged actions such as sending client quote status notification emails.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Verify caller identity using their JWT
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: authData, error: authError } = await userClient.auth.getUser();
    if (authError || !authData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin role required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    if (body.action === 'notify_quote_status') {
      const resendKey = Deno.env.get('RESEND_API_KEY');
      const fromEmail = Deno.env.get('FROM_EMAIL') || 'Amplix Ecom <onboarding@resend.dev>';

      await adminClient.from('project_updates').insert({
        reference_code: String(body.reference_code),
        title: `Quote Status: ${body.status}`,
        status_label: String(body.status),
        message: body.message ? String(body.message) : `Your quote status was updated to ${body.status}.`,
        is_public_to_client: true,
      });

      await adminClient.from('activity_logs').insert({
        actor_id: authData.user.id,
        action: 'quote_status_updated',
        entity_type: 'quote_requests',
        entity_id: String(body.reference_code),
        details: { status: body.status },
      });

      let emailSent = false;
      if (resendKey && body.client_email) {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [String(body.client_email)],
            subject: `Amplix Ecom Quote Update (${body.reference_code})`,
            html: `<p>Hello ${body.client_name || 'Client'},</p>
                   <p>Your quote <strong>${body.reference_code}</strong> status is now: <strong>${body.status}</strong>.</p>
                   ${body.estimated_price ? `<p>Estimated Price: <strong>$${body.estimated_price}</strong></p>` : ''}`,
          }),
        });
        emailSent = res.ok;
      }

      return new Response(
        JSON.stringify({ success: true, email_configured: Boolean(resendKey), email_sent: emailSent }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
