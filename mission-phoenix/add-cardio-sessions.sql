-- Run this in Supabase SQL Editor. Adds cardio support to the trainer feature.
-- session_kind is 'strength' (default) or 'cardio'. Strength workouts use sets[]
-- as exercise sets; cardio workouts use sets[] as a single { kind: 'intervals'|'steady', ... } object.

alter table trainer_workout
  add column if not exists session_kind text default 'strength';
alter table trainer_program
  add column if not exists session_kind text default 'strength';

-- Cardio templates use codes like 'N4x4', 'Z2' — drop the strength-only constraint.
alter table trainer_program
  drop constraint if exists trainer_program_code_check;
alter table trainer_workout
  drop constraint if exists trainer_workout_code_check;
