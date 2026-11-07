import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/auth";
import {
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
} from "@/lib/password";
import styles from "../signup/signup.module.css";

async function signInWithPassword(formData: FormData) {
  "use server";

  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    redirect("/signin?error=invalid");
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        redirect("/signin?error=invalid");
      }

      console.error("Password sign-in failed:", error.type);
      redirect("/signin?error=unavailable");
    }

    // Successful sign-in redirects are thrown by Next.js.
    // Rethrow them, along with unexpected errors.
    throw error;
  }
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    registered?: string;
    callbackUrl?: string;
  }>;
}) {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  const errorMessage =
    params.error === "invalid"
      ? "Unable to sign in. Check your email and password."
      : params.error
        ? "Sign-in is temporarily unavailable. Please try again."
        : null;

  return (
    <main className={styles.page}>
      <section
        className={styles.panel}
        aria-labelledby="signin-heading"
      >
        <header className={styles.header}>
          <h1 id="signin-heading" className={styles.heading}>
            Welcome back
          </h1>

          <p className={styles.description}>
            Sign in to set a goal, track your savings,
            and view your progress.
          </p>

          {params.registered === "1" && !errorMessage && (
            <p role="status" className={styles.description}>
              Account created. You can now sign in.
            </p>
          )}
        </header>

        {errorMessage && (
          <p role="alert" className={styles.error}>
            {errorMessage}
          </p>
        )}

        <form
          action={signInWithPassword}
          className={styles.form}
        >
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
            <label
              htmlFor="password"
              className={styles.label}
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              maxLength={MAX_PASSWORD_LENGTH}
              className={styles.input}
            />

            <p className={styles.accountNote}>
              <Link
                href="/forgot-password"
                className={styles.link}
              >
                Forgot password?
              </Link>
            </p>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
          >
            Sign in
            <span aria-hidden="true">→</span>
          </button>
        </form>

        <p className={styles.accountNote}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className={styles.link}>
            Create an account
          </Link>
        </p>

        <p className={styles.demoNote}>
          College-project demo. Use a unique demo password
          and sample financial data. Email verification
          and working password recovery are not available
          in this version.
        </p>
      </section>
    </main>
  );
}