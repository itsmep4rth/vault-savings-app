import Link from "next/link";
import { auth } from "@/auth";
import { getActiveGoal } from "@/server/goals/getActiveGoal";
import { getGoalProgress } from "@/server/savings/getGoalProgress";
import GoalSummaryCard from "@/components/goal/GoalSummaryCard";
import styles from "../vault-pages.module.css";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <main className={styles.page}>
        <div className={styles.narrowContainer}>
          <section className={styles.panel}>
            <h1 className={styles.heading}>
              Please sign in
            </h1>

            <p className={styles.description}>
              You need to sign in to access your Vault
              dashboard.
            </p>

            <div className={styles.actions}>
              <Link
                href="/signin"
                className={styles.button}
              >
                Sign in
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const goal = await getActiveGoal(session.user.id);

  if (!goal) {
    return (
      <main className={styles.page}>
        <div className={styles.mediumContainer}>
          <section className={styles.panel}>
            <h1 className={styles.heading}>
              Welcome to Vault
            </h1>

            <p className={styles.description}>
              You don&apos;t have an active savings goal yet.
            </p>

            <div className={styles.actions}>
              <Link
                href="/onboarding/goal"
                className={styles.button}
              >
                Create your goal
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const progress = await getGoalProgress(
    session.user.id,
    goal.id,
  );

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.panel}>
          <header className={styles.header}>
            <div>
              <p className={styles.eyebrow}>
                Vault Dashboard
              </p>

              <h1 className={styles.heading}>
                Welcome
                {session.user.name
                  ? `, ${session.user.name}`
                  : ""}
              </h1>
            </div>

            <Link
              href="/dashboard/log"
              className={styles.button}
            >
              Log savings
              <span aria-hidden="true">→</span>
            </Link>
          </header>

          <GoalSummaryCard
            targetAmount={progress.targetAmount}
            savedAmount={progress.savedAmount}
            deadline={goal.deadline.toISOString()}
            progress={progress.progress}
          />

          <div className={styles.cardGrid}>
            <Link
              href="/dashboard/log"
              className={styles.actionCard}
            >
              <h2 className={styles.cardHeading}>
                Add savings
              </h2>

              <p className={styles.cardDescription}>
                Record money you&apos;ve put toward your goal.
              </p>
            </Link>

            <Link
              href="/dashboard/history"
              className={styles.actionCard}
            >
              <h2 className={styles.cardHeading}>
                Savings history
              </h2>

              <p className={styles.cardDescription}>
                View your previous savings entries.
              </p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}