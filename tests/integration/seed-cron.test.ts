import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
 
// Integration test: seed goals -> run the settle-goals cron -> check the outcomes.
//
// Only the database is faked (an in-memory copy of the goals table). The cron
// route, settleGoal and calculateInterest all run for real, so this checks that
// they work together. The scenarios use the same numbers as prisma/seed.ts.
 
const { db } = vi.hoisted(() => ({
  db: {
    users: {} as Record<string, { plan: string }>,
    goals: [] as any[],
  },
}));
 
vi.mock("@/lib/db", () => {
  const prisma: any = {
    goal: {
      findMany: async ({ where }: any) =>
        db.goals
          .filter(
            (goal) =>
              goal.status === where.status &&
              goal.deadline.getTime() <= where.deadline.lte.getTime()
          )
          .map((goal) => ({ id: goal.id })),
 
      findUnique: async ({ where }: any) => {
        const goal = db.goals.find((g) => g.id === where.id);
 
        if (!goal) {
          return null;
        }
 
        return { ...goal, user: { plan: db.users[goal.userId].plan } };
      },
 
      update: async ({ where, data }: any) => {
        const goal = db.goals.find((g) => g.id === where.id);
 
        Object.assign(goal, data);
 
        return { ...goal };
      },
    },
    $transaction: async (callback: any) => callback(prisma),
  };
 
  return { prisma };
});
 
vi.mock("@prisma/client", () => ({
  GoalStatus: {
    active: "active",
    completed: "completed",
    failed: "failed",
    cancelled: "cancelled",
  },
}));
 
import { GET } from "@/app/api/cron/settle-goals/route";
 
const DAY_MS = 24 * 60 * 60 * 1000;
 
const SCENARIOS = [
  { id: "free", plan: "free", saved: 1000, target: 1000, deadlineDays: -1 },
  { id: "premium", plan: "premium", saved: 2000, target: 2000, deadlineDays: -1 },
  { id: "missed", plan: "free", saved: 700, target: 1500, deadlineDays: -1 },
  { id: "future", plan: "free", saved: 100, target: 500, deadlineDays: 30 },
];
 
function seed() {
  db.users = {};
  db.goals = [];
 
  for (const scenario of SCENARIOS) {
    db.users[scenario.id] = { plan: scenario.plan };
 
    db.goals.push({
      id: `goal-${scenario.id}`,
      userId: scenario.id,
      savedAmount: scenario.saved,
      targetAmount: scenario.target,
      deadline: new Date(Date.now() + scenario.deadlineDays * DAY_MS),
      status: "active",
      rewardRate: null,
      rewardAmount: null,
      settledAt: null,
    });
  }
}
 
function goal(id: string) {
  return db.goals.find((g) => g.id === `goal-${id}`);
}
 
function runCron(secret?: string) {
  const request = new NextRequest("http://localhost/api/cron/settle-goals", {
    headers: secret ? { authorization: `Bearer ${secret}` } : {},
  });
 
  return GET(request);
}
 
describe("seeded goals -> settle-goals cron", () => {
  beforeEach(() => {
    process.env.CRON_SECRET = "test-secret";
    seed();
  });
 
  it("completes a free user's goal with a 1% reward", async () => {
    await runCron("test-secret");
 
    expect(goal("free").status).toBe("completed");
    expect(goal("free").rewardRate).toBe(0.01);
    expect(goal("free").rewardAmount).toBe(10);
  });
 
  it("completes a premium user's goal with a 3% reward", async () => {
    await runCron("test-secret");
 
    expect(goal("premium").status).toBe("completed");
    expect(goal("premium").rewardRate).toBe(0.03);
    expect(goal("premium").rewardAmount).toBe(60);
  });
 
  it("fails a goal that missed its target and gives no reward", async () => {
    await runCron("test-secret");
 
    expect(goal("missed").status).toBe("failed");
    expect(goal("missed").rewardAmount).toBe(0);
  });
 
  it("leaves a goal that is not due yet untouched", async () => {
    await runCron("test-secret");
 
    expect(goal("future").status).toBe("active");
    expect(goal("future").rewardAmount).toBe(null);
    expect(goal("future").settledAt).toBe(null);
  });
 
  it("reports the three overdue goals in the response", async () => {
    const response = await runCron("test-secret");
    const body = await response.json();
 
    expect(response.status).toBe(200);
    expect(body.processed).toBe(3);
    expect(body.results).toEqual([
      { goalId: "goal-free", status: "completed" },
      { goalId: "goal-premium", status: "completed" },
      { goalId: "goal-missed", status: "failed" },
    ]);
  });
 
  it("does not settle anything a second time when the cron runs again", async () => {
    await runCron("test-secret");
 
    const settledAt = goal("free").settledAt;
 
    expect(settledAt instanceof Date).toBe(true);
 
    const response = await runCron("test-secret");
    const body = await response.json();
 
    expect(body.processed).toBe(0);
    expect(goal("free").settledAt).toBe(settledAt);
    expect(goal("free").rewardAmount).toBe(10);
  });
 
  it("changes nothing when the secret is missing", async () => {
    const response = await runCron();
 
    expect(response.status).toBe(401);
    expect(goal("free").status).toBe("active");
    expect(goal("premium").status).toBe("active");
    expect(goal("missed").status).toBe("active");
  });
});
