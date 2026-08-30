-- MasterChess schema (all features free)
-- Run in Supabase SQL editor

-- Profiles
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  country text,
  ratings jsonb default '{"bullet":1200,"blitz":1200,"rapid":1200,"puzzle":1000}'::jsonb,
  league text default 'Wood',
  prestige int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Games
create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  white_id uuid references profiles(id),
  black_id uuid references profiles(id),
  bot_id text, -- if vs bot
  rated boolean default true,
  time_control text,
  variant text default 'standard',
  status text default 'ongoing', -- ongoing, finished, aborted
  result text, -- 1-0, 0-1, 1/2-1/2
  pgn text,
  fen text,
  moves jsonb default '[]'::jsonb,
  white_clock int,
  black_clock int,
  started_at timestamptz default now(),
  ended_at timestamptz
);

-- Puzzles
create table if not exists puzzles (
  id uuid primary key default gen_random_uuid(),
  fen text not null,
  moves text[] not null, -- solution SAN or UCI
  rating int default 1000,
  themes text[],
  created_at timestamptz default now()
);

-- Clubs
create table if not exists clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  owner_id uuid references profiles(id),
  is_public boolean default true,
  created_at timestamptz default now()
);

create table if not exists club_members (
  club_id uuid references clubs(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role text default 'member', -- member, coordinator, admin
  primary key (club_id, user_id)
);

-- Tournaments
create table if not exists tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text, -- swiss, arena, daily
  time_control text,
  variant text default 'standard',
  status text default 'upcoming',
  creator_id uuid references profiles(id),
  starts_at timestamptz,
  created_at timestamptz default now()
);

-- Friendships
create table if not exists friendships (
  user_id uuid references profiles(id) on delete cascade,
  friend_id uuid references profiles(id) on delete cascade,
  status text default 'pending', -- pending, accepted
  primary key (user_id, friend_id)
);

-- RLS example (enable as needed)
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Indexes
create index if not exists games_white_idx on games(white_id);
create index if not exists games_black_idx on games(black_id);
create index if not exists puzzles_rating_idx on puzzles(rating);
