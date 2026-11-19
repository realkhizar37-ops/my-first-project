-- =============================================================================
-- AMPLIX ECOM — Complete Supabase Database Schema & Row Level Security (RLS)
-- =============================================================================

create extension if not exists "pgcrypto";

-- Helper function: automatic updated_at timestamp
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null default 'Administrator',
  role text not null default 'client' check (role in ('admin', 'client')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Helper: server-side admin role verification for RLS
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 2. SERVICES
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  short_description text not null,
  description text not null,
  image_url text,
  benefits jsonb not null default '[]'::jsonb,
  features jsonb not null default '[]'::jsonb,
  process_steps jsonb not null default '[]'::jsonb,
  faqs jsonb not null default '[]'::jsonb,
  starting_price numeric(12, 2) not null default 0,
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_services_slug on public.services(slug);
create index if not exists idx_services_published on public.services(is_published, sort_order);

create trigger trg_services_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

-- 3. PROJECTS (Portfolio CMS)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  short_description text not null,
  description text not null,
  cover_image text,
  technologies jsonb not null default '[]'::jsonb,
  completion_date date,
  project_url text,
  client_type text,
  is_demo boolean not null default false,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_projects_slug on public.projects(slug);
create index if not exists idx_projects_published on public.projects(is_published, is_featured);

create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- 4. PROJECT IMAGES (Gallery)
create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  image_url text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_project_images_project on public.project_images(project_id, sort_order);

-- 5. PRICING PACKAGES
create table if not exists public.pricing_packages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text not null,
  price numeric(12, 2) not null,
  currency text not null default 'USD',
  delivery_time text not null,
  revisions text not null,
  support_duration text not null,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  cta_text text not null default 'Get Started',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_pricing_packages_updated_at
  before update on public.pricing_packages
  for each row execute function public.set_updated_at();

-- 6. PACKAGE FEATURES
create table if not exists public.package_features (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.pricing_packages(id) on delete cascade,
  feature_text text not null,
  included boolean not null default true,
  sort_order integer not null default 0
);

create index if not exists idx_package_features_pkg on public.package_features(package_id, sort_order);

-- 7. TESTIMONIALS
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  client_role text not null,
  company text,
  avatar_url text,
  quote text not null,
  rating integer not null default 5 check (rating between 1 and 5),
  is_sample boolean not null default false,
  is_approved boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_testimonials_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();

-- 8. FAQS
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text not null default 'General',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_faqs_updated_at
  before update on public.faqs
  for each row execute function public.set_updated_at();

-- 9. LEADS
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,
  full_name text not null,
  email text not null,
  whatsapp text not null,
  company_name text,
  service_required text not null,
  budget_range text not null,
  project_description text not null,
  status text not null default 'New' check (status in ('New', 'Contacted', 'Qualified', 'Proposal Sent', 'Converted', 'Closed')),
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High', 'Urgent')),
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_leads_status on public.leads(status, created_at desc);
create index if not exists idx_leads_email on public.leads(email);

create trigger trg_leads_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- 10. QUOTE REQUESTS
create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,
  full_name text not null,
  email text not null,
  whatsapp text not null,
  company_name text,
  service_slug text not null,
  complexity text not null,
  selected_features jsonb not null default '[]'::jsonb,
  scope_count integer not null default 5,
  budget_range text not null,
  calculated_estimate numeric(12, 2) not null default 0,
  estimated_price numeric(12, 2),
  project_requirements text not null,
  status text not null default 'Pending' check (status in ('Pending', 'Reviewed', 'Quoted', 'Approved', 'Declined')),
  private_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_quote_requests_status on public.quote_requests(status, created_at desc);

create trigger trg_quote_requests_updated_at
  before update on public.quote_requests
  for each row execute function public.set_updated_at();

-- 11. PROJECT UPDATES (Client-facing tracking via non-guessable reference_code)
create table if not exists public.project_updates (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null,
  title text not null,
  status_label text not null,
  message text not null,
  is_public_to_client boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_project_updates_ref on public.project_updates(reference_code, created_at desc);

-- 12. SITE SETTINGS (Singleton row 'default')
create table if not exists public.site_settings (
  id text primary key default 'default',
  business_name text not null default 'AMPLIX ECOM',
  tagline text not null default 'Shopify, E-commerce, Web Development & Digital Growth Agency',
  whatsapp_number text not null default '+923099050330',
  contact_email text not null default 'realkhizar37@gmail.com',
  currency text not null default 'USD',
  hero_headline text not null default 'Build. Scale. Dominate Your Digital Market.',
  hero_subcopy text not null default 'We help ambitious businesses build powerful e-commerce experiences through premium Shopify development, modern web solutions and conversion-focused digital strategies.',
  about_text text not null default 'Amplix Ecom is an international e-commerce and web engineering agency focused on conversion-driven Shopify stores, performance optimization, and scalable web architecture.',
  footer_text text not null default 'Amplix Ecom. All Rights Reserved.',
  social_links jsonb not null default '{}'::jsonb,
  pricing_rules jsonb not null default '{"baseMultiplier":1,"complexityMultipliers":{"standard":1,"advanced":1.5,"enterprise":2.2},"perUnitFee":45,"featureFee":120}'::jsonb,
  notification_prefs jsonb not null default '{"emailOnLead":true,"emailOnQuote":true}'::jsonb,
  seo_metadata jsonb not null default '{"title":"Amplix Ecom | Premium Shopify & Web Development Agency","description":"Premium Shopify store design, speed optimization, full management, WordPress & custom web development."}'::jsonb,
  updated_at timestamptz not null default now()
);

create trigger trg_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- 13. NOTIFICATIONS (Admin Only)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- 14. ACTIVITY LOGS (Admin Only)
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.pricing_packages enable row level security;
alter table public.package_features enable row level security;
alter table public.testimonials enable row level security;
alter table public.faqs enable row level security;
alter table public.leads enable row level security;
alter table public.quote_requests enable row level security;
alter table public.project_updates enable row level security;
alter table public.site_settings enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_logs enable row level security;

-- PROFILES: users can read own profile; admins can manage all
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- SERVICES: public reads published; admin full access
create policy "services_public_read" on public.services
  for select using (is_published = true or public.is_admin());
create policy "services_admin_write" on public.services
  for all using (public.is_admin()) with check (public.is_admin());

-- PROJECTS & IMAGES: public reads published; admin full access
create policy "projects_public_read" on public.projects
  for select using (is_published = true or public.is_admin());
create policy "projects_admin_write" on public.projects
  for all using (public.is_admin()) with check (public.is_admin());

create policy "project_images_public_read" on public.project_images
  for select using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and (p.is_published = true or public.is_admin())
    )
  );
