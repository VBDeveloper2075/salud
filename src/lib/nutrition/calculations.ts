import type {
  DailyNutritionState,
  ExerciseEntry,
  MacroTotals,
  MealEntry,
} from "@/types/nutrition";

export function sumMealItems(meals: MealEntry[]): MacroTotals {
  return meals.reduce(
    (acc, meal) => {
      for (const item of meal.items) {
        acc.calories += item.calories;
        acc.protein_g += item.protein_g;
        acc.carbs_g += item.carbs_g;
        acc.fat_g += item.fat_g;
      }
      return acc;
    },
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
  );
}

export function sumExerciseCalories(exercises: ExerciseEntry[]): number {
  return exercises.reduce((sum, ex) => sum + ex.calories_burned, 0);
}

export function getDailyBalance(
  state: DailyNutritionState,
  calorieGoal: number,
): {
  consumed: MacroTotals;
  burned: number;
  netCalories: number;
  remainingCalories: number;
  progressPercent: number;
} {
  const consumed = sumMealItems(state.meals);
  const burned = sumExerciseCalories(state.exercises);
  const netCalories = consumed.calories - burned;
  const remainingCalories = calorieGoal - netCalories;
  const progressPercent = Math.min(
    100,
    Math.round((netCalories / calorieGoal) * 100),
  );

  return {
    consumed,
    burned,
    netCalories,
    remainingCalories,
    progressPercent,
  };
}

export function mealsBySlot(meals: MealEntry[]): Record<string, MacroTotals> {
  const slots: Record<string, MacroTotals> = {};
  for (const meal of meals) {
    if (!slots[meal.meal_slot]) {
      slots[meal.meal_slot] = {
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
      };
    }
    for (const item of meal.items) {
      slots[meal.meal_slot].calories += item.calories;
      slots[meal.meal_slot].protein_g += item.protein_g;
      slots[meal.meal_slot].carbs_g += item.carbs_g;
      slots[meal.meal_slot].fat_g += item.fat_g;
    }
  }
  return slots;
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}
