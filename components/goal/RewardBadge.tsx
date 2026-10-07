interface RewardBadgeProps {
  status: "active" | "completed" | "failed" | "cancelled";
  rewardAmount?: number | null;
  rewardRate?: number | null;
}

export function RewardBadge({
  status,
  rewardAmount,
  rewardRate,
}: RewardBadgeProps) {
  if (status === "active") {
    return (
      <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
        In progress
      </span>
    );
  }

  if (status === "failed") {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">
        Goal missed — No reward
      </span>
    );
  }

  if (status === "cancelled") {
    return (
      <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
        Cancelled
      </span>
    );
  }

  const amount = rewardAmount ?? 0;
  const percentage = ((rewardRate ?? 0) * 100).toFixed(0);

  return (
    <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
      +${amount} reward ({percentage}%)
    </span>
  );
}
