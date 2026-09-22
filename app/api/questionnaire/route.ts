import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveExpenseProfile } from "@/server/questionnaire/saveExpenseProfile";

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

    const profile = await saveExpenseProfile({
      userId: session.user.id,
      rent: Number(body.rent),
      groceries: Number(body.groceries),
      food: Number(body.food),
      transport: Number(body.transport),
      utilities: Number(body.utilities),
      other: Number(body.other),
    });

    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to save expense profile.",
      },
      { status: 400 }
    );
  }
}
