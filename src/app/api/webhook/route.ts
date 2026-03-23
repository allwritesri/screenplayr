import { NextRequest, NextResponse } from "next/server";
import { getStripe, PLANS, PlanKey } from "@/lib/stripe";
import { getOrCreateUser } from "@/lib/db";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  try {
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const email = session.customer_email;
      const plan = session.metadata?.plan as PlanKey | undefined;

      if (email && plan && plan in PLANS) {
        const user = getOrCreateUser(email);
        const planConfig = PLANS[plan];
        const db = getDb();
        db.prepare(
          "UPDATE users SET plan = ?, credits_remaining = ?, stripe_customer_id = ?, updated_at = datetime('now') WHERE id = ?"
        ).run(plan, planConfig.credits, session.customer as string, user.id);
      }
    }

    if (event.type === "invoice.paid") {
      const invoice = event.data.object;
      const customerId = invoice.customer as string;

      const db = getDb();
      const user = db
        .prepare("SELECT * FROM users WHERE stripe_customer_id = ?")
        .get(customerId) as { id: string; plan: PlanKey } | undefined;

      if (user && user.plan in PLANS) {
        const planConfig = PLANS[user.plan];
        db.prepare(
          "UPDATE users SET credits_remaining = ?, updated_at = datetime('now') WHERE id = ?"
        ).run(planConfig.credits, user.id);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
