"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface BalanceDashboardProps {
  calorieGoal: number;
  consumed: number;
  burned: number;
  remaining: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  weeklyNetCalories: { day: string; net: number }[];
}

export function BalanceDashboard({
  calorieGoal,
  consumed,
  burned,
  remaining,
  protein_g,
  carbs_g,
  fat_g,
  weeklyNetCalories,
}: BalanceDashboardProps) {
  const net = consumed - burned;
  const progress = Math.min(100, Math.round((net / calorieGoal) * 100));

  const macroChartData = [
    { name: "Proteínas", gramos: Math.round(protein_g), fill: "#059669" },
    { name: "Carbs", gramos: Math.round(carbs_g), fill: "#0ea5e9" },
    { name: "Grasas", gramos: Math.round(fat_g), fill: "#f59e0b" },
  ];

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Balance diario
            </p>
            <p className="text-2xl font-semibold tabular-nums text-zinc-900">
              {Math.round(net)}{" "}
              <span className="text-base font-normal text-zinc-500">
                / {calorieGoal} kcal
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500">Disponibles</p>
            <p
              className={`text-lg font-semibold tabular-nums ${
                remaining >= 0 ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {Math.round(remaining)} kcal
            </p>
          </div>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-zinc-100">
          <div
            className={`h-full rounded-full transition-all ${
              progress > 100 ? "bg-amber-500" : "bg-emerald-500"
            }`}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>

        <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg bg-emerald-50 py-2">
            <dt className="text-zinc-500">Consumidas</dt>
            <dd className="font-semibold tabular-nums text-emerald-800">
              {Math.round(consumed)}
            </dd>
          </div>
          <div className="rounded-lg bg-sky-50 py-2">
            <dt className="text-zinc-500">Quemadas</dt>
            <dd className="font-semibold tabular-nums text-sky-800">
              {Math.round(burned)}
            </dd>
          </div>
          <div className="rounded-lg bg-zinc-50 py-2">
            <dt className="text-zinc-500">Neto</dt>
            <dd className="font-semibold tabular-nums text-zinc-800">
              {Math.round(net)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-zinc-900">
          Macros del día (g)
        </h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={macroChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
              <Tooltip
                formatter={(value) => [`${value} g`, "Cantidad"]}
                contentStyle={{ borderRadius: 12, border: "1px solid #e4e4e7" }}
              />
              <Bar dataKey="gramos" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-zinc-900">
          Vista semanal (neto kcal)
        </h3>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyNetCalories}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip
                formatter={(value) => [`${value} kcal`, "Neto"]}
                contentStyle={{ borderRadius: 12, border: "1px solid #e4e4e7" }}
              />
              <Bar dataKey="net" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
