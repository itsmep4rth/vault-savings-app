import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getActiveGoal } from "@/server/goals/getActiveGoal";
import SavingsEntryForm from "@/components/savings/SavingsEntryForm";

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
    <main className="mx-auto max-w-lg px-6 py-12">
      <Link
        href="/dashboard"
        className="text-sm text-gray-500 hover:text-black"
      >
        ← Back to dashboard
      </Link>

      <div className="mt-6 rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Log savings</h1>

        <p className="mt-2 text-gray-600">
          Record money you've saved toward your current Vault goal.
        </p>

        <div className="my-6 rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Current goal</p>
          <p className="mt-1 font-semibold">
            ${goal.targetAmount.toLocaleString()}
          </p>
        </div>

        <SavingsEntryForm goalId={goal.id} />
      </div>
    </main>
  );
}