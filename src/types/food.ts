export type FoodSource = "mock" | "saved";

/** Valores nutricionales por cada 100 g */
export interface FoodPer100g {
  id: string;
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  source: FoodSource;
  /** Gramos equivalentes a 1 porción (para modo porciones) */
  default_portion_g?: number;
}

export type QuantityUnit = "grams" | "portions";

/** Macros totales de la porción (ingreso manual, no por 100 g) */
export interface ManualEntryMacros {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

/** Alimento + cantidad habitual guardada por el usuario */
export interface SavedFoodPreset {
  id: string;
  food: FoodPer100g;
  amount: number;
  unit: QuantityUnit;
  meal_slot?: import("@/types/nutrition").MealSlot;
  /** Si existe, la porción usa estos totales en lugar del cálculo por 100 g */
  manual_macros?: ManualEntryMacros;
}
