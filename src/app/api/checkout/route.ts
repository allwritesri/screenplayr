import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession, PlanKey } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, plan } = body as { email: string; plan: PlanKey };

    if (!email || !plan) {
      return NextResponse.json(
        { error: "Email and plan are required" },
        { status: 400 }
      );
    }

    if (!["starter", "pro", "unlimited"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const url = await createCheckoutSession(
      email,
      plan,
      `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      `${appUrl}/pricing`
    );

    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
