# Traffic Kit — real humans only (no bots, ever)

Assets:
- Share card (1200×630): `docs/share-card.png`
- QR code → https://flowra-amber.vercel.app : `docs/qr-myflo.png`
- Demo video (schematic cut): `video/myflo-track01-demo-video-v2.mp4`

Rules while sharing:
- Only real people on their own devices. No bots, no paid clicks, no self-clicks
  (except the one disclosed verification run).
- Never promise rewards for clicking — incentivized traffic biases the metric.
- Experiment window: 2026-11-22 → 2026-11-29 UTC. Do not stop early.

---

## 1) Flagsmith community / hackathon channel
**Title:** Live for Toggle Wars Track 01: a real onboarding CTA experiment inside Myflo

Body:
> Built for Track 01 (Test Something Real): Myflo, a cycle-tracking PWA, now runs a
> live multivariate experiment in production via Flagsmith Experimentation.
> Flag `experiment_ab_test` splits new anonymous visitors 50/50 between a neutral
> splash CTA ("Get Started") and a warm one ("Start my cycle 🌸"); completing the
> goals-setup step fires the conversion metric `experiment_conversion_metric`, and
> every funnel event is mirrored to a PII-free Supabase table for independent audit.
> No simulated traffic anywhere — the win probability will be whatever real users
> decide. Try it yourself: https://flowra-amber.vercel.app
> Repo: https://github.com/nikhilnikhil4331/flowra

## 2) X / Twitter thread
**Tweet 1:**
> I shipped a REAL A/B test to production for @Flagsmith's Toggle Wars (Track 01:
> Test Something Real). My cycle-tracking PWA Myflo now asks new visitors one of two
> questions: "Get Started" vs "Start my cycle 🌸". Real users, real conversions,
> 50/50 split, zero simulated traffic. Try it: https://flowra-amber.vercel.app 🧵
**Tweet 2:**
> The honest part: no fake-traffic button exists in the codebase. Exposures come from
> Flagsmith's $flag_exposure on anonymous UUID identities; conversions fire only when
> a human finishes the goals step. A PII-free Supabase table mirrors every event so
> the funnel can be audited outside Flagsmith.
**Tweet 3:**
> The experiment runs 22–29 Nov. Whatever the win probability says on the 29th IS the
> result — even if it's "no difference". That's the point of testing something real.
> Repo: https://github.com/nikhilnikhil4331/flowra
(attach `docs/share-card.png` to tweet 1)

## 3) LinkedIn
> Most A/B tests in hackathon demos are theatre. Ours isn't.
> For Toggle Wars Track 01 ("Test Something Real"), my cycle-tracking PWA Myflo is
> running a live experiment in production: new visitors are split 50/50 by Flagsmith
> Experimentation between a neutral onboarding CTA and a warm, benefit-led one.
> Conversions are real onboarding completions by real anonymous users, mirrored to a
> PII-free audit table in Supabase. There is no simulate-traffic button — by design.
> If you're curious (or know someone building onboarding flows), try it and tell me
> which CTA you got: https://flowra-amber.vercel.app
> The experiment window closes 29 Nov; I'll publish the honest result either way.

## 4) Reddit — r/SideProject (check self-promo rules first)
**Title:** I put my period-tracking PWA into a live A/B test: "Get Started" vs "Start my cycle 🌸" — real users only, results published either way
**Body:**
> Hey all — built Myflo, a cycle-tracking PWA (React + Vite + Supabase), and for the
> Flagsmith Toggle Wars hackathon (Track 01: Test Something Real) it's now running a
> real experiment in production: the splash CTA is a multivariate flag split 50/50
> between neutral and warm copy. Conversion = finishing the goals-setup step of
> onboarding. Every funnel event is also mirrored to an anonymous, insert-only
> Supabase table so the numbers can be audited independently.
> No bots, no simulated clicks — the dashboard shows exactly what real visitors do.
> Window: 22–29 Nov, then I publish the result even if it's "no difference".
> Live: https://flowra-amber.vercel.app · Repo: https://github.com/nikhilnikhil4331/flowra
> Happy to share the SDK wiring details if anyone's building their first experiment.

## 5) Indie Hackers — post intro
> Running a live A/B test on my cycle-tracking PWA: neutral CTA vs warm CTA, split
> 50/50 by Flagsmith, conversions = real onboarding completions, audited by a
> PII-free Supabase mirror. Built for Toggle Wars Track 01. I'll post the honest
> outcome on 29 Nov, whatever it is. Try it: https://flowra-amber.vercel.app

## 6) WhatsApp forward (short)
> Quick favour 🙏 I built Myflo (cycle-tracking app) and it's in a live A/B test for a
> hackathon: open https://flowra-amber.vercel.app on your phone, tap the first button
> you see, and finish the 30-second setup. That's it — your tap is real experiment
> data. Tell me which button text you saw 🙂 (QR: docs/qr-myflo.png)

## 7) Email draft (gmail) — send only to people who'd genuinely try it
**Subject:** 30 seconds of real help: my app is in a live A/B test
**Body:**
> Hi <name>,
> I'm competing in Flagsmith's Toggle Wars hackathon with Myflo, a cycle-tracking
> web app. It's running a real experiment: new visitors see one of two onboarding
> buttons, and finishing the 30-second setup counts as a conversion. No bots allowed —
> real people only, which is why I'm asking you 🙂
> If you can spare half a minute: open https://flowra-amber.vercel.app on your phone,
> tap through the setup, and tell me which button text you saw first.
> Results get published on 29 Nov either way. Thank you!
> — Nikhil

---

## Posting checklist
- [ ] Flagsmith community/hackathon channel
- [ ] X thread (card attached)
- [ ] LinkedIn
- [ ] r/SideProject (+ r/webdev if rules allow)
- [ ] Indie Hackers
- [ ] WhatsApp circle (QR image)
- [ ] 5–10 personal emails/DMs to friends who'll actually try it
- [ ] Daily: check Experiments tab; ask the agent for "numbers nikaalo" anytime
