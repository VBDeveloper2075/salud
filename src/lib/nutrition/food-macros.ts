import type { FoodPer100g, QuantityUnit } from "@/types/food";
import type { MealItem } from "@/types/nutrition";

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export function gramsFromQuantity(
  food: FoodPer100g,
  amount: number,
  unit: QuantityUnit,
): number {
  if (unit === "grams") return amount;
  const portion = food.default_portion_g ?? 100;
  return amount * portion;
}

export function mealItemFromFood(
  food: FoodPer100g,
  amount: number,
  unit: QuantityUnit,
): MealItem {
  const grams = gramsFromQuantity(food, amount, unit);
  const factor = grams / 100;

  const quantity_description =
    unit === "grams"
      ? `${amount} g`
      : `${amount} porción${amount === 1 ? "" : "es"} (${Math.round(grams)} g)`;

  return {
    id: crypto.randomUUID(),
    food_name: food.name,
    quantity_description,
    calories: round1(food.calories * factor),
    protein_g: round1(food.protein_g * factor),
    carbs_g: round1(food.carbs_g * factor),
    fat_g: round1(food.fat_g * factor),
  };
}

export function previewMacros(
  food: FoodPer100g,
  amount: number,
  unit: QuantityUnit,
) {
  const item = mealItemFromFood(food, amount, unit);
  return {
    calories: item.calories,
    protein_g: item.protein_g,
    carbs_g: item.carbs_g,
    fat_g: item.fat_g,
    grams: gramsFromQuantity(food, amount, unit),
  };
}