create policy "project_images_admin_write" on public.project_images
  for all using (public.is_admin()) with check (public.is_admin());

-- PRICING & FEATURES: public reads active; admin full access
create policy "pricing_public_read" on public.pricing_packages
  for select using (is_active = true or public.is_admin());
create policy "pricing_admin_write" on public.pricing_packages
  for all using (public.is_admin()) with check (public.is_admin());

create policy "package_features_public_read" on public.package_features
  for select using (
    exists (
      select 1 from public.pricing_packages pkg
      where pkg.id = package_id and (pkg.is_active = true or public.is_admin())
    )
  );
create policy "package_features_admin_write" on public.package_features
  for all using (public.is_admin()) with check (public.is_admin());

-- TESTIMONIALS: public reads approved & published; admin full access
create policy "testimonials_public_read" on public.testimonials
  for select using ((is_approved = true and is_published = true) or public.is_admin());
create policy "testimonials_admin_write" on public.testimonials
  for all using (public.is_admin()) with check (public.is_admin());

-- FAQS: public reads published; admin full access
create policy "faqs_public_read" on public.faqs
  for select using (is_published = true or public.is_admin());
create policy "faqs_admin_write" on public.faqs
  for all using (public.is_admin()) with check (public.is_admin());

-- LEADS: public can ONLY insert; NEVER select/update/delete; admin full access
create policy "leads_public_insert" on public.leads
  for insert with check (true);
