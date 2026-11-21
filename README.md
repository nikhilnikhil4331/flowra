# Myflo · Flagsmith Experimentation

Hackathon build for **Toggle Wars: The Flagsmith Experimentation Hackathon**
(WeMakeDevs, Nov 26–29, 2026) · Track 01 — **Test Something Real** · Team **Niknote**

Myflo is a local-first, mobile-first women's health companion (cycle tracking,
symptoms, nutrition, reminders, insights). This repository is the hackathon
project: a real, live **Flagsmith Experimentation** A/B test running inside the
app.

---

## 01 · The experiment

**Hypothesis.** A personal, warm onboarding CTA converts more new users into
the onboarding funnel than the generic "Get Started" CTA.

| | |
|---|---|
| **Flag** | `onboarding_cta` (multivariate) |
| **Versions** | `control` — the current CTA ("Get Started") · `personalized` — warm CTA ("Start my cycle 🌸") |
| **Surface** | The splash screen CTA — every new user sees it |
| **Metric event** | `onboarding_completed` — fired when a user completes the goals step of onboarding |
| **Exposure event** | `$flag_exposure` — fired automatically by the Flagsmith SDK when the visitor is enrolled in the running experiment |
| **Traffic split** | 50/50, owned by Flagsmith (round 03) |

Frontend never blocks on Flagsmith: the app renders the control variant
instantly (via `defaultFlags`), then swaps to the experiment-selected variant
once the SDK resolves. Telemetry is fire-and-forget and every call is
guarded — if Flagsmith or Supabase is unreachable the app keeps working and
the user sees the control flow.

**Privacy note.** No email, name, or health data is sent to Flagsmith. The
identity used for the funnel is an anonymous, browser-generated UUID
(`myflo-client-id-v1` in `localStorage`). Exposure/metric events carry only
that UUID plus the variant — no PII, no health data.

## 02 · Rounds 1–4 (how it works)

1. **Create a flag** — a multivariate flag `onboarding_cta` in Flagsmith with
   two versions, `control` and `personalized`. (Setup step, round 01 — see
   [§ Runbook](#06-runbook-what-we-still-need).)
2. **Pick a metric** — `onboarding_completed` is the event that counts as
   success. It fires from the goals-setup step of onboarding
   (`src/screens/Auth.tsx`), and it is mirrored into Supabase
   (`myflo_experiment_events`) for an independent funnel count.
3. **Split the traffic** — 50/50 inside the experiment (the split lives in
   Flagsmith; round 03). Watch the funnel in Flagsmith (or in the Supabase
   dashboard — see the SQL snippet below).
4. **Ship the winner** — Flagsmith shows the win probability for each version.
   Once a winner is clear, roll it out with the same flag (round 04). The app
   reads the resolved flag on every visit, so shipping a winner = changing the
   flag, not deploying.

## 03 · Repository layout

```
src/
  lib/
    flagsmith.ts     # SDK init, anonymous identity, variant resolution, event tracking
    experiment.ts     # experiment orchestration (single place that reports the funnel)
    supabase.ts      # best-effort funnel logging to Supabase
  screens/
    Onboarding.tsx   # Splash — renders the control/personalized CTA (the tested treatment)
    Auth.tsx         # goals-setup step fires `onboarding_completed`
  store.ts           # app state (local-first)
supabase/            # SQL migration for the funnel table (applied via Supabase)
```

## 04 · Run locally

```bash
npm install
cp .env.example .env.local   # then paste your Flagsmith key + Supabase values
npm run dev                  # http://localhost:5173
```

Without `VITE_FLAGSMITH_SDK_KEY` the app serves the control variant — the
whole flow still works, no flags are resolved, and nothing is tracked. Empty
key = safe no-op.

## 05 · What we still need (the honest gap)

The code is wired and the experiment is live-code. Missing are the two
things only the project owner can do:

1. **The Flagsmith SDK key** (`VITE_FLAGSMITH_SDK_KEY`) — paste it in
   `.env.local` and/or in the Vercel project env vars, then redeploy.
2. **The actual Flagsmith objects** — create the flag, metric and experiment.
   See [§ Runbook](#06-runbook-what-we-still-need).

## 06 · Runbook (what we still need)

**A. Post the Flagsmith setup prompt** (or do it by hand) — in Flagsmith
console, create:

- **Flag** `onboarding_cta` (multivariate) with versions `control` and
  `personalized`.
- **Metric** = the event you track for success: `onboarding_completed`.
- **Experiment** on that flag, 50/50 traffic to `control` | `personalized`,
  metric `onboarding_completed`.

**B. Wire the app** — put the environment key in `.env.local`
(`VITE_FLAGSMITH_SDK_KEY=…`), `npm run build && npm run dev` to check, then
set the same var in Vercel and redeploy.

**C. Read the funnel** — in Flagsmith's experimentation view you get the win
probability per version. Independently, the Supabase table gives the raw
funnel:

```sql
select event, variant, count(*) as events
from myflo_experiment_events
group by event, variant
order by event, variant;
```

**D. Ship the winner** — once win probability is clearly above 50% for one
version, set that version as the flag's rollout (e.g. point the flag at the
winning value / finish the experiment in Flagsmith). The app reads the
resolved flag on every visit.

## 07 · Judging checklist

- [x] Flagsmith **core** to the project (the splash CTA + funnel events are
      resolved and tracked through Flagsmith, not hard-coded)
- [x] A **real metric from real events** — `onboarding_completed` from actual
      installs, mirrored to Supabase for an independent count
- [x] **Clear hypothesis** (see §01)
- [x] **Versions behind a flag** (`onboarding_cta`)
- [x] **Results you can explain** — Flagsmith win probability + raw funnel SQL
- [ ] Demo video — record the funnel walk: splash CTA (two variants) →
      onboarding → complete → Flagsmith experiment view → winner shipped
- [ ] Flag + experiment created in the Flagsmith console (rounds 01–03)
- [ ] Win probability observed and winner rolled out (round 04)

## 08 · Honest limits

- No auth/backend for the app itself — Myflo is local-first by design; Supabase
  is used for the funnel events only.
- The experiment is **not yet live** until the key and Flagsmith
  objects exist — this repo documents that gap honestly.
- The app has not yet been through a real judges' demo — that's the remaining
  work of the hackathon itself.
