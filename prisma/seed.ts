// Dev seed data for Vault. Run it with:  npx tsx prisma/seed.ts
//
// Safe to re-run: it only touches the four seed users below (matched by email)
// and rebuilds their goals each time, so the "run the settle-goals cron" demo
// can be repeated. Nothing else in the database is changed.
//
// What the settle-goals cron should do with this data:
//   free@example.com         1000 / 1000, deadline passed -> completed, $10 (1%)
//   premium@example.com      2000 / 2000, deadline passed -> completed, $60 (3%)
//   free.missed@example.com   700 / 1500, deadline passed -> failed,    $0
//   free.future@example.com   100 /  500, due in 30 days  -> stays active
//
// Each user has exactly one active goal, matching the app's one-active-goal rule.

import "dotenv/config";
import { prisma } from "../lib/prisma";

const DAY_MS = 24 * 60 * 60 * 1000;

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * DAY_MS);
}

type Scenario = {
  email: string;
  name: string;
  plan: "free" | "premium";
  targetAmount: number;
  savedAmount: number;
  startDays: number;
  deadlineDays: number;
};

const SCENARIOS: Scenario[] = [
  {
    email: "free@example.com",
    name: "Free User",
    plan: "free",
    targetAmount: 1000,
    savedAmount: 1000,
    startDays: -60,
    deadlineDays: -1,
  },
  {
    email: "premium@example.com",
    name: "Premium User",
    plan: "premium",
    targetAmount: 2000,
    savedAmount: 2000,
    startDays: -60,
    deadlineDays: -1,
  },
  {
    email: "free.missed@example.com",
    name: "Free User (missed goal)",
    plan: "free",
    targetAmount: 1500,
    savedAmount: 700,
    startDays: -60,
    deadlineDays: -1,
  },
  {
    email: "free.future@example.com",
    name: "Free User (goal in progress)",
    plan: "free",
    targetAmount: 500,
    savedAmount: 100,
    startDays: -10,
    deadlineDays: 30,
  },
];

async function main() {
  console.log("Seeding database...");

  for (const scenario of SCENARIOS) {
    const user = await prisma.user.upsert({
      where: { email: scenario.email },
      update: { name: scenario.name, plan: scenario.plan },
      create: {
        email: scenario.email,
        name: scenario.name,
        plan: scenario.plan,
      },
    });

    // Rebuild this user's goals so re-running the seed starts from a clean state.
    await prisma.goal.deleteMany({ where: { userId: user.id } });

    await prisma.goal.create({
      data: {
        userId: user.id,
        targetAmount: scenario.targetAmount,
        savedAmount: scenario.savedAmount,
        startDate: daysFromNow(scenario.startDays),
        deadline: daysFromNow(scenario.deadlineDays),
        status: "active",
        // savedAmount is the sum of a goal's entries, so seed a matching entry.
        entries: {
          create: { amount: scenario.savedAmount, note: "Seed deposit" },
        },
      },
    });

    console.log(
      `  ${scenario.email} (${scenario.plan}): saved ${scenario.savedAmount} of ${scenario.targetAmount}`
    );
  }

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
