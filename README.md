# Finance Tracker

> A real-time personal finance tracker for Kenya, built around manual income and expense logging, with M-Pesa integration in progress.

Finance Tracker lets a user log their income and expenses manually, then instantly see their spending broken down by category on a live dashboard. The M-Pesa side of the project (automatic deposits and withdrawals) exists in the codebase but isn't wired up to real Safaricom credentials yet, that part is still in progress.

## What it does today

- **Manual transaction entry.** Add, edit, or delete income and expense entries.
- **Automatic calculation.** Totals and balances update instantly as soon as a transaction is entered, no manual math.
- **Spending breakdown.** A pie chart showing where money is actually going, by category.
- **Real-time dashboard.** Powered by Supabase Realtime, so changes reflect instantly without a page refresh.
- **Authentication.** Secure login and signup via Supabase Auth, with Row Level Security so each user only sees their own data.

## What's planned but not working yet

- **Live M-Pesa deposits and withdrawals.** API route files for STK push and B2C transfers already exist in the codebase (`/api/mpesa/push`, `/api/mpesa/callback`, `/api/mpesa/withdraw`, `/api/mpesa/b2c-result`), but they aren't connected to real Safaricom Daraja credentials yet. Daraja requires business verification and a tested callback URL, which is the next step.
- Once wired up, the intended flow is: user clicks "Sync Live M-Pesa," an STK push goes to their phone, they enter their PIN, Safaricom calls back with the result, and the transaction saves automatically, no manual entry needed.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 16 + React 19 | App Router for the dashboard and auth pages |
| Database | Supabase (Postgres) | Realtime subscriptions meant transactions could appear live without building a websocket layer myself |
| Auth | Supabase Auth | Built-in login/signup with Row Level Security, so each user's data stays isolated |
| Charts | Recharts | Spending breakdown visualization |
| Payments (in progress) | Safaricom M-Pesa Daraja API | Planned for automatic deposit/withdrawal tracking, not yet connected |
| Secondary backend | Python (FastAPI) | A separate service intended to handle part of the M-Pesa integration logic outside the main Next.js app |
| Local tunneling | ngrok | Needed during development so Safaricom's servers could reach a local callback URL, once that integration is live |

## Project structure

```
src/
├── app/
│   ├── api/mpesa/                 # M-Pesa routes (not yet connected to live credentials)
│   │   ├── push/route.ts
│   │   ├── callback/route.ts
│   │   ├── withdraw/route.ts
│   │   └── b2c-result/route.ts
│   ├── login/page.tsx
│   └── page.tsx                   # Main dashboard
├── components/
│   ├── TransactionForm.tsx        # Manual entry form, the part that actually works today
│   └── SpendingChart.tsx
├── lib/supabase.ts
└── types/index.ts

mpesa-backend/
└── main.py                        # FastAPI service, not yet connected to live Daraja credentials
```

## Getting started

```bash
git clone https://github.com/<your-username>/Finance-Tracker.git
cd Finance-Tracker
npm install
```

### Environment variables

Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

The M-Pesa-related variables below are scaffolded in the code but not required to run the app today, since that integration isn't live yet:

```
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PASSKEY=
MPESA_INITIATOR_NAME=
MPESA_INITIATOR_PASSWORD=
NEXT_PUBLIC_NGROK_URL=
```

### Supabase setup

Create a `transactions` table, enable Realtime on it, and enable Row Level Security so each user can only access their own rows.

### Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Security notes

- `.env.local` is already in `.gitignore` and should never be committed.
- `SUPABASE_SERVICE_ROLE_KEY` is only ever used server-side, never exposed to the browser.
- Row Level Security at the database level means even if the frontend had a bug, users still couldn't read each other's data.

## What I'd improve next

- **Finish the M-Pesa integration.** This means completing Safaricom Daraja business verification, wiring up real credentials, and testing the STK push and callback flow end-to-end.
- **Consolidate the backend.** Right now the M-Pesa scaffolding is split across a Next.js app and a separate Python FastAPI service. Once the integration is live, deciding on one backend would simplify deployment.
- **Add budget goals and alerts**, not just historical spending breakdown.

---

Built by Ruby Kituli
