# Myflo · Flagsmith Experimentation

Hackathon build for **Toggle Wars: The Flagsmith Experimentation Hackathon**
(WeMakeDevs, Nov 26–29, 2026) · Track 01 — **Test Something Real** · Team **Niknote**

Myflo is a local-first, mobile-first women's health companion (cycle tracking,
symptoms, nutrition, reminders, insights). This repository is the hackathon
project: a real, live **Flagsmith Experimentation** A/B test running inside the
app.

## 🚩 Flagsmith Experimentation (Toggle Wars Hackathon)

**Track 01 — Test Something Real.** Team Niknote. This is the flagship experiment in the app.

**Hypothesis.** A warm, personalized onboarding CTA converts more new users
into the onboarding funnel than the generic "Get Started" CTA.

| | |
|---|---|
| **Flag Key** | `experiment_ab_test` (multivariate) |
| **Variant A (control)** | The existing CTA — "Get Started" (+ "Your story begins here") |
| **Variant B** | The optimized, warm CTA — "Start my cycle 🌸" (+ "A gentle start to your routine") |
| **Surface** | Splash screen CTA — every new visitor sees it |
| **Metric** | `experiment_conversion_metric` — fired when a user completes the goals step of onboarding (the conversion event) |
| **Exposure** | `$flag_exposure` — fired by the Flagsmith SDK, only when the identity is enrolled in the running experiment |
| **Traffic split** | 50/50 — created in Flagsmith (round 03), owned by Flagsmith |
| **Win probability** | Shown in Flagsmith's experiment view (round 04) |

**Rounds 1–4:**

1. **Create the flag** — multivariate `experiment_ab_test` with versions `variant_a` and `variant_b`.
2. **Pick the metric** — `experiment_conversion_metric`, tracked from real user actions (the goals-setup step in `src/screens/Auth.tsx`).
3. **Split the traffic** — 50/50 inside the experiment in Flagsmith (round 03).
4. **Ship the winner** — once win probability is clearly above 50% for one version, roll it out with the same flag (round 04). The app resolves the flag on every visit — shipping = changing the flag, not a redeploy.

**Privacy.** No email, name, or health data is sent to Flagsmith or Supabase.
The identity used for the funnel is an anonymous, browser-generated UUID.
Funnel events carry only that UUID plus the resolved variant.

**What is NOT simulated.** No synthetic events, no forced clicks, no
fabricated statistics. The experiment is real; the dashboard reflects real
onboarding completions only. A dev-only forced-variant override exists so
both variants can be seen (and filmed for the demo video) locally — see
below — but it sends no telemetry and cannot pollute the experiment.

### Running both variants locally

```bash
npm install
npm run dev
```

Without a Flagsmith key the app serves the control variant (`variant_a`) and the
whole funnel still works — the app never blocks on Flagsmith.

In dev builds only, you can force a variant to see both — for recording the
demo video:

```
http://localhost:5173/?variant=variant_b
```

This forces the render locally and shows a 🧪 badge on screen — it is not
experiment data and sends **no** events. Real traffic never goes through this
override.

### Where the data lives

- **Flagsmith** — the metric + the Bayesian win probability for the experiment.
- **Supabase** (`myflo_experiment_events`) — an independent audit of the funnel
  (insert-only; no PII):

```sql
select event, variant, count(*) as events
from myflo_experiment_events
group by event, variant
order by event, variant;
```

---

## 01 · The experiment (details)

The splash CTA is the surface with the highest impact per visitor: it is the
first thing every new user sees, and it gates the entire onboarding funnel.
Holding it constant except for copy (which is exactly the tested treatment),
the thing we compare is real conversion: does a personal, warm CTA get more
people into the funnel than a generic one?

**Why this works well for Track 01:**

- One experiment, well executed — no pile of half-tested features.
- Clear hypotheses with a falsifiable win metric.
- The flag resolves on **every** visit, so a winner can be shipped by changing
  the flag — no redeploy, no architecture change.
