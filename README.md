# Myflo 🌸

**Your Cycle. Your Health. Your Story.**

A complete menstrual health companion recreated from the MyFlo reference design — all 27 screens, fully functional, in a responsive React web app. On desktop it presents inside a phone frame (like the reference mockups); on mobile it runs full-screen.

## Features

- **Onboarding flow** — Splash, 3 onboarding pages, Sign Up / Login (with social buttons), Profile setup (DOB, height, weight) and goal selection.
- **Home cycle wheel** — live cycle day, phase, next period, fertile window and ovulation, computed from your real logged history.
- **Calendar** — period / predicted / fertile / ovulation colour coding, day details, notes, and quick logging for any date.
- **Logging** — Log Period (dates, flow intensity, flow colour, symptoms), Log Symptoms (mood, 12 physical symptoms, pain slider, notes), Body Tracker (pain, bleeding, bloating, stress, energy).
- **Nutrition** — Food Scanner (photo upload/camera + manual search + recents), estimated nutrition result with portion scaling, and a Daily Nutrition diary with kcal / protein / iron rings.
- **Flow education** — interactive Flow Color explorer and a Flow Guide (blood colours + discharge info) with "when to consult a doctor" guidance.
- **Medicine & Care** — recommended / pain-relief catalogues, your own medicine list, add-medicine form, and medical safety disclaimers.
- **Smart Reminders** — 7 reminder types with toggles, per-reminder lead-time / time / repeat settings, and browser Notification permission support.
- **Myflo AI** — a warm, offline, cycle-aware chat companion that answers using your actual cycle data.
- **Insights & Reports** — cycle length & period duration charts, symptom frequency, monthly pain trend, mood patterns, nutrition trends.
- **Settings & privacy** — profile editing, cycle preferences, notification preferences, JSON data export, and full data deletion. Everything is stored **only in your browser** (localStorage).

Demo data is seeded after onboarding (history relative to today, so Home shows "Day 1" like the reference) — every value is editable and every chart recomputes from your real logs.

## Tech

- React 19 + TypeScript + Vite
- Tailwind CSS 3 (custom Myflo design system: Nunito + Great Vibes, blush palette, pink gradients)
- Zustand with `localStorage` persistence
- Lucide icons, date-fns
- Original watercolor mascot illustrations in `public/images/`

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
```

## Notes on the reference assets

The supplied screenshots are flattened mockups, so the original GIFs/vectors cannot be recovered from them (see `ASSET_MANIFEST.json` in the upload pack). The mascot illustrations were therefore recreated in the same watercolor style, and motion (falling petals, floating mascots, scan-line, typing dots) is provided as equivalent CSS animations. If the original Figma source becomes available, drop the exported assets into `public/images/` using the same filenames to swap them in.

Myflo provides general wellness information and is not a substitute for medical advice.
