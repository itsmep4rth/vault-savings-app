import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGoalFindUnique, mockGoalUpdate, mockTransaction } = vi.hoisted(
  () => ({
    mockGoalFindUnique: vi.fn(),
    mockGoalUpdate: vi.fn(),
    mockTransaction: vi.fn(),
  })
);

vi.mock("@/lib/db", () => ({
  prisma: {
    $transaction: mockTransaction,
  },
}));

vi.mock("@prisma/client", () => ({
  GoalStatus: {
    active: "active",
    completed: "completed",
    failed: "failed",
    cancelled: "cancelled",
  },
}));

import { settleGoal } from "@/server/goals/settleGoal";

describe("settleGoal", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockTransaction.mockImplementation(async (callback) =>
      callback({
        goal: {
          findUnique: mockGoalFindUnique,
          update: mockGoalUpdate,
        },
      })
    );
  });

  it("throws an error when the goal does not exist", async () => {
    mockGoalFindUnique.mockResolvedValue(null);

    await expect(settleGoal("missing-goal")).rejects.toThrow(
      "Goal not found"
    );
  });

  it("does nothing when the goal is already settled", async () => {
    mockGoalFindUnique.mockResolvedValue({
      id: "goal-1",
      status: "completed",
      savedAmount: 1000,
      targetAmount: 1000,
      rewardRate: 0.01,
      rewardAmount: 10,
      settledAt: new Date(),
      user: {
        plan: "free",
      },
    });

    const result = await settleGoal("goal-1");

    expect(result.status).toBe("completed");
    expect(mockGoalUpdate).not.toHaveBeenCalled();
  });

  it("completes a goal and gives a free user 1% reward", async () => {
    mockGoalFindUnique.mockResolvedValue({
      id: "goal-1",
      status: "active",
      savedAmount: 1000,
      targetAmount: 1000,
      user: {
        plan: "free",
      },
    });

    mockGoalUpdate.mockResolvedValue({
      id: "goal-1",
      status: "completed",
      rewardRate: 0.01,
      rewardAmount: 10,
      settledAt: new Date(),
    });

    const result = await settleGoal("goal-1");

    expect(result.status).toBe("completed");

    expect(mockGoalUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "goal-1",
        },
        data: expect.objectContaining({
          status: "completed",
          rewardRate: 0.01,
          rewardAmount: 10,
        }),
      })
    );
  });

  it("completes a goal and gives a premium user 3% reward", async () => {
    mockGoalFindUnique.mockResolvedValue({
      id: "goal-2",
      status: "active",
      savedAmount: 2000,
      targetAmount: 2000,
      user: {
        plan: "premium",
      },
    });

    mockGoalUpdate.mockResolvedValue({
      id: "goal-2",
      status: "completed",
      rewardRate: 0.03,
      rewardAmount: 60,
      settledAt: new Date(),
    });

    const result = await settleGoal("goal-2");

    expect(result.status).toBe("completed");

    expect(mockGoalUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "completed",
          rewardRate: 0.03,
          rewardAmount: 60,
        }),
      })
    );
  });

  it("fails a goal when the target was not reached", async () => {
    mockGoalFindUnique.mockResolvedValue({
      id: "goal-3",
      status: "active",
      savedAmount: 700,
      targetAmount: 1000,
      user: {
        plan: "premium",
      },
    });

    mockGoalUpdate.mockResolvedValue({
      id: "goal-3",
      status: "failed",
      rewardRate: 0.03,
      rewardAmount: 0,
      settledAt: new Date(),
    });

    const result = await settleGoal("goal-3");

    expect(result.status).toBe("failed");

    expect(mockGoalUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "failed",
          rewardRate: 0.03,
          rewardAmount: 0,
        }),
      })
    );
  });
});
