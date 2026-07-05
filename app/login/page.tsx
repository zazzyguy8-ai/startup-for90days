"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, ArrowRight } from "lucide-react";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) return;
    setBusy(true);
    setMessage("");
    try {
      if (mode === "signup") {
        const { error } = await sb.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Check your email to confirm your account, then sign in.");
      } else {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass-strong w-full max-w-md rounded-3xl p-8 sm:p-10"
      >
        <Link href="/" className="mx-auto flex w-fit items-center gap-2 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-white">
            <Sparkles size={17} />
          </span>
          Micro SaaS <span className="text-gradient">Validator</span>
        </Link>

        <h1 className="mt-8 text-center text-2xl font-bold tracking-tight">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>

        {supabaseConfigured ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="relative">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="email"
                required
                className="input-glass !pl-10"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="password"
                required
                minLength={6}
                className="input-glass !pl-10"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {message && <p className="text-sm text-warning">{message}</p>}
            <button type="submit" disabled={busy} className="btn-primary w-full py-3">
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
              <ArrowRight size={16} />
            </button>
            <p className="text-center text-sm text-muted">
              {mode === "signin" ? "No account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="font-semibold text-accent hover:underline"
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </form>
        ) : (
          <div className="mt-8 space-y-5 text-center">
            <p className="text-sm leading-relaxed text-muted">
              Supabase isn&apos;t configured yet, so the app is running in{" "}
              <span className="font-semibold text-foreground">demo mode</span> —
              your ideas are saved locally in this browser. Add{" "}
              <code className="rounded bg-(--ring-track) px-1.5 py-0.5 text-xs">
                NEXT_PUBLIC_SUPABASE_URL
              </code>{" "}
              and{" "}
              <code className="rounded bg-(--ring-track) px-1.5 py-0.5 text-xs">
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </code>{" "}
              to enable real accounts.
            </p>
            <Link href="/dashboard" className="btn-primary w-full py-3">
              Continue in demo mode <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
