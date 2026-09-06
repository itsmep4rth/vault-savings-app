import { test, expect } from "@playwright/test";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured.");
}

const testDatabaseUrl = databaseUrl.replace(
  /\/Vault(\?|$)/,
  "/vault_test$1"
);

const adapter = new PrismaPg({
  connectionString: testDatabaseUrl,
});

const prisma = new PrismaClient({ adapter });

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("create goal and log savings", async ({ page }) => {
  // Locate the authenticated test user in the isolated test database.
  const user = await prisma.user.findUnique({
    where: {
      email: "t.hender0714@gmail.com",
    },
  });

  if (!user) {
    throw new Error("Authenticated E2E test user was not found.");
  }

  // Reset only this test user's Vault data.
  await prisma.savingsEntry.deleteMany({
    where: {
      goal: {
        userId: user.id,
      },
    },
  });

  await prisma.goal.deleteMany({
    where: {
      userId: user.id,
    },
  });

  // Verify the test database is actually clean.
  const remainingGoals = await prisma.goal.count({
    where: {
      userId: user.id,
    },
  });

  expect(remainingGoals).toBe(0);

  await page.goto("/onboarding/goal");

  await expect(
    page.getByRole("heading", { name: /create.*goal|savings goal/i })
  ).toBeVisible();

  await page.getByLabel("Savings target").fill("1000");

  const deadline = new Date();
  deadline.setMonth(deadline.getMonth() + 2);

  const deadlineValue = deadline.toISOString().split("T")[0];

  await page.getByLabel("Goal deadline").fill(deadlineValue);

  await page.getByRole("button", {
    name: "Create savings goal",
  }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText("$1,000")).toBeVisible();
  await expect(page.getByText("$0")).toBeVisible();

  await page.getByRole("link", {
    name: "Log savings",
  }).click();

  await expect(page).toHaveURL(/\/dashboard\/log/);

  await page.getByLabel("Amount saved").fill("250");
  await page.getByLabel(/Note/).fill("E2E test savings");

  await page.getByRole("button", {
    name: "Add savings",
  }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText("$250")).toBeVisible();
  await expect(page.getByText("25%")).toBeVisible();
});