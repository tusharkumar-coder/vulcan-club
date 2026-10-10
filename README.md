# Vulcan Club

The website for Vulcan Club, the developer community at Mirai School of Technology. It includes public pages for the club’s domains, events, leaderboards, projects, team, and resources; join/contact/event registration flows; a Supabase-backed admin dashboard; and a lazy-loaded Three.js hero.

The repository starts without real club content or external credentials. Public data shows a clear setup/empty state by default. Fictional preview records can be enabled locally with `USE_DEMO_DATA=true`; they are never used in production. No people, social accounts, event results, attendance figures, or project URLs have been invented as club facts.

## Stack

- Next.js App Router, React, strict TypeScript
- Tailwind CSS 4 plus a small hand-authored design system
- React Three Fiber, Drei, and Three.js
- Supabase PostgreSQL, Auth, and Storage
- React Hook Form and Zod
- Lucide React
- ESLint, Prettier, and strict TypeScript

## Project layout

```text
src/app/                 Public routes, API handlers, metadata routes
src/components/          Shared navigation, directories, forms, admin UI, 3D scene
src/lib/                 Data access, schemas, types, Supabase and admin auth
supabase/migrations/     Re-creatable database schema and RLS policies
supabase/seed.sql        Optional domain-directory seed data
```

## Requirements

- Node.js 20.9 or newer (Node 22 LTS recommended)
- npm
- A Supabase project for persistence, authentication, and administrator tools

## Install and run locally (macOS)

From the `vulcan-club` directory:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>. Without Supabase configured, public directories show helpful setup and empty states. The join, contact, and internal event registration forms return a real configuration error instead of pretending data was saved.

To view explicitly fictional visual preview records, set `USE_DEMO_DATA=true` in `.env.local` and restart the dev server. The records are labeled as preview content. This option is ignored in production.

## Configure Supabase

1. Create a Supabase project. In **Project Settings → API**, copy the project URL, anon/public key, and service-role key.
2. Add them to `.env.local`:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_SERVICE_ROLE_KEY
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   USE_DEMO_DATA=false
   ```

3. Keep the service-role key server-side. Never prefix it with `NEXT_PUBLIC_`, commit `.env.local`, or paste it into client code.
4. Install the Supabase CLI if needed and link the project:

   ```bash
   brew install supabase/tap/supabase
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase db push
   ```

   `db push` applies the SQL migration in `supabase/migrations`. The optional seed contains only the domain directory defined in the project brief; it does not create sample people, events, projects, or performance figures. For local Supabase development, `npx supabase start` and `npx supabase db reset` apply migrations and the configured seed.

5. Restart Next.js after changing environment variables. The public directories query Supabase with the anon key and RLS. Server form handlers use the service-role key to insert private submissions after validation and rate checks.

## Create the first administrator

1. In the Supabase dashboard, open **Authentication → Users** and invite or create the organizer account. Use a verified, club-controlled account and set a strong password.
2. Copy that account’s Auth user UUID.
3. In the Supabase SQL editor, run:

   ```sql
   insert into public.admin_users (user_id)
   values ('AUTH_USER_UUID');
   ```

4. Sign in at `/admin` with that Auth account. The server verifies the Supabase session and checks the user UUID against `admin_users` on each protected request. A frontend flag or hidden route does not grant access.
5. To revoke access, delete that user’s row from `public.admin_users`.

Admin accounts should be provisioned directly by a trusted project owner; this site intentionally has no public admin-registration flow.

## Content and forms

- Events, projects, resources, domains, and visible team records are public only when published/visible. Private applications and contact messages are admin-only under RLS.
- Contest standings are entered in Admin → Leaderboards & Results. Contest-wise tables sort by points; year-wise standings total published points for students in the selected academic year. The table intentionally stores only student display names, academic year, contest, and points.
- Membership forms accept any valid email address; no school domain is assumed. Student ID is not collected.
- Internal event registrations have a unique constraint on event ID plus case-insensitive email. If an event provides an external registration URL, the event page links to that destination instead.
- Join and contact submissions require Supabase and return actionable errors if saving fails. Inputs are validated on the server with Zod.
- The in-memory API rate limiter is a useful local/development guard, but it is per server process. Before deploying a multi-instance production site, replace it with a shared rate-limit store (for example, Upstash Redis) or equivalent edge protection.
- The migration creates a public `club-assets` Storage bucket with admin-only upload/update/delete policies. Organizers can upload JPG, PNG, WebP, or AVIF covers and profile images from the dashboard, or paste an existing public image URL.
- Footer email and social links stay hidden until configured through `NEXT_PUBLIC_CLUB_EMAIL`, `NEXT_PUBLIC_GITHUB_URL`, `NEXT_PUBLIC_INSTAGRAM_URL`, and `NEXT_PUBLIC_LINKEDIN_URL`.

## Checks

```bash
npm run format:check
npm run lint
npm run typecheck
npm run build
npm run test:smoke
```

Supabase integration flows (database writes, RLS, Auth, duplicate registration) require a configured Supabase project and credentials. The local source includes the migration and security policies, but those live integrations cannot be claimed as verified until exercised against a real project.

## Deploy to Vercel

1. Push this project to a Git repository you control and import it into Vercel.
2. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, and any verified public contact/social links under **Project Settings → Environment Variables**. Set the service-role key for server runtime only. Set `USE_DEMO_DATA=false`.
3. Apply the migration to the intended Supabase project with `npx supabase link --project-ref YOUR_PROJECT_REF` and `npx supabase db push`.
4. Add the production Vercel domain to Supabase Auth **URL Configuration → Site URL** and allowed redirect URLs. Set `NEXT_PUBLIC_SITE_URL` to the canonical `https://` domain in Vercel.
5. Redeploy after changing environment variables. Verify public pages, an actual form submission, admin sign-in, and published records on the production deployment.

## Troubleshooting

- **“Supabase is not configured”**: check `.env.local` names and restart `npm run dev`.
- **Forms show “not being saved yet”**: configure the public URL/key and server-only service-role key, then apply the migration.
- **Admin shows access denied**: confirm you signed into the expected Supabase Auth user and that its UUID is present in `public.admin_users`.
- **Content is missing**: public queries only show published events/projects/resources and visible team records. Check the status field and RLS migration. Database errors are surfaced; the app does not switch to preview data after a failed live query.
- **Storage upload policy error**: check that the migration created `club-assets` and that the current user passes the same server-verified administrator check.
- **Rate limiting across Vercel instances**: use a shared store before expecting a global limit; the built-in in-memory guard is not distributed.
