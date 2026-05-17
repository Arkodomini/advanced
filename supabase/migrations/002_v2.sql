create extension if not exists "uuid-ossp";

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "own profile" on profiles for all using (auth.uid() = id);

create or replace function handle_new_user() returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles(id,display_name) values(new.id, new.raw_user_meta_data->>'display_name') on conflict(id) do nothing;
  return new;
end;$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure handle_new_user();

create table boards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users on delete cascade not null,
  parent_board_id uuid references boards(id) on delete cascade,
  title text not null default 'Untitled Board',
  description text,
  cover_image_url text,
  icon_color text default '#6366F1',
  icon_type text default 'board',
  is_starred boolean default false,
  is_deleted boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table boards enable row level security;
create policy "own boards" on boards for all using (auth.uid() = owner_id);

create or replace function set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end;$$;
create trigger boards_updated_at before update on boards for each row execute procedure set_updated_at();

create table cards (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade not null,
  type text not null check (type in ('note','link','todo','image','file','board','column','comment','color_swatch','drawing')),
  x float not null default 100,
  y float not null default 100,
  width float not null default 280,
  height float not null default 160,
  z_index int default 1,
  content jsonb not null default '{}',
  bg_color text default '#FFFFFF',
  is_deleted boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table cards enable row level security;
create policy "own cards" on cards for all using (board_id in (select id from boards where owner_id=auth.uid()));
create trigger cards_updated_at before update on cards for each row execute procedure set_updated_at();
create index cards_board_id_idx on cards(board_id);

create table arrows (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade not null,
  from_card_id uuid references cards(id) on delete cascade not null,
  to_card_id uuid references cards(id) on delete cascade not null,
  color text default '#94A3B8',
  style text default 'curved',
  label text,
  created_at timestamptz default now()
);
alter table arrows enable row level security;
create policy "own arrows" on arrows for all using (board_id in (select id from boards where owner_id=auth.uid()));
create index arrows_board_id_idx on arrows(board_id);

insert into storage.buckets(id,name,public) values('card-images','card-images',true) on conflict(id) do nothing;
insert into storage.buckets(id,name,public) values('card-files','card-files',false) on conflict(id) do nothing;
create policy "auth upload images" on storage.objects for insert with check (bucket_id='card-images' and auth.role()='authenticated');
create policy "public view images" on storage.objects for select using (bucket_id='card-images');
create policy "owner delete images" on storage.objects for delete using (bucket_id='card-images' and auth.uid()::text=(storage.foldername(name))[1]);
create policy "auth upload files" on storage.objects for insert with check (bucket_id='card-files' and auth.role()='authenticated');
create policy "auth view files" on storage.objects for select using (bucket_id='card-files' and auth.role()='authenticated');
