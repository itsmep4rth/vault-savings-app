import Link from "next/link";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  validatePassword,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
} from "@/lib/password";
import SignupSubmitButton from "./SignupSubmitButton";
import styles from "./signup.module.css";

async function registerAccount(formData: FormData) {
  "use server";

  const session = await auth();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  const rawName = formData.get("name");
  const rawEmail = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (
    typeof rawName !== "string" ||
    typeof rawEmail !== "string" ||
    typeof password !== "string" ||
    typeof confirmPassword !== "string"
  ) {
    redirect("/signup?error=invalid");
  }

  const name = rawName.trim();
  const email = rawEmail.trim().toLowerCase();

  if (
    name.length < 1 ||
    name.length > 100 ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    redirect("/signup?error=invalid");
  }

  if (validatePassword(password)) {
    redirect("/signup?error=password");
  }

  if (password !== confirmPassword) {
    redirect("/signup?error=mismatch");
  }

  let registrationError: "exists" | "unavailable" | null = null;

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      registrationError = "exists";
    } else {
      const passwordHash = await hashPassword(password);

      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
        select: {
          id: true,
        },
      });
    }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      registrationError = "exists";
    } else {
      console.error("Account registration failed.");
      registrationError = "unavailable";
    }
  }

  if (registrationError) {
    redirect(`/signup?error=${registrationError}`);
  }

  redirect("/signin?registered=1");
}

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  const { error } = await searchParams;

  const messages: Record<string, string> = {
    invalid: "Enter a name and a valid email address.",
    password:
      `Use a password between ${MIN_PASSWORD_LENGTH} and ` +
      `${MAX_PASSWORD_LENGTH} characters.`,
    mismatch: "Your passwords do not match.",
    exists:
      "An account already uses this email. Sign in with its existing " +
      "password, or use a different email for a new demo account.",
    unavailable:
      "Account creation is temporarily unavailable. Please try again.",
  };

  const errorMessage = error
    ? messages[error] ?? messages.unavailable
    : null;

  return (
    <main className={styles.page}>
      <section
        className={styles.panel}
        aria-labelledby="signup-heading"
      >
        <header className={styles.header}>
          <h1 id="signup-heading" className={styles.heading}>
            Create your account
          </h1>

          <p className={styles.description}>
            Set a goal and start tracking your savings.
          </p>
        </header>

        {errorMessage && (
          <p role="alert" className={styles.error}>
            {errorMessage}
          </p>
        )}

        <form action={registerAccount} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>
              Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              maxLength={100}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              maxLength={MAX_PASSWORD_LENGTH}
              aria-describedby="password-help"
              className={styles.input}
            />

            <p id="password-help" className={styles.help}>
              Use {MIN_PASSWORD_LENGTH} to {MAX_PASSWORD_LENGTH}
              {" "}characters. Choose a unique password for this demo.
            </p>
          </div>

          <div className={styles.field}>
            <label
              htmlFor="confirmPassword"
              className={styles.label}
            >
              Confirm password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              maxLength={MAX_PASSWORD_LENGTH}
              className={styles.input}
            />
          </div>

          <SignupSubmitButton />
        </form>

        <p className={styles.accountNote}>
          Already have an account?{" "}
          <Link href="/signin" className={styles.link}>
            Sign in
          </Link>
        </p>

        <p className={styles.demoNote}>
          College-project demo. Email ownership is not verified.
          Password recovery is not available. Use sample financial data.
        </p>
      </section>
    </main>
  );
}