# Sovereign OS

A private personal operating system for tracking your inner and outer life — journaling, daily planning, goals, finances, and mindset work — all in one dashboard. Sign in with your own account and your data follows you across devices, isolated from every other user.

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
| **Vision Board** | An image board for visual inspiration. |
| **Settings** | Export all your data (including Vision Board images) to a single JSON backup file, import it back, or wipe everything and start fresh. |

## Accounts & data

Sovereign OS uses [Supabase](https://supabase.com/) for authentication and storage:

- Sign up with email + password. Every page's data (journal entries, tasks, goals, finances, etc.) is stored in a single `user_data` table, scoped to your account with Row Level Security — no other user can ever read or write your rows.
- Vision Board images go into a private Supabase Storage bucket, one folder per user.
- Data loads once on sign-in into an in-memory cache so the app feels instant, and writes sync to the cloud in the background (debounced, so typing doesn't spam the network).
- Settings still has full Export/Import to a local JSON file for offline backups, independent of the cloud sync.
- If you used Sovereign OS before accounts existed and still have data in this browser, the app offers a one-time "Import your existing data" prompt right after your first sign-in.

### Cloud sync setup

The app needs a Supabase project to run. To set one up:

1. Create a free project at [supabase.com](https://supabase.com/).
2. In the Supabase SQL editor, run:
   ```sql
   create table user_data (
     user_id uuid references auth.users(id) on delete cascade,
     key text not null,
     value text not null,
     updated_at timestamptz not null default now(),
     primary key (user_id, key)
   );
   alter table user_data enable row level security;
   create policy "Users manage their own data" on user_data
     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
   ```
3. In Storage, create a **private** bucket named `vision-images`, then add a policy scoping access to `(storage.foldername(name))[1] = auth.uid()::text` for all operations.
4. In Project Settings → API, copy the **Project URL** and **anon/public key**.
5. Create a `.env` file in the project root (never committed — see `.gitignore`):
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
   The anon key is safe to expose in a public repo or client bundle — Row Level Security is what actually protects the data, not secrecy of that key.
6. For a deployed instance (e.g. Vercel), add the same two variables under Project Settings → Environment Variables, then redeploy.

Without these set, the app shows a "Cloud sync isn't configured yet" screen instead of the login form.

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
- [React Router](https://reactrouter.com/) for client-side navigation
- [Supabase](https://supabase.com/) for auth, database, and file storage
- [Tailwind CSS](https://tailwindcss.com/) for styling, with a custom dark glassmorphism theme
- [Recharts](https://recharts.org/) for the Wealth Architect charts
- [lucide-react](https://lucide.dev/) for icons

## Getting started

```bash
npm install
npm run dev
```

Complete the [Cloud sync setup](#cloud-sync-setup) above first, or you'll just see a setup notice instead of the app. Once configured, it runs at `http://localhost:5173`.

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
  pages/          One component per route (see the feature table above), plus Login
  context/        AuthContext — Supabase session state
  lib/            Shared helpers: Supabase client, cloudStorage (the
                  localStorage-shaped cloud adapter), local-date utilities,
                  journal/timeline readers, shared types, image storage
  hooks/          usePersistentStore — a cloudStorage-backed useState
```
