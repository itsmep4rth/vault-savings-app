export function validateGoalDeadline(deadline: Date) {
  if (Number.isNaN(deadline.getTime())) {
    throw new Error("Invalid deadline.");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const requestedDeadline = new Date(deadline);
  requestedDeadline.setHours(0, 0, 0, 0);

  const minDeadline = new Date(today);
  minDeadline.setMonth(minDeadline.getMonth() + 1);

  const maxDeadline = new Date(today);
  maxDeadline.setMonth(maxDeadline.getMonth() + 4);

  if (
    requestedDeadline < minDeadline ||
    requestedDeadline > maxDeadline
  ) {
    throw new Error(
      "Deadline must be between 1 and 4 months from today."
    );
  }

  return requestedDeadline;
}