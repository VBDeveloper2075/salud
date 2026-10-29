"use client";

import { FoodEntryForm } from "@/components/pulso/FoodEntryForm";
import { DailyNutritionTable } from "@/components/pulso/DailyNutritionTable";
import { BalanceDashboard } from "@/components/pulso/BalanceDashboard";
import type { MealEntry } from "@/types/nutrition";

interface NutritionPanelProps {
  meals: MealEntry[];
  onAddMeal: (entry: MealEntry) => void;
  calorieGoal: number;
  consumed: number;
  burned: number;
  remaining: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  weeklyNetCalories: { day: string; net: number }[];
}

export function NutritionPanel({
  meals,
  onAddMeal,
  calorieGoal,
  consumed,
  burned,
  remaining,
  protein_g,
  carbs_g,
  fat_g,
  weeklyNetCalories,
}: NutritionPanelProps) {
  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <div className="flex min-w-0 flex-col gap-6">
        <FoodEntryForm onAddMeal={onAddMeal} />
        <DailyNutritionTable meals={meals} />
      </div>
      <aside className="min-w-0 lg:sticky lg:top-36 lg:self-start">
        <BalanceDashboard
          calorieGoal={calorieGoal}
          consumed={consumed}
          burned={burned}
          remaining={remaining}
          protein_g={protein_g}
          carbs_g={carbs_g}
          fat_g={fat_g}
          weeklyNetCalories={weeklyNetCalories}
        />
      </aside>
    </div>
  );
}
