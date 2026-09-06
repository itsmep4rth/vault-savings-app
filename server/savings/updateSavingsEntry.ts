import { prisma } from "@/lib/prisma";

type UpdateSavingsEntryInput = {
  userId: string;
  entryId: string;
  amount: number;
  note?: string;
};

export async function updateSavingsEntry({
  userId,
  entryId,
  amount,
  note,
}: UpdateSavingsEntryInput) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Savings amount must be greater than zero.");
  }

  return prisma.$transaction(async (tx) => {
    const entry = await tx.savingsEntry.findFirst({
      where: {
        id: entryId,
        goal: {
          userId,
        },
      },
    });

    if (!entry) {
      throw new Error("Savings entry not found.");
    }

    const updatedEntry = await tx.savingsEntry.update({
      where: {
        id: entryId,
      },
      data: {
        amount,
        note,
      },
    });

    const aggregate = await tx.savingsEntry.aggregate({
      where: {
        goalId: entry.goalId,
      },
      _sum: {
        amount: true,
      },
    });

    const savedAmount = aggregate._sum.amount ?? 0;

    const goal = await tx.goal.update({
      where: {
        id: entry.goalId,
      },
      data: {
        savedAmount,
      },
    });

    return {
      entry: updatedEntry,
      goal,
    };
  });
}