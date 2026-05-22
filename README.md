# 🏦 Aurevia Invest — Full-Stack Investment Platform

A production-ready investment web platform built with Next.js 14, TailwindCSS, Framer Motion, PostgreSQL (Prisma ORM), JWT authentication, and payment integrations for the Cameroonian market.

---

## ✨ Features

- **🔐 Authentication** — JWT-based login/register, bcrypt password hashing, protected routes
- **📊 Dashboard** — Balance overview, live chart, recent activity, active passes
- **💼 Pass System** — 4 investment tiers (Basic/Pro/Elite/VIP) with daily returns
- **💳 Payments** — FAPSHI (Mobile Money) + GeniusPay/Card integration with webhook support
- **✅ Daily Tasks** — Earn micro-rewards with a countdown timer
- **🔗 Affiliate System** — Referral links, click tracking, 5% commission engine
- **👛 Wallet** — Balance, earnings history, withdrawal requests
- **⚙️ Admin Panel** — Full CRUD for users, passes, and withdrawal approvals
- **📅 Cron Jobs** — Daily earnings auto-credit endpoint

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### 1. Clone & Install

```bash
cd aurevia-invest
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:
- `DATABASE_URL` — your PostgreSQL connection string
- `JWT_SECRET` — a long random string (generate: `openssl rand -base64 64`)
- `NEXT_PUBLIC_URL` — your app URL (`http://localhost:3000` for dev)
- `FAPSHI_USER` / `FAPSHI_KEY` — from [FAPSHI dashboard](https://fapshi.com)
- `CRON_SECRET` — a random string for securing cron endpoints

### 3. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Or run migrations (production)
npm run db:migrate

# Seed with initial data (passes, tasks, demo users)
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Default Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@aurevia.com | Admin@2024! |
| Demo User | demo@aurevia.com | Demo@2024! |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/              # Public auth pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Protected user area
│   │   ├── dashboard/       # Home dashboard
│   │   ├── passes/          # Investment passes
│   │   ├── tasks/           # Daily tasks
│   │   ├── affiliate/       # Referral system
│   │   ├── wallet/          # Wallet & withdrawals
│   │   └── portfolio/       # My investments
│   ├── admin/               # Admin panel
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── passes/
│   │   └── withdrawals/
│   ├── api/                 # API routes (Next.js App Router)
│   │   ├── auth/            # login, register, logout, me
│   │   ├── dashboard/
│   │   ├── passes/          # list + buy
│   │   ├── tasks/           # list + complete
│   │   ├── affiliate/
│   │   ├── wallet/          # balance + withdraw
│   │   ├── payments/
│   │   │   ├── confirm/     # Simulation confirmation
│   │   │   └── fapshi/
│   │   │       └── webhook/ # FAPSHI webhook handler
│   │   ├── admin/           # Admin CRUD endpoints
│   │   └── cron/
│   │       └── daily-earnings/ # Daily earnings cron
│   └── payment/
│       └── simulate/        # Payment simulation page
├── components/
│   ├── ui/                  # Button, Input, Card
│   └── layout/              # BottomNav (sidebar + mobile nav)
├── lib/
│   ├── prisma.ts            # Prisma singleton
│   ├── auth.ts              # JWT + bcrypt helpers
│   └── utils.ts             # Formatters, helpers
└── middleware.ts            # Route protection
```

---

## 💳 Payment Integration

### FAPSHI (Mobile Money - Cameroon)

**Initiate payment** (in `/api/passes/buy/route.ts`):

```typescript
const res = await fetch("https://live.fapshi.com/initiate-pay", {
  method: "POST",
  headers: {
    "apiuser": process.env.FAPSHI_USER!,
    "apikey": process.env.FAPSHI_KEY!,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    amount: pass.price,
    email: user.email,
    redirectUrl: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
    externalId: reference,          // Your payment reference
    message: `Achat Pass ${pass.name}`,
  }),
});
const { link } = await res.json();
// Redirect user to: link
```

**Webhook** (`/api/payments/fapshi/webhook`):
- Configure webhook URL in FAPSHI dashboard
- Listens for `SUCCESSFUL` / `FAILED` / `CANCELLED` events
- Auto-activates passes on success

### GeniusPay (Cards / International)

Replace the simulation in `/api/passes/buy/route.ts` with your GeniusPay API call.

---

## ⏰ Daily Earnings Cron

Set up a cron job to call the earnings endpoint daily:

**Vercel Cron** — add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/daily-earnings",
    "schedule": "0 0 * * *"
  }]
}
```

**External cron** (Railway, cron-job.org, etc.):
```bash
# POST https://your-domain.com/api/cron/daily-earnings
# Header: Authorization: Bearer YOUR_CRON_SECRET
```

---

## 🚢 Deployment

### Vercel (Frontend + API)

```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel Dashboard.

### Railway (Database)

1. Create a PostgreSQL service on [Railway](https://railway.app)
2. Copy `DATABASE_URL` from Railway to your `.env`
3. Run `npm run db:migrate`

### Environment Variables for Production

```env
DATABASE_URL=postgresql://...
JWT_SECRET=<64-char-random-string>
NEXT_PUBLIC_URL=https://your-domain.com
FAPSHI_USER=your-fapshi-user
FAPSHI_KEY=your-fapshi-key
CRON_SECRET=<32-char-random-string>
NODE_ENV=production
```

---

## 🔒 Security Features

- ✅ JWT in httpOnly cookies (not localStorage)
- ✅ bcrypt password hashing (12 rounds)
- ✅ Zod input validation on all API routes
- ✅ Role-based access control (USER / ADMIN)
- ✅ Protected middleware on all dashboard/admin routes
- ✅ CSRF protection via SameSite cookie
- ✅ Admin-only routes with server-side role check

---

## 📱 Screenshots

The app mirrors the design from the provided mockup:
- Dark navy theme with glassmorphism cards
- Mobile-first responsive design
- Framer Motion animations on page loads
- Real-time countdown timer for daily tasks
- Interactive payment modal with method selection

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | TailwindCSS + custom CSS |
| Animations | Framer Motion |
| Charts | Recharts |
| Database | PostgreSQL via Prisma ORM |
| Auth | JWT + bcrypt |
| Validation | Zod |
| Notifications | React Hot Toast |
| Icons | Lucide React |
| Payments | FAPSHI + GeniusPay |

---

## 📄 License

MIT — Built for production use. Replace payment simulation with live API keys before going live.
