import { describe, expect, it } from "vitest";
import { calculateInterest } from "@/server/reward/calculateInterest";
import type { RewardPlan } from "@/server/reward/calculateInterest";

// Amounts are whole dollars, and the reward is rounded to the nearest whole
// dollar (exact halves round up). See ARCHITECTURE.md: reward = round(saved * rate).
describe("calculateInterest rounding", () => {
  const cases: { plan: RewardPlan; saved: number; expected: number }[] = [
    // Free plan, 1%
    { plan: "free", saved: 150, expected: 2 }, // 1.50 rounds up
    { plan: "free", saved: 149, expected: 1 }, // 1.49 rounds down
    { plan: "free", saved: 50, expected: 1 }, // 0.50 rounds up
    { plan: "free", saved: 49, expected: 0 }, // 0.49 rounds down to nothing
    // Premium plan, 3%
    { plan: "premium", saved: 150, expected: 5 }, // 4.50 rounds up
    { plan: "premium", saved: 50, expected: 2 }, // 1.50 rounds up
    { plan: "premium", saved: 17, expected: 1 }, // 0.51 rounds up
    { plan: "premium", saved: 16, expected: 0 }, // 0.48 rounds down to nothing
  ];

  for (const { plan, saved, expected } of cases) {
    it(`${plan} plan: saving $${saved} pays a $${expected} reward`, () => {
      const result = calculateInterest({
        plan,
        savedAmount: saved,
        targetAmount: saved,
      });

      expect(result.metGoal).toBe(true);
      expect(result.rewardAmount).toBe(expected);
    });
  }

  it("still reports the rate when the rounded reward is $0", () => {
    const result = calculateInterest({
      plan: "free",
      savedAmount: 20,
      targetAmount: 20,
    });

    expect(result.metGoal).toBe(true);
    expect(result.rewardRate).toBe(0.01);
    expect(result.rewardAmount).toBe(0);
  });

  it("rounds on the amount saved, not the target", () => {
    const result = calculateInterest({
      plan: "free",
      savedAmount: 250,
      targetAmount: 200,
    });

    expect(result.metGoal).toBe(true);
    expect(result.rewardAmount).toBe(3); // 2.50 rounds up
  });
});
