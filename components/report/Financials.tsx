"use client";

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { TrendingUp, Scale } from "lucide-react";
import type { SavedIdea } from "@/lib/types";
import { SectionCard } from "./ui";

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  format = (v: number) => String(v),
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-bold text-accent">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 w-full accent-(--accent)"
      />
    </div>
  );
}

export default function Financials({ idea }: { idea: SavedIdea }) {
  const r = idea.report;
  const a = r.revenueAssumptions;

  const [growth, setGrowth] = useState(a.monthlyGrowthPct);
  const [churn, setChurn] = useState(a.churnPct);
  const [price, setPrice] = useState(r.pricing.monthly);
  const [fixedCosts, setFixedCosts] = useState(a.fixedCostsMonthly);
  const [varCost, setVarCost] = useState(a.variableCostPerCustomer);

  const data = useMemo(() => {
    const rows: {
      month: string;
      customers: number;
      mrr: number;
      profit: number;
    }[] = [];
    let customers = a.startingCustomers;
    for (let m = 1; m <= 24; m++) {
      customers = customers * (1 + growth / 100) * (1 - churn / 100);
      const c = Math.round(customers);
      const mrr = Math.round(c * price);
      const profit = Math.round(mrr - fixedCosts - c * varCost);
      rows.push({ month: `M${m}`, customers: c, mrr, profit });
    }
    return rows;
  }, [growth, churn, price, fixedCosts, varCost, a.startingCustomers]);

  const breakEvenCustomers =
    price - varCost > 0 ? Math.ceil(fixedCosts / (price - varCost)) : Infinity;
  const breakEvenMonth = data.find((d) => d.profit >= 0)?.month ?? null;
  const finalMrr = data[data.length - 1]?.mrr ?? 0;

  return (
    <div className="space-y-5">
      <SectionCard icon={TrendingUp} title="Revenue Projections (24 months)">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <div className="space-y-4">
            <Slider
              label="Price / month"
              value={price}
              onChange={setPrice}
              min={5}
              max={299}
              format={(v) => `$${v}`}
            />
            <Slider
              label="Monthly growth"
              value={growth}
              onChange={setGrowth}
              min={0}
              max={60}
              format={(v) => `${v}%`}
            />
            <Slider
              label="Monthly churn"
              value={churn}
              onChange={setChurn}
              min={0}
              max={25}
              format={(v) => `${v}%`}
            />
            <div className="rounded-2xl border border-(--card-border) p-4 text-sm">
              <p className="text-muted">MRR at month 24</p>
              <p className="text-2xl font-bold text-gradient">
                ${finalMrr.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="h-72 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="mrrFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--ring-track)" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="var(--muted)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  interval={3}
                />
                <YAxis
                  stroke="var(--muted)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--background)",
                    border: "1px solid var(--card-border)",
                    borderRadius: 14,
                    fontSize: 13,
                  }}
                  formatter={(value, name) => [
                    name === "customers"
                      ? Number(value).toLocaleString()
                      : `$${Number(value).toLocaleString()}`,
                    name === "mrr"
                      ? "MRR"
                      : name === "customers"
                        ? "Customers"
                        : "Profit",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke="var(--accent)"
                  strokeWidth={2.5}
                  fill="url(#mrrFill)"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="var(--success)"
                  strokeWidth={2}
                  fill="transparent"
                />
                <ReferenceLine y={0} stroke="var(--muted)" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={Scale} title="Break-Even Calculator">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <div className="space-y-4">
            <Slider
              label="Fixed costs / month"
              value={fixedCosts}
              onChange={setFixedCosts}
              min={0}
              max={10000}
              step={100}
              format={(v) => `$${v.toLocaleString()}`}
            />
            <Slider
              label="Variable cost / customer"
              value={varCost}
              onChange={setVarCost}
              min={0}
              max={50}
              format={(v) => `$${v}`}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-(--card-border) p-5 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">
                Break-even customers
              </p>
              <p className="mt-2 text-4xl font-bold text-gradient">
                {breakEvenCustomers === Infinity ? "—" : breakEvenCustomers}
              </p>
              <p className="mt-1 text-xs text-muted">
                paying ${price}/mo each
              </p>
            </div>
            <div className="rounded-2xl border border-(--card-border) p-5 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">
                Break-even month
              </p>
              <p className="mt-2 text-4xl font-bold text-gradient">
                {breakEvenMonth ?? "24+"}
              </p>
              <p className="mt-1 text-xs text-muted">
                at current growth & churn
              </p>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
