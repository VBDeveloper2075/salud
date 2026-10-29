-- Campos que usa la app actual (calendario de actividades y presets locales)
alter table public.profiles
  add column if not exists activity_log jsonb not null default '{}'::jsonb;

alter table public.profiles
  add column if not exists saved_food_presets jsonb not null default '[]'::jsonb;

-- IDs de cliente para reconstruir comidas con varios ítems
alter table public.meals_entries
  add column if not exists client_meal_id text;

alter table public.meals_entries
  add column if not exists client_item_id text;

alter table public.exercises
  add column if not exists client_exercise_id text;

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
