import GoalProgressBar from "./GoalProgressBar";

type GoalSummaryCardProps = {
  targetAmount: number;
  savedAmount: number;
  deadline: string;
  progress: number;
};

export default function GoalSummaryCard({
  targetAmount,
  savedAmount,
  deadline,
  progress,
}: GoalSummaryCardProps) {
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(deadline).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const remaining = Math.max(targetAmount - savedAmount, 0);

  const formattedProgress = Number.isInteger(progress)
    ? progress.toString()
    : progress.toFixed(1);

  return (
    <section
      aria-labelledby="active-goal-heading"
      className="min-w-0 rounded-2xl border border-white/15 bg-[#0b2b1f] p-5 text-white shadow-sm sm:p-6"
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2
            id="active-goal-heading"
            className="text-sm font-medium text-[#c4d5cc]"
          >
            Active savings goal
          </h2>

          <p className="mt-1 break-words text-3xl font-bold text-[#8ff2bc]">
            ${savedAmount.toLocaleString()}
          </p>

          <p className="mt-1 text-sm text-[#c4d5cc]">
            of ${targetAmount.toLocaleString()}
          </p>
        </div>

        <div className="shrink-0 rounded-xl border border-[#8ff2bc]/30 bg-[#163d2c] px-4 py-3 text-center">
          <p className="text-2xl font-bold leading-tight text-[#8ff2bc]">
            {daysLeft}
          </p>

          <p className="mt-1 text-sm font-medium text-white">
            {daysLeft === 1 ? "day left" : "days left"}
          </p>
        </div>
      </div>

      <GoalProgressBar progress={progress} />

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="min-w-0 rounded-xl border border-white/10 bg-[#061d15] p-4">
          <p className="text-sm text-[#c4d5cc]">
            Progress
          </p>

          <p className="mt-1 break-words text-lg font-semibold text-white">
            {formattedProgress}%
          </p>

          <p className="mt-1 text-xs text-[#a9c1b4]">
            Complete
          </p>
        </div>

        <div className="min-w-0 rounded-xl border border-white/10 bg-[#061d15] p-4">
          <p className="text-sm text-[#c4d5cc]">
            Remaining
          </p>

          <p className="mt-1 break-words text-lg font-semibold text-white">
            ${remaining.toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-[#a9c1b4]">
            To reach your goal
          </p>
        </div>
      </div>
    </section>
  );
}