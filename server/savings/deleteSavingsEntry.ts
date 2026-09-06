import { prisma } from "@/lib/prisma";

export async function deleteSavingsEntry(
  userId: string,
  entryId: string
) {
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

    await tx.savingsEntry.delete({
      where: {
        id: entryId,
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
      goal,
      deletedEntryId: entryId,
    };
  });
}