import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

type PlanType = "monthly" | "annually";

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json();

    if (!["monthly", "annually"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const selectedPlan = plan as PlanType;
    const amount = selectedPlan === "annually" ? 19200 : 2000;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: { plan: selectedPlan },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret, price: amount });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error creating payment intent:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.error("Error creating payment intent:", error);
      return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
    }
  }
}