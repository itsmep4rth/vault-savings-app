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
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">Active savings goal</p>

          <h2 className="mt-1 text-3xl font-bold">
            ${savedAmount.toLocaleString()}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            of ${targetAmount.toLocaleString()}
          </p>
        </div>

        <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium">
          {daysLeft} days left
        </div>
      </div>

      <GoalProgressBar progress={progress} />

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Progress</p>

          <p className="mt-1 text-lg font-semibold text-gray-900">
            {formattedProgress}%
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Complete
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Remaining</p>

          <p className="mt-1 text-lg font-semibold text-gray-900">
            ${remaining.toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            To reach your goal
          </p>
        </div>
      </div>
    </div>
  );
}