"use client";

import Link from "next/link";
import {
  Activity,
  Dumbbell,
  Home,
  UserRound,
  UtensilsCrossed,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ActivitiesPanel } from "@/components/pulso/ActivitiesPanel";
import { NutritionPanel } from "@/components/pulso/NutritionPanel";
import { DailyVideoPlayer } from "@/components/pulso/DailyVideoPlayer";
import { getDailyBalance, todayIsoDate } from "@/lib/nutrition/calculations";
import {
  DAY_KEY_PREFIX,
  PROFILE_KEY,
  ensureSaludStorageMigrated,
} from "@/lib/salud/storage";
import type { DailyNutritionState, MealEntry, UserProfile } from "@/types/nutrition";
import { DEFAULT_PROFILE } from "@/types/nutrition";

type MainTab = "home" | "nutrition" | "activities";

const TAB_LABELS: Record<MainTab, string> = {
  home: "Inicio",
  nutrition: "Nutrición",
  activities: "Actividades",
};

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

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-medium transition-all duration-200 sm:flex-none sm:gap-2 sm:px-4 sm:text-sm ${
        active
          ? "bg-emerald-600 text-white shadow-sm"
          : "text-zinc-600 hover:bg-zinc-100 active:scale-[0.98]"
      }`}
    >
      {children}
    </button>
  );
}

export function SaludApp() {
  const [tab, setTab] = useState<MainTab>("home");
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

  const headerSubtitle =
    tab === "home"
      ? "Rutina y bienestar del día"
      : tab === "nutrition"
        ? "Registro de comidas y balance"
        : "Calendario de actividades";

  if (!logDate) {
    return (
      <div className="flex min-h-full items-center justify-center bg-zinc-50 text-sm text-zinc-500">
        Cargando Salud…
      </div>
    );
  }

  return (
    <div
      className={`min-h-full ${
        tab === "home"
          ? "bg-gradient-to-b from-emerald-950 via-zinc-900 to-zinc-950"
          : "bg-gradient-to-b from-emerald-50/80 to-zinc-50"
      }`}
    >
      <header
        className={`sticky top-0 z-20 border-b backdrop-blur-md ${
          tab === "home"
            ? "border-white/10 bg-zinc-950/80"
            : "border-emerald-100/80 bg-white/90"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${
                tab === "home" ? "bg-emerald-500" : "bg-emerald-600"
              }`}
            >
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h1
                className={`text-lg font-semibold tracking-tight ${
                  tab === "home" ? "text-white" : "text-zinc-900"
                }`}
              >
                Salud
              </h1>
              <p
                className={`text-xs ${
                  tab === "home" ? "text-emerald-100/70" : "text-zinc-500"
                }`}
              >
                {headerSubtitle}
              </p>
            </div>
          </div>
          <Link
            href="/perfil"
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
              tab === "home"
                ? "border-white/15 text-white hover:bg-white/10"
                : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            <UserRound className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </Link>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 px-4 pb-3 sm:gap-2">
          <TabButton active={tab === "home"} onClick={() => setTab("home")}>
            <Home className="h-4 w-4 shrink-0" />
            {TAB_LABELS.home}
          </TabButton>
          <TabButton
            active={tab === "nutrition"}
            onClick={() => setTab("nutrition")}
          >
            <UtensilsCrossed className="h-4 w-4 shrink-0" />
            {TAB_LABELS.nutrition}
          </TabButton>
          <TabButton
            active={tab === "activities"}
            onClick={() => setTab("activities")}
          >
            <Dumbbell className="h-4 w-4 shrink-0" />
            {TAB_LABELS.activities}
          </TabButton>
        </nav>
      </header>

      <main
        className={`mx-auto w-full max-w-6xl px-4 py-6 ${
          tab !== "home" ? "min-w-0 overflow-x-clip" : ""
        }`}
      >
        <div
          key={tab}
          className="animate-[fadeIn_0.25s_ease-out]"
          style={{
            animationFillMode: "backwards",
          }}
        >
          {tab === "home" && (
            <div className="flex min-h-[calc(100dvh-11rem)] flex-col items-center justify-center py-4 sm:min-h-[calc(100dvh-10rem)] sm:py-8">
              <DailyVideoPlayer variant="hero" />
            </div>
          )}

          {tab === "nutrition" && (
            <NutritionPanel
              meals={dayState.meals}
              onAddMeal={handleAddMeal}
              calorieGoal={profile.daily_calorie_goal}
              consumed={balance.consumed.calories}
              burned={balance.burned}
              remaining={balance.remainingCalories}
              protein_g={balance.consumed.protein_g}
              carbs_g={balance.consumed.carbs_g}
              fat_g={balance.consumed.fat_g}
              weeklyNetCalories={weeklyNetCalories}
            />
          )}

          {tab === "activities" && <ActivitiesPanel />}
        </div>
      </main>
    </div>
  );
}
