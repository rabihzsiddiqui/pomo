# pomodoRo.

a clean, keyboard-first pomodoro timer that runs entirely in the browser.

---

## features

- **circular countdown ring** — SVG progress visualization, color-coded by phase
- **three-phase cycle** — focus (25m), short break (5m), long break (15m) after every 4 sessions
- **configurable durations** — adjust all three intervals from the settings panel
- **session tracking** — daily completed sessions stored in localStorage
- **keyboard shortcuts** — `space` start/pause, `r` reset, `s` skip to next phase
- **dynamic favicon** — the tab icon mirrors the ring progress in real time
- **audio chime** — optional sound cue on phase transition
- **browser notifications** — optional system notification when a phase ends
- **zero dependencies** — no state libraries, no animation libraries, no backend

---

## tech stack

| layer       | choice                          |
|-------------|---------------------------------|
| framework   | Next.js 16 (App Router)         |
| language    | TypeScript (strict)             |
| styling     | Tailwind CSS v4                 |
| font        | Geist (via next/font/google)    |
| testing     | Vitest + Testing Library        |
| persistence | localStorage (no server needed) |

---

## local dev

```bash
npm install
npm run dev
```

open [http://localhost:3000](http://localhost:3000).

```bash
npm run test       # run tests once
npm run test:watch # watch mode
npm run build      # production build
npm run lint       # lint check
```

no environment variables required. this is fully client-side.

---

## design rationale

### circular visualization

a circle maps intuitively to the concept of time running out. the arc depletes as the session progresses, giving an at-a-glance sense of urgency without forcing you to read numbers. the ring also reflects into the favicon, so the timer stays visible even when the tab is backgrounded.

### keyboard-first interaction

reaching for the mouse breaks focus. three keys cover the entire control surface: start/pause, reset, and skip. all actions are reachable without looking away from your work.

### localStorage persistence

session data needs to survive page refreshes but has no reason to live on a server. localStorage is synchronous, zero-latency, and requires no auth. settings and session counts are stored independently so clearing one does not wipe the other.

### no external state libraries

the timer's core state fits cleanly into a single `usePomodoro` hook. adding a state library would mean more surface area, more indirection, and more to debug. the interval runs in a `useRef` to avoid stale closure bugs — a pattern worth knowing if you use `setInterval` in React.

---

## open graph image concept

> for reference when generating the OG preview image.

- **background:** `#09090b` (zinc-950)
- **focal element:** large SVG ring, amber-500 arc on zinc-700 track, roughly 60% full
- **inside ring:** `25:00` in Geist, white, large, semibold
- **below ring:** `pomodoRo.` wordmark in white with amber period, text-2xl
- **tagline:** `focus. rest. repeat.` in zinc-400, small, centered
- no gradients, no decorative shapes — the ring is the only visual anchor
- **dimensions:** 1200x630, ring centered slightly above vertical midpoint
