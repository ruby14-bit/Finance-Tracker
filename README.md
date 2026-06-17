# Finance Tracker
> A real-time personal finance tracker for Kenya, with live M-Pesa deposits and withdrawals built directly into the app.

Finance Tracker lets a user see their actual M-Pesa transactions update live on a dashboard, without manually entering anything. A payment prompt goes to the user's phone, they enter their PIN, and the transaction appears on screen within seconds via Supabase's realtime layer.

## What it does

- **Live M-Pesa deposits.** Trigger an STK push (the PIN prompt you get on your phone) directly from the app.
- **Live M-Pesa withdrawals.** Send money from the app back to a phone number using Safaricom's B2C API.
- **Real-time dashboard.** Transactions appear instantly with no page refresh, powered by Supabase Realtime.
- **Manual transaction entry.** Add, edit, or delete transactions that didn't come through M-Pesa.
- **Spending breakdown.** A pie chart showing where money is actually going by category.
- **Authentication.** Secure login and signup via Supabase Auth, with Row Level Security so each user only sees their own data.

## How the M-Pesa flow works

1. User clicks "Sync Live M-Pesa" on the dashboard.
2. An STK push is sent to their phone (the Safaricom PIN prompt).
3. User enters their M-Pesa PIN.
4. Safaricom calls back to `/api/mpesa/callback` with the result.
5. The transaction is saved to Supabase.
6. The realtime listener updates the UI instantly, with no refresh needed.

Withdrawals follow the same pattern using Safaricom's B2C API instead.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 16 + React 19 | App Router for the dashboard and auth pages |
| Database | Supabase (Postgres) | Realtime subscriptions meant transactions could appear live without building a websocket layer myself |
| Auth | Supabase Auth | Built-in login/signup with Row Level Security, so each user's data stays isolated |
| Charts | Recharts | Spending breakdown visualization |
| Payments | Safaricom M-Pesa Daraja API | Real STK push and B2C transfers, the actual payment rails used in Kenya |
| Secondary backend | Python (FastAPI) | A separate service for handling parts of the M-Pesa integration logic outside the main Next.js app |
| Local tunneling | ngrok | Required during development so Safaricom's servers can reach a local callback URL |

## Project structure

```
src/
├── app/
│   ├── api/mpesa/
│   │   ├── push/route.ts          # Initiates the STK push
│   │   ├── callback/route.ts      # Receives the deposit result from Safaricom
│   │   ├── withdraw/route.ts      # Initiates a B2C withdrawal
│   │   └── b2c-result/route.ts    # Receives the withdrawal result
│   ├── login/page.tsx
│   └── page.tsx                   # Main dashboard
├── components/
│   ├── TransactionForm.tsx
│   └── SpendingChart.tsx
├── lib/supabase.ts
└── types/index.ts

mpesa-backend/
└── main.py                        # FastAPI service handling part of the Daraja integration
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

### Local M-Pesa testing

Safaricom needs a public URL to send callbacks to, so during development:

```bash
ngrok http 3000
```

Copy the HTTPS URL it gives you into `NEXT_PUBLIC_NGROK_URL`.

### Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Security notes

- `.env.local` is already in `.gitignore` and should never be committed.
- `SUPABASE_SERVICE_ROLE_KEY` is only ever used server-side, inside API routes, never exposed to the browser.
- Row Level Security at the database level means even if the frontend had a bug, users still couldn't read each other's data.

## What I'd improve next

- **Move all M-Pesa logic into the Next.js API routes.** Right now the integration is split across a Next.js app and a separate Python FastAPI service, which adds deployment complexity. Consolidating would simplify hosting.
- **Replace ngrok with a permanent webhook URL** once deployed, since ngrok is only meant for local development.
- **Add budget goals and alerts**, not just historical spending breakdown.

---

Built by Ruby Kituli
