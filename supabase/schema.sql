-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Use a NEW Supabase project for this — this replaces the old user_state
-- table from an earlier round, which this schema does not carry forward.
--
-- One row per (user, item). item_type distinguishes what item_id means:
--   'saved'      item_id = question id            status = 'saved'
--   'flashcard'  item_id = question id            status = 'known' | 'review'
--   'flow-step'  item_id = '<topic-slug>.<stage>' status = 'viewed'
--   'quiz'       item_id = 'result'               status = JSON: {"answers":{...},"at":epoch-ms}
-- Row-level security: a signed-in user can only ever read or write their own rows.

create table if not exists public.user_progress (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  item_id    text        not null,
  item_type  text        not null,
  status     text        not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, item_type, item_id),
  constraint status_small check (char_length(status) < 20000)
);

create index if not exists user_progress_by_user on public.user_progress (user_id, item_type);

alter table public.user_progress enable row level security;

create policy "read own progress"   on public.user_progress for select using (auth.uid() = user_id);
create policy "insert own progress" on public.user_progress for insert with check (auth.uid() = user_id);
create policy "update own progress" on public.user_progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own progress" on public.user_progress for delete using (auth.uid() = user_id);

-- "Delete my account and data": removes this user's progress rows, then their
-- auth.users row (which the app can't do directly with the anon/public key).
-- SECURITY DEFINER runs as the function owner, not the caller, so it can
-- reach auth.users; the `where id = auth.uid()` keeps it scoped to the
-- caller's own account regardless. Grant execute to authenticated only.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.user_progress where user_id = auth.uid();
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
