import { prisma } from "@/lib/prisma";
import { validateGoalDeadline } from "./validateGoalDeadline";

type CreateGoalInput = {
  userId: string;
  targetAmount: number;
  deadline: Date;
};

export async function createGoal({
  userId,
  targetAmount,
  deadline,
}: CreateGoalInput) {
  // Validate target amount
  if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
    throw new Error("Target amount must be greater than zero.");
  }

  // Validate deadline using the shared 1–4 month rule
  const validatedDeadline = validateGoalDeadline(deadline);

  // Only one active goal is allowed per user
  const existingGoal = await prisma.goal.findFirst({
    where: {
      userId,
      status: "active",
    },
  });

  if (existingGoal) {
    throw new Error("User already has an active goal.");
  }

  // Create the new active goal
  return prisma.goal.create({
    data: {
      userId,
      targetAmount,
      deadline: validatedDeadline,
    },
  });
}