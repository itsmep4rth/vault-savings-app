# Vault — Architecture

This document describes the intended architecture of the Vault savings app:
the system components, how they talk to each other, the data model, the core
domain flows, and the planned repository layout.

---

## 1. System Overview

Vault is a server-rendered Next.js application deployed on Vercel. It uses
Google OAuth for identity, a PostgreSQL database for all persistent state, and
Stripe for premium subscription billing. A scheduled job evaluates goals at
their deadline and decides whether the user earned interest.

```
                              ┌───────────────────────────┐
                              │          Browser          │
                              │   (Next.js React client)  │
                              └────────────┬──────────────┘
                                           │ HTTPS
                                           ▼
                       ┌───────────────────────────────────────┐
                       │        Vercel (Next.js runtime)        │
                       │                                       │
                       │  ┌─────────────┐   ┌───────────────┐  │
                       │  │ App Router  │   │  Route         │  │
                       │  │ pages / RSC │   │  Handlers /    │  │
                       │  │ + Server    │   │  API endpoints │  │
                       │  │ Actions     │   │                │  │
                       │  └──────┬──────┘   └───────┬───────┘  │
                       │         │                  │          │
                       │  ┌──────┴──────────────────┴───────┐  │
                       │  │        Domain / Service layer    │  │
                       │  │  (auth, goals, savings, reward,  │  │
                       │  │   billing, questionnaire)        │  │
                       │  └──────┬──────────────┬────────────┘  │
                       │         │              │               │
                       │  ┌──────┴─────┐  ┌─────┴──────────┐    │
                       │  │  Prisma    │  │  Stripe SDK    │    │
                       │  │  client    │  │                │    │
                       │  └──────┬─────┘  └─────┬──────────┘    │
                       └─────────┼──────────────┼───────────────┘
                                 │              │
                 ┌───────────────┘              └───────────────┐
                 ▼                                              ▼
      ┌────────────────────┐                        ┌────────────────────┐
      │  PostgreSQL        │                        │      Stripe        │
      │  (Supabase / Neon) │                        │  Billing + webhooks│
      │  users, goals,     │                        │                    │
      │  savings_entries,  │                        └─────────┬──────────┘
      │  subscriptions,    │                                  │ webhook
      │  expense_profiles  │◄─────────────────────────────────┘
      └─────────┬──────────┘
                │
                ▼
      ┌────────────────────┐        ┌────────────────────┐
      │  Cron / Scheduled  │        │   Google OAuth     │
      │  Function (Vercel) │        │   (NextAuth        │
      │  goal settlement   │        │    provider)       │
      └────────────────────┘        └────────────────────┘
```

### External services

| Service            | Role                                                             |
|--------------------|-----------------------------------------------------------------|
| Google OAuth       | User identity; the only sign-in method.                          |
| PostgreSQL         | System of record for users, goals, savings, subscriptions.       |
| Stripe             | Premium subscription checkout, billing, and webhook events.      |
| Vercel Cron        | Triggers goal settlement at/after each goal deadline.            |
| Vercel             | Hosting, edge network, serverless/Node functions, env secrets.   |

---

## 2. Repository Structure

