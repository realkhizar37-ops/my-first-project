# AMPLIX ECOM — Agency Platform & Admin Dashboard

Enterprise digital agency website and Supabase-backed Admin CMS built with **React, TypeScript, Vite, and Supabase**.

## Architecture
- **Public Frontend (`/`):** Multi-page React + TypeScript application (GitHub Pages compatible via `base: './'` and `public/404.html` SPA redirect).
- **Database & Auth:** Supabase PostgreSQL with Row Level Security (RLS) on all 14 tables + Supabase Auth (`profiles.role = 'admin'`).
- **Media Storage:** Supabase Storage (`media` bucket).
- **Server-Side Privileged Operations:** Supabase Edge Functions (`submit-inquiry`, `admin-actions`) with optional **Resend** transactional emails.

## 1. Local Setup
```bash
cp .env.example .env
# Fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
npm install
npm run dev
```

## 2. Supabase Database & Edge Functions Setup
1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Run the SQL migrations in order in the Supabase SQL Editor:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_seed_data.sql`
3. Deploy Edge Functions (`supabase functions deploy submit-inquiry` and `supabase functions deploy admin-actions`).
4. Set Edge Function secrets (never in `.env` frontend):
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY` (optional, for transactional email notifications)
   - `ADMIN_NOTIFICATION_EMAIL=realkhizar37@gmail.com`

## 3. Initial Admin Provisioning (No Hardcoded Passwords)
1. In Supabase Dashboard -> **Authentication -> Users**, invite or create your administrator account with your chosen secure password.
2. Copy the new user's UUID and promote them in the SQL Editor:
```sql
insert into public.profiles (id, email, full_name, role)
values ('<USER_UUID>', 'your-admin@email.com', 'Khizar', 'admin')
on conflict (id) do update set role = 'admin';
```
3. Sign in at `/admin/login`.

## 4. Testing & Build
```bash
npm test
npm run build
```

## 5. GitHub Pages Deployment
- Push to `main`. The included workflow `.github/workflows/deploy.yml` builds `dist/` and deploys to GitHub Pages automatically.
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in **GitHub Repository Settings -> Secrets and variables -> Actions**.
