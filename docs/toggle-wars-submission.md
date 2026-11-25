# Toggle Wars · Track 01 — Test Something Real
## Entry: Myflo × Flagsmith — "Does a warmer onboarding CTA convert better?"

**Status: LIVE experiment (launched 2026-11-22, Flagsmith Production, status Running).**
This document is the submission writeup draft. Numbers below are real and timestamped;
placeholders marked `[screenshot]` get filled once results accumulate.

---

## Links
- **Live app (production):** https://flowra-amber.vercel.app
- **Source:** https://github.com/nikhilnikhil4331/flowra (branch `arena/c76a8c36-flowra`)
- **Demo video (schematic cut, honestly labeled):** `video/myflo-track01-demo-video-v2.mp4` in repo
- **Final video (real screen recordings):** in production — see `docs/screen-recording-checklist.md`
- **Independent audit DB:** Supabase `myflo_experiment_events` (anonymous, insert-only for clients)

## One-paragraph pitch
Myflo is a cycle-tracking PWA. For Toggle Wars Track 01 we did not simulate anything:
we shipped a real multivariate experiment into production. New visitors get an anonymous
UUID identity; Flagsmith resolves one of two splash CTAs — control `variant_a`
("Get Started") or treatment `variant_b` ("Start my cycle 🌸") — at a 50/50 split.
Completing the goals-setup step of onboarding fires the conversion metric
`experiment_conversion_metric` through the Flagsmith SDK, and every funnel event is
mirrored to a PII-free Supabase table so the funnel can be audited independently of
Flagsmith. No synthetic traffic, no fabricated dashboards: the win probability you see
is computed from real humans clicking real buttons.

## Hypothesis (as registered in Flagsmith)
> Replacing the neutral splash CTA ("Get Started") with warm, benefit-led copy
> ("Start my cycle 🌸") will increase the onboarding completion rate (goals-setup
> completed) for new anonymous users during the experiment window.

## What is real (architecture)
| Piece | Reality |
|---|---|
| Flag | `experiment_ab_test`, multivariate, values `variant_a` / `variant_b`, 50/50 |
| Experiment | "Myflo onboarding CTA — warm vs neutral", Flagsmith Production, **Running** |
| Primary metric | `Onboarding completed (goals setup)` = event `experiment_conversion_metric`, occurrence, higher-is-better |
| SDK wiring | `@flagsmith/flagsmith`, `enableEvents: true`, identity = browser UUID (`myflo-client-id-v1`); `getExperimentFlag()` records `$flag_exposure`; `trackEvent()` fires the metric |
| Fallback honesty | App renders `variant_a` instantly via `defaultFlags` and never blocks UI on Flagsmith; a dev-only `?variant=` override exists for filming and is DEV-gated + badged + telemetry-silent |
| Independent audit | Supabase `public.myflo_experiment_events` (event, client_id, variant, t); RLS: anon can INSERT only |
| Privacy | No email/name/health data in any event; anonymous UUIDs only |

## Live results (real, timestamped)
Pipeline verification (author test runs, **pre-launch**, kept for transparency):

| Event | variant_a | variant_b |
|---|---|---|
| CTA clicked (`experiment_conversion_started`) | 1 @ 2026-11-22 08:24:57 UTC | 1 @ 2026-11-22 10:08:02 UTC |
| Conversion (`experiment_conversion_metric`) | 1 @ 2026-11-22 08:25:06 UTC | 1 @ 2026-11-22 10:08:06 UTC |

Post-launch (real public traffic, accumulating since 2026-11-22 launch):
`[screenshot: Flagsmith experiment results — exposures, conversions, win probability]`
`[table: Supabase counts at submission time]`

Timeline: experiment went live **2026-11-22** (build week, disclosed); the hackathon's
judged window is **2026-11-26 → 2026-11-29** (Toggle Wars dates). Results snapshot is
taken at submission time on 29 Nov; no early stopping on peeked results.

## Honest limitations (we say these out loud)
- Sample size at submission time is small; if the credible interval is wide, we report
  it as wide instead of declaring a winner.
- The author's own verification runs exist (marked above); they are real user actions,
  not synthetic events, and are disclosed.
- The demo video's in-app visuals are **schematic and labeled as such**
  ("Schematic in-app view — real app screens not shown"); the final cut will use real
  screen recordings per `docs/screen-recording-checklist.md`.
- Nothing in any dashboard was ever simulated: there is no fake-traffic button in the
  codebase, by design.

## Reproduction runbook (judge-friendly)
1. Open https://flowra-amber.vercel.app in incognito → note the splash CTA copy.
2. Complete onboarding to the goals step → a conversion event fires.
3. Flagsmith → Production → Experiments → "Myflo onboarding CTA — warm vs neutral":
   exposure + conversion appear for the served variant.
4. Supabase → `select event, variant, count(*) from myflo_experiment_events group by 1,2;`
   shows the independent mirror.
5. Code tour: `src/lib/flagsmith.ts` (SDK + exposure/metric), `src/lib/experiment.ts`
   (funnel orchestration + DEV-gated filming override), `src/lib/supabase.ts` (audit),
   `supabase/myflo_experiment_events.sql` (schema + RLS).

## Submission checklist
- [x] Real experiment running in production (Flagsmith Experimentation)
- [x] Real metric on real user actions; independent PII-free audit table
- [x] Demo video (schematic cut) + recording brief for the real-screens cut
- [x] This writeup with hypothesis, architecture, limitations
- [ ] Results screenshot + final numbers at window close (2026-11-29)
- [ ] Final Apple-style video with real screen recordings
- [ ] Submit form filled (repo + video + writeup links)
