-- Salud: esquema inicial (Supabase / PostgreSQL)
-- Ejecutar en el SQL Editor de Supabase o via CLI: supabase db push

-- Perfil extendido del usuario autenticado
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  weight_kg numeric(5, 2),
  height_cm numeric(5, 2),
  age smallint,
  target_weight_kg numeric(5, 2),
  daily_calorie_goal integer not null default 1800,
  fixed_routines jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type public.meal_slot as enum (
  'desayuno',
  'almuerzo',
  'merienda',
  'cena',
  'snack'
);

-- Totales agregados por día
create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  log_date date not null,
  total_calories_consumed numeric(8, 2) not null default 0,
  total_protein_g numeric(8, 2) not null default 0,
  total_carbs_g numeric(8, 2) not null default 0,
  total_fat_g numeric(8, 2) not null default 0,
  total_calories_burned numeric(8, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create index if not exists daily_logs_user_date_idx on public.daily_logs (user_id, log_date desc);

-- Detalle por alimento
create table if not exists public.meals_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  daily_log_id uuid not null references public.daily_logs (id) on delete cascade,
  log_date date not null,
  meal_slot public.meal_slot not null,
  food_name text not null,
  quantity_description text,
  calories numeric(8, 2) not null default 0,
  protein_g numeric(8, 2) not null default 0,
  carbs_g numeric(8, 2) not null default 0,
  fat_g numeric(8, 2) not null default 0,
  raw_message text,
  created_at timestamptz not null default now()
);

create index if not exists meals_entries_log_idx on public.meals_entries (daily_log_id, meal_slot);

-- Actividad física
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  daily_log_id uuid not null references public.daily_logs (id) on delete cascade,
  log_date date not null,
  activity_name text not null,
  duration_minutes numeric(6, 2),
  calories_burned numeric(8, 2) not null default 0,
  raw_message text,
  created_at timestamptz not null default now()
);

create index if not exists exercises_log_idx on public.exercises (daily_log_id);

-- Trigger updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger daily_logs_updated_at
  before update on public.daily_logs
  for each row execute function public.set_updated_at();

-- Perfil automático al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.daily_logs enable row level security;
alter table public.meals_entries enable row level security;
alter table public.exercises enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "daily_logs_all_own" on public.daily_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "meals_entries_all_own" on public.meals_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "exercises_all_own" on public.exercises
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
