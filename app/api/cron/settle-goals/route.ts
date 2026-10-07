import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { settleGoal } from "@/server/goals/settleGoal";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("CRON_SECRET is not configured");

    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const authorization = request.headers.get("authorization");

  if (authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const now = new Date();

    const goals = await prisma.goal.findMany({
      where: {
        status: "active",
        deadline: {
          lte: now,
        },
      },
      select: {
        id: true,
      },
    });

    const results = [];

    for (const goal of goals) {
      try {
        const settledGoal = await settleGoal(goal.id);

        results.push({
          goalId: goal.id,
          status: settledGoal.status,
        });
      } catch (error) {
        console.error(`Failed to settle goal ${goal.id}`, error);

        results.push({
          goalId: goal.id,
          status: "error",
        });
      }
    }

    console.info("Goal settlement completed", {
      processed: goals.length,
    });

    return NextResponse.json({
      success: true,
      processed: goals.length,
      results,
    });
  } catch (error) {
    console.error("Goal settlement cron failed", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to settle goals",
      },
      { status: 500 }
    );
  }
}
