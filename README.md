# Myflo

A privacy-first, safety-aware women’s health companion built as a mobile-first React + TypeScript application. The primary visual treatment follows the supplied Myflo reference: a warm off-white phone canvas, lavender presentation frame, floral line art, compact pastel cards, a circular cycle widget, and a five-item bottom navigation with a centre quick-action button.

> **Important:** Myflo provides tracking and educational information. It does not diagnose conditions, prescribe medicine, assess emergencies, or replace a qualified clinician. Severe, sudden, worsening, or concerning symptoms should be evaluated by an appropriate medical professional.

## Initial repository audit

The supplied repository contained only `README.md` at the initial commit. There was no frontend, API, auth provider, database schema, component library, dependency manifest, or existing functionality to preserve.

A connected Supabase account exposes a project named **NikNote**, which is not clearly a Myflo project. It was deliberately **not modified**. The repository includes a new Myflo migration ready to apply to a dedicated project instead.

## What is implemented

### Core app / Stage 1

- Premium Myflo mobile design system: warm ivory, blush, rose, sage, lavender, accessible focus states, restrained botanical CSS art, reduced-motion support, a centred phone shell on larger screens, and the reference-style mobile bottom navigation.
- Three-step onboarding with cycle irregularity, optional current period entry, private-local-mode disclosure, and opt-in future AI-processing consent.
- **Home dashboard** with current cycle day, conservative phase display, estimated period confidence, today’s scorecard, hydration, meal-log status, and contextual care guidance.
- **Cycle calendar** with:
  - recorded versus estimated periods displayed differently;
  - fertile-window / ovulation estimates labelled as estimates;
  - period create, edit, notes, correction, and deletion;
  - history-driven predictions that do **not** force a 28-day cycle;
  - uncertainty / variability messaging.
- **My Body Today** scorecard with persistent daily entries for:
  - 0–10 pain (location, duration, change, daily-life interference, existing medication note);
  - none / spotting / light / moderate / heavy bleeding;
  - practical heavy-bleeding questions;
  - flow colour / consistency;
  - 0–10 bloating, stress, and energy;
  - mood, symptoms, sleep, water, free notes, and relevant warning-sign context.
- A deterministic **safety gate** runs before wellness guidance. It highlights potential urgent situations such as fainting, breathing difficulty, possible pregnancy with pain/bleeding, severe worsening pain, very heavy bleeding with practical warning signs, and fever with concerning context. It never labels a diagnosis.
- **Flow Guide**, an educational flow-colour interface with common contexts, relevant symptoms, appropriate clinician advice, urgent escalation guidance, and a non-diagnostic disclaimer.
- **Insights** from actual saved entries: score trends, recorded symptom frequencies, cautious language that does not infer causation, and an on-device, deterministic companion response.
- **Nutrition dashboard / meal log** with configurable manual meal entries, portion scaling, editable nutrient values, daily totals, weekly saved-estimate trend, local image preview, and explicit uncertainty messaging.
- **Medicine & Care** record for medicines users already take, including time, dose-as-recorded, reasons, side effects, and reported result. It does not prescribe or calculate regimens.
- **Reminder settings** with persisted schedules, quiet hours, browser-permission request, duplicate prevention for in-tab notification delivery, and a clear limitation notice for closed-app push delivery.
- **Privacy & data** controls: local-mode disclosure, granular consent flags, JSON export, and confirmed local-data deletion.

### Data correctness and privacy foundations

- Versioned browser persistence (`localStorage`) for private local mode with load/error handling.
- No health data is transmitted by this build.
- No client-side API keys are present.
- A Supabase-ready relational schema and RLS policies are in [`supabase/migrations/202610250001_myflo_core.sql`](./supabase/migrations/202610250001_myflo_core.sql).
- The migration scopes every health-data table to `auth.uid()`, adds ownership RLS policies, user/date indexes, data export/deletion support, timestamps, validation constraints, and an auditable place for future AI insights.

## Deliberately not represented as complete

This application is honest about features requiring a production backend or external credentials:

