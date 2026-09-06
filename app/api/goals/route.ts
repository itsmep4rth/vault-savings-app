import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createGoal } from "@/server/goals/createGoal";
import { getActiveGoal } from "@/server/goals/getActiveGoal";
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }
    const goal = await getActiveGoal(session.user.id);
    return NextResponse.json({ goal });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get goal." },
      { status: 500 }
    );
  }
}
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }
    const body = await request.json();
    const targetAmount = Number(body.targetAmount);
const deadline = new Date(body.deadline);

if (
  !Number.isFinite(targetAmount) ||
  targetAmount <= 0 ||
  Number.isNaN(deadline.getTime())
) {
      return NextResponse.json(
        { error: "Invalid goal data." },
        { status: 400 }
      );
    }
    const goal = await createGoal({
      userId: session.user.id,
      targetAmount,
      deadline,
    });
    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create goal.",
      },
      { status: 400 }
    );
  }
}
