import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured.");
}

const testDatabaseUrl = databaseUrl.replace(
  /\/Vault(\?|$)/,
  "/vault_test$1"
);

export default defineConfig({
  testDir: "./tests/e2e",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    env: {
      ...process.env,
      DATABASE_URL: testDatabaseUrl,
    },
  },

  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium",
      testMatch: /.*\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/e2e/.auth/user.json",
      },
    },
  ],
});