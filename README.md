# 💜 Wallet Glow

> A beautiful, real-time personal finance tracker with M-Pesa integration  built for Kenya.

## ✨ Features

- **Real-time dashboard** — transactions update instantly via Supabase Realtime
- **M-Pesa STK Push** — trigger a payment prompt directly to your phone
- **M-Pesa B2C Withdrawal** — send money from the app back to your phone
- **Add / Edit / Delete** transactions manually
- **Spending breakdown chart** — visual pie chart of expenses by category
- **Largest expense insight** — instantly see where your money goes
- **Auth system** — secure login and sign-up via Supabase Auth
- **Glassmorphism UI** — modern, feminine design with smooth animations

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime |
| Charts | Recharts |
| Payments | Safaricom M-Pesa Daraja API |
| Tunnel | ngrok (for M-Pesa callbacks) |

---

## 🚀 Getting Started

### 1. Clone the repo

    git clone https://github.com/YOUR_USERNAME/Cashmere.git
    cd Cashmere
    npm install

### 2. Set up environment variables

Create a .env.local file in the root:

    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
    MPESA_CONSUMER_KEY=your_consumer_key
    MPESA_CONSUMER_SECRET=your_consumer_secret
    MPESA_SHORTCODE=your_shortcode
    MPESA_PASSKEY=your_passkey
    MPESA_INITIATOR_NAME=your_initiator_name
    MPESA_INITIATOR_PASSWORD=your_initiator_password
    NEXT_PUBLIC_NGROK_URL=https://your-ngrok-url.ngrok-free.app

### 3. Set up Supabase

Create a transactions table in your Supabase project and enable Realtime on it. Enable Row Level Security so users only access their own data.

### 4. Start ngrok

    ngrok http 3000

Copy the HTTPS URL and set it as NEXT_PUBLIC_NGROK_URL in .env.local.

### 5. Run the app

    npm run dev

Open http://localhost:3000

---

## 📁 Project Structure

    src/
    app/
        api/mpesa/
            push/route.ts        - STK Push
            callback/route.ts    - M-Pesa deposit callback
            withdraw/route.ts    - B2C withdrawal
            b2c-result/route.ts  - B2C result callback
        login/page.tsx           - Auth page
        page.tsx                 - Main dashboard
        layout.tsx               - Root layout
    components/
        TransactionForm.tsx      - Add/edit form
        SpendingChart.tsx        - Pie chart
    lib/supabase.ts              - Supabase client
    types/index.ts               - TypeScript types

---

## 💳 M-Pesa Flow

    User clicks Sync Live M-Pesa
        ↓
    STK Push sent to phone
        ↓
    User enters PIN
        ↓
    Safaricom hits /api/mpesa/callback
        ↓
    Transaction saved to Supabase
        ↓
    Realtime listener updates UI instantly ✨

Withdrawal flow mirrors this using the B2C API.

---

## 🔐 Security Notes

- Never commit your .env.local — it is already in .gitignore
- SUPABASE_SERVICE_ROLE_KEY is only used server-side in API routes
- Row Level Security ensures users only access their own data

---

## 🙏 Acknowledgements

- Safaricom Daraja API: https://developer.safaricom.co.ke
- Supabase: https://supabase.com
- Recharts: https://recharts.org
- Tailwind CSS: https://tailwindcss.com

---

Built with 💜 in Nairobi
