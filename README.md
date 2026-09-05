<<<<<<< HEAD
# Vault — Goal-Driven Savings App

Vault is a personal savings accountability web app that rewards users
for actually meeting their savings goals. Set a target, save up, and
earn interest when you follow through.

## What it does

- Sign in with Google — no separate account needed
- Answer a short questionnaire about your monthly expenses
  (rent, groceries, food, transport, utilities, etc.)
- Set a savings goal: a target amount and a deadline of 1 to 4 months
- Log your savings progress throughout the goal period
- If you meet your goal → earn interest on your saved amount
- If you miss your goal → no reward (no partial credit)

## Reward Tiers

| Plan      | Interest on Completed Goal |
|-----------|---------------------------|
| Free      | 1%                        |
| Premium   | 3%                        |

Goal must be fully met to receive any reward.

## Tech Stack

- **Frontend:** Next.js (React)
- **Auth:** NextAuth.js with Google OAuth
- **Database:** PostgreSQL (Supabase / Neon)
- **Payments:** Stripe (subscription billing)
- **Hosting:** Vercel

## Getting Started

1. Clone the repo
   git clone https://github.com/your-username/vault-savings-app.git

2. Install dependencies
   cd vault-savings-app
   npm install

3. Set up environment variables
   Copy .env.example to .env.local and fill in your keys:
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   - DATABASE_URL
   - NEXTAUTH_SECRET
   - STRIPE_SECRET_KEY

4. Run the development server
   npm run dev

## Team

- Jemor Colin Ballentine — @github-username
- Parth M. Chavan — @itsmep4rth
- Sumit Dahiya — @github-username
- Sanjar Yakshimuradov — @github-username

## Status

🚧 In active development
=======
# Vault — Goal-Driven Savings App

Vault is a personal savings accountability web app that rewards users
for actually meeting their savings goals. Set a target, save up, and
earn interest when you follow through.

## What it does

- Sign in with Google — no separate account needed
- Answer a short questionnaire about your monthly expenses
  (rent, groceries, food, transport, utilities, etc.)
- Set a savings goal: a target amount and a deadline of 1 to 4 months
- Log your savings progress throughout the goal period
- If you meet your goal → earn interest on your saved amount
- If you miss your goal → no reward (no partial credit)

## Reward Tiers

| Plan      | Interest on Completed Goal |
|-----------|---------------------------|
| Free      | 1%                        |
| Premium   | 3%                        |

Goal must be fully met to receive any reward.

## Tech Stack

- **Frontend:** Next.js (React)
- **Auth:** NextAuth.js with Google OAuth
- **Database:** PostgreSQL (Supabase / Neon)
- **Payments:** Stripe (subscription billing)
- **Hosting:** Vercel

## Getting Started

1. Clone the repo
   git clone https://github.com/your-username/vault-savings-app.git

2. Install dependencies
   cd vault-savings-app
   npm install

3. Set up environment variables
   Copy .env.example to .env.local and fill in your keys:
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   - DATABASE_URL
   - NEXTAUTH_SECRET
   - STRIPE_SECRET_KEY

4. Run the development server
   npm run dev

## Team

- Jemor Colin C. Ballentine — @github-username
- Parth M. Chavan — @itsmep4rth
- Sumit Dahiya — @github-username
- Sanjar Yakshimuradov — @github-username

## Status

🚧 In active development
>>>>>>> fa36567 (Set up Vault database with Prisma and PostgreSQL)
