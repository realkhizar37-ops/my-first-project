export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Converted' | 'Closed';
export type LeadPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type QuoteStatus = 'Pending' | 'Reviewed' | 'Quoted' | 'Approved' | 'Declined';

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  category: 'Shopify' | 'Performance' | 'Web' | 'Growth' | string;
  short_description: string;
  description: string;
  image_url?: string | null;
  benefits: string[];
  features: string[];
  process_steps: { step: string; title: string; detail: string }[];
  faqs: { q: string; a: string }[];
  starting_price: number;
  sort_order: number;
  is_featured: boolean;
  is_published: boolean;
}

export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  short_description: string;
  description: string;
  cover_image?: string | null;
  gallery?: { id: string; image_url: string; caption?: string }[];
  technologies: string[];
  completion_date?: string | null;
  project_url?: string | null;
  client_type?: string | null;
  is_demo: boolean;
  is_featured: boolean;
  is_published: boolean;
}

export interface PackageFeature {
  id: string;
  package_id: string;
  feature_text: string;
  included: boolean;
  sort_order: number;
}

export interface PricingPackage {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  price: number;
  currency: string;
  delivery_time: string;
  revisions: string;
  support_duration: string;
  is_featured: boolean;
  is_active: boolean;
  cta_text: string;
  sort_order: number;
  features: PackageFeature[];
}

export interface TestimonialItem {
  id: string;
  client_name: string;
  client_role: string;
  company?: string | null;
  avatar_url?: string | null;
  quote: string;
  rating: number;
  is_sample: boolean;
  is_approved: boolean;
  is_published: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_published: boolean;
}

export interface LeadItem {
  id: string;
  reference_code: string;
  full_name: string;
  email: string;
  whatsapp: string;
  company_name?: string | null;
  service_required: string;
  budget_range: string;
  project_description: string;
  status: LeadStatus;
  priority: LeadPriority;
  internal_notes?: string | null;
  created_at: string;
}

export interface QuoteRequestItem {
  id: string;
  reference_code: string;
  full_name: string;
  email: string;
  whatsapp: string;
  company_name?: string | null;
  service_slug: string;
  complexity: string;
  selected_features: string[];
  scope_count: number;
  budget_range: string;
  calculated_estimate: number;
  estimated_price?: number | null;
  project_requirements: string;
  status: QuoteStatus;
  private_notes?: string | null;
  created_at: string;
}

export interface PricingRules {
  baseMultiplier: number;
  complexityMultipliers: {
    standard: number;
    advanced: number;
    enterprise: number;
  };
  perUnitFee: number;
  featureFee: number;
}

export interface SiteSettings {
  id: string;
  business_name: string;
  tagline: string;
  whatsapp_number: string;
  contact_email: string;
  currency: string;
  hero_headline: string;
  hero_subcopy: string;
  about_text: string;
  footer_text: string;
  social_links: Record<string, string>;
  pricing_rules: PricingRules;
  notification_prefs: { emailOnLead: boolean; emailOnQuote: boolean };
  seo_metadata: { title: string; description: string };
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}


export interface DesignReferenceItem {
  id: string;
  slug: string;
  name: string;
  platform: 'Shopify' | 'WordPress';
  industry: string;
  reference_url: string;
  design_inspiration: string;
  ux_observations: string[];
  feature_highlights: string[];
  preview_image?: string | null;
  inspection_note?: string | null;
  iframe_allowed: boolean;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
}
