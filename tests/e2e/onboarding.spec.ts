import { test, expect } from "@playwright/test";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import crypto from "crypto";

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

const NEW_USER_EMAIL = "e2e-new-user@vault.local";

// These specs each start from an unauthenticated browser context —
// the project-level storageState is for the already-onboarded shared
// fixture user and isn't appropriate here.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("new user onboarding", () => {
  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test("a brand new user is routed through the questionnaire before reaching goal creation", async ({
    page,
    context,
  }) => {
    // Start from a clean slate for this dedicated user.
    await prisma.expenseProfile.deleteMany({
      where: { user: { email: NEW_USER_EMAIL } },
    });

    await prisma.user.deleteMany({ where: { email: NEW_USER_EMAIL } });

    const user = await prisma.user.create({
      data: { email: NEW_USER_EMAIL, name: "New Vault User" },
    });

    // Stand in for a completed Google OAuth sign-in, same approach as
    // tests/e2e/auth.setup.ts: create a database session directly and
    // hand the browser its cookie.
    const sessionToken = crypto.randomBytes(32).toString("hex");

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    await context.addCookies([
      {
        name: "authjs.session-token",
        value: sessionToken,
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ]);

    // A signed-in user with no expense profile hitting the dashboard
    // should be redirected into the questionnaire.
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/onboarding\/questionnaire$/);

    await expect(
      page.getByRole("heading", { name: /expenses/i })
    ).toBeVisible();

    const numberInputs = page.locator('input[type="number"]');
    const count = await numberInputs.count();

    for (let i = 0; i < count; i++) {
      await numberInputs.nth(i).fill("100");
    }

    await page.getByRole("button", { name: "Continue" }).click();

    // Completing the questionnaire hands off to goal creation.
    await expect(page).toHaveURL(/\/onboarding\/goal$/);

    const profile = await prisma.expenseProfile.findUnique({
      where: { userId: user.id },
    });

    expect(profile).not.toBeNull();
    expect(profile?.rent).toBe(100);
  });
});

test.describe("auth guard", () => {
  test("unauthenticated request to a protected route redirects to sign in", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/signin/);
  });
});
