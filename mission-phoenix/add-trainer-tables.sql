-- Run this in Supabase SQL Editor to add the personal-trainer feature tables.

-- A/B/C program templates (one row per session code per user)
create table if not exists trainer_program (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  code text not null check (code in ('A','B','C')),
  name text not null,
  slots jsonb not null default '[]'::jsonb,
  updated_at timestamptz default now(),
  unique (user_id, code)
);

-- Logged workouts (one row per session)
create table if not exists trainer_workout (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  code text not null check (code in ('A','B','C')),
  performed_at timestamptz default now(),
  sets jsonb not null default '[]'::jsonb,
  swaps jsonb not null default '[]'::jsonb,
  notes text default '',
  client_id text not null,
  created_at timestamptz default now(),
  unique (user_id, client_id)
);

create index if not exists trainer_program_user_idx on trainer_program(user_id, code);
create index if not exists trainer_workout_user_perf_idx on trainer_workout(user_id, performed_at desc);

alter table trainer_program enable row level security;
alter table trainer_workout enable row level security;

create policy "Users can do everything with own program" on trainer_program
  for all using (auth.uid() = user_id);

create policy "Users can do everything with own workouts" on trainer_workout
  for all using (auth.uid() = user_id);
