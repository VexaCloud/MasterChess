-- MasterChess migration 002
-- Additive changes on top of 001_schema.sql. Safe to run on your existing database.
-- Run this in the Supabase SQL editor (or `supabase db push`).

-- =========================================================
-- 1. Auto-create a profile row whenever a new user signs up
-- =========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'player_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'username', 'Player')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================
-- 2. games: columns needed for real online play + clocks
-- =========================================================
alter table games add column if not exists increment int default 0;
alter table games add column if not exists turn text default 'w'; -- 'w' | 'b', whose move it is
alter table games add column if not exists last_move_at timestamptz default now();
alter table games add column if not exists draw_offered_by uuid references profiles(id);
alter table games add column if not exists winner_id uuid references profiles(id);
alter table games add column if not exists end_reason text; -- checkmate, resignation, timeout, stalemate, draw-agreed, insufficient-material, threefold, fifty-move, abort
alter table games add column if not exists updated_at timestamptz default now();

-- =========================================================
-- 3. Matchmaking queue for "Play Online" (default mode)
-- =========================================================
create table if not exists matchmaking_queue (
  user_id uuid primary key references profiles(id) on delete cascade,
  time_control text not null,   -- e.g. '300|5'
  base int not null,
  increment int not null,
  rating int not null default 1200,
  created_at timestamptz default now()
);

-- =========================================================
-- 4. Puzzles: track provenance + per-user solve history
-- =========================================================
alter table puzzles add column if not exists submitted_by uuid references profiles(id);
alter table puzzles add column if not exists source text default 'curated'; -- curated | user | engine
alter table puzzles add column if not exists is_verified boolean default true;
alter table puzzles add column if not exists title text;

create table if not exists puzzle_solves (
  user_id uuid references profiles(id) on delete cascade,
  puzzle_id uuid references puzzles(id) on delete cascade,
  solved boolean not null,
  attempts int default 1,
  solved_at timestamptz default now(),
  primary key (user_id, puzzle_id)
);

-- =========================================================
-- 5. Row Level Security
-- =========================================================

-- games
alter table games enable row level security;
drop policy if exists "games_select_participants" on games;
create policy "games_select_participants" on games for select
  using (auth.uid() = white_id or auth.uid() = black_id);
-- inserts/updates happen only via edge functions using the service role key,
-- so no insert/update policy is granted to normal authenticated clients.

-- matchmaking_queue
alter table matchmaking_queue enable row level security;
drop policy if exists "queue_select_own" on matchmaking_queue;
create policy "queue_select_own" on matchmaking_queue for select using (auth.uid() = user_id);
drop policy if exists "queue_delete_own" on matchmaking_queue;
create policy "queue_delete_own" on matchmaking_queue for delete using (auth.uid() = user_id);
-- inserts go through the matchmake edge function (service role).

-- puzzles: readable by any signed-in user (curated + community + engine-generated
-- are all part of the shared puzzle bank). is_verified is a display/quality flag,
-- not a visibility gate. Inserts go through submit-puzzle / save-generated-puzzle
-- edge functions, which validate every move server-side before storing anything.
alter table puzzles enable row level security;
drop policy if exists "puzzles_select_visible" on puzzles;
create policy "puzzles_select_all" on puzzles for select using (auth.role() = 'authenticated');

-- puzzle_solves
alter table puzzle_solves enable row level security;
drop policy if exists "solves_select_own" on puzzle_solves;
create policy "solves_select_own" on puzzle_solves for select using (auth.uid() = user_id);
drop policy if exists "solves_insert_own" on puzzle_solves;
create policy "solves_insert_own" on puzzle_solves for insert with check (auth.uid() = user_id);
drop policy if exists "solves_update_own" on puzzle_solves;
create policy "solves_update_own" on puzzle_solves for update using (auth.uid() = user_id);

-- profiles: allow users to insert their own row too (belt & suspenders alongside the trigger)
drop policy if exists "profiles_insert_own" on profiles;
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);

-- =========================================================
-- 6. Realtime: broadcast row changes for live games + queue
-- =========================================================
alter publication supabase_realtime add table games;
alter publication supabase_realtime add table matchmaking_queue;

-- =========================================================
-- 7. Indexes
-- =========================================================
create index if not exists games_status_idx on games(status);
create index if not exists puzzles_source_idx on puzzles(source);
create index if not exists puzzle_solves_user_idx on puzzle_solves(user_id);
