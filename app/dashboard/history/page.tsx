import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getActiveGoal } from "@/server/goals/getActiveGoal";
import { getGoalProgress } from "@/server/savings/getGoalProgress";
import SavingsTimeline from "@/components/savings/SavingsTimeline";

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
    goal.id
  );

  const entries = progress.goal.entries.map((entry) => ({
    id: entry.id,
    amount: entry.amount,
    note: entry.note,
    createdAt: entry.createdAt.toISOString(),
  }));

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/dashboard"
        className="text-sm text-gray-500 hover:text-black"
      >
        ← Back to dashboard
      </Link>

      <div className="mb-8 mt-6">
        <h1 className="text-3xl font-bold">Savings history</h1>

        <p className="mt-2 text-gray-600">
          You've saved ${progress.savedAmount.toLocaleString()} toward your
          ${progress.targetAmount.toLocaleString()} goal.
        </p>
      </div>

      <SavingsTimeline entries={entries} />
    </main>
  );
}