```
vault-savings-app/
├── README.md
├── ARCHITECTURE.md
├── .env.example                  # template for required secrets
├── next.config.js
├── package.json
├── tsconfig.json
│
├── prisma/
│   ├── schema.prisma             # DB schema (models + relations)
│   ├── migrations/               # generated SQL migrations
│   └── seed.ts                   # dev seed data
│
├── public/                       # static assets (logo, icons, images)
│
└── src/
    ├── app/                              # Next.js App Router
    │   ├── layout.tsx                     # root layout, providers
    │   ├── page.tsx                       # marketing / landing page
    │   ├── globals.css
    │   │
    │   ├── (auth)/
    │   │   └── signin/page.tsx            # "Continue with Google" screen
    │   │
    │   ├── onboarding/
    │   │   ├── questionnaire/page.tsx     # monthly expense questionnaire
    │   │   └── goal/page.tsx              # create first savings goal
    │   │
    │   ├── dashboard/
    │   │   ├── page.tsx                   # active goal overview + progress
    │   │   ├── log/page.tsx               # add a savings entry
    │   │   └── history/page.tsx           # past goals + outcomes
    │   │
    │   ├── billing/
    │   │   ├── page.tsx                   # Free vs Premium, upgrade CTA
    │   │   └── success/page.tsx           # post-checkout return page
    │   │
    │   ├── settings/page.tsx              # profile, expense profile, plan
    │   │
    │   └── api/                           # Route Handlers (server endpoints)
    │       ├── auth/[...nextauth]/route.ts   # NextAuth handler
    │       ├── goals/route.ts                # create / list goals
    │       ├── goals/[id]/route.ts           # get / update / cancel a goal
    │       ├── savings/route.ts              # create / list savings entries
    │       ├── questionnaire/route.ts        # save expense profile
    │       ├── stripe/checkout/route.ts      # create Checkout session
    │       ├── stripe/portal/route.ts        # billing portal session
    │       ├── stripe/webhook/route.ts       # Stripe event receiver
    │       └── cron/settle-goals/route.ts    # invoked by Vercel Cron
    │
    ├── components/
    │   ├── ui/                            # buttons, inputs, cards, dialog
    │   ├── goal/
    │   │   ├── GoalProgressBar.tsx
    │   │   ├── GoalSummaryCard.tsx
    │   │   └── CreateGoalForm.tsx
    │   ├── savings/
    │   │   ├── SavingsEntryForm.tsx
    │   │   └── SavingsTimeline.tsx
    │   ├── questionnaire/ExpenseForm.tsx
    │   └── billing/PlanComparison.tsx
    │
    ├── lib/
    │   ├── auth.ts                        # NextAuth config + helpers
    │   ├── db.ts                          # Prisma client singleton
    │   ├── stripe.ts                      # Stripe SDK client
    │   ├── env.ts                         # runtime env validation (zod)
    │   └── utils.ts
    │
    ├── server/                            # domain / service layer
    │   ├── goals/
    │   │   ├── createGoal.ts
    │   │   ├── getActiveGoal.ts
    │   │   └── settleGoal.ts              # completion check + reward calc
    │   ├── savings/
    │   │   ├── addSavingsEntry.ts
    │   │   └── getGoalProgress.ts
    │   ├── questionnaire/saveExpenseProfile.ts
    │   ├── billing/
    │   │   ├── createCheckoutSession.ts
    │   │   ├── syncSubscription.ts        # applies Stripe webhook state
    │   │   └── getPlan.ts                 # "free" | "premium"
    │   └── reward/calculateInterest.ts    # tier %, only if goal met
    │
    ├── types/                             # shared TypeScript types
    │
    └── middleware.ts                      # route protection / redirects
```

---

## 3. Layer Responsibilities

### Client (React components under `src/app` + `src/components`)
Renders pages and forms. Server Components fetch data directly through the
service layer; Client Components handle interactivity (forms, progress
animations) and call Route Handlers or Server Actions. No business rules and
no direct database access live here.

### Route Handlers (`src/app/api/**`)
Thin HTTP entry points. They authenticate the request, validate the payload,
delegate to a `src/server/**` service, and shape the response. Stripe and cron
endpoints verify a signature / secret before doing any work.

### Service / domain layer (`src/server/**`)
Holds every business rule: how a goal is created, when a goal counts as
"complete", how interest is calculated, how a Stripe subscription maps to a
plan. It is the only layer that uses the Prisma client and the Stripe SDK for
writes. Keeping rules here means the questionnaire page, the dashboard, and the
cron job all enforce the same logic.

### Data access (`src/lib/db.ts` + `prisma/`)
A single Prisma client instance (guarded against hot-reload duplication).
Schema and migrations are version-controlled in `prisma/`.

### Infrastructure (`src/lib/*`)
Cross-cutting singletons and config: NextAuth setup, Stripe client, env-var
validation, small utilities.

---

## 4. Data Model

```
┌────────────────────┐        ┌────────────────────────┐
│ User               │        │ ExpenseProfile         │
│────────────────────│ 1    1 │────────────────────────│
│ id (pk)            │────────│ id (pk)                │
│ email              │        │ userId (fk, unique)    │
│ name               │        │ rent                   │
│ image              │        │ groceries              │
│ plan  free|premium │        │ food                   │
│ stripeCustomerId   │        │ transport              │
│ createdAt          │        │ utilities              │
└─────────┬──────────┘        │ other                  │
          │ 1                 │ updatedAt              │
          │                   └────────────────────────┘
          │ *
┌─────────┴──────────────────────────┐
│ Goal                               │
│────────────────────────────────────│        ┌────────────────────────┐
│ id (pk)                            │ 1    * │ SavingsEntry           │
│ userId (fk)                        │────────│────────────────────────│
│ targetAmount                       │        │ id (pk)                │
│ startDate                          │        │ goalId (fk)            │
│ deadline        (1–4 months out)   │        │ amount                 │
│ status  active|completed|failed|   │        │ note                   │
│         cancelled                  │        │ createdAt              │
│ savedAmount     (denormalized sum) │        └────────────────────────┘
│ rewardRate      (0.01 | 0.03)      │
│ rewardAmount    (set at settlement)│
│ settledAt                          │
│ createdAt                          │
└─────────┬──────────────────────────┘
          │
          │ (plan at settlement time drives rewardRate)
          ▼
┌────────────────────────────────────┐
│ Subscription                       │
│────────────────────────────────────│
│ id (pk)                            │
│ userId (fk, unique)                │
│ stripeSubscriptionId               │
│ status  active|past_due|canceled   │
│ currentPeriodEnd                   │
│ updatedAt                          │
└────────────────────────────────────┘

+ NextAuth tables: Account, Session, VerificationToken
```

