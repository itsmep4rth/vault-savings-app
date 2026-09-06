import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { addSavingsEntry } from "@/server/savings/addSavingsEntry";
import { getGoalProgress } from "@/server/savings/getGoalProgress";
import { updateSavingsEntry } from "@/server/savings/updateSavingsEntry";
import { deleteSavingsEntry } from "@/server/savings/deleteSavingsEntry";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get("goalId");

    if (!goalId) {
      return NextResponse.json(
        { error: "Goal ID is required." },
        { status: 400 }
      );
    }

    const progress = await getGoalProgress(
      session.user.id,
      goalId
    );

    return NextResponse.json(progress);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get savings.",
      },
      { status: 400 }
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
    const amount = Number(body.amount);

    if (!body.goalId || !Number.isFinite(amount)) {
      return NextResponse.json(
        { error: "Goal ID and a valid amount are required." },
        { status: 400 }
      );
    }

    const result = await addSavingsEntry({
      userId: session.user.id,
      goalId: body.goalId,
      amount,
      note: body.note,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to add savings.",
      },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const amount = Number(body.amount);

    if (!body.entryId || !Number.isFinite(amount)) {
      return NextResponse.json(
        { error: "Entry ID and a valid amount are required." },
        { status: 400 }
      );
    }

    const result = await updateSavingsEntry({
      userId: session.user.id,
      entryId: body.entryId,
      amount,
      note: body.note,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update savings.",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get("entryId");

    if (!entryId) {
      return NextResponse.json(
        { error: "Entry ID is required." },
        { status: 400 }
      );
    }

    const result = await deleteSavingsEntry(
      session.user.id,
      entryId
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete savings.",
      },
      { status: 400 }
    );
  }
}