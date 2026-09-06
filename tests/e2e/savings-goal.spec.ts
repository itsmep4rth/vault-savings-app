import { test, expect } from "@playwright/test";

test.use({
  storageState: "tests/e2e/.auth/user.json",
});

test("create goal and log savings", async ({ page }) => {
  // Create a $1,000 goal
  await page.goto("/onboarding/goal");

  await page.getByLabel("Savings target").fill("1000");

  const deadline = new Date();
  deadline.setMonth(deadline.getMonth() + 2);

  const deadlineValue = deadline.toISOString().split("T")[0];

  await page.getByLabel("Goal deadline").fill(deadlineValue);

  await page.getByRole("button", {
    name: "Create savings goal",
  }).click();

  // Dashboard should show the new goal with $0 saved
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText("$1,000")).toBeVisible();
  await expect(page.getByText("$0")).toBeVisible();

  // Log $250
  await page.getByRole("link", { name: "Log savings" }).click();

  await expect(page).toHaveURL(/\/dashboard\/log/);

  await page.getByLabel("Amount saved").fill("250");

  await page.getByLabel(/Note/).fill("E2E test savings");

  await page.getByRole("button", {
    name: "Add savings",
  }).click();

  // Dashboard should now show $250 saved and 25% progress
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText("$250")).toBeVisible();
  await expect(page.getByText("25%")).toBeVisible();
});