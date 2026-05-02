-- Run this in Supabase SQL Editor. Adds the per-session readiness check.
-- readiness shape:
-- { sleep_quality: 1-5, energy: 1-5, mood: 1-5, niggles: "free text",
--   skipped: bool, recorded_at: ISO timestamp }

alter table trainer_workout
  add column if not exists readiness jsonb default null;
