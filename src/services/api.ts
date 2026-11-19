import {
  DEFAULT_FAQS,
  DEFAULT_PACKAGES,
  DEFAULT_PROJECTS,
  DEFAULT_REFERENCES,
  DEFAULT_SERVICES,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_TESTIMONIALS,
} from '../data/defaultCatalog';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type {
  DesignReferenceItem,
  FaqItem,
  LeadItem,
  NotificationItem,
  PricingPackage,
  PricingRules,
  ProjectItem,
  QuoteRequestItem,
  ServiceItem,
  SiteSettings,
  TestimonialItem,
} from '../types';

export function calculateProjectEstimate(
  basePrice: number,
  complexity: 'standard' | 'advanced' | 'enterprise',
  scopeCount: number,
  selectedFeaturesCount: number,
  rules: PricingRules = DEFAULT_SITE_SETTINGS.pricing_rules
): number {
  const mult = rules.complexityMultipliers[complexity] ?? 1;
  const extraUnits = Math.max(0, scopeCount - 5);
  const raw =
    (basePrice * mult + extraUnits * rules.perUnitFee + selectedFeaturesCount * rules.featureFee) *
    (rules.baseMultiplier || 1);
  return Math.round(raw);
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  if (!supabase) return DEFAULT_SITE_SETTINGS;
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'default').single();
  if (error || !data) return DEFAULT_SITE_SETTINGS;
  return data as SiteSettings;
}

export async function fetchPublishedServices(includeUnpublished = false): Promise<ServiceItem[]> {
  if (!supabase) return DEFAULT_SERVICES;
  let query = supabase.from('services').select('*').order('sort_order', { ascending: true });
  if (!includeUnpublished) query = query.eq('is_published', true);
  const { data, error } = await query;
  if (error || !data || data.length === 0) return includeUnpublished ? [] : DEFAULT_SERVICES;
  return data as ServiceItem[];
}

export async function fetchPublishedProjects(includeUnpublished = false): Promise<ProjectItem[]> {
  if (!supabase) return DEFAULT_PROJECTS;
  let query = supabase.from('projects').select('*').order('created_at', { ascending: false });
  if (!includeUnpublished) query = query.eq('is_published', true);
  const { data, error } = await query;
  if (error || !data || data.length === 0) return includeUnpublished ? [] : DEFAULT_PROJECTS;
  return data as ProjectItem[];
}

export async function fetchDesignReferences(includeUnpublished = false): Promise<DesignReferenceItem[]> {
  if (!supabase) return DEFAULT_REFERENCES;
  let query = supabase.from('design_references').select('*').order('sort_order', { ascending: true });
  if (!includeUnpublished) query = query.eq('is_published', true);
  const { data, error } = await query;
  if (error || !data || data.length === 0) return includeUnpublished ? [] : DEFAULT_REFERENCES;
  return data as DesignReferenceItem[];
}

export async function fetchPricingPackages(includeInactive = false): Promise<PricingPackage[]> {
  if (!supabase) return DEFAULT_PACKAGES;
  let query = supabase
    .from('pricing_packages')
    .select('*, features:package_features(*)')
    .order('sort_order', { ascending: true });
  if (!includeInactive) query = query.eq('is_active', true);
  const { data, error } = await query;
  if (error || !data || data.length === 0) return includeInactive ? [] : DEFAULT_PACKAGES;
  return data as PricingPackage[];
}

export async function fetchTestimonials(includeUnpublished = false): Promise<TestimonialItem[]> {
  if (!supabase) return DEFAULT_TESTIMONIALS;
  let query = supabase.from('testimonials').select('*').order('created_at', { ascending: false });
  if (!includeUnpublished) query = query.eq('is_approved', true).eq('is_published', true);
  const { data, error } = await query;
  if (error || !data || data.length === 0) return includeUnpublished ? [] : DEFAULT_TESTIMONIALS;
  return data as TestimonialItem[];
}

export async function fetchFaqs(includeUnpublished = false): Promise<FaqItem[]> {
  if (!supabase) return DEFAULT_FAQS;
  let query = supabase.from('faqs').select('*').order('sort_order', { ascending: true });
  if (!includeUnpublished) query = query.eq('is_published', true);
  const { data, error } = await query;
  if (error || !data || data.length === 0) return includeUnpublished ? [] : DEFAULT_FAQS;
  return data as FaqItem[];
}

