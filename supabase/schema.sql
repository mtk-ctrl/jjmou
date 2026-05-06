-- プログラミングランド Supabaseスキーマ
-- デバイスをまたいだ進捗保存のためのテーブル定義

-- ユーザープロファイル（デバイス識別子ベース）
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,          -- デバイス固有ID（ブラウザfingerprintまたはランダム生成）
  slot_index integer not null check (slot_index between 0 and 3),
  name text not null,
  animal_idx integer not null default 0 check (animal_idx between 0 and 3),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(device_id, slot_index)
);

-- アプリごとの進捗
create table if not exists progress (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  app_id text not null check (app_id in ('nyanko','music','dotart','hiragana','shapes')),
  level_index integer not null default 0,
  stars jsonb not null default '{}'::jsonb,     -- { "0": 3, "1": 2, ... }
  unlocked_count integer not null default 1,
  updated_at timestamptz default now(),
  unique(profile_id, app_id)
);

-- Row Level Security（RLS）
alter table profiles enable row level security;
alter table progress enable row level security;

-- 匿名アクセスポリシー（device_id で自分のデータのみ操作）
create policy "device can read own profiles"
  on profiles for select
  using (true);

create policy "device can insert own profiles"
  on profiles for insert
  with check (true);

create policy "device can update own profiles"
  on profiles for update
  using (true);

create policy "anyone can read progress"
  on progress for select
  using (true);

create policy "anyone can insert progress"
  on progress for insert
  with check (true);

create policy "anyone can update progress"
  on progress for update
  using (true);

-- インデックス
create index if not exists profiles_device_id_idx on profiles(device_id);
create index if not exists progress_profile_id_idx on progress(profile_id);

-- updated_at 自動更新トリガー
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger progress_updated_at
  before update on progress
  for each row execute function update_updated_at();
