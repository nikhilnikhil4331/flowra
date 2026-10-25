-- Myflo core schema
-- Apply this only to the Supabase project intended for Myflo.
-- This migration is intentionally not applied to any unrelated project.

create extension if not exists pgcrypto;

create type public.myflo_bleeding_level as enum ('none', 'spotting', 'light', 'moderate', 'heavy');
create type public.myflo_flow_color as enum ('bright_red', 'dark_red', 'brown', 'pink', 'orange_unusual', 'other_unsure');
create type public.myflo_mood as enum ('happy', 'calm', 'irritable', 'anxious', 'sad', 'low', 'confused', 'sleepy');
create type public.myflo_reminder_type as enum ('daily_log', 'water', 'nutrition', 'sleep', 'period', 'medication', 'appointment');

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 40),
  cycle_is_irregular boolean not null default false,
  timezone text not null default 'UTC',
  setup_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.consent_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  ai_processing boolean not null default false,
  analytics boolean not null default false,
  local_notifications boolean not null default false,
  data_retention text not null default 'until_deleted' check (data_retention in ('until_deleted', '12_months')),
  accepted_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.cycle_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  start_date date not null,
  end_date date,
  notes text check (char_length(notes) <= 280),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_cycle_range check (end_date is null or end_date >= start_date),
  constraint reasonable_period_duration check (end_date is null or end_date <= start_date + 30)
);
create index cycle_entries_user_start_idx on public.cycle_entries (user_id, start_date desc);

create table public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  pain_score smallint not null default 0 check (pain_score between 0 and 10),
  pain_locations text[] not null default '{}',
  pain_duration text,
  pain_worsening boolean not null default false,
  pain_interferes boolean not null default false,
  medication_taken text check (char_length(medication_taken) <= 80),
  medication_helped text check (medication_helped in ('yes', 'no', 'unsure')),
  bleeding public.myflo_bleeding_level not null default 'none',
  flow_color public.myflo_flow_color,
  flow_consistency text check (char_length(flow_consistency) <= 140),
  products_changed text check (products_changed in ('not_applicable', 'less_than_2h', '2_to_4h', '4_to_8h', 'more_than_8h')),
  fully_soaked boolean not null default false,
  leakage boolean not null default false,
  large_clots boolean not null default false,
  possible_pregnancy boolean not null default false,
  fainting boolean not null default false,
  fever boolean not null default false,
  shortness_breath boolean not null default false,
  bloating_score smallint not null default 0 check (bloating_score between 0 and 10),
  stress_score smallint not null default 0 check (stress_score between 0 and 10),
  energy_score smallint not null default 5 check (energy_score between 0 and 10),
  mood public.myflo_mood,
  symptoms text[] not null default '{}',
  sleep_hours numeric(4,1) check (sleep_hours between 0 and 24),
  sleep_quality smallint check (sleep_quality between 0 and 10),
  water_ml integer check (water_ml between 0 and 10000),
  notes text check (char_length(notes) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);
create index daily_logs_user_date_idx on public.daily_logs (user_id, log_date desc);

create table public.meal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_date date not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  name text not null check (char_length(name) between 1 and 100),
  portion_label text not null check (char_length(portion_label) between 1 and 80),
  nutrients jsonb not null,
  source text not null check (source in ('manual', 'reference', 'database', 'ai_confirmed')),
  confidence text not null check (confidence in ('user_entered', 'estimated')),
  notes text check (char_length(notes) <= 200),
  created_at timestamptz not null default now(),
  constraint nutrients_is_object check (jsonb_typeof(nutrients) = 'object')
);
create index meal_entries_user_date_idx on public.meal_entries (user_id, meal_date desc);

create table public.medication_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  dose text check (char_length(dose) <= 80),
  taken_at timestamptz not null,
  reason text check (char_length(reason) <= 120),
  side_effects text check (char_length(side_effects) <= 300),
  helped text check (helped in ('yes', 'no', 'unsure')),
  created_at timestamptz not null default now()
);
create index medication_records_user_taken_idx on public.medication_records (user_id, taken_at desc);

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reminder_type public.myflo_reminder_type not null,
  title text not null check (char_length(title) between 1 and 80),
  enabled boolean not null default true,
  local_time time not null,
  days_before smallint check (days_before between 0 and 30),
  quiet_hours_start time,
  quiet_hours_end time,
  last_notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index reminders_user_enabled_idx on public.reminders (user_id, enabled);

create table public.notification_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reminder_id uuid references public.reminders(id) on delete set null,
  channel text not null check (channel in ('local', 'push', 'email')),
  scheduled_for timestamptz not null,
  delivered_at timestamptz,
  status text not null check (status in ('scheduled', 'delivered', 'failed', 'dismissed', 'snoozed')),
  failure_reason text,
  created_at timestamptz not null default now()
);
create index notification_history_user_scheduled_idx on public.notification_history (user_id, scheduled_for desc);

-- Keep generated personal insights separate from source observations and auditable.
create table public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('companion', 'pattern', 'nutrition', 'safety')),
  content text not null,
  source_log_ids uuid[] not null default '{}',
  model_provider text,
  model_version text,
  consent_version text,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);
create index ai_insights_user_created_idx on public.ai_insights (user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger consent_settings_set_updated_at before update on public.consent_settings for each row execute function public.set_updated_at();
create trigger cycle_entries_set_updated_at before update on public.cycle_entries for each row execute function public.set_updated_at();
create trigger daily_logs_set_updated_at before update on public.daily_logs for each row execute function public.set_updated_at();
create trigger reminders_set_updated_at before update on public.reminders for each row execute function public.set_updated_at();

-- RLS: no health data is readable or writable across users.
alter table public.profiles enable row level security;
alter table public.consent_settings enable row level security;
alter table public.cycle_entries enable row level security;
alter table public.daily_logs enable row level security;
alter table public.meal_entries enable row level security;
alter table public.medication_records enable row level security;
alter table public.reminders enable row level security;
alter table public.notification_history enable row level security;
alter table public.ai_insights enable row level security;

create policy "Users manage their own profile" on public.profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their own consent" on public.consent_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their own cycles" on public.cycle_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their own daily logs" on public.daily_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their own meals" on public.meal_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their own medication records" on public.medication_records for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their own reminders" on public.reminders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users read their own notification history" on public.notification_history for select using (auth.uid() = user_id);
create policy "Users insert their own notification history" on public.notification_history for insert with check (auth.uid() = user_id);
create policy "Users update their own notification history" on public.notification_history for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their own generated insights" on public.ai_insights for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Privacy support: authenticated clients can remove their health data while retaining
-- their account. Account deletion itself requires a separately protected server-side
-- administrative operation; never expose a service-role key to the client.
create or replace function public.delete_myflo_data()
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  delete from public.ai_insights where user_id = auth.uid();
  delete from public.notification_history where user_id = auth.uid();
  delete from public.reminders where user_id = auth.uid();
  delete from public.medication_records where user_id = auth.uid();
  delete from public.meal_entries where user_id = auth.uid();
  delete from public.daily_logs where user_id = auth.uid();
  delete from public.cycle_entries where user_id = auth.uid();
  delete from public.consent_settings where user_id = auth.uid();
  delete from public.profiles where user_id = auth.uid();
end;
$$;

-- Data export is deliberately client-side after RLS-scoped reads, or may be exposed
-- from a server route after rechecking auth. Do not grant broad table access to roles.
