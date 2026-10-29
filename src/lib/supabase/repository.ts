import { createClient } from "@/lib/supabase/client";
import type { ActivityLog } from "@/types/activities";
import type { SavedFoodPreset } from "@/types/food";
import type {
  DailyNutritionState,
  ExerciseEntry,
  MealEntry,
  MealItem,
  UserProfile,
} from "@/types/nutrition";
import { DEFAULT_PROFILE } from "@/types/nutrition";
import {
  DAY_KEY_PREFIX,
  PROFILE_KEY,
  SAVED_PRESETS_KEY,
} from "@/lib/salud/storage";

const ACTIVITY_LOG_KEY = "salud_activity_log";

type ProfileRow = {
  display_name: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  age: number | null;
  target_weight_kg: number | null;
  daily_calorie_goal: number;
  fixed_routines: string[] | null;
  activity_log: ActivityLog | null;
  saved_food_presets: SavedFoodPreset[] | null;
};

type MealRow = {
  id: string;
  meal_slot: MealEntry["meal_slot"];
  food_name: string;
  quantity_description: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  raw_message: string | null;
  client_meal_id: string | null;
  client_item_id: string | null;
};

type ExerciseRow = {
  id: string;
  activity_name: string;
  duration_minutes: number | null;
  calories_burned: number;
  raw_message: string | null;
  client_exercise_id: string | null;
};

function profileFromRow(row: ProfileRow): UserProfile {
  return {
    displayName: row.display_name?.trim() || DEFAULT_PROFILE.displayName,
    weight_kg: Number(row.weight_kg ?? DEFAULT_PROFILE.weight_kg),
    height_cm: Number(row.height_cm ?? DEFAULT_PROFILE.height_cm),
    age: Number(row.age ?? DEFAULT_PROFILE.age),
    target_weight_kg: Number(row.target_weight_kg ?? DEFAULT_PROFILE.target_weight_kg),
    daily_calorie_goal: Number(
      row.daily_calorie_goal ?? DEFAULT_PROFILE.daily_calorie_goal,
    ),
    fixed_routines: Array.isArray(row.fixed_routines) ? row.fixed_routines : [],
  };
}

function profileToRow(profile: UserProfile) {
  return {
    display_name: profile.displayName,
    weight_kg: profile.weight_kg,
    height_cm: profile.height_cm,
    age: profile.age,
    target_weight_kg: profile.target_weight_kg,
    daily_calorie_goal: profile.daily_calorie_goal,
    fixed_routines: profile.fixed_routines,
  };
}

function mealsFromRows(rows: MealRow[]): MealEntry[] {
  const byMeal = new Map<string, MealEntry>();

  for (const row of rows) {
    const mealKey = row.client_meal_id ?? `${row.meal_slot}-${row.id}`;
    let meal = byMeal.get(mealKey);
    if (!meal) {
      meal = {
        id: row.client_meal_id ?? mealKey,
        meal_slot: row.meal_slot,
        items: [],
        raw_message: row.raw_message ?? undefined,
      };
      byMeal.set(mealKey, meal);
    }

    const item: MealItem = {
      id: row.client_item_id ?? row.id,
      food_name: row.food_name,
      quantity_description: row.quantity_description ?? undefined,
      calories: Number(row.calories),
      protein_g: Number(row.protein_g),
      carbs_g: Number(row.carbs_g),
      fat_g: Number(row.fat_g),
    };
    meal.items.push(item);
  }

  return [...byMeal.values()];
}

function mealRowsFromState(
  userId: string,
  dailyLogId: string,
  logDate: string,
  meals: MealEntry[],
) {
  const rows: Record<string, unknown>[] = [];
  for (const meal of meals) {
    for (const item of meal.items) {
      rows.push({
        user_id: userId,
        daily_log_id: dailyLogId,
        log_date: logDate,
        meal_slot: meal.meal_slot,
        food_name: item.food_name,
        quantity_description: item.quantity_description ?? null,
        calories: item.calories,
        protein_g: item.protein_g,
        carbs_g: item.carbs_g,
        fat_g: item.fat_g,
        raw_message: meal.raw_message ?? null,
        client_meal_id: meal.id,
        client_item_id: item.id,
      });
    }
  }
  return rows;
}

function exercisesFromRows(rows: ExerciseRow[]): ExerciseEntry[] {
  return rows.map((row) => ({
    id: row.client_exercise_id ?? row.id,
    activity_name: row.activity_name,
    duration_minutes: row.duration_minutes ?? undefined,
    calories_burned: Number(row.calories_burned),
    raw_message: row.raw_message ?? undefined,
  }));
}

export async function getSessionUserId(): Promise<string | null> {
  const supabase = createClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function fetchRemoteProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "display_name, weight_kg, height_cm, age, target_weight_kg, daily_calorie_goal, fixed_routines",
    )
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return profileFromRow(data as ProfileRow);
}

export async function upsertRemoteProfile(
  userId: string,
  profile: UserProfile,
): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      ...profileToRow(profile),
    },
    { onConflict: "id" },
  );

  return !error;
}