- A metric from real events with an independent audit trail in Supabase.

**Frontend behaviour:** the app renders the control variant instantly
(`defaultFlags`), then swaps to the SDK-resolved variant once Flagsmith
resolves — Flagsmith being unreachable never breaks the app. Telemetry is
fire-and-forget and every call is guarded.

## 02 · Repository layout

```
src/
  lib/
    flagsmith.ts     # SDK init, anonymous identity, variant resolution, event tracking
    experiment.ts     # experiment orchestration (the single place the funnel is reported)
    supabase.ts      # best-effort funnel logging to Supabase
  screens/
    Onboarding.tsx   # Splash — the tested surface
    Auth.tsx         # goals-setup step fires `experiment_conversion_metric`
  store.ts           # app state (local-first)
supabase/            # SQL migration for the funnel table
```

## 03 · Run locally

```bash
npm install
cp .env.example .env.local   # then paste your Flagsmith key + Supabase values
npm run dev                  # http://localhost:5173
```

Without `VITE_FLAGSMITH_SDK_KEY` the app serves the control variant — the
whole flow still works, no flags are resolved, and nothing is tracked. Empty
key = safe no-op.

## 04 · What we still need (the honest gap)

The code is wired and the experiment is live-code. Missing are the two things
only the project owner can do:

1. **The Flagsmith environment key** (`VITE_FLAGSMITH_SDK_KEY`) — paste it in
   `.env.local` and/or in the Vercel project env vars, then redeploy.
2. **The actual Flagsmith objects** — create the flag, metric and experiment in
   the Flagsmith console (see §05).

## 05 · Runbook (what we still need)

**A. Create in the Flagsmith console:**

- **Flag** `experiment_ab_test` (multivariate) with versions `variant_a` and
  `variant_b`.
- **Metric** = `experiment_conversion_metric`.
- **Experiment** on that flag, 50/50 traffic to `variant_a` | `variant_b`,
  metric `experiment_conversion_metric`.

(Paste Flagsmith's setup prompt into a coding agent if you don't want to do
this by hand — the hackathon page links the prompt.)

**B. Wire the app** — put the environment key in `.env.local`
(`VITE_FLAGSMITH_SDK_KEY=…`), `npm run build && npm run dev` to check, then
set the same var in Vercel and redeploy.

**C. Read the funnel** — in Flagsmith's experiment view you get the win
probability per version. Independently, the Supabase table gives the raw
funnel:

```sql
select event, variant, count(*) as events
from myflo_experiment_events
group by event, variant
order by event, variant;
```

**D. Ship the winner** — once win probability is clearly above 50% for one
version, set that version as the flag's rollout (finish the experiment in
Flagsmith). The app reads the resolved flag on every visit.

## 06 · Judging checklist

- [x] Flagsmith **core** to the project (the splash CTA + funnel events are
      resolved and tracked through Flagsmith, not hard-coded)
- [x] A **real metric from real events** — `experiment_conversion_metric`
      from actual onboarding completions, mirrored to Supabase for an
      independent count
- [x] **Clear hypothesis** (see §🚩)
- [x] **Versions behind a flag** (`experiment_ab_test`)
- [x] **Results you can explain** — Flagsmith win probability + raw funnel SQL
- [ ] Demo video — record the funnel walk (splash CTA in both variants,
      onboarding, completion, Flagsmith experiment view)
- [ ] Flag + metric + experiment created in the Flagsmith console (rounds 01–03)
- [ ] Win probability observed and winner rolled out (round 04)

## 07 · Honest limits

- No auth/backend for the app itself — Myflo is local-first by design; Supabase
  is used for the funnel events only.
- The experiment is **not yet live** until the key and Flagsmith objects exist —
  this repo documents that gap honestly.
- No synthetic traffic is sent anywhere. Win probability will be meaningful
  only after real installs complete onboarding — 50/50 will still show after
  a handful of completions, but treat it until it accumulates.
- The app has not yet been through a real judges' demo — that's the remaining
  work of the hackathon itself.
