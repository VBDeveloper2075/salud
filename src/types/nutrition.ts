export type MealSlot =
  | "desayuno"
  | "almuerzo"
  | "merienda"
  | "cena"
  | "snack";

export interface MealItem {
  id: string;
  food_name: string;
  quantity_description?: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface MealEntry {
  id: string;
  meal_slot: MealSlot;
  items: MealItem[];
  raw_message?: string;
}

export interface ExerciseEntry {
  id: string;
  activity_name: string;
  duration_minutes?: number;
  calories_burned: number;
  raw_message?: string;
}

export interface MacroTotals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface DailyNutritionState {
  logDate: string;
  meals: MealEntry[];
  exercises: ExerciseEntry[];
}

export interface UserProfile {
  displayName: string;
  weight_kg: number;
  height_cm: number;
  age: number;
  target_weight_kg: number;
  daily_calorie_goal: number;
  fixed_routines: string[];
}

export const MEAL_SLOT_LABELS: Record<MealSlot, string> = {
  desayuno: "Desayuno",
  almuerzo: "Almuerzo",
  merienda: "Merienda",
  cena: "Cena",
  snack: "Snack",
};

export const DEFAULT_PROFILE: UserProfile = {
  displayName: "Tú",
  weight_kg: 70,
  height_cm: 170,
  age: 30,
  target_weight_kg: 65,
  daily_calorie_goal: 1800,
  fixed_routines: [],
};
