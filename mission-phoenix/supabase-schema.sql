-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  motivational_message text default '',
  show_streak boolean default true,
  show_total_days boolean default true,
  show_habits boolean default true,
  show_message boolean default true,
  is_public boolean default true,
  created_at timestamptz default now()
);

-- Habits table
create table habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Daily checks table
create table daily_checks (
  id uuid default gen_random_uuid() primary key,
  habit_id uuid references habits(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  check_date date not null,
  completed boolean default true,
  created_at timestamptz default now(),
  unique(habit_id, check_date)
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table habits enable row level security;
alter table daily_checks enable row level security;

-- Profiles policies
create policy "Anyone can view public profiles" on profiles
  for select using (is_public = true or auth.uid() = id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Habits policies
create policy "Users can do everything with own habits" on habits
  for all using (auth.uid() = user_id);

create policy "Anyone can view public users habits" on habits
  for select using (
    exists (select 1 from profiles where id = user_id and is_public = true and show_habits = true)
  );

-- Daily checks policies
create policy "Users can do everything with own checks" on daily_checks
  for all using (auth.uid() = user_id);

create policy "Anyone can view public users checks" on daily_checks
  for select using (
    exists (select 1 from profiles where id = user_id and is_public = true)
  );
