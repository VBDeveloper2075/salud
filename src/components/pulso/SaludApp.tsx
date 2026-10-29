"use client";

import Link from "next/link";
import { Activity, Dumbbell, UserRound, UtensilsCrossed } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivitiesPanel } from "@/components/pulso/ActivitiesPanel";
import { FoodEntryForm } from "@/components/pulso/FoodEntryForm";
import { DailyNutritionTable } from "@/components/pulso/DailyNutritionTable";
import { BalanceDashboard } from "@/components/pulso/BalanceDashboard";
import { DailyVideoPlayer } from "@/components/pulso/DailyVideoPlayer";
import { getDailyBalance, todayIsoDate } from "@/lib/nutrition/calculations";
import {
  DAY_KEY_PREFIX,
  PROFILE_KEY,
  ensureSaludStorageMigrated,
} from "@/lib/salud/storage";
import type { DailyNutritionState, MealEntry, UserProfile } from "@/types/nutrition";
import { DEFAULT_PROFILE } from "@/types/nutrition";

type MainTab = "nutrition" | "activities";

function loadProfile(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  ensureSaludStorageMigrated();
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) } as UserProfile;
  } catch {
    return DEFAULT_PROFILE;
  }
}

function loadDay(date: string): DailyNutritionState {
  if (typeof window === "undefined") {
    return { logDate: date, meals: [], exercises: [] };
  }
  ensureSaludStorageMigrated();
  try {
    const raw = localStorage.getItem(`${DAY_KEY_PREFIX}${date}`);
    if (!raw) return { logDate: date, meals: [], exercises: [] };
    return JSON.parse(raw) as DailyNutritionState;
  } catch {
    return { logDate: date, meals: [], exercises: [] };
  }
}

function saveDay(state: DailyNutritionState) {
  localStorage.setItem(`${DAY_KEY_PREFIX}${state.logDate}`, JSON.stringify(state));
}

function weekdayShort(date: Date) {
  return date.toLocaleDateString("es-AR", { weekday: "short" });
}

export function SaludApp() {
  const [tab, setTab] = useState<MainTab>("nutrition");
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());

  useEffect(() => {
    const syncProfile = () => setProfile(loadProfile());
    syncProfile();
    window.addEventListener("focus", syncProfile);
    return () => window.removeEventListener("focus", syncProfile);
  }, []);

  useEffect(() => {
    const today = todayIsoDate();
    setLogDate(today);
    setDayState(loadDay(today));
  }, []);
  const [logDate, setLogDate] = useState<string | null>(null);
  const [dayState, setDayState] = useState<DailyNutritionState>({
    logDate: "",
    meals: [],
    exercises: [],
  });

  useEffect(() => {
    saveDay(dayState);
  }, [dayState]);

  const balance = useMemo(
    () => getDailyBalance(dayState, profile.daily_calorie_goal),
    [dayState, profile.daily_calorie_goal],
  );

  const weeklyNetCalories = useMemo(() => {
    if (!logDate) return [];
    const points: { day: string; net: number }[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const state = iso === logDate ? dayState : loadDay(iso);
      const b = getDailyBalance(state, profile.daily_calorie_goal);
      points.push({
        day: weekdayShort(d),
        net: Math.round(b.netCalories),
      });
    }
    return points;
  }, [dayState, logDate, profile.daily_calorie_goal]);

  const handleAddMeal = useCallback((entry: MealEntry) => {
    setDayState((prev) => ({
      ...prev,
      meals: [...prev.meals, entry],
    }));
  }, []);

  if (!logDate) {
    return (
      <div className="flex min-h-full items-center justify-center bg-zinc-50 text-sm text-zinc-500">
        Cargando Salud…
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-emerald-50/80 to-zinc-50">
      <header className="sticky top-0 z-10 border-b border-emerald-100/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-zinc-900">
                Salud
              </h1>
              <p className="text-xs text-zinc-500">
                {tab === "nutrition"
                  ? "Registro de comidas"
                  : "Registro de actividades"}
              </p>
            </div>
          </div>
          <Link
            href="/perfil"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            <UserRound className="h-4 w-4" />
            Perfil
          </Link>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 px-4 pb-3">
          <button
            type="button"
            onClick={() => setTab("nutrition")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
              tab === "nutrition"
                ? "bg-emerald-600 text-white"
                : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            <UtensilsCrossed className="h-4 w-4" />
            Nutrición
          </button>
          <button
            type="button"
            onClick={() => setTab("activities")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
              tab === "activities"
                ? "bg-emerald-600 text-white"
                : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            <Dumbbell className="h-4 w-4" />
            Actividades
          </button>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <DailyVideoPlayer />
        {tab === "nutrition" ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="flex flex-col gap-6">
              <FoodEntryForm onAddMeal={handleAddMeal} />
              <DailyNutritionTable meals={dayState.meals} />
            </div>
            <aside>
              <BalanceDashboard
                calorieGoal={profile.daily_calorie_goal}
                consumed={balance.consumed.calories}
                burned={balance.burned}
                remaining={balance.remainingCalories}
                protein_g={balance.consumed.protein_g}
                carbs_g={balance.consumed.carbs_g}
                fat_g={balance.consumed.fat_g}
                weeklyNetCalories={weeklyNetCalories}
              />
            </aside>
          </div>
        ) : (
          <ActivitiesPanel />
        )}
      </main>
    </div>
  );
}
