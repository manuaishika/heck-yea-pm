-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- One row per (user, key). The app stores three keys: saved questions,
-- flashcard marks, and quiz answers. Row-level security means a signed-in
-- user can only ever read or write their own rows.

create table if not exists public.user_state (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  key        text        not null,
  value      jsonb       not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key),
  constraint key_allowed check (key in ('hyp.saved.v1', 'hyp.reviews.v1', 'hyp.quiz.v1')),
  constraint value_small check (pg_column_size(value) < 20000)
);

alter table public.user_state enable row level security;

create policy "read own state"   on public.user_state for select using (auth.uid() = user_id);
create policy "insert own state" on public.user_state for insert with check (auth.uid() = user_id);
create policy "update own state" on public.user_state for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own state" on public.user_state for delete using (auth.uid() = user_id);
