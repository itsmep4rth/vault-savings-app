type GoalProgressBarProps = {
  progress: number;
};

export default function GoalProgressBar({
  progress,
}: GoalProgressBarProps) {
  const safeProgress = Number.isFinite(progress)
    ? Math.min(Math.max(progress, 0), 100)
    : 0;

  return (
    <div
      role="progressbar"
      aria-label="Savings goal progress"
      aria-valuenow={safeProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-3 w-full overflow-hidden rounded-full bg-[#304B3C]"
    >
      <div
        className="h-full rounded-full bg-[#28CB83] transition-[width] duration-500 ease-out motion-reduce:transition-none"
        style={{ width: `${safeProgress}%` }}
      />
    </div>
  );
}
