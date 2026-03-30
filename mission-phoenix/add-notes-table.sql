-- Run this in Supabase SQL Editor to add journaling support

-- Daily notes / journal entries
create table if not exists daily_notes (
  id uuid default gen_random_uuid() primary key,
  habit_id uuid references habits(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  note_date date not null,
  note_text text not null default '',
  is_public boolean default false,
  created_at timestamptz default now(),
  unique(habit_id, note_date)
);

-- Enable Row Level Security
alter table daily_notes enable row level security;

-- Users can manage their own notes
create policy "Users can do everything with own notes" on daily_notes
  for all using (auth.uid() = user_id);

-- Anyone can view public notes (for community journal)
create policy "Anyone can view public notes" on daily_notes
  for select using (is_public = true);
