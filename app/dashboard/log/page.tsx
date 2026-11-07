import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getActiveGoal } from "@/server/goals/getActiveGoal";
import SavingsEntryForm from "@/components/savings/SavingsEntryForm";
import styles from "../../vault-pages.module.css";

export default async function LogSavingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const goal = await getActiveGoal(session.user.id);

  if (!goal) {
    redirect("/onboarding/goal");
  }

  return (
    <main className={styles.page}>
      <div className={styles.narrowContainer}>
        <section className={styles.panel}>
          <Link
            href="/dashboard"
            className={styles.backLink}
          >
            ← Back to dashboard
          </Link>

          <h1 className={styles.heading}>
            Log savings
          </h1>

          <p className={styles.description}>
            Record money you&apos;ve saved toward your
            current Vault goal.
          </p>

          <div className={styles.goalBox}>
            <p className={styles.goalLabel}>
              Current goal
            </p>

            <p className={styles.goalAmount}>
              ${goal.targetAmount.toLocaleString()}
            </p>
          </div>

          <SavingsEntryForm goalId={goal.id} />
        </section>
      </div>
    </main>
  );
}