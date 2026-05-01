-- Run this in Supabase SQL Editor to add the admin flag used to gate /trainer.

alter table profiles
  add column if not exists is_admin boolean default false;

-- Promote a user with: update profiles set is_admin = true where username = 'YourUsername';
