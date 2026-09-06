import Link from "next/link";
import { auth } from "@/auth";
import { getActiveGoal } from "@/server/goals/getActiveGoal";
import { getGoalProgress } from "@/server/savings/getGoalProgress";
import GoalSummaryCard from "@/components/goal/GoalSummaryCard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Please sign in</h1>
          <p className="mt-2 text-gray-500">
            You need to sign in to access your Vault dashboard.
          </p>
        </div>
      </main>
    );
  }

  const goal = await getActiveGoal(session.user.id);

  if (!goal) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold">Welcome to Vault</h1>

        <p className="mt-2 text-gray-600">
          You don't have an active savings goal yet.
        </p>

        <Link
          href="/onboarding/goal"
          className="mt-6 inline-block rounded-lg bg-black px-5 py-3 font-medium text-white"
        >
          Create your goal
        </Link>
      </main>
    );
  }

  const progress = await getGoalProgress(session.user.id, goal.id);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Vault Dashboard</p>

          <h1 className="mt-1 text-3xl font-bold">
            Welcome{session.user.name ? `, ${session.user.name}` : ""}
          </h1>
        </div>

        <Link
          href="/dashboard/log"
          className="rounded-lg bg-black px-5 py-3 font-medium text-white"
        >
          Log savings
        </Link>
      </div>

      <GoalSummaryCard
        targetAmount={progress.targetAmount}
        savedAmount={progress.savedAmount}
        deadline={goal.deadline.toISOString()}
        progress={progress.progress}
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/log"
          className="rounded-xl border bg-white p-5 transition hover:bg-gray-50"
        >
          <h2 className="font-semibold">Add savings</h2>
          <p className="mt-1 text-sm text-gray-500">
            Record money you've put toward your goal.
          </p>
        </Link>

        <Link
          href="/dashboard/history"
          className="rounded-xl border bg-white p-5 transition hover:bg-gray-50"
        >
          <h2 className="font-semibold">Savings history</h2>
          <p className="mt-1 text-sm text-gray-500">
            View your previous savings entries.
          </p>
        </Link>
      </div>
    </main>
  );
}