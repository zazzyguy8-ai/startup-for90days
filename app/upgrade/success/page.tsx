"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Confetti from "@/components/report/Confetti";
import { activatePro } from "@/lib/billing";

function SuccessInner() {
  const params = useSearchParams();
  const [state, setState] = useState<"verifying" | "active" | "failed">(
    "verifying"
  );

  useEffect(() => {
    const sessionId = params.get("session_id");
    if (!sessionId) {
      setState("failed");
      return;
    }
    fetch(`/api/stripe/verify?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.active) {
          activatePro();
          setState("active");
        } else {
          setState("failed");
        }
      })
      .catch(() => setState("failed"));
  }, [params]);

  return (
    <main className="mx-auto max-w-md px-4 pt-40 text-center">
      {state === "active" && <Confetti />}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-3xl p-10"
      >
        {state === "verifying" && (
          <>
            <div className="glass shimmer mx-auto h-12 w-12 rounded-2xl" />
            <h1 className="mt-5 text-2xl font-bold">Confirming payment…</h1>
            <p className="mt-2 text-sm text-muted">Just a second.</p>
          </>
        )}
        {state === "active" && (
          <>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 text-white">
              <Zap size={24} />
            </span>
            <h1 className="mt-5 text-2xl font-bold">
              Welcome to <span className="text-gradient">Founder</span>
            </h1>
            <p className="mt-2 text-sm text-muted">
              Unlimited validations and full builds are now unlocked.
            </p>
            <ul className="mx-auto mt-5 w-fit space-y-2 text-left text-sm">
              {["Unlimited validations", "Build My Startup", "All founder tools"].map(
                (f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check size={14} className="text-success" /> {f}
                  </li>
                )
              )}
            </ul>
            <Link href="/validate" className="btn-primary mt-7 inline-flex px-7 py-3">
              Validate an idea
            </Link>
          </>
        )}
        {state === "failed" && (
          <>
            <h1 className="text-2xl font-bold">Payment not confirmed</h1>
            <p className="mt-2 text-sm text-muted">
              We couldn&apos;t verify this checkout session. If you were
              charged, contact support and we&apos;ll sort it out.
            </p>
            <Link href="/#pricing" className="btn-ghost mt-6 inline-flex px-6 py-3">
              Back to pricing
            </Link>
          </>
        )}
      </motion.div>
    </main>
  );
}

export default function UpgradeSuccessPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Suspense fallback={null}>
        <SuccessInner />
      </Suspense>
    </div>
  );
}
