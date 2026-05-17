-- ─────────────────────────────────────────────
-- Advanced Notes – Phase 1 Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── PROFILES ──────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users on delete cascade,
  display_name text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

alter table profiles enable row level security;
create policy "Users can view own profile"   on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ── BOARDS ────────────────────────────────────
create table if not exists boards (
  id               uuid primary key default uuid_generate_v4(),
  owner_id         uuid not null references auth.users on delete cascade,
  title            text not null default 'Untitled Board',
  description      text,
  thumbnail_color  text not null default '#3B82F6',
  is_starred       boolean not null default false,
  is_trashed       boolean not null default false,
  from_template    text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table boards enable row level security;
create policy "Owner full access on boards" on boards for all using (auth.uid() = owner_id);

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists boards_updated_at on boards;
create trigger boards_updated_at
  before update on boards
  for each row execute procedure update_updated_at();

-- ── CARDS ─────────────────────────────────────
create table if not exists cards (
  id         uuid primary key default uuid_generate_v4(),
  board_id   uuid not null references boards on delete cascade,
  type       text not null check (type in ('note','image','link','todo','column_header','color_swatch')),
  x          real not null default 0,
  y          real not null default 0,
  width      real not null default 280,
  height     real not null default 160,
  z_index    integer not null default 1,
  content    jsonb not null default '{}',
  bg_color   text not null default '#FFFFFF',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table cards enable row level security;
create policy "Board owner full access on cards" on cards for all
  using (exists (select 1 from boards where boards.id = cards.board_id and boards.owner_id = auth.uid()));

drop trigger if exists cards_updated_at on cards;
create trigger cards_updated_at
  before update on cards
  for each row execute procedure update_updated_at();

create index if not exists cards_board_id_idx on cards(board_id);

-- ── ARROWS ────────────────────────────────────
create table if not exists arrows (
  id           uuid primary key default uuid_generate_v4(),
  board_id     uuid not null references boards on delete cascade,
  from_card_id uuid not null references cards on delete cascade,
  to_card_id   uuid not null references cards on delete cascade,
  color        text not null default '#94A3B8',
  style        text not null default 'curved' check (style in ('curved','straight','elbow')),
  created_at   timestamptz not null default now()
);

alter table arrows enable row level security;
create policy "Board owner full access on arrows" on arrows for all
  using (exists (select 1 from boards where boards.id = arrows.board_id and boards.owner_id = auth.uid()));

create index if not exists arrows_board_id_idx on arrows(board_id);

-- ── STORAGE ───────────────────────────────────
insert into storage.buckets (id, name, public) values ('card-images', 'card-images', true)
  on conflict (id) do nothing;

create policy "Authenticated users can upload card images"
  on storage.objects for insert
  with check (bucket_id = 'card-images' and auth.role() = 'authenticated');

create policy "Anyone can view card images"
  on storage.objects for select
  using (bucket_id = 'card-images');

create policy "Users can delete own card images"
  on storage.objects for delete
  using (bucket_id = 'card-images' and auth.uid()::text = (storage.foldername(name))[1]);
