# Record the real Myflo screens (for the final Apple-style video)

**Why:** `video/myflo-track01-demo-video-v2.mp4` shows the app as styled/schematic mockups — premium, honest ("Schematic in-app view — real app screens not shown"), but it is NOT a recording. To make the *final* Apple-style product film, record real screens yourself.

**What you need:** a screen recorder on your machine — Cmd+Shift+5 (Mac), Win+Alt+R (Windows), or any recorder. The deployed app: `https://flowra.vercel.app` (or the preview from branch `arena/c76a8c36-flowra`).

## Recording shots (in order, ~8-9 segments, 4-7s each)

1. **Cold open** — close the app window, then open it. Splash screen ("Get Started" / "Start my cycle" CTA visible).
2. **Funnel** — tap the CTA → "Understand Your Cycle" → "Set Your Goals".
3. **Home** — "You are doing well" + mascot heart card + cycle ring.
4. **Insights** — chart bars + calendar + insights headline.
5. **Nutrition** — food cards (chicken bowl ↔ oatmeal).
6. **History** — cycle history list.
7. **Settings** — Privacy → Export my data → Delete all my data (do NOT actually delete) → Exploration mode (tap it to show the floating screen selector).
8. **Experiment** — leave it showing the honest live state (real data pending — do not fake numbers).

## Package to send me

- File: **one MP4** (screen-recorded, 1280×720 minimum, 30fps+, no audio or ambient audio only).
- Name it: `video/myflo-screen-recording.mp4` (or give me the path).
- That's it — I'll splice it with cinematic pacing, staggered feature highlights, narration and text overlays to make the final Apple-style film.

## Honest limits
- Do NOT record fake/fabricated data. Screen real states: "Real data pending" is the honest default while the experiment collects real users.
- Leave the 🧪 DEMO badge visible if you use the dev override (`?variant=variant_b`) — it proves the warm CTA is deliberate.
- The A/B split of the CTA depends on what Flagsmith resolves — record the CTA as it appears; if you want the warm CTA in the video, use the dev override (`?variant=variant_b`) and keep the badge visible.
