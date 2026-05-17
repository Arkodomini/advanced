-- ============================================================
-- Advanced Notes — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- profiles mirrors auth.users
create table if not exists profiles (
  id uuid references auth.users primary key,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists boards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade,
  title text not null default 'Untitled Board',
  description text,
  thumbnail_url text,
  is_starred boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade,
  type text not null, -- 'note' | 'image' | 'link' | 'todo' | 'column_header'
  x float not null default 0,
  y float not null default 0,
  width float not null default 280,
  height float not null default 200,
  z_index int default 1,
  content jsonb not null default '{}',
  color text default 'white',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table profiles enable row level security;
alter table boards enable row level security;
alter table cards enable row level security;

-- Profiles
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Boards
create policy "Users can view own boards"
  on boards for select using (auth.uid() = owner_id);

create policy "Users can insert own boards"
  on boards for insert with check (auth.uid() = owner_id);

create policy "Users can update own boards"
  on boards for update using (auth.uid() = owner_id);

create policy "Users can delete own boards"
  on boards for delete using (auth.uid() = owner_id);

-- Cards (scoped through boards ownership)
create policy "Users can view own cards"
  on cards for select using (
    exists (select 1 from boards where boards.id = cards.board_id and boards.owner_id = auth.uid())
  );

create policy "Users can insert own cards"
  on cards for insert with check (
    exists (select 1 from boards where boards.id = cards.board_id and boards.owner_id = auth.uid())
  );

create policy "Users can update own cards"
  on cards for update using (
    exists (select 1 from boards where boards.id = cards.board_id and boards.owner_id = auth.uid())
  );

create policy "Users can delete own cards"
  on cards for delete using (
    exists (select 1 from boards where boards.id = cards.board_id and boards.owner_id = auth.uid())
  );

-- ============================================================
-- Auto-create profile on sign-up trigger
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
