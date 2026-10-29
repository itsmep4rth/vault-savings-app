import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
  stripe: {
    customers: {
      create: vi.fn(),
    },
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mocks.prisma,
}));

vi.mock("@/lib/stripe", () => ({
  stripe: mocks.stripe,
}));

import { createCheckoutSession } from "@/server/billing/createCheckoutSession";

describe("createCheckoutSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_PRICE_PREMIUM = "price_premium";
    process.env.NEXT_PUBLIC_APP_URL = "https://vault.example";
  });

  it("creates a Stripe customer and returns the subscription checkout URL", async () => {
    mocks.prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      plan: "free",
      stripeCustomerId: null,
    });
    mocks.stripe.customers.create.mockResolvedValue({ id: "cus-1" });
    mocks.prisma.user.update.mockResolvedValue({});
    mocks.stripe.checkout.sessions.create.mockResolvedValue({
      url: "https://checkout.stripe.com/session-1",
    });

    const checkoutUrl = await createCheckoutSession("user-1");

    expect(checkoutUrl).toBe("https://checkout.stripe.com/session-1");
    expect(mocks.prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { stripeCustomerId: "cus-1" },
    });
    expect(mocks.stripe.checkout.sessions.create).toHaveBeenCalledWith({
      mode: "subscription",
      customer: "cus-1",
      line_items: [{ price: "price_premium", quantity: 1 }],
      success_url: "https://vault.example/billing/success",
      cancel_url: "https://vault.example/billing",
      metadata: { userId: "user-1" },
    });
  });

  it("rejects checkout for a user who already has Premium", async () => {
    mocks.prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      plan: "premium",
      stripeCustomerId: "cus-1",
    });

    await expect(createCheckoutSession("user-1")).rejects.toThrow(
      "User already has Premium"
    );

    expect(mocks.stripe.checkout.sessions.create).not.toHaveBeenCalled();
  });
});