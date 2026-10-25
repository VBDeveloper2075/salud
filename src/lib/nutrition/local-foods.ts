import mockFoods from "@/data/foods-mock.json";
import type { FoodPer100g } from "@/types/food";
import type { SavedFoodPreset } from "@/types/food";
import { searchPresets } from "@/lib/nutrition/saved-presets";

const LOCAL_FOODS: FoodPer100g[] = mockFoods.map((f) => ({
  ...f,
  source: "mock" as const,
}));

export function getLocalFoods(): FoodPer100g[] {
  return LOCAL_FOODS;
}

export function getFoodById(id: string): FoodPer100g | undefined {
  return LOCAL_FOODS.find((f) => f.id === id);
}

export function searchLocalFoods(query: string, limit = 12): FoodPer100g[] {
  const q = query.trim().toLowerCase();
  if (!q) return LOCAL_FOODS;
  return LOCAL_FOODS.filter((f) => f.name.toLowerCase().includes(q)).slice(
    0,
    limit,
  );
}

export type FoodDropdownItem =
  | { kind: "preset"; preset: SavedFoodPreset }
  | { kind: "food"; food: FoodPer100g };

export function buildFoodDropdown(
  query: string,
  presets: SavedFoodPreset[],
): FoodDropdownItem[] {
  const matchedPresets = searchPresets(presets, query, 8);
  const presetFoodIds = new Set(matchedPresets.map((p) => p.food.id));
  const foods = searchLocalFoods(query, 12).filter(
    (f) => !presetFoodIds.has(f.id) || query.trim().length > 0,
  );

  const items: FoodDropdownItem[] = matchedPresets.map((preset) => ({
    kind: "preset",
    preset,
  }));

  for (const food of foods) {
    if (matchedPresets.some((p) => p.food.id === food.id && !query.trim())) {
      continue;
    }
    items.push({ kind: "food", food });
  }

  return items.slice(0, 14);
}
