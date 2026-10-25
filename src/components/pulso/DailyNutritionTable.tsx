"use client";

import type { MealEntry } from "@/types/nutrition";
import { MEAL_SLOT_LABELS, type MealSlot } from "@/types/nutrition";
import { mealsBySlot } from "@/lib/nutrition/calculations";

const SLOT_ORDER: MealSlot[] = [
  "desayuno",
  "almuerzo",
  "merienda",
  "cena",
  "snack",
];

interface DailyNutritionTableProps {
  meals: MealEntry[];
}

function fmt(n: number) {
  return Math.round(n);
}

export function DailyNutritionTable({ meals }: DailyNutritionTableProps) {
  const bySlot = mealsBySlot(meals);

  return (
    <section className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-zinc-900">
        Desglose por comida
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-xs uppercase tracking-wide text-zinc-500">
              <th className="py-2 pr-4 font-medium">Comida</th>
              <th className="py-2 px-2 font-medium text-right">kcal</th>
              <th className="py-2 px-2 font-medium text-right">Prot (g)</th>
              <th className="py-2 px-2 font-medium text-right">Carbs (g)</th>
              <th className="py-2 pl-2 font-medium text-right">Grasas (g)</th>
            </tr>
          </thead>
          <tbody>
            {SLOT_ORDER.map((slot) => {
              const row = bySlot[slot] ?? {
                calories: 0,
                protein_g: 0,
                carbs_g: 0,
                fat_g: 0,
              };
              const hasData = row.calories > 0;
              return (
                <tr
                  key={slot}
                  className={`border-b border-zinc-50 ${hasData ? "text-zinc-900" : "text-zinc-400"}`}
                >
                  <td className="py-2.5 pr-4 font-medium">
                    {MEAL_SLOT_LABELS[slot]}
                  </td>
                  <td className="py-2.5 px-2 text-right tabular-nums">
                    {fmt(row.calories)}
                  </td>
                  <td className="py-2.5 px-2 text-right tabular-nums">
                    {fmt(row.protein_g)}
                  </td>
                  <td className="py-2.5 px-2 text-right tabular-nums">
                    {fmt(row.carbs_g)}
                  </td>
                  <td className="py-2.5 pl-2 text-right tabular-nums">
                    {fmt(row.fat_g)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {meals.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-zinc-100 pt-3 text-xs text-zinc-600">
          {meals.flatMap((meal) =>
            meal.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-2">
                <span>
                  <span className="font-medium text-zinc-800">
                    {MEAL_SLOT_LABELS[meal.meal_slot]}:
                  </span>{" "}
                  {item.food_name}
                  {item.quantity_description
                    ? ` (${item.quantity_description})`
                    : ""}
                </span>
                <span className="tabular-nums text-zinc-500">
                  {fmt(item.calories)} kcal
                </span>
              </li>
            )),
          )}
        </ul>
      )}
    </section>
  );
}
