import { test as setup, expect } from "@playwright/test";

setup.setTimeout(180000);

setup("authenticate Playwright with Google", async ({ page, context }) => {
  await page.goto("/");

  const dashboardLink = page.getByRole("link", {
    name: "Go to dashboard",
  });

  if (await dashboardLink.isVisible().catch(() => false)) {
    console.log("Already authenticated.");
  } else {
    console.log(
      "Complete Google sign-in manually in the Playwright browser window."
    );

    await page.getByRole("button", {
      name: /Continue with Google/i,
    }).click();

    await page.waitForURL(
      /\/(onboarding\/goal|dashboard)/,
      { timeout: 150000 }
    );

    await expect(
      page.getByRole("link", {
        name: /dashboard/i,
      }).or(
        page.getByRole("heading", {
          name: /create.*goal|savings goal/i,
        })
      )
    ).toBeVisible();
  }

  await context.storageState({
    path: "tests/e2e/.auth/user.json",
  });

  console.log("Authentication state saved.");
});