import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
type RouteContext = {
  params: Promise<{ id: string }>;
};
export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await auth();
    const { id } = await context.params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const existingGoal = await prisma.goal.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingGoal) {
      return NextResponse.json(
        { error: "Goal not found." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const data: {
      targetAmount?: number;
      deadline?: Date;
    } = {};

    if (body.targetAmount !== undefined) {
      const targetAmount = Number(body.targetAmount);

      if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
        return NextResponse.json(
          {
            error: "Target amount must be greater than zero.",
          },
          { status: 400 }
        );
      }

      data.targetAmount = targetAmount;
    }

    if (body.deadline !== undefined) {
      const deadline = new Date(body.deadline);

      if (Number.isNaN(deadline.getTime())) {
        return NextResponse.json(
          { error: "Invalid deadline." },
          { status: 400 }
        );
      }

      const today = new Date();

      today.setHours(0, 0, 0, 0);

      const minDeadline = new Date(today);
      minDeadline.setMonth(minDeadline.getMonth() + 1);

      const maxDeadline = new Date(today);
      maxDeadline.setMonth(maxDeadline.getMonth() + 4);

      deadline.setHours(0, 0, 0, 0);

      if (deadline < minDeadline || deadline > maxDeadline) {
        return NextResponse.json(
          {
            error:
              "Deadline must be between 1 and 4 months from today.",
          },
          { status: 400 }
        );
      }

      data.deadline = deadline;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No changes provided." },
        { status: 400 }
      );
    }

    const goal = await prisma.goal.update({
      where: { id },
      data,
    });

    return NextResponse.json({ goal });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update goal.",
      },
      { status: 400 }
    );
  }
}