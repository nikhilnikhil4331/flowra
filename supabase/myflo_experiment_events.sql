-- Myflo experiment funnel events for the Flagsmith A/B test.
--
-- One row per funnel event. Privacy-first by design:
--   - only an anonymous, browser-generated client UUID is stored (no email/PII)
--   - anonymous clients may only INSERT (no reads) — read the funnel from the
--     SQL snippet in README.md or the Flagsmith dashboard
--   - RLS enabled on the table
--
-- Events (mirrored from the Flagsmith funnel):
--   experiment_conversion_started  — splash CTA clicked
--   experiment_conversion_metric   — goals-setup step completed (the metric)

create table if not exists public.myflo_experiment_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event text not null check (event in ('experiment_conversion_started', 'experiment_conversion_metric')),
  client_id text,
  variant text check (variant in ('variant_a', 'variant_b')),
  metadata jsonb not null default '{}'::jsonb
);

comment on table public.myflo_experiment_events is
  'Myflo experiment funnel events for the Flagsmith A/B test (anonymous client UUIDs only).';

create index if not exists myflo_experiment_events_event_idx
  on public.myflo_experiment_events (event, created_at);

alter table public.myflo_experiment_events enable row level security;

-- Anonymous insert-only policy (no select for anon; reads happen from the
-- dashboard/SQL only)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'myflo_experiment_events'
      and policyname = 'anon insert myflo_experiment_events'
  ) then
    create policy "anon insert myflo_experiment_events"
      on public.myflo_experiment_events
      for insert
      to anon
      with check (true);
  end if;
end $$;
