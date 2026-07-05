import { NextResponse } from "next/server";
import Stripe from "stripe";

// Confirms a Checkout session actually got paid before the client
// activates Pro — the success URL alone is not proof of payment.
export async function GET(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json(
      { active: false, error: "Stripe not configured" },
      { status: 501 }
    );
  }
  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json(
      { active: false, error: "Missing session_id" },
      { status: 400 }
    );
  }
  try {
    const stripe = new Stripe(key);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const active =
      session.status === "complete" && session.payment_status !== "unpaid";
    return NextResponse.json({ active });
  } catch {
    return NextResponse.json(
      { active: false, error: "Invalid session" },
      { status: 400 }
    );
  }
}
