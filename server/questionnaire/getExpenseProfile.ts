import { prisma } from "@/lib/prisma";

export async function getExpenseProfile(userId: string) {
  return prisma.expenseProfile.findUnique({
    where: { userId },
  });
}
