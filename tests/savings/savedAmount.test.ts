import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  prisma: {
    $transaction: vi.fn(),
    goal: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    savingsEntry: {
      create: vi.fn(),
      aggregate: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mocks.prisma,
}));

import { addSavingsEntry } from "@/server/savings/addSavingsEntry";
import { updateSavingsEntry } from "@/server/savings/updateSavingsEntry";
import { deleteSavingsEntry } from "@/server/savings/deleteSavingsEntry";

describe("Savings savedAmount recomputation", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.prisma.$transaction.mockImplementation(
      async (callback: (tx: typeof mocks.prisma) => unknown) =>
        callback(mocks.prisma)
    );
  });

  it("recomputes savedAmount after adding a savings entry", async () => {
    mocks.prisma.goal.findFirst.mockResolvedValue({
      id: "goal-1",
      userId: "user-1",
    });

    mocks.prisma.savingsEntry.create.mockResolvedValue({
      id: "entry-1",
      goalId: "goal-1",
      amount: 100,
      note: "First deposit",
    });

    mocks.prisma.savingsEntry.aggregate.mockResolvedValue({
      _sum: {
        amount: 100,
      },
    });

    mocks.prisma.goal.update.mockResolvedValue({
      id: "goal-1",
      savedAmount: 100,
    });

    const result = await addSavingsEntry({
      userId: "user-1",
      goalId: "goal-1",
      amount: 100,
      note: "First deposit",
    });

    expect(result.goal.savedAmount).toBe(100);

    expect(mocks.prisma.goal.update).toHaveBeenCalledWith({
      where: { id: "goal-1" },
      data: { savedAmount: 100 },
    });
  });

  it("recomputes savedAmount after editing a savings entry", async () => {
    mocks.prisma.savingsEntry.findFirst.mockResolvedValue({
      id: "entry-1",
      goalId: "goal-1",
    });

    mocks.prisma.savingsEntry.update.mockResolvedValue({
      id: "entry-1",
      goalId: "goal-1",
      amount: 250,
      note: "Updated deposit",
    });

    mocks.prisma.savingsEntry.aggregate.mockResolvedValue({
      _sum: {
        amount: 250,
      },
    });

    mocks.prisma.goal.update.mockResolvedValue({
      id: "goal-1",
      savedAmount: 250,
    });

    const result = await updateSavingsEntry({
      userId: "user-1",
      entryId: "entry-1",
      amount: 250,
      note: "Updated deposit",
    });

    expect(result.goal.savedAmount).toBe(250);

    expect(mocks.prisma.goal.update).toHaveBeenCalledWith({
      where: { id: "goal-1" },
      data: { savedAmount: 250 },
    });
  });

  it("recomputes savedAmount after deleting a savings entry", async () => {
    mocks.prisma.savingsEntry.findFirst.mockResolvedValue({
      id: "entry-1",
      goalId: "goal-1",
    });

    mocks.prisma.savingsEntry.delete.mockResolvedValue({
      id: "entry-1",
    });

    mocks.prisma.savingsEntry.aggregate.mockResolvedValue({
      _sum: {
        amount: 150,
      },
    });

    mocks.prisma.goal.update.mockResolvedValue({
      id: "goal-1",
      savedAmount: 150,
    });

    const result = await deleteSavingsEntry(
      "user-1",
      "entry-1"
    );

    expect(result.goal.savedAmount).toBe(150);

    expect(mocks.prisma.goal.update).toHaveBeenCalledWith({
      where: { id: "goal-1" },
      data: { savedAmount: 150 },
    });
  });

  it("rejects an entry that does not belong to the user", async () => {
    mocks.prisma.goal.findFirst.mockResolvedValue(null);

    await expect(
      addSavingsEntry({
        userId: "user-1",
        goalId: "someone-elses-goal",
        amount: 100,
      })
    ).rejects.toThrow("Goal not found or does not belong to user.");

    expect(
      mocks.prisma.savingsEntry.create
    ).not.toHaveBeenCalled();

    expect(
      mocks.prisma.goal.update
    ).not.toHaveBeenCalled();
  });

  it("rejects editing an entry that does not belong to the user", async () => {
    mocks.prisma.savingsEntry.findFirst.mockResolvedValue(null);

    await expect(
      updateSavingsEntry({
        userId: "user-1",
        entryId: "someone-elses-entry",
        amount: 100,
      })
    ).rejects.toThrow("Savings entry not found.");

    expect(
      mocks.prisma.savingsEntry.update
    ).not.toHaveBeenCalled();
  });

  it("rejects deleting an entry that does not belong to the user", async () => {
    mocks.prisma.savingsEntry.findFirst.mockResolvedValue(null);

    await expect(
      deleteSavingsEntry("user-1", "someone-elses-entry")
    ).rejects.toThrow("Savings entry not found.");

    expect(
      mocks.prisma.savingsEntry.delete
    ).not.toHaveBeenCalled();
  });
});