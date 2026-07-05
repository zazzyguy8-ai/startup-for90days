"use client";

// Client-side plan + usage tracking. Free plan: 3 validations per calendar
// month. Pro is activated by a verified Stripe Checkout session (see
// /api/stripe/verify) or by the demo unlock when Stripe isn't configured.
// NOTE: with Supabase auth enabled you'd mirror this into a profiles table
// for server-side enforcement — this is the self-serve/demo baseline.

export const FREE_LIMIT = 3;
export const PRICE_MONTHLY = 19;
export const PRICE_ANNUAL = 190;

const PLAN_KEY = "msv_plan";
const USAGE_KEY = "msv_usage";

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function getPlan(): "free" | "pro" {
  if (typeof window === "undefined") return "free";
  return localStorage.getItem(PLAN_KEY) === "pro" ? "pro" : "free";
}

export function activatePro() {
  localStorage.setItem(PLAN_KEY, "pro");
}

export function usageThisMonth(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = JSON.parse(localStorage.getItem(USAGE_KEY) || "{}");
    return raw.month === currentMonth() ? (raw.count ?? 0) : 0;
  } catch {
    return 0;
  }
}

export function incrementUsage() {
  const count = usageThisMonth() + 1;
  localStorage.setItem(
    USAGE_KEY,
    JSON.stringify({ month: currentMonth(), count })
  );
}

export function remainingValidations(): number {
  if (getPlan() === "pro") return Infinity;
  return Math.max(0, FREE_LIMIT - usageThisMonth());
}

export function canValidate(): boolean {
  return remainingValidations() > 0;
}

// Starts Stripe Checkout; resolves to an error message if not possible.
export async function startCheckout(annual: boolean): Promise<string | null> {
  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ annual }),
  });
  const data = await res.json();
  if (res.ok && data.url) {
    window.location.href = data.url;
    return null;
  }
  return data.error ?? "Checkout failed";
}
