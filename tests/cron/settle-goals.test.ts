import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { mockGoalFindMany, mockSettleGoal } = vi.hoisted(() => ({
  mockGoalFindMany: vi.fn(),
  mockSettleGoal: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    goal: {
      findMany: mockGoalFindMany,
    },
  },
}));

vi.mock("@/server/goals/settleGoal", () => ({
  settleGoal: mockSettleGoal,
}));

import { GET } from "@/app/api/cron/settle-goals/route";

describe("GET /api/cron/settle-goals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "test-secret";
  });

  it("rejects requests with no authorization header", async () => {
    const request = new NextRequest(
      "http://localhost/api/cron/settle-goals"
    );

    const response = await GET(request);

    expect(response.status).toBe(401);
    expect(mockGoalFindMany).not.toHaveBeenCalled();
  });

  it("rejects requests with the wrong secret", async () => {
    const request = new NextRequest(
      "http://localhost/api/cron/settle-goals",
      {
        headers: {
          authorization: "Bearer wrong-secret",
        },
      }
    );

    const response = await GET(request);

    expect(response.status).toBe(401);
    expect(mockGoalFindMany).not.toHaveBeenCalled();
  });

  it("settles overdue active goals with the correct secret", async () => {
    mockGoalFindMany.mockResolvedValue([
      { id: "goal-1" },
      { id: "goal-2" },
    ]);

    mockSettleGoal
      .mockResolvedValueOnce({ id: "goal-1", status: "completed" })
      .mockResolvedValueOnce({ id: "goal-2", status: "failed" });

    const request = new NextRequest(
      "http://localhost/api/cron/settle-goals",
      {
        headers: {
          authorization: "Bearer test-secret",
        },
      }
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.processed).toBe(2);

    expect(mockGoalFindMany).toHaveBeenCalledWith({
      where: {
        status: "active",
        deadline: {
          lte: expect.any(Date),
        },
      },
      select: {
        id: true,
      },
    });

    expect(mockSettleGoal).toHaveBeenCalledWith("goal-1");
    expect(mockSettleGoal).toHaveBeenCalledWith("goal-2");
  });

  it("returns a 500 error when CRON_SECRET is not configured", async () => {
    delete process.env.CRON_SECRET;

    const request = new NextRequest(
      "http://localhost/api/cron/settle-goals",
      {
        headers: {
          authorization: "Bearer test-secret",
        },
      }
    );

    const response = await GET(request);

    expect(response.status).toBe(500);
    expect(mockGoalFindMany).not.toHaveBeenCalled();
  });

  it("does nothing when no goals are past their deadline", async () => {
    mockGoalFindMany.mockResolvedValue([]);

    const request = new NextRequest(
      "http://localhost/api/cron/settle-goals",
      {
        headers: {
          authorization: "Bearer test-secret",
        },
      }
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.processed).toBe(0);
    expect(mockSettleGoal).not.toHaveBeenCalled();
  });

  it("keeps settling the other goals when one goal fails", async () => {
    mockGoalFindMany.mockResolvedValue([
      { id: "goal-1" },
      { id: "goal-2" },
    ]);

    mockSettleGoal
      .mockRejectedValueOnce(new Error("database error"))
      .mockResolvedValueOnce({ id: "goal-2", status: "completed" });

    const request = new NextRequest(
      "http://localhost/api/cron/settle-goals",
      {
        headers: {
          authorization: "Bearer test-secret",
        },
      }
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.processed).toBe(2);
    expect(body.results).toEqual([
      { goalId: "goal-1", status: "error" },
      { goalId: "goal-2", status: "completed" },
    ]);
  });
});
