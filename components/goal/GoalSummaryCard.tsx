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
    <div className="rounded-2xl border border-[#304B3C] bg-[#153629] p-6 text-white shadow-sm">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[#AEC4B7]">
            Active savings goal
          </p>

          <h2 className="mt-2 break-words text-3xl font-bold text-[#28CB83] sm:text-4xl">
            ${savedAmount.toLocaleString()}
          </h2>

          <p className="mt-2 text-sm text-[#AEC4B7]">
            of ${targetAmount.toLocaleString()}
          </p>
        </div>

        <div className="rounded-lg border border-[#304B3C] bg-[#071F16] px-3 py-2 text-sm font-medium text-[#28CB83]">
          {daysLeft} days left
        </div>
      </div>

      <GoalProgressBar progress={progress} />

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#304B3C] bg-[#0B271C] p-4">
          <p className="text-sm text-[#AEC4B7]">
            Progress
          </p>

          <p className="mt-1 text-lg font-semibold text-[#28CB83]">
            {formattedProgress}%
          </p>

          <p className="mt-1 text-xs text-[#AEC4B7]">
            Complete
          </p>
        </div>

        <div className="rounded-xl border border-[#304B3C] bg-[#0B271C] p-4">
          <p className="text-sm text-[#AEC4B7]">
            Remaining
          </p>

          <p className="mt-1 break-words text-lg font-semibold text-white">
            ${remaining.toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-[#AEC4B7]">
            To reach your goal
          </p>
        </div>
      </div>
    </div>
  );
}
