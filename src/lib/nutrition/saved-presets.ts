import type {
  FoodPer100g,
  ManualEntryMacros,
  QuantityUnit,
  SavedFoodPreset,
} from "@/types/food";
import type { MealSlot } from "@/types/nutrition";
import {
  SAVED_PRESETS_KEY,
  ensureSaludStorageMigrated,
} from "@/lib/salud/storage";
import { syncPresetsToCloud } from "@/lib/supabase/cloud-sync";

export function loadSavedPresets(): SavedFoodPreset[] {
  if (typeof window === "undefined") return [];
  ensureSaludStorageMigrated();
  try {
    const raw = localStorage.getItem(SAVED_PRESETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedFoodPreset[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(presets: SavedFoodPreset[]) {
  localStorage.setItem(SAVED_PRESETS_KEY, JSON.stringify(presets));
  void syncPresetsToCloud(presets);
}

export function customFoodId(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `custom-${slug || "alimento"}`;
}

export function saveFoodPreset(input: {
  food: FoodPer100g;
  amount: number;
  unit: QuantityUnit;
  meal_slot?: MealSlot;
  manual_macros?: ManualEntryMacros;
}): SavedFoodPreset {
  const presets = loadSavedPresets();
  const existing = presets.find(
    (p) =>
      p.food.id === input.food.id &&
      p.amount === input.amount &&
      p.unit === input.unit &&
      Boolean(p.manual_macros) === Boolean(input.manual_macros),
  );

  if (existing) {
    const updated: SavedFoodPreset = {
      ...existing,
      meal_slot: input.meal_slot ?? existing.meal_slot,
      food: input.food,
      manual_macros: input.manual_macros ?? existing.manual_macros,
    };
    persist(
      presets.map((p) => (p.id === existing.id ? updated : p)),
    );
    return updated;
  }

  const preset: SavedFoodPreset = {
    id: crypto.randomUUID(),
    food: { ...input.food, source: "saved" },
    amount: input.amount,
    unit: input.unit,
    meal_slot: input.meal_slot,
    manual_macros: input.manual_macros,
  };
  persist([preset, ...presets]);
  return preset;
}

export function removeFoodPreset(id: string) {
  persist(loadSavedPresets().filter((p) => p.id !== id));
}

export function presetLabel(preset: SavedFoodPreset): string {
  const qty =
    preset.unit === "grams"
      ? `${preset.amount} g`
      : `${preset.amount} porción${preset.amount === 1 ? "" : "es"}`;
  return `${preset.food.name} · ${qty}`;
}

export function searchPresets(
  presets: SavedFoodPreset[],
  query: string,
  limit = 12,
): SavedFoodPreset[] {
  const q = query.trim().toLowerCase();
  const list = q
    ? presets.filter((p) => p.food.name.toLowerCase().includes(q))
    : presets;
  return list.slice(0, limit);
}

export function amountsForFood(
  presets: SavedFoodPreset[],
  foodId: string,
): SavedFoodPreset[] {
  const seen = new Set<string>();
  const out: SavedFoodPreset[] = [];
  for (const p of presets) {
    if (p.food.id !== foodId) continue;
    const key = `${p.amount}-${p.unit}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}
