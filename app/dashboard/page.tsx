import Link from "next/link";
import { auth } from "@/auth";
import { getActiveGoal } from "@/server/goals/getActiveGoal";
import { getGoalProgress } from "@/server/savings/getGoalProgress";
import GoalSummaryCard from "@/components/goal/GoalSummaryCard";

const primaryButton =
  "inline-flex items-center justify-center rounded-xl bg-[#28CB83] " +
  "px-5 py-3 font-semibold text-[#071F16] transition " +
  "hover:bg-[#52D99D] focus-visible:outline " +
  "focus-visible:outline-2 focus-visible:outline-offset-4 " +
  "focus-visible:outline-[#28CB83]";

const actionCard =
  "group rounded-2xl border border-[#304B3C] bg-[#153629] p-6 " +
  "transition hover:border-[#28CB83] hover:bg-[#1B4232] " +
  "focus-visible:outline focus-visible:outline-2 " +
  "focus-visible:outline-offset-4 focus-visible:outline-[#28CB83]";

function VaultHeader() {
  return (
    <header className="mb-12 flex flex-wrap items-center justify-between gap-4 border-b border-[#304B3C] pb-6">
      <Link
        href="/"
        aria-label="Vault home"
        className="text-2xl font-black tracking-[0.3em] text-[#28CB83]"
      >
        VAULT
      </Link>

      <p className="text-xs uppercase tracking-[0.2em] text-[#AEC4B7]">
        Goal driven savings
      </p>
    </header>
  );
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <main className="min-h-screen bg-[#071F16] px-6 py-8 text-white">
        <div className="mx-auto max-w-5xl">
          <VaultHeader />

          <section className="mx-auto mt-16 max-w-lg rounded-3xl border border-[#304B3C] bg-[#153629] p-8 text-center sm:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#28CB83]">
              Your next chapter
            </p>

            <h1 className="mt-4 text-3xl font-bold">
              Your goals start here.
            </h1>

            <p className="mt-4 leading-relaxed text-[#AEC4B7]">
              Sign in to access your savings goals, track your progress,
              and stay accountable.
            </p>

            <Link href="/api/auth/signin" className={`${primaryButton} mt-8`}>
              Sign in to Vault
            </Link>
          </section>
        </div>
      </main>
    );
  }

  const goal = await getActiveGoal(session.user.id);

  if (!goal) {
    return (
      <main className="min-h-screen bg-[#071F16] px-6 py-8 text-white">
        <div className="mx-auto max-w-5xl">
          <VaultHeader />

          <section className="rounded-3xl border border-[#304B3C] bg-[#153629] p-8 sm:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#28CB83]">
              Build your future
            </p>

            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
              Welcome
              {session.user.name ? `, ${session.user.name}` : " to Vault"}.
            </h1>

            <p className="mt-4 max-w-xl leading-relaxed text-[#AEC4B7]">
              You don&apos;t have an active savings goal yet. Choose
              what you&apos;re saving for, set a target, and take your
              first step.
            </p>

            <Link
              href="/onboarding/goal"
              className={`${primaryButton} mt-8`}
            >
              Create your goal
              <span aria-hidden="true" className="ml-3">
                →
              </span>
            </Link>
          </section>
        </div>
      </main>
    );
  }

  const progress = await getGoalProgress(session.user.id, goal.id);

  return (
    <main className="min-h-screen bg-[#071F16] px-6 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <VaultHeader />

        <section aria-labelledby="dashboard-heading">
          <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#28CB83]">
                Your savings dashboard
              </p>

              <h1
                id="dashboard-heading"
                className="mt-3 text-3xl font-bold sm:text-4xl"
              >
                Welcome
                {session.user.name ? `, ${session.user.name}` : ""}.
              </h1>

              <p className="mt-3 text-[#AEC4B7]">
                Small steps today. A stronger future tomorrow.
              </p>
            </div>

            <Link
              href="/dashboard/log"
              className={`${primaryButton} shrink-0 self-start`}
            >
              <span aria-hidden="true" className="mr-2">
                +
              </span>
              Log savings
            </Link>
          </div>

          <GoalSummaryCard
            targetAmount={progress.targetAmount}
            savedAmount={progress.savedAmount}
            deadline={goal.deadline.toISOString()}
            progress={progress.progress}
          />

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Link href="/dashboard/log" className={actionCard}>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">Add savings</h2>
                <span aria-hidden="true" className="text-2xl text-[#28CB83]">
                  +
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[#AEC4B7]">
                Record money you&apos;ve put toward your goal.
                Every step counts.
              </p>
            </Link>

            <Link href="/dashboard/history" className={actionCard}>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">Savings history</h2>
                <span aria-hidden="true" className="text-2xl text-[#28CB83]">
                  →
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[#AEC4B7]">
                Review your savings entries and see how far
                you&apos;ve come.
              </p>
            </Link>
          </div>
        </section>

        <footer className="mt-12 border-t border-[#304B3C] pt-6 text-sm text-[#AEC4B7]">
          Vault — Goal driven savings.
        </footer>
      </div>
    </main>
  );
}
