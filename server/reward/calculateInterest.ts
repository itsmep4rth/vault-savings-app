export type RewardPlan = "free" | "premium";

export interface CalculateInterestInput {
  plan: RewardPlan;
  savedAmount: number;
  targetAmount: number;
}

export interface CalculateInterestResult {
  metGoal: boolean;
  rewardRate: number;
  rewardAmount: number;
}

const FREE_RATE = 0.01;
const PREMIUM_RATE = 0.03;

export function calculateInterest({
  plan,
  savedAmount,
  targetAmount,
}: CalculateInterestInput): CalculateInterestResult {
  const rewardRate = plan === "premium" ? PREMIUM_RATE : FREE_RATE;

  const metGoal = savedAmount >= targetAmount;

  if (!metGoal) {
    return {
      metGoal: false,
      rewardRate,
      rewardAmount: 0,
    };
  }

  const rewardAmount = Math.round(savedAmount * rewardRate);

  return {
    metGoal: true,
    rewardRate,
    rewardAmount,
  };
}
