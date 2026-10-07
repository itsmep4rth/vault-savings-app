import { GoalStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { calculateInterest } from "@/server/reward/calculateInterest";

export async function settleGoal(goalId: string) {
  return prisma.$transaction(async (tx) => {
    const goal = await tx.goal.findUnique({
      where: {
        id: goalId,
      },
      include: {
        user: {
          select: {
            plan: true,
          },
        },
      },
    });

    if (!goal) {
      throw new Error("Goal not found");
    }

    // Do nothing if this goal has already been settled.
    if (goal.status !== GoalStatus.active) {
      return goal;
    }

    const result = calculateInterest({
      plan: goal.user.plan,
      savedAmount: goal.savedAmount,
      targetAmount: goal.targetAmount,
    });

    const status = result.metGoal
      ? GoalStatus.completed
      : GoalStatus.failed;

    const updatedGoal = await tx.goal.update({
      where: {
        id: goal.id,
      },
      data: {
        status,
        rewardRate: result.rewardRate,
        rewardAmount: result.rewardAmount,
        settledAt: new Date(),
      },
    });

    return updatedGoal;
  });
}
