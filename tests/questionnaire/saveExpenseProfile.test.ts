import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  prisma: {
    expenseProfile: {
      upsert: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mocks.prisma,
}));

import { saveExpenseProfile } from "@/server/questionnaire/saveExpenseProfile";

describe("saveExpenseProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects a negative expense value", async () => {
    await expect(
      saveExpenseProfile({
        userId: "user-1",
        rent: -100,
        groceries: 0,
        food: 0,
        transport: 0,
        utilities: 0,
        other: 0,
      })
    ).rejects.toThrow("rent must be a non-negative number.");

    expect(mocks.prisma.expenseProfile.upsert).not.toHaveBeenCalled();
  });

  it("rejects a non-finite expense value", async () => {
    await expect(
      saveExpenseProfile({
        userId: "user-1",
        rent: 0,
        groceries: Number.NaN,
        food: 0,
        transport: 0,
        utilities: 0,
        other: 0,
      })
    ).rejects.toThrow("groceries must be a non-negative number.");
  });

  it("allows a zero expense value", async () => {
    mocks.prisma.expenseProfile.upsert.mockResolvedValue({
      userId: "user-1",
      rent: 0,
      groceries: 0,
      food: 0,
      transport: 0,
      utilities: 0,
      other: 0,
    });

    await expect(
      saveExpenseProfile({
        userId: "user-1",
        rent: 0,
        groceries: 0,
        food: 0,
        transport: 0,
        utilities: 0,
        other: 0,
      })
    ).resolves.toMatchObject({ rent: 0 });
  });

  it("upserts the expense profile for a valid submission", async () => {
    mocks.prisma.expenseProfile.upsert.mockResolvedValue({
      userId: "user-1",
      rent: 1200,
      groceries: 300,
      food: 150,
      transport: 100,
      utilities: 80,
      other: 50,
    });

    const result = await saveExpenseProfile({
      userId: "user-1",
      rent: 1200,
      groceries: 300,
      food: 150,
      transport: 100,
      utilities: 80,
      other: 50,
    });

    expect(result.rent).toBe(1200);

    expect(mocks.prisma.expenseProfile.upsert).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      update: {
        rent: 1200,
        groceries: 300,
        food: 150,
        transport: 100,
        utilities: 80,
        other: 50,
      },
      create: {
        userId: "user-1",
        rent: 1200,
        groceries: 300,
        food: 150,
        transport: 100,
        utilities: 80,
        other: 50,
      },
    });
  });
});
