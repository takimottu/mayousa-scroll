create table if not exists public.mayousa_scores (
  id bigint generated always as identity primary key,
  player_name text not null check (char_length(player_name) between 1 and 16),
  score integer not null check (score between 0 and 100000),
  completed_at timestamptz not null,
  lives integer not null check (lives between 0 and 5),
  end_id text not null,
  title text not null default '',
  scene_name text not null default '',
  favorite_mayousa text not null default 'hat',
  created_at timestamptz not null default now()
);

alter table public.mayousa_scores
  add column if not exists favorite_mayousa text not null default 'hat';

create index if not exists mayousa_scores_ranking_idx
  on public.mayousa_scores (score desc, completed_at asc);

alter table public.mayousa_scores enable row level security;

drop policy if exists "Anyone can read mayousa scores" on public.mayousa_scores;
create policy "Anyone can read mayousa scores"
  on public.mayousa_scores
  for select
  using (true);

drop policy if exists "Anyone can insert mayousa scores" on public.mayousa_scores;
create policy "Anyone can insert mayousa scores"
  on public.mayousa_scores
  for insert
  with check (true);