export async function fetchRemoteDay(
  userId: string,
  logDate: string,
): Promise<DailyNutritionState | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data: log, error: logError } = await supabase
    .from("daily_logs")
    .select("id")
    .eq("user_id", userId)
    .eq("log_date", logDate)
    .maybeSingle();

  if (logError || !log) {
    return { logDate, meals: [], exercises: [] };
  }

  const dailyLogId = log.id as string;

  const [mealsRes, exercisesRes] = await Promise.all([
    supabase.from("meals_entries").select("*").eq("daily_log_id", dailyLogId),
    supabase.from("exercises").select("*").eq("daily_log_id", dailyLogId),
  ]);

  if (mealsRes.error || exercisesRes.error) return null;

  return {
    logDate,
    meals: mealsFromRows((mealsRes.data ?? []) as MealRow[]),
    exercises: exercisesFromRows((exercisesRes.data ?? []) as ExerciseRow[]),
  };
}

export async function saveRemoteDay(
  userId: string,
  state: DailyNutritionState,
): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  const consumed = state.meals.reduce(
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
  const burned = state.exercises.reduce((s, ex) => s + ex.calories_burned, 0);

  const { data: log, error: logError } = await supabase
    .from("daily_logs")
    .upsert(
      {
        user_id: userId,
        log_date: state.logDate,
        total_calories_consumed: consumed.calories,
        total_protein_g: consumed.protein_g,
        total_carbs_g: consumed.carbs_g,
        total_fat_g: consumed.fat_g,
        total_calories_burned: burned,
      },
      { onConflict: "user_id,log_date" },
    )
    .select("id")
    .single();

  if (logError || !log) return false;

  const dailyLogId = log.id as string;

  await supabase.from("meals_entries").delete().eq("daily_log_id", dailyLogId);
  await supabase.from("exercises").delete().eq("daily_log_id", dailyLogId);

  const mealRows = mealRowsFromState(userId, dailyLogId, state.logDate, state.meals);
  if (mealRows.length > 0) {
    const { error } = await supabase.from("meals_entries").insert(mealRows);
    if (error) return false;
  }

  if (state.exercises.length > 0) {
    const exerciseRows = state.exercises.map((ex) => ({
      user_id: userId,
      daily_log_id: dailyLogId,
      log_date: state.logDate,
      activity_name: ex.activity_name,
      duration_minutes: ex.duration_minutes ?? null,
      calories_burned: ex.calories_burned,
      raw_message: ex.raw_message ?? null,
      client_exercise_id: ex.id,
    }));
    const { error } = await supabase.from("exercises").insert(exerciseRows);
    if (error) return false;
  }

  return true;
}

export async function fetchRemoteActivityLog(userId: string): Promise<ActivityLog | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("activity_log")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  const log = data.activity_log;
  return log && typeof log === "object" ? (log as ActivityLog) : {};
}

export async function saveRemoteActivityLog(
  userId: string,
  log: ActivityLog,
): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("profiles")
    .update({ activity_log: log })
    .eq("id", userId);

  return !error;
}

export async function fetchRemotePresets(userId: string): Promise<SavedFoodPreset[] | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("saved_food_presets")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  const presets = data.saved_food_presets;
  return Array.isArray(presets) ? (presets as SavedFoodPreset[]) : [];
}

export async function saveRemotePresets(
  userId: string,
  presets: SavedFoodPreset[],
): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("profiles")
    .update({ saved_food_presets: presets })
    .eq("id", userId);

  return !error;
}

/** Sube perfil, actividades, presets y todos los días guardados en localStorage. */
export async function pushLocalStorageToRemote(userId: string): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const rawProfile = localStorage.getItem(PROFILE_KEY);
    if (rawProfile) {
      const profile = { ...DEFAULT_PROFILE, ...JSON.parse(rawProfile) } as UserProfile;
      await upsertRemoteProfile(userId, profile);
    }
  } catch {
    /* ignore */
  }

  try {
    const rawLog = localStorage.getItem(ACTIVITY_LOG_KEY);
    if (rawLog) {
      await saveRemoteActivityLog(userId, JSON.parse(rawLog) as ActivityLog);
    }
  } catch {
    /* ignore */
  }

  try {
    const rawPresets = localStorage.getItem(SAVED_PRESETS_KEY);
    if (rawPresets) {
      await saveRemotePresets(userId, JSON.parse(rawPresets) as SavedFoodPreset[]);
    }
  } catch {
    /* ignore */
  }

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(DAY_KEY_PREFIX)) continue;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const state = JSON.parse(raw) as DailyNutritionState;
      if (state?.logDate) await saveRemoteDay(userId, state);
    } catch {
      /* ignore */
    }
  }
}

export async function pullRemoteToLocalStorage(userId: string): Promise<void> {
  if (typeof window === "undefined") return;

  const supabase = createClient();
  if (!supabase) return;

  const profile = await fetchRemoteProfile(userId);
  if (profile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }

  const activityLog = await fetchRemoteActivityLog(userId);
  if (activityLog) {
    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(activityLog));
  }

  const presets = await fetchRemotePresets(userId);
  if (presets) {
    localStorage.setItem(SAVED_PRESETS_KEY, JSON.stringify(presets));
  }

  const { data: dayRows } = await supabase
    .from("daily_logs")
    .select("log_date")
    .eq("user_id", userId)
    .order("log_date", { ascending: false })
    .limit(120);

  for (const row of dayRows ?? []) {
    const logDate = String(row.log_date).slice(0, 10);
    const state = await fetchRemoteDay(userId, logDate);
    if (state) {
      localStorage.setItem(`${DAY_KEY_PREFIX}${logDate}`, JSON.stringify(state));
    }
  }
}
