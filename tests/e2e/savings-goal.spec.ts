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

const TEST_EMAIL = "e2e-test@vault.local";

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("create goal and log savings", async ({ page }) => {
  // Find the exact user used by auth.setup.ts.
  const user = await prisma.user.findUnique({
    where: {
      email: TEST_EMAIL,
    },
  });

  if (!user) {
    throw new Error(
      `E2E test user ${TEST_EMAIL} was not found.`
    );
  }

  // Start with a completely clean goal/savings state
  // for this dedicated E2E user.
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

  const remainingGoals = await prisma.goal.count({
    where: {
      userId: user.id,
    },
  });

  expect(remainingGoals).toBe(0);

  // --------------------------------------------------
  // CREATE GOAL
  // --------------------------------------------------

  await page.goto("/onboarding/goal");

  await expect(
    page.getByRole("heading", {
      name: /create.*goal|savings goal/i,
    })
  ).toBeVisible();

  const amountInput = page.locator('input[type="number"]');
  const deadlineInput = page.locator('input[type="date"]');

  await expect(amountInput).toBeVisible();
  await expect(deadlineInput).toBeVisible();

  await amountInput.fill("1000");

  // Use a stable two-month deadline.
  // Setting the date to the first of the month first
  // avoids month-end rollover problems.
  const deadline = new Date();

  deadline.setHours(12, 0, 0, 0);
  deadline.setDate(1);
  deadline.setMonth(deadline.getMonth() + 2);

  const deadlineValue = [
    deadline.getFullYear(),
    String(deadline.getMonth() + 1).padStart(2, "0"),
    String(deadline.getDate()).padStart(2, "0"),
  ].join("-");

  await deadlineInput.fill(deadlineValue);

  await page.getByRole("button", {
    name: "Create savings goal",
  }).click();

  // The form should redirect after a successful POST.
  await expect(page).toHaveURL(/\/dashboard$/);

  // --------------------------------------------------
  // VERIFY INITIAL GOAL
  // --------------------------------------------------

  await expect(
    page.getByText("$1,000", { exact: true })
  ).toBeVisible();

  await expect(
    page.getByText("$0", { exact: true })
  ).toBeVisible();

  // --------------------------------------------------
  // LOG SAVINGS
  // --------------------------------------------------

  await page.getByRole("link", {
    name: "Log savings",
  }).click();

  await expect(page).toHaveURL(/\/dashboard\/log$/);

  const savingsAmountInput = page.locator(
    'input[type="number"]'
  );

  await expect(savingsAmountInput).toBeVisible();

  await savingsAmountInput.fill("250");

  const noteInput = page.locator(
    'input[name="note"], textarea[name="note"]'
  );

  if (await noteInput.count()) {
    await noteInput.fill("E2E test savings");
  }

  await page.getByRole("button", {
    name: "Add savings",
  }).click();

  // --------------------------------------------------
  // VERIFY UPDATED DASHBOARD
  // --------------------------------------------------

  await expect(page).toHaveURL(/\/dashboard$/);

  await expect(
    page.getByText("$250", { exact: true })
  ).toBeVisible();

  await expect(
    page.getByText("25%", { exact: true })
  ).toBeVisible();

  // --------------------------------------------------
  // VERIFY DATABASE STATE
  // --------------------------------------------------

  const goal = await prisma.goal.findFirst({
    where: {
      userId: user.id,
      status: "active",
    },
  });

  expect(goal).not.toBeNull();
  expect(goal?.targetAmount).toBe(1000);
  expect(goal?.savedAmount).toBe(250);

  const savingsEntry = await prisma.savingsEntry.findFirst({
    where: {
      goalId: goal!.id,
    },
  });

  expect(savingsEntry).not.toBeNull();
  expect(savingsEntry?.amount).toBe(250);
});