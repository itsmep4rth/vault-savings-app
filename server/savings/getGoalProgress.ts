import { prisma } from "@/lib/prisma";
export async function getGoalProgress(userId: string, goalId: string) {
  const goal = await prisma.goal.findFirst({
    where: {
      id: goalId,
      userId,
    },
    include: {
      entries: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
  if (!goal) {
    throw new Error("Goal not found.");
  }
  const savedAmount = goal.entries.reduce(
    (total, entry) => total + entry.amount,
    0
  );
  const progress =
    goal.targetAmount > 0
      ? Math.min((savedAmount / goal.targetAmount) * 100, 100)
      : 0;
  return {
    goal,
    savedAmount,
    targetAmount: goal.targetAmount,
    progress,
    remainingAmount: Math.max(goal.targetAmount - savedAmount, 0),
  };
}