function generateReference(prefix: string): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return `${prefix}-${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

export async function submitLead(payload: {
  full_name: string;
  email: string;
  whatsapp: string;
  company_name?: string;
  service_required: string;
  budget_range: string;
  project_description: string;
  website_honeypot?: string;
}): Promise<{ reference_code: string; storedInDb: boolean; emailConfigured: boolean }> {
  if (payload.website_honeypot) {
    throw new Error('Invalid submission.');
  }
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'Backend database is not configured yet. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY or contact us directly via WhatsApp.'
    );
  }

  // Prefer Edge Function for server-side validation, spam guard, notification & email
  const { data: fnData, error: fnError } = await supabase.functions.invoke('submit-inquiry', {
    body: { type: 'lead', ...payload },
  });

  if (!fnError && fnData?.reference_code) {
    return {
      reference_code: fnData.reference_code,
      storedInDb: true,
      emailConfigured: Boolean(fnData.email_configured),
    };
  }

  // Fallback to direct RLS-permitted insert if Edge Function isn't deployed yet
  const reference_code = generateReference('LED');
  const { error } = await supabase.from('leads').insert({
    reference_code,
    full_name: payload.full_name,
    email: payload.email,
    whatsapp: payload.whatsapp,
    company_name: payload.company_name || null,
    service_required: payload.service_required,
    budget_range: payload.budget_range,
    project_description: payload.project_description,
  });
  if (error) throw new Error(error.message);

  return { reference_code, storedInDb: true, emailConfigured: false };
}

export async function submitQuoteRequest(payload: {
  full_name: string;
  email: string;
  whatsapp: string;
  company_name?: string;
  service_slug: string;
  complexity: string;
  selected_features: string[];
  scope_count: number;
  budget_range: string;
  calculated_estimate: number;
  project_requirements: string;
  website_honeypot?: string;
}): Promise<{ reference_code: string; storedInDb: boolean; emailConfigured: boolean }> {
  if (payload.website_honeypot) {
    throw new Error('Invalid submission.');
  }
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'Backend database is not configured yet. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY or contact us directly via WhatsApp.'
    );
  }

  const { data: fnData, error: fnError } = await supabase.functions.invoke('submit-inquiry', {
    body: { type: 'quote', ...payload },
  });

  if (!fnError && fnData?.reference_code) {
    return {
      reference_code: fnData.reference_code,
      storedInDb: true,
      emailConfigured: Boolean(fnData.email_configured),
    };
  }

  const reference_code = generateReference('QTE');
  const { error } = await supabase.from('quote_requests').insert({
    reference_code,
    full_name: payload.full_name,
    email: payload.email,
    whatsapp: payload.whatsapp,
    company_name: payload.company_name || null,
    service_slug: payload.service_slug,
    complexity: payload.complexity,
    selected_features: payload.selected_features,
    scope_count: payload.scope_count,
    budget_range: payload.budget_range,
    calculated_estimate: payload.calculated_estimate,
    project_requirements: payload.project_requirements,
  });
  if (error) throw new Error(error.message);

  return { reference_code, storedInDb: true, emailConfigured: false };
}

export async function trackInquiryByReference(refCode: string) {
  if (!supabase) {
    throw new Error('Database is not configured.');
  }
  const { data, error } = await supabase.rpc('track_inquiry', { ref_code: refCode.trim().toUpperCase() });
  if (error) throw new Error(error.message);
  return data?.[0] ?? null;
}

export function exportToCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h] ?? '';
          const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Admin helpers
export async function fetchAdminOverview() {
  if (!supabase) {
    return {
      totalLeads: 0,
      newLeads: 0,
      pendingQuotes: 0,
      publishedProjects: 0,
      leads: [] as LeadItem[],
      quotes: [] as QuoteRequestItem[],
      notifications: [] as NotificationItem[],
    };
  }
  const [leadsRes, quotesRes, projRes, notifRes] = await Promise.all([
    supabase.from('leads').select('*').order('created_at', { ascending: false }),
    supabase.from('quote_requests').select('*').order('created_at', { ascending: false }),
    supabase.from('projects').select('id, is_published'),
    supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(15),
  ]);

  const leads = (leadsRes.data ?? []) as LeadItem[];
  const quotes = (quotesRes.data ?? []) as QuoteRequestItem[];
  const projects = (projRes.data ?? []) as { id: string; is_published: boolean }[];
  const notifications = (notifRes.data ?? []) as NotificationItem[];

  return {
    totalLeads: leads.length,
    newLeads: leads.filter((l) => l.status === 'New').length,
    pendingQuotes: quotes.filter((q) => q.status === 'Pending').length,
    publishedProjects: projects.filter((p) => p.is_published).length,
    leads,
    quotes,
    notifications,
  };
}
