"use client";

import { Bookmark, Plus, Search, Star, UtensilsCrossed, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  mealItemFromFood,
  previewMacros,
} from "@/lib/nutrition/food-macros";
import {
  buildFoodDropdown,
  type FoodDropdownItem,
} from "@/lib/nutrition/local-foods";
import {
  amountsForFood,
  customFoodId,
  loadSavedPresets,
  presetLabel,
  removeFoodPreset,
  saveFoodPreset,
} from "@/lib/nutrition/saved-presets";
import type { FoodPer100g, QuantityUnit, SavedFoodPreset } from "@/types/food";
import { MEAL_SLOT_LABELS, type MealEntry, type MealSlot } from "@/types/nutrition";

const MEAL_OPTIONS: MealSlot[] = ["desayuno", "almuerzo", "merienda", "cena"];

interface FoodEntryFormProps {
  onAddMeal: (entry: MealEntry) => void;
}

function parseNonNegative(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = parseFloat(trimmed.replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function quantityDescription(
  amount: number | null,
  unit: QuantityUnit,
): string | undefined {
  if (amount == null) return undefined;
  if (unit === "grams") return `${amount} g`;
  return `${amount} porción${amount === 1 ? "" : "es"}`;
}

export function FoodEntryForm({ onAddMeal }: FoodEntryFormProps) {
  const [presets, setPresets] = useState<SavedFoodPreset[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<FoodPer100g | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [amount, setAmount] = useState("100");
  const [unit, setUnit] = useState<QuantityUnit>("grams");
  const [mealSlot, setMealSlot] = useState<MealSlot>("almuerzo");
  const [manualCalories, setManualCalories] = useState("");
  const [manualProtein, setManualProtein] = useState("");
  const [manualCarbs, setManualCarbs] = useState("");
  const [manualFat, setManualFat] = useState("");
  const [savedHint, setSavedHint] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPresets(loadSavedPresets());
  }, []);

  const trimmedName = query.trim();
  const isManualEntry = selected === null && trimmedName.length > 0;

  const dropdownItems = useMemo(
    () => buildFoodDropdown(query, presets),
    [query, presets],
  );

  const savedAmounts = useMemo(
    () => (selected ? amountsForFood(presets, selected.id) : []),
    [presets, selected],
  );

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setListOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const parsedAmount = useMemo(() => {
    const n = parseFloat(amount.replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [amount]);

  const manualMacros = useMemo(() => {
    const calories = parseNonNegative(manualCalories);
    const protein_g = parseNonNegative(manualProtein);
    const carbs_g = parseNonNegative(manualCarbs);
    const fat_g = parseNonNegative(manualFat);
    if (
      calories == null ||
      protein_g == null ||
      carbs_g == null ||
      fat_g == null
    ) {
      return null;
    }
    return { calories, protein_g, carbs_g, fat_g };
  }, [manualCalories, manualProtein, manualCarbs, manualFat]);

  const catalogPreview = useMemo(() => {
    if (!selected || parsedAmount == null) return null;
    return previewMacros(selected, parsedAmount, unit);
  }, [selected, parsedAmount, unit]);

  const preview = isManualEntry ? manualMacros : catalogPreview;

  const isCurrentSaved = useMemo(() => {
    if (isManualEntry && manualMacros && parsedAmount != null) {
      return presets.some(
        (p) =>
          p.manual_macros &&
          p.food.name.toLowerCase() === trimmedName.toLowerCase() &&
          p.amount === parsedAmount &&
          p.unit === unit &&
          p.manual_macros.calories === manualMacros.calories &&
          p.manual_macros.protein_g === manualMacros.protein_g &&
          p.manual_macros.carbs_g === manualMacros.carbs_g &&
          p.manual_macros.fat_g === manualMacros.fat_g,
      );
    }
    if (!selected || parsedAmount == null) return false;
    return presets.some(
      (p) =>
        !p.manual_macros &&
        p.food.id === selected.id &&
        p.amount === parsedAmount &&
        p.unit === unit,
    );
  }, [
    isManualEntry,
    manualMacros,
    parsedAmount,
    presets,
    selected,
    trimmedName,
    unit,
  ]);

  function clearManualMacros() {
    setManualCalories("");
    setManualProtein("");
    setManualCarbs("");
    setManualFat("");
  }

  function pickFood(food: FoodPer100g) {
    setSelected(food);
    setQuery(food.name);
    setListOpen(false);
    clearManualMacros();
    const habitual = amountsForFood(presets, food.id)[0];
    if (habitual?.manual_macros) {
      applyPreset(habitual);
      return;
    }
    if (habitual) {
      setAmount(String(habitual.amount));
      setUnit(habitual.unit);
      if (habitual.meal_slot) setMealSlot(habitual.meal_slot);
    } else if (unit === "portions") {
      setAmount("1");
    } else {
      setAmount(String(food.default_portion_g ?? 100));
    }
  }

  function applyPreset(preset: SavedFoodPreset) {
    setQuery(preset.food.name);
    setAmount(String(preset.amount));
    setUnit(preset.unit);
    if (preset.meal_slot) setMealSlot(preset.meal_slot);
    setListOpen(false);

    if (preset.manual_macros) {
      setSelected(null);
      setManualCalories(String(preset.manual_macros.calories));
      setManualProtein(String(preset.manual_macros.protein_g));
      setManualCarbs(String(preset.manual_macros.carbs_g));
      setManualFat(String(preset.manual_macros.fat_g));
      return;
    }

    setSelected(preset.food);
    clearManualMacros();
  }

  function pickItem(item: FoodDropdownItem) {
    if (item.kind === "preset") {
      applyPreset(item.preset);
      return;
    }
    pickFood(item.food);
  }

  function handleSaveHabitual() {
    if (isManualEntry && manualMacros && parsedAmount != null) {
      saveFoodPreset({
        food: {
          id: customFoodId(trimmedName),
          name: trimmedName,
          calories: 0,
          protein_g: 0,
          carbs_g: 0,
          fat_g: 0,
          source: "saved",
        },
        amount: parsedAmount,
        unit,
        meal_slot: mealSlot,
        manual_macros: manualMacros,
      });
    } else if (selected && parsedAmount != null) {
      saveFoodPreset({
        food: selected,
        amount: parsedAmount,
        unit,
        meal_slot: mealSlot,
      });
    } else {
      return;
    }
    setPresets(loadSavedPresets());
    setSavedHint(true);
    setTimeout(() => setSavedHint(false), 2000);
  }

  function handleRemovePreset(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    removeFoodPreset(id);
    setPresets(loadSavedPresets());
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isManualEntry && manualMacros) {
      onAddMeal({
        id: crypto.randomUUID(),
        meal_slot: mealSlot,
        items: [
          {
            id: crypto.randomUUID(),
            food_name: trimmedName,
            quantity_description: quantityDescription(parsedAmount, unit),
            calories: manualMacros.calories,
            protein_g: manualMacros.protein_g,
            carbs_g: manualMacros.carbs_g,
            fat_g: manualMacros.fat_g,
          },
        ],
      });
    } else if (selected && parsedAmount != null) {
      const item = mealItemFromFood(selected, parsedAmount, unit);
      onAddMeal({
        id: crypto.randomUUID(),
        meal_slot: mealSlot,
        items: [item],
      });
    } else {
      return;
    }

    setQuery("");
    setSelected(null);
    setAmount("100");
    setUnit("grams");
    clearManualMacros();
  }

  const canSubmitCatalog = selected != null && parsedAmount != null;
  const canSubmitManual =
    isManualEntry && manualMacros != null && parsedAmount != null;
  const canSubmit = canSubmitCatalog || canSubmitManual;
  const canSaveHabitual = canSubmit && !isCurrentSaved;

  const showDropdown =
    listOpen && (query.length > 0 || dropdownItems.length > 0);

  return (
    <section className="rounded-2xl border border-emerald-100 bg-white shadow-sm">
      <header className="flex items-center gap-2 border-b border-emerald-50 px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white">
          <UtensilsCrossed className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Registrar comida</h2>
          <p className="text-xs text-zinc-500">
            Catálogo, habituales o macros manuales
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <div ref={wrapperRef} className="relative">
          <label className="mb-1 block text-xs font-medium text-zinc-600">
            Alimento
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelected(null);
                setListOpen(true);
              }}
              onFocus={() => setListOpen(true)}
              placeholder="Tus habituales o buscar…"
              autoComplete="off"
              className="w-full rounded-xl border border-zinc-200 py-2.5 pl-10 pr-3 text-sm outline-none ring-emerald-500 focus:ring-2"
            />
          </div>

          {showDropdown && (
            <ul
              className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-lg"
              role="listbox"
            >
              {!query.trim() && presets.length > 0 && dropdownItems.some((i) => i.kind === "preset") && (
                <li className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                  Tus habituales
                </li>
              )}
              {dropdownItems.map((item) =>
                item.kind === "preset" ? (
                  <li key={`preset-${item.preset.id}`} className="group relative">
                    <button
                      type="button"
                      role="option"
                      className="flex w-full flex-col px-3 py-2 pr-9 text-left text-sm hover:bg-emerald-50"
                      onClick={() => pickItem(item)}
                    >
                      <span className="flex items-center gap-1.5 font-medium text-zinc-900">
                        <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
                        {presetLabel(item.preset)}
                      </span>
                      <span className="pl-5 text-xs text-zinc-500">
                        {item.preset.meal_slot
                          ? MEAL_SLOT_LABELS[item.preset.meal_slot]
                          : "Habitual"}
                        {" · "}
                        {item.preset.manual_macros
                          ? `${Math.round(item.preset.manual_macros.calories)} kcal (manual)`
                          : `${item.preset.food.calories} kcal / 100 g`}
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label="Quitar habitual"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-400 opacity-0 transition hover:bg-zinc-100 hover:text-zinc-600 group-hover:opacity-100"
                      onClick={(e) => handleRemovePreset(e, item.preset.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ) : (
                  <li key={`food-${item.food.id}`}>
                    <button
                      type="button"
                      role="option"
                      className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-emerald-50"
                      onClick={() => pickItem(item)}
                    >
                      <span className="font-medium text-zinc-900">
                        {item.food.name}
                      </span>
                      <span className="text-xs text-zinc-500">
                        Catálogo · {item.food.calories} kcal / 100 g
                      </span>
                    </button>
                  </li>
                ),
              )}
              {query.trim() && (
                <li className="border-t border-zinc-100">
                  <button
                    type="button"
                    className="flex w-full px-3 py-2.5 text-left text-sm font-medium text-emerald-800 hover:bg-emerald-50"
                    onClick={() => {
                      setSelected(null);
                      setListOpen(false);
                    }}
                  >
                    + Usar «{trimmedName}» con macros manuales
                  </button>
                </li>
              )}
            </ul>
          )}

          {isManualEntry && (
            <p className="mt-1 text-xs text-emerald-700">
              Ingreso manual: completá los macros de esta porción abajo.
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">
              Cantidad
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                list={selected ? "salud-saved-amounts" : undefined}
                className="min-w-0 flex-1 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none ring-emerald-500 focus:ring-2"
              />
              {selected && savedAmounts.length > 0 && (
                <datalist id="salud-saved-amounts">
                  {savedAmounts.map((p) => (
                    <option
                      key={p.id}
                      value={String(p.amount)}
                      label={
                        p.unit === "grams"
                          ? `${p.amount} g`
                          : `${p.amount} porc.`
                      }
                    />
                  ))}
                </datalist>
              )}
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as QuantityUnit)}
                className="rounded-xl border border-zinc-200 bg-white px-2 py-2.5 text-sm outline-none ring-emerald-500 focus:ring-2"
              >
                <option value="grams">Gramos</option>
                <option value="portions">Porciones</option>
              </select>
            </div>
            {selected && savedAmounts.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {savedAmounts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setAmount(String(p.amount));
                      setUnit(p.unit);
                      if (p.manual_macros) {
                        setManualCalories(String(p.manual_macros.calories));
                        setManualProtein(String(p.manual_macros.protein_g));
                        setManualCarbs(String(p.manual_macros.carbs_g));
                        setManualFat(String(p.manual_macros.fat_g));
                      }
                    }}
                    className="rounded-lg border border-emerald-200 bg-emerald-50/80 px-2 py-0.5 text-xs font-medium text-emerald-800 transition hover:bg-emerald-100"
                  >
                    {p.unit === "grams" ? `${p.amount} g` : `${p.amount} porc.`}
                  </button>
                ))}
              </div>
            )}
            {unit === "portions" && selected?.default_portion_g && (
              <p className="mt-1 text-xs text-zinc-500">
                1 porción ≈ {selected.default_portion_g} g
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">
              Comida
            </label>
            <select
              value={mealSlot}
              onChange={(e) => setMealSlot(e.target.value as MealSlot)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none ring-emerald-500 focus:ring-2"
            >
              {MEAL_OPTIONS.map((slot) => (
                <option key={slot} value={slot}>
                  {MEAL_SLOT_LABELS[slot]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isManualEntry && (
          <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-3">
            <p className="mb-2 text-xs font-medium text-zinc-600">
              Macros de esta porción (totales, no por 100 g)
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <label className="block text-xs">
                <span className="text-zinc-500">Calorías</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={manualCalories}
                  onChange={(e) => setManualCalories(e.target.value)}
                  placeholder="kcal"
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-2 text-sm outline-none ring-emerald-500 focus:ring-2"
                />
              </label>
              <label className="block text-xs">
                <span className="text-zinc-500">Proteínas (g)</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={manualProtein}
                  onChange={(e) => setManualProtein(e.target.value)}
                  placeholder="0"
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-2 text-sm outline-none ring-emerald-500 focus:ring-2"
                />
              </label>
              <label className="block text-xs">
                <span className="text-zinc-500">Carbs (g)</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={manualCarbs}
                  onChange={(e) => setManualCarbs(e.target.value)}
                  placeholder="0"
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-2 text-sm outline-none ring-emerald-500 focus:ring-2"
                />
              </label>
              <label className="block text-xs">
                <span className="text-zinc-500">Grasas (g)</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={manualFat}
                  onChange={(e) => setManualFat(e.target.value)}
                  placeholder="0"
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-2 text-sm outline-none ring-emerald-500 focus:ring-2"
                />
              </label>
            </div>
          </div>
        )}

        {preview && (
          <div className="rounded-xl bg-emerald-50/80 px-4 py-3 text-sm text-emerald-950">
            <p className="font-medium">{selected?.name ?? trimmedName}</p>
            <p className="mt-1 tabular-nums text-emerald-900">
              {Math.round(preview.calories)} kcal · P {preview.protein_g} g · C{" "}
              {preview.carbs_g} g · G {preview.fat_g} g
              {catalogPreview && (
                <span className="text-emerald-700/80">
                  {" "}
                  ({Math.round(catalogPreview.grams)} g total)
                </span>
              )}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Agregar al día
          </button>
          <button
            type="button"
            disabled={!canSaveHabitual}
            onClick={handleSaveHabitual}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
          >
            <Bookmark className="h-4 w-4" />
            {isCurrentSaved ? "Ya está guardado" : "Guardar como habitual"}
          </button>
          {savedHint && (
            <span className="text-xs text-emerald-700">Guardado en tus habituales</span>
          )}
        </div>
      </form>
    </section>
  );
}
