import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";

export async function createCheckoutSession(
  userId: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.plan === "premium") {
    throw new Error("User already has Premium");
  }

  let customerId = user.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: {
        userId: user.id,
      },
    });

    customerId = customer.id;

    await prisma.user.update({
      where: { id: userId },
      data: {
        stripeCustomerId: customerId,
      },
    });
  }

  const priceId = process.env.STRIPE_PRICE_PREMIUM;

  if (!priceId) {
    throw new Error(
      "STRIPE_PRICE_PREMIUM is missing"
    );
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/billing/success`,
    cancel_url: `${appUrl}/billing`,
    metadata: {
      userId,
    },
  });

  if (!checkout.url) {
    throw new Error("Checkout URL not returned");
  }

  return checkout.url;
}