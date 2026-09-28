# Sovereign OS

A private, local-first personal operating system for tracking your inner and outer life — journaling, daily planning, goals, finances, and mindset work — all in one dashboard. No account, no server, no tracking: everything lives in your own browser.

> "Your mind, your data, your sovereignty."

## Features

| Page | What it does |
|---|---|
| **Dashboard** | Daily overview — today's journal snapshot, a mood slider, a task-completion toggle, a journaling streak badge, and a 30-day activity heatmap. |
| **Journal** | Free-form writing, a mood + emotion + energy check-in, guided reflection prompts (Self-Reflection, Gratitude, CBT, Goal Alignment, Shadow Work, Future Self), a CBT thought record, gratitude & wins, and a goal-alignment note. A **Recall a Day** panel at the bottom lets you pick any past date and see that day's journal entry and hourly timeline together. Full entry history is browsable on a separate **History** page with search and tag filters. |
| **Work & Projects** | A kanban board (To Do / In Progress / Done) with a built-in Pomodoro timer, split into five life-area tabs — Office, Self Development, Chores, Study Targets, and Other Projects — each tracked independently. |
| **Daily Timeline** | An hour-by-hour log of your day. Each hour has a **Planned** side (tag + note, set in advance) and an **Actual** side (tag + note + mood, filled in at the end of the hour), with a running "hours matched" comparison between plan and reality. Navigate to any past or future day. |
| **Integral Audit** | A 4-step daily check-in across Body (sleep, energy, morning routine), Mind (learnings, blockers, deep work), Spirit (gratitude, flow), and Shadow (triggers, shadow work). |
| **Finances** | A simple income/expense ledger with running income, expense, and net totals. |
| **Wealth Architect** | The full net-worth picture: bank accounts (opening vs. current balance), investments (Equity / Mutual Fund / Fixed Deposit / Other) tagged by time horizon — **Safety Net** (liquid, targeted at 6 months of expenses), **Short Term** (6 months–3 years), **Long Term** (3+ years) — a Splitwise-style receivable/payable tracker for money owed to or by you, loan/EMI tracking with upcoming due dates, and an expense log. Auto-syncs with the Finances ledger. |
| **Goals** | A nested year → month → week goal tree with sub-goals, completion tracking, and a progress bar. Shows a live preview of today's journal goal-reflection. |
| **Success Accelerator** | A structured goal-setting workflow (Define → Deadline → The Why → Obstacles → Skills → People → Master Plan) that auto-generates an action checklist from your inputs. |
| **Affirmations** | A curated affirmation library with favorites and scheduling, a wizard to turn a limiting belief into a present-tense affirmation, and a guided mental-rehearsal timer with a background tone. Tracks a morning/evening practice streak. |
| **Vision Board** | An image board for visual inspiration, stored locally. |
| **Settings** | Export all your data (including Vision Board images) to a single JSON backup file, import it back, or wipe everything and start fresh. |

## Data & privacy

Sovereign OS has no backend. Everything is stored directly in your browser:

- Most data lives in `localStorage`, namespaced per day/category (e.g. `journal-2026-09-28-...`, `timeline-2026-09-28`, `work-tasks-office`).
- Vision Board images are stored in IndexedDB (via `idb-keyval`), since `localStorage` isn't suited to binary blobs.
- Nothing ever leaves your machine unless you explicitly export a backup from Settings.

Because of this, data is tied to a single browser profile — export a backup before clearing site data, switching browsers, or moving devices.

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
- [React Router](https://reactrouter.com/) for client-side navigation
- [Tailwind CSS](https://tailwindcss.com/) for styling, with a custom dark glassmorphism theme
- [Recharts](https://recharts.org/) for the Wealth Architect charts
- [idb-keyval](https://github.com/jakearchibald/idb-keyval) for image storage
- [lucide-react](https://lucide.dev/) for icons

## Getting started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

Other scripts:

```bash
npm run build    # type-check and build for production
npm run preview  # preview the production build locally
npm run lint     # run ESLint
```

## Project structure

```
src/
  components/     Layout (sidebar nav) and shared UI (TaskBoard)
  pages/          One component per route (see the feature table above)
  lib/            Shared helpers: local-date utilities, journal/timeline
                  readers, shared types, image storage, journal prompt data
  hooks/          usePersistentStore — a localStorage-backed useState
```
