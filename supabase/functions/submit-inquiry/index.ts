// Supabase Edge Function: submit-inquiry
// Handles public Contact & Quote submissions with server-side validation,
// duplicate guard, DB storage, admin notification, and optional Resend email.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function makeRef(prefix: string): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  return `${prefix}-${hex}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Honeypot spam check
    if (body.website_honeypot) {
      return new Response(JSON.stringify({ error: 'Spam detected' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const type = body.type === 'quote' ? 'quote' : 'lead';
    const fullName = String(body.full_name ?? '').trim();
    const email = String(body.email ?? '').trim().toLowerCase();
    const whatsapp = String(body.whatsapp ?? '').trim();

    if (!fullName || !email || !email.includes('@') || !whatsapp) {
      return new Response(JSON.stringify({ error: 'Missing required contact fields.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Duplicate submission check (same email within last 2 minutes)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const table = type === 'quote' ? 'quote_requests' : 'leads';
    const { data: recent } = await supabase
      .from(table)
      .select('id')
      .eq('email', email)
      .gte('created_at', twoMinutesAgo)
      .limit(1);

    if (recent && recent.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Duplicate submission detected. Please wait a moment before submitting again.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const referenceCode = makeRef(type === 'quote' ? 'QTE' : 'LED');

    if (type === 'quote') {
      const { error } = await supabase.from('quote_requests').insert({
        reference_code: referenceCode,
        full_name: fullName,
        email,
        whatsapp,
        company_name: body.company_name ? String(body.company_name).trim() : null,
        service_slug: String(body.service_slug ?? 'shopify-store-development'),
        complexity: String(body.complexity ?? 'standard'),
        selected_features: Array.isArray(body.selected_features) ? body.selected_features : [],
        scope_count: Number(body.scope_count ?? 5),
        budget_range: String(body.budget_range ?? 'Not specified'),
        calculated_estimate: Number(body.calculated_estimate ?? 0),
        project_requirements: String(body.project_requirements ?? '').trim(),
      });
      if (error) throw error;
    } else {
      const { error } = await supabase.from('leads').insert({
        reference_code: referenceCode,
        full_name: fullName,
        email,
        whatsapp,
        company_name: body.company_name ? String(body.company_name).trim() : null,
        service_required: String(body.service_required ?? 'General Inquiry'),
        budget_range: String(body.budget_range ?? 'Not specified'),
        project_description: String(body.project_description ?? '').trim(),
      });
      if (error) throw error;
    }

    // Create initial client-visible tracking update
    await supabase.from('project_updates').insert({
      reference_code: referenceCode,
      title: 'Inquiry Received',
      status_label: 'Received',
      message: 'Your submission has been received by the Amplix Ecom team and is queued for review.',
      is_public_to_client: true,
    });

    // Create admin notification
    await supabase.from('notifications').insert({
      type: type === 'quote' ? 'quote' : 'lead',
      title: type === 'quote' ? `New Quote Request (${referenceCode})` : `New Lead (${referenceCode})`,
      message: `${fullName} (${email}) submitted a ${type} inquiry.`,
    });

    // Optional Resend email notification
    const resendKey = Deno.env.get('RESEND_API_KEY');
    const adminEmail = Deno.env.get('ADMIN_NOTIFICATION_EMAIL') || 'realkhizar37@gmail.com';
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'Amplix Ecom <onboarding@resend.dev>';
    let emailSent = false;

    if (resendKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [adminEmail],
          subject: `[Amplix Ecom] New ${type.toUpperCase()} — ${referenceCode}`,
          html: `<p><strong>Reference:</strong> ${referenceCode}</p>
                 <p><strong>Name:</strong> ${fullName}</p>
                 <p><strong>Email:</strong> ${email}</p>
                 <p><strong>WhatsApp:</strong> ${whatsapp}</p>`,
        }),
      });
      emailSent = res.ok;
    }

    return new Response(
      JSON.stringify({
        success: true,
        reference_code: referenceCode,
        email_configured: Boolean(resendKey),
        email_sent: emailSent,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unexpected server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
