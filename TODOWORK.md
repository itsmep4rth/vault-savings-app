# Vault — Work Breakdown (TODOWORK)

Work is split into **4 equal workstreams**, one owner each. Every stream has a
setup slice, a build slice, and a test slice so the load is comparable.
Cross-cutting files (`prisma/schema.prisma`, `src/components/ui/*`, `lib/env.ts`)
are built together in Phase 0 so nobody is blocked.

| Stream | Owner | Area |
|--------|-------|------|
| A | Parth Chavan (@itsmep4rth) | Auth, onboarding, expense questionnaire |
| B | Jemor Ballentine | Goals, savings logging, dashboard |
| C | Sumit Dahiya | Stripe billing & subscriptions |
| D | Sanjar Yakshimuradov | Reward engine, settlement cron, infra & deploy |

---

## Phase 0 — Project setup (whole team, ~1 short session together)

- [ ] `npx create-next-app` (App Router, TypeScript) — **Parth**
- [ ] Add Prisma, ESLint/Prettier, base folder structure per ARCHITECTURE.md — **Sanjar**
- [ ] Draft `prisma/schema.prisma` (User, ExpenseProfile, Goal, SavingsEntry, Subscription, NextAuth tables) — **whole team review, Jemor lands it**
- [ ] `.env.example` with all keys — **Sumit**
- [ ] Shared UI kit: `src/components/ui/` (Button, Input, Card, Dialog, ProgressBar) — **Parth + Jemor**
- [ ] `lib/db.ts`, `lib/env.ts` (zod validation) — **Sanjar**
- [ ] First deploy to Vercel (blank app) + Postgres provisioned (Supabase/Neon) — **Sanjar**

---

## Stream A — Auth & Onboarding — Parth Chavan

**Setup**
- [ ] Configure Google OAuth credentials (client id/secret, redirect URIs)
- [ ] `lib/auth.ts` — NextAuth config, Google provider, Prisma adapter, JWT session with `userId` + `plan`

**Build**
- [ ] `src/app/api/auth/[...nextauth]/route.ts`
- [ ] `src/app/(auth)/signin/page.tsx` — "Continue with Google"
- [ ] `src/middleware.ts` — protect `/dashboard`, `/onboarding`, `/billing`, `/settings`; redirect new users to questionnaire
- [ ] `src/app/onboarding/questionnaire/page.tsx` + `components/questionnaire/ExpenseForm.tsx`
- [ ] `src/app/api/questionnaire/route.ts` + `server/questionnaire/saveExpenseProfile.ts`
- [ ] `src/app/settings/page.tsx` — profile + editable expense profile + current plan (read-only from Stream C)
- [ ] Root layout: session provider, nav, sign-out

**Test**
- [ ] Unit: expense-profile validation
- [ ] E2E: new user → sign in → questionnaire → redirected to goal creation
- [ ] Auth guard test: unauthenticated request to protected route redirects

---

## Stream B — Goals & Savings — Jemor Ballentine

**Setup**
- [ ] Finalize `Goal` + `SavingsEntry` models and migration
- [ ] `server/goals/` and `server/savings/` module skeletons

**Build**
- [ ] `server/goals/createGoal.ts` — validate deadline is 1–4 months out; reject if an active goal exists
- [ ] `server/goals/getActiveGoal.ts`, `server/savings/getGoalProgress.ts`
- [ ] `server/savings/addSavingsEntry.ts` — ownership check, insert entry, recompute `Goal.savedAmount`
- [ ] `src/app/api/goals/route.ts`, `src/app/api/goals/[id]/route.ts` (get/update/cancel)
- [ ] `src/app/api/savings/route.ts`
- [ ] `src/app/onboarding/goal/page.tsx` + `components/goal/CreateGoalForm.tsx`
- [ ] `src/app/dashboard/page.tsx` — active goal summary, progress bar, days left
- [ ] `src/app/dashboard/log/page.tsx` + `components/savings/SavingsEntryForm.tsx`
- [ ] `src/app/dashboard/history/page.tsx` + `components/savings/SavingsTimeline.tsx`
- [ ] `components/goal/GoalProgressBar.tsx`, `GoalSummaryCard.tsx`