**Key rules baked into the model**

- A user has **at most one `active` goal** at a time.
- `deadline` must be **1 to 4 calendar months** after `startDate`.
- `savedAmount` is the running total of `SavingsEntry.amount` for the goal,
  kept in sync by the service layer for fast reads.
- `rewardRate` / `rewardAmount` are **null until settlement**. Interest is
  paid **only** when `savedAmount >= targetAmount` at the deadline — there is
  no partial credit.
- `plan` is derived from Stripe subscription state and cached on `User` for
  quick checks; `Subscription` holds the authoritative billing status.

---

## 5. Core Flows

### 5.1 Sign-up & onboarding

```
User clicks "Continue with Google"
      → NextAuth Google OAuth
      → callback creates User (+ Account/Session) if new
      → middleware sees no ExpenseProfile → redirect /onboarding/questionnaire
      → user submits expenses  → POST /api/questionnaire → saveExpenseProfile
      → redirect /onboarding/goal
      → user submits target + deadline → POST /api/goals → createGoal
            · validates deadline is 1–4 months out
            · rejects if an active goal already exists
      → redirect /dashboard
```

### 5.2 Logging savings

```
User on /dashboard/log enters an amount
      → POST /api/savings → addSavingsEntry
            · verifies the goal belongs to the user and is still active
            · inserts SavingsEntry
            · recomputes and updates Goal.savedAmount
      → dashboard progress bar reflects new savedAmount / targetAmount
```

### 5.3 Upgrading to Premium

```
User on /billing clicks "Upgrade"
      → POST /api/stripe/checkout → createCheckoutSession
            · ensures a Stripe customer exists (stores stripeCustomerId)
            · returns Checkout URL → browser redirects to Stripe
      → user pays on Stripe
      → Stripe → POST /api/stripe/webhook
            · verify signature
            · checkout.session.completed / customer.subscription.updated
              → syncSubscription: upsert Subscription, set User.plan
      → user returns to /billing/success
```

### 5.4 Goal settlement (the payout decision)

```
Vercel Cron (daily) → GET /api/cron/settle-goals  (secret-protected)
      → find all goals with status = active AND deadline <= now
      → for each goal, settleGoal:
            met = goal.savedAmount >= goal.targetAmount
            if met:
                rate   = user.plan === "premium" ? 0.03 : 0.01
                reward = round(goal.savedAmount * rate)
                goal.status       = "completed"
                goal.rewardRate   = rate
                goal.rewardAmount = reward
            else:
                goal.status = "failed"      # no reward, no partial credit
            goal.settledAt = now
      → user sees the outcome on /dashboard and /dashboard/history
```

---

## 6. Authentication & Authorization

- **Authentication:** NextAuth.js with the Google provider only. Sessions are
  JWT-based; the session carries `userId` and `plan`.
- **Route protection:** `src/middleware.ts` redirects unauthenticated users
  away from `/dashboard`, `/onboarding`, `/billing`, and `/settings`.
- **Authorization:** every service function that touches a `Goal` or
  `SavingsEntry` re-checks that the row's `userId` matches the session user.
  API handlers never trust an `id` from the client without that check.
- **Machine endpoints:** `/api/stripe/webhook` verifies the Stripe signature;
  `/api/cron/settle-goals` requires a shared `CRON_SECRET` header.

---

## 7. Environment Variables

| Variable                | Used by                        |
|-------------------------|--------------------------------|
| `GOOGLE_CLIENT_ID`      | NextAuth Google provider       |
| `GOOGLE_CLIENT_SECRET`  | NextAuth Google provider       |
| `NEXTAUTH_SECRET`       | NextAuth session encryption    |
| `NEXTAUTH_URL`          | NextAuth callback base URL     |
| `DATABASE_URL`          | Prisma / PostgreSQL connection |
| `STRIPE_SECRET_KEY`     | Stripe SDK                     |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification    |
| `STRIPE_PRICE_PREMIUM`  | Premium plan price id          |
| `CRON_SECRET`           | Auth for the settlement cron   |

---

## 8. Deployment

- **Host:** Vercel. `main` branch auto-deploys to production; PRs get preview
  deployments.
- **Database:** managed PostgreSQL (Supabase or Neon). Migrations run via
  `prisma migrate deploy` in the build/release step.
- **Cron:** configured in `vercel.json` to call `/api/cron/settle-goals` once
  per day.
- **Secrets:** stored as Vercel Environment Variables, never committed.