- **Food photo AI is not enabled.** A photo can be selected locally as context, but it is not transmitted or analyzed. Users can manually enter / correct a meal and portion. The compact local food reference is an editable starter estimate, not a live validated nutrition database.
- **Cloud AI Health Companion is not enabled.** The current companion is deterministic on-device guidance plus the safety gate; it does not call an LLM.
- **Account sync/auth is not enabled.** Current persistence is limited to the active browser. The included Supabase migration is not deployed.
- **Push notifications when the app is closed are not enabled.** Browser notification settings work while this browser app is open. A service worker, push provider, server-side scheduler, and OS-specific testing are required for reliable closed-app delivery.
- **Medication reference pages and clinical review are not complete.** The app records user-entered existing medication details but does not provide a drug database or decision support.

## Project structure

```text
src/
  components/       reusable UI and onboarding
  domain/           cycle prediction, safety rules, nutrition estimate logic + tests
  lib/              local persistence and in-tab reminder scheduler
  screens/          Home, Calendar, Track, Insights, Flow Guide, More
supabase/migrations/ Myflo security-first schema and RLS migration
```

## Run locally

```bash
npm install
npm run dev
```

The development server binds to `0.0.0.0` and permits Arena’s preview host.

```bash
npm run build
npm test
```

## Environment variables

Copy `.env.example` for deployment configuration. All provider secrets must remain server-side.

| Variable | Purpose | Exposure |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Optional public Supabase project URL | browser-safe public config |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Optional public Supabase publishable key | browser-safe public config |
| `VITE_FOOD_ANALYSIS_ENDPOINT` | Relative server route for opt-in photo analysis | browser-safe route only |
| `VITE_NUTRITION_LOOKUP_ENDPOINT` | Relative server route for nutrition lookup | browser-safe route only |
| `VITE_HEALTH_COMPANION_ENDPOINT` | Relative server route for opt-in AI companion | browser-safe route only |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend administrative key | **server only** |
| `FOOD_VISION_PROVIDER_API_KEY` | Vision provider secret | **server only** |
| `NUTRITION_DATABASE_API_KEY` | Validated nutrition database secret | **server only** |
| `HEALTH_AI_PROVIDER_API_KEY` | AI provider secret | **server only** |
| `PUSH_PROVIDER_PRIVATE_KEY` | Web-push/private provider secret | **server only** |

Never put sensitive provider keys in `VITE_*` variables.

## Database deployment checklist

1. Create or identify a **dedicated Myflo Supabase project**; do not repurpose an unrelated app’s database.
2. Review [`supabase/migrations/202610250001_myflo_core.sql`](./supabase/migrations/202610250001_myflo_core.sql) with a database/security owner.
3. Apply the migration through controlled deployment.
4. Configure Auth, redirect URLs, email policy, and a server-side account deletion endpoint.
5. Add a Supabase repository adapter and replace local-only persistence only after integration tests verify RLS isolation across two accounts.
6. Implement secrets only in Edge Functions/server routes, including explicit AI consent checks before transmission.

## Prioritized next implementation plan

1. **Production data layer:** provision a dedicated project; implement Supabase Auth and repository sync; exercise RLS isolation, export, and account deletion against real accounts.
2. **Food analysis:** add an opt-in server endpoint that combines food vision, a user confirmation / portion step, and a licensed or validated nutrient-composition source. Persist source, confidence, ingredients, and uncertainty.
3. **Clinical/safety review:** have qualified clinicians review the deterministic escalation rules, Flow Guide wording, medication content, regional emergency wording, and minor safeguards.
4. **AI companion:** add a consent-gated server-side model adapter with minimized context, safety prefiltering, audit logging, red-team testing, refusal behavior, and no medical diagnosis/prescribing.
5. **Reminders:** add a service worker, durable job scheduling, push subscriptions, retry/failure history, timezone handling, and device-level tests.
6. **QA / accessibility:** add browser tests for mobile breakpoints, forms, offline failures, keyboard use, screen readers, data import/export, and multi-account privacy.

## Tests executed

```text
npm run build
✓ TypeScript compilation
✓ Vite production build

npm test
✓ 11 tests passed
  ✓ 4 cycle-calculation / irregular-history tests
  ✓ 4 deterministic safety-escalation tests
  ✓ 3 nutrition-reference / uncertainty tests
```

## Sources and clinical review still needed

No external AI service or production food database has been integrated in this build. Before release, the following require provider credentials and/or qualified clinical review:

- food vision model and validated nutrition source, including regional mixed dishes;
- consented health-AI provider and privacy/data-processing agreement;
- medication reference source with maintenance process;
- safety / escalation rule review by licensed local clinicians;
- push notification provider and delivery monitoring;
- dedicated Supabase Auth and secure backend deployment.