**Test**
- [ ] Unit: deadline range validation (1–4 months, boundaries)
- [ ] Unit: `savedAmount` recomputation after add/edit/delete entry
- [ ] Unit: "only one active goal" rule
- [ ] E2E: create goal → log savings → progress updates

---

## Stream C — Stripe Billing & Subscriptions — Sumit Dahiya

**Setup**
- [ ] Stripe account, Premium product + recurring price, test keys
- [ ] `lib/stripe.ts` — Stripe SDK client
- [ ] Finalize `Subscription` model + `User.plan` / `User.stripeCustomerId`

**Build**
- [ ] `server/billing/createCheckoutSession.ts` — ensure Stripe customer, return Checkout URL
- [ ] `server/billing/syncSubscription.ts` — upsert `Subscription`, set `User.plan` from Stripe state
- [ ] `server/billing/getPlan.ts` — `"free" | "premium"` helper used by other streams
- [ ] `src/app/api/stripe/checkout/route.ts`
- [ ] `src/app/api/stripe/portal/route.ts` — billing portal session
- [ ] `src/app/api/stripe/webhook/route.ts` — signature verify; handle `checkout.session.completed`, `customer.subscription.updated/deleted`
- [ ] `src/app/billing/page.tsx` + `components/billing/PlanComparison.tsx`
- [ ] `src/app/billing/success/page.tsx`
- [ ] Downgrade handling: on cancel/past_due → `plan = "free"`

**Test**
- [ ] Unit: webhook event → subscription/plan mapping (each event type)
- [ ] Unit: webhook rejects bad signature
- [ ] Integration: Stripe CLI `stripe listen` — upgrade then cancel flow
- [ ] E2E: free user upgrades → `plan` shows premium on dashboard/settings

---

## Stream D — Reward Engine, Settlement Cron, Infra & Deploy — Sanjar Yakshimuradov

**Setup**
- [ ] `vercel.json` cron config (daily) → `/api/cron/settle-goals`
- [ ] `CRON_SECRET` env var + header check helper
- [ ] CI: GitHub Actions running lint + typecheck + tests on PRs
- [ ] `prisma migrate deploy` wired into the Vercel build/release step

**Build**
- [ ] `server/reward/calculateInterest.ts` — rate = premium ? 0.03 : 0.01; reward only if `savedAmount >= targetAmount`; no partial credit
- [ ] `server/goals/settleGoal.ts` — mark `completed`/`failed`, set `rewardRate`, `rewardAmount`, `settledAt`
- [ ] `src/app/api/cron/settle-goals/route.ts` — secret-protected; find `active` goals past deadline; settle each
- [ ] Reward outcome display components used by Stream B history page (`RewardBadge`)
- [ ] `prisma/seed.ts` — dev data: users on both plans, goals in various states
- [ ] Staging/production env var setup in Vercel; `NEXTAUTH_URL` per environment
- [ ] Error monitoring hookup (e.g. Sentry) + basic logging in cron and webhook

**Test**
- [ ] Unit: `calculateInterest` — met vs missed, free vs premium, rounding
- [ ] Unit: `settleGoal` — status transitions, idempotency (re-running cron is safe)
- [ ] Integration: cron endpoint rejects requests without `CRON_SECRET`
- [ ] Integration: seed goals at deadline → run cron → correct outcomes

---

## Shared Definition of Done (every task)

- [ ] Types shared via `src/types/`, no `any`
- [ ] Service-layer ownership checks on all user-scoped rows
- [ ] Unit tests for business rules; PR green on CI
- [ ] Reviewed by at least one other teammate
- [ ] No secrets committed; new env vars added to `.env.example` + Vercel

---

## Integration checkpoints (do together)

1. **After Phase 0** — schema + shared UI merged to `main`.
2. **Mid-build** — Stream C exposes `getPlan()`; Streams B/D consume it.
3. **Pre-demo** — full path: sign in → questionnaire → goal → log savings →
   (fast-forward deadline) → run cron → see completed/failed + interest.
