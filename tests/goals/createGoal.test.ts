import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  prisma: {
    goal: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mocks.prisma,
}));

import { createGoal } from "@/server/goals/createGoal";

describe("createGoal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects creating a goal when the user already has an active goal", async () => {
    mocks.prisma.goal.findFirst.mockResolvedValue({
      id: "existing-goal",
      userId: "user-1",
      status: "active",
    });

    await expect(
      createGoal({
        userId: "user-1",
        targetAmount: 1000,
        deadline: new Date("2026-12-01T12:00:00"),
      })
    ).rejects.toThrow("User already has an active goal.");

    expect(mocks.prisma.goal.create).not.toHaveBeenCalled();
  });

  it("allows creating a goal when the user has no active goal", async () => {
    mocks.prisma.goal.findFirst.mockResolvedValue(null);

    mocks.prisma.goal.create.mockResolvedValue({
      id: "new-goal",
      userId: "user-1",
      targetAmount: 1000,
      deadline: new Date("2026-12-01T00:00:00"),
      status: "active",
      savedAmount: 0,
    });

    const result = await createGoal({
      userId: "user-1",
      targetAmount: 1000,
      deadline: new Date("2026-12-01T12:00:00"),
    });

    expect(result.id).toBe("new-goal");

    expect(mocks.prisma.goal.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        targetAmount: 1000,
        deadline: new Date("2026-12-01T00:00:00"),
      },
    });
  });
});