create policy "leads_admin_all" on public.leads
  for all using (public.is_admin()) with check (public.is_admin());

-- QUOTE REQUESTS: public can ONLY insert; NEVER select/update/delete; admin full access
create policy "quotes_public_insert" on public.quote_requests
  for insert with check (true);
create policy "quotes_admin_all" on public.quote_requests
  for all using (public.is_admin()) with check (public.is_admin());

-- PROJECT UPDATES: admin full access (public lookup goes through secure RPC below)
create policy "project_updates_admin_all" on public.project_updates
  for all using (public.is_admin()) with check (public.is_admin());

-- Secure non-guessable reference lookup RPC (returns only non-sensitive status updates)
create or replace function public.track_inquiry(ref_code text)
returns table (
  reference_code text,
  kind text,
  status text,
  service_label text,
  created_at timestamptz,
  updates jsonb
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    q.reference_code,
    'quote'::text as kind,
    q.status,
    q.service_slug as service_label,
    q.created_at,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'title', pu.title,
            'status_label', pu.status_label,
            'message', pu.message,
            'created_at', pu.created_at
          ) order by pu.created_at desc
        )
        from public.project_updates pu
        where pu.reference_code = q.reference_code and pu.is_public_to_client = true
      ),
      '[]'::jsonb
    ) as updates
  from public.quote_requests q
  where q.reference_code = ref_code
  union all
  select
    l.reference_code,
    'lead'::text as kind,
    l.status,
    l.service_required as service_label,
    l.created_at,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'title', pu.title,
            'status_label', pu.status_label,
            'message', pu.message,
            'created_at', pu.created_at
          ) order by pu.created_at desc
        )
        from public.project_updates pu
        where pu.reference_code = l.reference_code and pu.is_public_to_client = true
      ),
      '[]'::jsonb
    ) as updates
  from public.leads l
  where l.reference_code = ref_code;
end;
$$;

-- SITE SETTINGS: public read; admin write
create policy "site_settings_public_read" on public.site_settings
  for select using (true);
create policy "site_settings_admin_write" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- NOTIFICATIONS & ACTIVITY LOGS: admin only
create policy "notifications_admin_only" on public.notifications
  for all using (public.is_admin()) with check (public.is_admin());

create policy "activity_logs_admin_only" on public.activity_logs
  for all using (public.is_admin()) with check (public.is_admin());

-- STORAGE BUCKET FOR MEDIA LIBRARY
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media_public_read" on storage.objects
  for select using (bucket_id = 'media');

create policy "media_admin_upload" on storage.objects
  for insert with check (bucket_id = 'media' and public.is_admin());

create policy "media_admin_delete" on storage.objects
  for delete using (bucket_id = 'media' and public.is_admin());


-- 15. DESIGN REFERENCES (Shopify & WordPress Inspiration Showcase — Distinct from Verified Client Work)
create table if not exists public.design_references (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  platform text not null check (platform in ('Shopify', 'WordPress')),
  industry text not null,
  reference_url text not null,
  design_inspiration text not null,
  ux_observations jsonb not null default '[]'::jsonb,
  feature_highlights jsonb not null default '[]'::jsonb,
  preview_image text,
  inspection_note text,
  iframe_allowed boolean not null default false,
  is_featured boolean not null default true,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.design_references enable row level security;

create policy "design_references_public_read" on public.design_references
  for select using (is_published = true or public.is_admin());

create policy "design_references_admin_write" on public.design_references
  for all using (public.is_admin()) with check (public.is_admin());
