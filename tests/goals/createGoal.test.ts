import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

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
    vi.resetAllMocks();

    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 7, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
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
        deadline: new Date(2027, 0, 7, 12, 0, 0),
      }),
    ).rejects.toThrow("User already has an active goal.");

    expect(mocks.prisma.goal.findFirst).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        status: "active",
      },
    });

    expect(mocks.prisma.goal.create).not.toHaveBeenCalled();
  });

  it("allows creating a goal when the user has no active goal", async () => {
    const requestedDeadline = new Date(
      2027,
      0,
      7,
      12,
      0,
      0,
    );

    const normalizedDeadline = new Date(
      2027,
      0,
      7,
      0,
      0,
      0,
    );

    mocks.prisma.goal.findFirst.mockResolvedValue(null);

    mocks.prisma.goal.create.mockResolvedValue({
      id: "new-goal",
      userId: "user-1",
      targetAmount: 1000,
      deadline: normalizedDeadline,
      status: "active",
      savedAmount: 0,
    });

    const result = await createGoal({
      userId: "user-1",
      targetAmount: 1000,
      deadline: requestedDeadline,
    });

    expect(result.id).toBe("new-goal");

    expect(mocks.prisma.goal.findFirst).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        status: "active",
      },
    });

    expect(mocks.prisma.goal.create).toHaveBeenCalledTimes(1);

    expect(mocks.prisma.goal.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        targetAmount: 1000,
        deadline: normalizedDeadline,
      },
    });
  });
});