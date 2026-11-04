import { test, expect } from "@playwright/test";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// IMPORTANT:
// The application test server and auth.setup.ts must also
// use this same test database.
const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error(
    "TEST_DATABASE_URL is required for database E2E tests."
  );
}

const parsedDatabaseUrl = new URL(testDatabaseUrl);

if (
  !["postgres:", "postgresql:"].includes(
    parsedDatabaseUrl.protocol
  )
) {
  throw new Error(
    "TEST_DATABASE_URL must be a PostgreSQL connection URL."
  );
}

if (parsedDatabaseUrl.pathname !== "/vault_test") {
  throw new Error(
    "Refusing to run: TEST_DATABASE_URL must point to vault_test."
  );
}

const adapter = new PrismaPg({
  connectionString: testDatabaseUrl,
});

const prisma = new PrismaClient({ adapter });

const TEST_EMAIL = "e2e-test@vault.local";

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("create goal and log savings", async ({ page }) => {
  const user = await prisma.user.findUnique({
    where: {
      email: TEST_EMAIL,
    },
  });

  if (!user) {
    throw new Error(
      `E2E user ${TEST_EMAIL} was not found in vault_test. ` +
        "Check auth.setup.ts and the test database configuration."
    );
  }

  // Delete only this dedicated user's test data.
  // A transaction keeps these cleanup operations together.
  await prisma.$transaction(async (tx) => {
    await tx.savingsEntry.deleteMany({
      where: {
        goal: {
          userId: user.id,
        },
      },
    });

    await tx.goal.deleteMany({
      where: {
        userId: user.id,
      },
    });
  });

  expect(
    await prisma.goal.count({
      where: {
        userId: user.id,
      },
    })
  ).toBe(0);

  // CREATE GOAL

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

  // The first day of the month two months ahead is within
  // the 1–4 month range and avoids month-end rollover.
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

  await page
    .getByRole("button", {
      name: "Create savings goal",
      exact: true,
    })
    .click();

  await expect(page).toHaveURL(/\/dashboard\/?$/);

  // VERIFY INITIAL DASHBOARD

  await expect(
    page.getByText("of $1,000", { exact: true })
  ).toBeVisible();

  await expect(
    page.getByRole("heading", {
      name: "$0",
      exact: true,
    })
  ).toBeVisible();

  // LOG SAVINGS

  await page
    .getByRole("link", {
      name: "Log savings",
      exact: true,
    })
    .click();

  await expect(page).toHaveURL(/\/dashboard\/log\/?$/);

  const savingsAmountInput = page.locator(
    'input[type="number"]'
  );

  await expect(savingsAmountInput).toBeVisible();
  await savingsAmountInput.fill("250");

  const noteInput = page.locator(
    'input[name="note"], textarea[name="note"]'
  );

  const hasNoteInput = (await noteInput.count()) > 0;

  if (hasNoteInput) {
    await expect(noteInput).toBeVisible();
    await noteInput.fill("E2E test savings");
  }

  await page
    .getByRole("button", {
      name: "Add savings",
      exact: true,
    })
    .click();

  // VERIFY UPDATED DASHBOARD

  await expect(page).toHaveURL(/\/dashboard\/?$/);

  await expect(
    page.getByRole("heading", {
      name: "$250",
      exact: true,
    })
  ).toBeVisible();

  await expect(
    page.getByText("25%", { exact: true })
  ).toBeVisible();

  // VERIFY DATABASE STATE
  //
  // These expectations preserve the monetary-unit contract
  // in your original test: input 1000 -> stored 1000.
  // Confirm this matches the application's intended units.

  const goals = await prisma.goal.findMany({
    where: {
      userId: user.id,
    },
    include: {
      entries: true,
    },
  });

  expect(goals).toHaveLength(1);

  const goal = goals[0];

  if (!goal) {
    throw new Error("Expected the created goal to exist.");
  }

  expect(goal.status).toBe("active");
  expect(goal.targetAmount).toBe(1000);
  expect(goal.savedAmount).toBe(250);
  expect(goal.entries).toHaveLength(1);

  const savingsEntry = goal.entries[0];

  if (!savingsEntry) {
    throw new Error("Expected the savings entry to exist.");
  }

  expect(savingsEntry.amount).toBe(250);

  if (hasNoteInput) {
    expect(savingsEntry.note).toBe("E2E test savings");
  }

  const entryTotal = goal.entries.reduce(
    (sum, entry) => sum + entry.amount,
    0
  );

  expect(goal.savedAmount).toBe(entryTotal);
});
