import { test as setup } from "@playwright/test";
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

const TEST_EMAIL = "e2e-test@vault.local";

setup.setTimeout(30_000);

setup("authenticate E2E test user", async ({ context }) => {
  let user = await prisma.user.findUnique({
    where: {
      email: TEST_EMAIL,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: TEST_EMAIL,
        name: "Vault E2E Test User",
      },
    });
  }

  // Downstream specs (e.g. the goal/savings flow) exercise post-onboarding
  // routes, which now redirect to the questionnaire until a profile exists.
  // Treat this shared fixture user as already onboarded.
  await prisma.expenseProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      rent: 1200,
      groceries: 300,
      food: 150,
      transport: 100,
      utilities: 80,
      other: 50,
    },
  });

  // Remove any previous sessions for the test user.
  await prisma.session.deleteMany({
    where: {
      userId: user.id,
    },
  });

  // Create a fresh Auth.js database session.
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

  await context.storageState({
    path: "tests/e2e/.auth/user.json",
  });

  await prisma.$disconnect();

  console.log(`E2E authentication state created for ${TEST_EMAIL}.`);
});