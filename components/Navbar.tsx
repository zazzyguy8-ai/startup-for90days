"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, LayoutDashboard, Plus, Zap } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { supabaseConfigured } from "@/lib/supabase";
import { getPlan } from "@/lib/billing";

export default function Navbar() {
  const pathname = usePathname();
  const [pro, setPro] = useState(false);

  useEffect(() => {
    setPro(getPlan() === "pro");
  }, [pathname]);
  const inApp =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/validate") ||
    pathname.startsWith("/idea");

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 pt-4">
      <nav className="glass mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-2.5 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-white shadow-lg">
            <Sparkles size={16} />
          </span>
          <span className="hidden sm:inline tracking-tight">
            Micro SaaS <span className="text-gradient">Validator</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {pro && (
            <span className="chip hidden text-accent md:inline-flex">
              <Zap size={11} /> Founder
            </span>
          )}
          {!supabaseConfigured && inApp && !pro && (
            <span className="chip text-muted hidden md:inline-flex">Demo mode</span>
          )}
          <Link
            href="/dashboard"
            className={`btn-ghost px-3.5 py-2 text-sm ${
              pathname === "/dashboard" ? "!border-accent/50" : ""
            }`}
          >
            <LayoutDashboard size={15} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <Link href="/validate" className="btn-primary px-4 py-2 text-sm">
            <Plus size={15} />
            <span className="hidden sm:inline">Validate idea</span>
            <span className="sm:hidden">New</span>
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
