alter table public.mayousa_scores
  add column if not exists favorite_mayousa text not null default 'hat';
