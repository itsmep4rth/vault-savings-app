import { prisma } from "@/lib/prisma";
type AddSavingsEntryInput = {
  userId: string;
  goalId: string;
  amount: number;
  note?: string;
};
export async function addSavingsEntry({
  userId,
  goalId,
  amount,
  note,
}: AddSavingsEntryInput) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Savings amount must be greater than zero.");
  }
  return prisma.$transaction(async (tx) => {
    const goal = await tx.goal.findFirst({
      where: {
        id: goalId,
        userId,
      },
    });
    if (!goal) {
      throw new Error("Goal not found or does not belong to user.");
    }
    const entry = await tx.savingsEntry.create({
      data: {
        goalId,
        amount,
        note,
      },
    });
    const aggregate = await tx.savingsEntry.aggregate({
      where: {
        goalId,
      },
      _sum: {
        amount: true,
      },
    });
    const savedAmount = aggregate._sum.amount ?? 0;
    const updatedGoal = await tx.goal.update({
      where: {
        id: goalId,
      },
      data: {
        savedAmount,
      },
    });
    return {
      entry,
      goal: updatedGoal,
    };
  });
}
