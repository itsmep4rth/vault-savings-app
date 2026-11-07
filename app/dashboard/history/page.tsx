import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getActiveGoal } from "@/server/goals/getActiveGoal";
import { getGoalProgress } from "@/server/savings/getGoalProgress";
import SavingsTimeline from "@/components/savings/SavingsTimeline";
import styles from "../../vault-pages.module.css";

export default async function SavingsHistoryPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const goal = await getActiveGoal(session.user.id);

  if (!goal) {
    redirect("/onboarding/goal");
  }

  const progress = await getGoalProgress(
    session.user.id,
    goal.id,
  );

  const entries = progress.goal.entries.map((entry) => ({
    id: entry.id,
    amount: entry.amount,
    note: entry.note,
    createdAt: entry.createdAt.toISOString(),
  }));

  return (
    <main className={styles.page}>
      <div className={styles.mediumContainer}>
        <section className={styles.panel}>
          <Link
            href="/dashboard"
            className={styles.backLink}
          >
            ← Back to dashboard
          </Link>

          <header className={styles.header}>
            <div>
              <h1 className={styles.heading}>
                Savings history
              </h1>

              <p className={styles.description}>
                You&apos;ve saved $
                {progress.savedAmount.toLocaleString()}
                {" toward your $"}
                {progress.targetAmount.toLocaleString()}
                {" goal."}
              </p>
            </div>
          </header>

          <SavingsTimeline entries={entries} />
        </section>
      </div>
    </main>
  );
}