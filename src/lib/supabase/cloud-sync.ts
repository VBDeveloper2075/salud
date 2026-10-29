import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  fetchRemoteDay,
  getSessionUserId,
  saveRemoteActivityLog,
  saveRemoteDay,
  saveRemotePresets,
  upsertRemoteProfile,
} from "@/lib/supabase/repository";
import type { ActivityLog } from "@/types/activities";
import type { SavedFoodPreset } from "@/types/food";
import type { DailyNutritionState, UserProfile } from "@/types/nutrition";

export function cloudSyncEnabled(): boolean {
  return isSupabaseConfigured() && typeof window !== "undefined";
}

export async function syncProfileToCloud(profile: UserProfile): Promise<void> {
  if (!cloudSyncEnabled()) return;
  const userId = await getSessionUserId();
  if (!userId) return;
  await upsertRemoteProfile(userId, profile);
}

export async function syncDayToCloud(state: DailyNutritionState): Promise<void> {
  if (!cloudSyncEnabled()) return;
  const userId = await getSessionUserId();
  if (!userId) return;
  await saveRemoteDay(userId, state);
}

export async function loadDayFromCloud(
  logDate: string,
): Promise<DailyNutritionState | null> {
  if (!cloudSyncEnabled()) return null;
  const userId = await getSessionUserId();
  if (!userId) return null;
  return fetchRemoteDay(userId, logDate);
}

export async function syncActivityLogToCloud(log: ActivityLog): Promise<void> {
  if (!cloudSyncEnabled()) return;
  const userId = await getSessionUserId();
  if (!userId) return;
  await saveRemoteActivityLog(userId, log);
}

export async function syncPresetsToCloud(presets: SavedFoodPreset[]): Promise<void> {
  if (!cloudSyncEnabled()) return;
  const userId = await getSessionUserId();
  if (!userId) return;
  await saveRemotePresets(userId, presets);
}
