type GoalProgressBarProps = {
  progress: number;
};

export default function GoalProgressBar({
  progress,
}: GoalProgressBarProps) {
  const safeProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
      <div
        className="h-full rounded-full bg-black transition-all"
        style={{ width: `${safeProgress}%` }}
      />
    </div>
  );
}