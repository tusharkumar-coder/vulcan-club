create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public, auth as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

create table public.domains (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text not null,
  technologies text[] not null default '{}',
  roadmap jsonb not null default '[]'::jsonb,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  category text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  venue text,
  registration_deadline timestamptz,
  registration_url text,
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at)
);
create index events_status_start_idx on public.events(status, starts_at);
create index events_category_start_idx on public.events(category, starts_at);

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  email text not null,
  status text not null default 'registered' check (status in ('registered','cancelled','attended','waitlisted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index event_registrations_event_email_idx on public.event_registrations(event_id, lower(email));
create index event_registrations_event_created_idx on public.event_registrations(event_id, created_at desc);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  domain text,
  technologies text[] not null default '{}',
  contributors text[] not null default '{}',
  repository_url text,
  demo_url text,
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_status_created_idx on public.projects(status, created_at desc);
create index projects_domain_idx on public.projects(domain);

create table public.membership_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  academic_year text not null check (academic_year in ('Year 1','Year 2','Year 3','Year 4','Other')),
  interests text[] not null default '{}',
  experience_level text not null check (experience_level in ('Just starting','Some practice','Building projects','Experienced')),
  github_url text,
  linkedin_url text,
  why_join text not null,
  consent_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending','reviewed','accepted','rejected')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index membership_applications_email_idx on public.membership_applications(lower(email));
create index membership_applications_status_created_idx on public.membership_applications(status, created_at desc);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  category text not null,
  url text not null,
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index resources_status_created_idx on public.resources(status, created_at desc);
create index resources_category_idx on public.resources(category);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'unread' check (status in ('unread','read','resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index contact_messages_status_created_idx on public.contact_messages(status, created_at desc);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  role text not null,
  bio text,
  interests text[] not null default '{}',
  image_url text,
  github_url text,
  linkedin_url text,
  is_visible boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index team_members_visibility_order_idx on public.team_members(is_visible, sort_order);

do $$
declare table_name text;
begin
  foreach table_name in array array['profiles','domains','events','event_registrations','projects','membership_applications','resources','contact_messages','team_members'] loop
    execute format('create trigger %I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end $$;

alter table public.profiles enable row level security;
alter table public.admin_users enable row level security;
alter table public.domains enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.projects enable row level security;
alter table public.membership_applications enable row level security;
alter table public.resources enable row level security;
alter table public.contact_messages enable row level security;
alter table public.team_members enable row level security;

create policy "Profiles are visible to their owner and admins" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "Users update only their own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "Admins manage profiles" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins read administrator roster" on public.admin_users for select to authenticated using (public.is_admin());

create policy "Read published domains" on public.domains for select to anon, authenticated using (is_published or public.is_admin());
create policy "Admins manage domains" on public.domains for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Read published events" on public.events for select to anon, authenticated using (status = 'published' or public.is_admin());
create policy "Admins manage events" on public.events for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins read registrations" on public.event_registrations for select to authenticated using (public.is_admin());
create policy "Admins manage registrations" on public.event_registrations for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Read published projects" on public.projects for select to anon, authenticated using (status = 'published' or public.is_admin());
create policy "Admins manage projects" on public.projects for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins read membership applications" on public.membership_applications for select to authenticated using (public.is_admin());
create policy "Admins manage membership applications" on public.membership_applications for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Read published resources" on public.resources for select to anon, authenticated using (status = 'published' or public.is_admin());
create policy "Admins manage resources" on public.resources for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins read contact messages" on public.contact_messages for select to authenticated using (public.is_admin());
create policy "Admins manage contact messages" on public.contact_messages for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Read visible team members" on public.team_members for select to anon, authenticated using (is_visible or public.is_admin());
create policy "Admins manage team members" on public.team_members for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.domains, public.events, public.projects, public.resources, public.team_members to anon, authenticated;
grant select, update on public.profiles to authenticated;

-- Public club assets are readable; uploads and deletes require a verified admin session.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('club-assets','club-assets',true,5242880,array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do nothing;
create policy "Read public club assets" on storage.objects for select to anon, authenticated using (bucket_id = 'club-assets');
create policy "Admins upload club assets" on storage.objects for insert to authenticated with check (bucket_id = 'club-assets' and public.is_admin());
create policy "Admins update club assets" on storage.objects for update to authenticated using (bucket_id = 'club-assets' and public.is_admin()) with check (bucket_id = 'club-assets' and public.is_admin());
create policy "Admins delete club assets" on storage.objects for delete to authenticated using (bucket_id = 'club-assets' and public.is_admin());
