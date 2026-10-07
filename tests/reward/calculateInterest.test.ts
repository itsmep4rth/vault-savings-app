import { describe, expect, it } from "vitest";
import { calculateInterest } from "@/server/reward/calculateInterest";

describe("calculateInterest", () => {
  it("gives a free user 1% when the goal is completed", () => {
    const result = calculateInterest({
      plan: "free",
      savedAmount: 1000,
      targetAmount: 1000,
    });

    expect(result.metGoal).toBe(true);
    expect(result.rewardRate).toBe(0.01);
    expect(result.rewardAmount).toBe(10);
  });

  it("gives a premium user 3% when the goal is completed", () => {
    const result = calculateInterest({
      plan: "premium",
      savedAmount: 1000,
      targetAmount: 1000,
    });

    expect(result.metGoal).toBe(true);
    expect(result.rewardRate).toBe(0.03);
    expect(result.rewardAmount).toBe(30);
  });

  it("gives no reward when the goal is missed", () => {
    const result = calculateInterest({
      plan: "premium",
      savedAmount: 900,
      targetAmount: 1000,
    });

    expect(result.metGoal).toBe(false);
    expect(result.rewardAmount).toBe(0);
  });

  it("counts exactly reaching the target as completing the goal", () => {
    const result = calculateInterest({
      plan: "free",
      savedAmount: 500,
      targetAmount: 500,
    });

    expect(result.metGoal).toBe(true);
    expect(result.rewardAmount).toBe(5);
  });

  it("does not give partial credit", () => {
    const result = calculateInterest({
      plan: "free",
      savedAmount: 499,
      targetAmount: 500,
    });

    expect(result.metGoal).toBe(false);
    expect(result.rewardAmount).toBe(0);
  });
});
