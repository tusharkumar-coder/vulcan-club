alter table public.team_members
  add column if not exists instagram_url text,
  add column if not exists skills text[] not null default '{}';
