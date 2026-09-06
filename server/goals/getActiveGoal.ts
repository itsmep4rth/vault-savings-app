import { prisma } from "@/lib/prisma";
export async function getActiveGoal(userId: string) {
  return prisma.goal.findFirst({
    where: {
      userId,
      status: "active",
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
