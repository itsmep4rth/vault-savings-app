export type Env = {
  DATABASE_URL: string;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_PRICE_PREMIUM: string;
  CRON_SECRET: string;
};

// Every key in .env.example. Keep the two in sync.
const REQUIRED_KEYS: (keyof Env)[] = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_PREMIUM",
  "CRON_SECRET",
];

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Checks a set of environment variables and returns them typed.
 * Throws one error that lists every problem, not just the first.
 */
export function parseEnv(
  source: Record<string, string | undefined> = process.env
): Env {
  const problems: string[] = [];
  const values: Partial<Record<keyof Env, string>> = {};

  for (const key of REQUIRED_KEYS) {
    const value = source[key];

    if (value === undefined || value.trim() === "") {
      problems.push(`${key} is missing`);
    } else {
      values[key] = value;
    }
  }

  const databaseUrl = values.DATABASE_URL;
  if (
    databaseUrl !== undefined &&
    !/^postgres(ql)?:\/\//.test(databaseUrl)
  ) {
    problems.push("DATABASE_URL must start with postgres:// or postgresql://");
  }

  const nextAuthUrl = values.NEXTAUTH_URL;
  if (nextAuthUrl !== undefined && !isHttpUrl(nextAuthUrl)) {
    problems.push("NEXTAUTH_URL must be a valid http(s) URL");
  }

  if (problems.length > 0) {
    throw new Error(
      `Invalid environment variables:\n${problems
        .map((problem) => `  - ${problem}`)
        .join("\n")}`
    );
  }

  return values as Env;
}

let cachedEnv: Env | undefined;

/** Validates process.env on first call, then returns the cached result. */
export function getEnv(): Env {
  if (cachedEnv === undefined) {
    cachedEnv = parseEnv(process.env);
  }

  return cachedEnv;
}
