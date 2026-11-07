import Link from "next/link";
import { auth } from "@/auth";
import styles from "./page.module.css";

export default async function HomePage() {
  const session = await auth();
  const signedIn = Boolean(session?.user?.id);

  return (
    <main className={styles.landing}>
      <h1 className={styles.screenReaderOnly}>
        Vault — Goal Driven Savings
      </h1>

      <section
        className={styles.accessPanel}
        aria-label="Access your Vault account"
      >
        <p className={styles.eyebrow}>
          YOUR NEXT GOAL STARTS HERE
        </p>

        <h2 className={styles.heading}>
          {signedIn ? "Welcome back." : "Make room for what matters."}
        </h2>

        <p className={styles.description}>
          {signedIn
            ? "Your goals are waiting. Pick up where you left off."
            : "Set your savings goal. Build your momentum. Make it happen."}
        </p>

        <div className={styles.action}>
          {signedIn ? (
            <Link
              href="/dashboard"
              className={styles.dashboardButton}
            >
              Go to dashboard
              <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <Link
              href="/signup"
              className={styles.dashboardButton}
            >
              Create account
              <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>

        {!signedIn && (
          <p className={styles.accountNote}>
            Already have an account?{" "}
            <Link href="/signin" className={styles.signInLink}>
              Sign in
            </Link>
          </p>
        )}
      </section>
    </main>
  );
}