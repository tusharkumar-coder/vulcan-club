create table public.leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  contest_name text not null check (char_length(contest_name) between 2 and 180),
  contest_date date not null,
  student_name text not null check (char_length(student_name) between 2 and 120),
  academic_year text not null check (academic_year in ('1st Year','2nd Year','3rd Year','4th Year','Other')),
  points numeric(10,2) not null check (points >= 0),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index leaderboard_entries_contest_student_idx
  on public.leaderboard_entries (lower(contest_name), contest_date, lower(student_name));
create index leaderboard_entries_public_standings_idx
  on public.leaderboard_entries (status, contest_date desc, points desc);

create trigger leaderboard_entries_updated_at
  before update on public.leaderboard_entries
  for each row execute function public.set_updated_at();

alter table public.leaderboard_entries enable row level security;

create policy "Read published leaderboard entries"
  on public.leaderboard_entries for select to anon, authenticated
  using (status = 'published' or public.is_admin());
create policy "Admins manage leaderboard entries"
  on public.leaderboard_entries for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

grant select on public.leaderboard_entries to anon, authenticated;
