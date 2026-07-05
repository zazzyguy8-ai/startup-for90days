import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  const monthly = process.env.STRIPE_PRICE_MONTHLY;
  const annual = process.env.STRIPE_PRICE_ANNUAL;
  if (!key || !monthly) {
    return NextResponse.json(
      {
        error:
          "Payments are not configured yet. Set STRIPE_SECRET_KEY and STRIPE_PRICE_MONTHLY (+ STRIPE_PRICE_ANNUAL) in your environment.",
        configured: false,
      },
      { status: 501 }
    );
  }

  let wantAnnual = false;
  try {
    wantAnnual = Boolean((await req.json())?.annual);
  } catch {
    /* empty body is fine */
  }

  const stripe = new Stripe(key);
  const origin =
    req.headers.get("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      { price: wantAnnual && annual ? annual : monthly, quantity: 1 },
    ],
    success_url: `${origin}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/#pricing`,
    allow_promotion_codes: true,
  });
  return NextResponse.json({ url: session.url });
}
