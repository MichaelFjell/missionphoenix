-- Run this in Supabase SQL Editor to add newsletter subscriber support

create table if not exists newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table newsletter_subscribers enable row level security;

-- Allow anyone to insert (signup from the public homepage)
create policy "Anyone can subscribe" on newsletter_subscribers
  for insert with check (true);
