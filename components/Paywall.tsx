"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Check, Zap } from "lucide-react";
import {
  FREE_LIMIT,
  PRICE_ANNUAL,
  PRICE_MONTHLY,
  activatePro,
  startCheckout,
} from "@/lib/billing";

const PRO_FEATURES = [
  "Unlimited validations",
  "Build My Startup — full app generation",
  "AI advisor chat",
  "SWOT, canvases, personas, RICE",
  "Revenue projections & PDF export",
];

export default function Paywall({
  onClose,
  onUnlocked,
}: {
  onClose: () => void;
  onUnlocked: () => void;
}) {
  const [annual, setAnnual] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);

  async function upgrade() {
    setBusy(true);
    const error = await startCheckout(annual);
    if (error) {
      setNotConfigured(true);
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="glass-strong relative w-full max-w-md rounded-3xl p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-2 text-muted transition-colors hover:text-foreground"
        >
          <X size={16} />
        </button>

        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 text-white">
          <Zap size={20} />
        </span>
        <h2 className="mt-4 text-2xl font-bold tracking-tight">
          You&apos;ve used your {FREE_LIMIT} free validations
        </h2>
        <p className="mt-2 text-sm text-muted">
          Upgrade to Founder and validate — and build — without limits.
        </p>

        {/* Billing toggle */}
        <div className="mt-5 flex items-center gap-2 rounded-full border border-(--card-border) p-1 text-sm font-medium">
          <button
            onClick={() => setAnnual(false)}
            className={`flex-1 rounded-full py-2 transition-colors ${
              !annual ? "bg-gradient-to-r from-accent to-accent-2 text-white" : "text-muted"
            }`}
          >
            ${PRICE_MONTHLY}/mo
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`flex-1 rounded-full py-2 transition-colors ${
              annual ? "bg-gradient-to-r from-accent to-accent-2 text-white" : "text-muted"
            }`}
          >
            ${PRICE_ANNUAL}/yr
            <span className="ml-1 text-xs opacity-80">(2 months free)</span>
          </button>
        </div>

        <ul className="mt-5 space-y-2.5 text-sm">
          {PRO_FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2">
              <Check size={15} className="shrink-0 text-success" /> {f}
            </li>
          ))}
        </ul>

        <button
          onClick={upgrade}
          disabled={busy}
          className="btn-primary mt-6 w-full py-3.5"
        >
          {busy ? "Redirecting to checkout…" : "Upgrade to Founder"}
        </button>

        {notConfigured && (
          <div className="mt-4 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-xs leading-relaxed">
            <p className="font-semibold text-warning">
              Stripe isn&apos;t configured on this deployment yet.
            </p>
            <p className="mt-1 text-muted">
              Set <code className="font-mono">STRIPE_SECRET_KEY</code> +{" "}
              <code className="font-mono">STRIPE_PRICE_MONTHLY</code> to accept
              real payments. For now you can unlock Pro locally to keep testing:
            </p>
            <button
              onClick={() => {
                activatePro();
                onUnlocked();
              }}
              className="btn-ghost mt-3 w-full py-2 text-xs"
            >
              Unlock Pro (demo)
            </button>
          </div>
        )}

        <p className="mt-4 text-center text-[11px] text-muted">
          Secure checkout by Stripe · cancel anytime
        </p>
      </motion.div>
    </div>
  );
}
