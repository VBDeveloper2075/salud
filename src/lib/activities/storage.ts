import type { ActivityLog, ActivityTagId } from "@/types/activities";
import { ACTIVITY_TAG_BY_ID } from "@/types/activities";
import { ensureSaludStorageMigrated } from "@/lib/salud/storage";

const ACTIVITY_LOG_KEY = "salud_activity_log";

export function loadActivityLog(): ActivityLog {
  if (typeof window === "undefined") return {};
  ensureSaludStorageMigrated();
  try {
    const raw = localStorage.getItem(ACTIVITY_LOG_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ActivityLog;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveActivityLog(log: ActivityLog) {
  localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(log));
}

export function getTagsForDate(log: ActivityLog, isoDate: string): ActivityTagId[] {
  return log[isoDate] ?? [];
}

export function toggleTagOnDate(
  log: ActivityLog,
  isoDate: string,
  tagId: ActivityTagId,
): ActivityLog {
  const current = getTagsForDate(log, isoDate);
  const next = current.includes(tagId)
    ? current.filter((id) => id !== tagId)
    : [...current, tagId];

  if (next.length === 0) {
    const { [isoDate]: _, ...rest } = log;
    return rest;
  }
  return { ...log, [isoDate]: next };
}

export function isoFromParts(
  year: number,
  monthIndex: number,
  day: number,
): string {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function formatTagsShort(tagIds: ActivityTagId[]): string {
  if (tagIds.length === 0) return "";
  return tagIds.map((id) => ACTIVITY_TAG_BY_ID[id].short).join(" ");
}
