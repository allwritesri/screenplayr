import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
    stripeInstance = new Stripe(key);
  }
  return stripeInstance;
}

export const PLANS = {
  free: {
    name: "Free",
    credits: 3,
    price: 0,
    features: [
      "3 free conversions",
      "Up to 2-minute videos",
      "Standard screenplay format",
      "Download as TXT",
    ],
  },
  starter: {
    name: "Starter",
    credits: 25,
    price: 9,
    priceId: process.env.STRIPE_PRICE_STARTER,
    features: [
      "25 conversions/month",
      "Up to 2-minute videos",
      "Professional screenplay format",
      "Download as TXT & PDF",
      "Email support",
    ],
  },
  pro: {
    name: "Pro",
    credits: 100,
    price: 29,
    priceId: process.env.STRIPE_PRICE_PRO,
    features: [
      "100 conversions/month",
      "Up to 2-minute videos",
      "Professional screenplay format",
      "Download as TXT & PDF",
      "Priority support",
      "Batch processing",
    ],
  },
  unlimited: {
    name: "Unlimited",
    credits: 999999,
    price: 79,
    priceId: process.env.STRIPE_PRICE_UNLIMITED,
    features: [
      "Unlimited conversions",
      "Up to 2-minute videos",
      "Professional screenplay format",
      "All export formats",
      "Priority support",
      "API access",
      "Batch processing",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export async function createCheckoutSession(
  email: string,
  plan: PlanKey,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const stripe = getStripe();
  const planConfig = PLANS[plan];

  if (!("priceId" in planConfig) || !planConfig.priceId) {
    throw new Error(`No price configured for plan: ${plan}`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { plan },
  });

  return session.url!;
}
