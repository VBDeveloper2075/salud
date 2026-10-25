const LEGACY_PROFILE = "pulso_profile";
const LEGACY_DAY_PREFIX = "pulso_day_";
const LEGACY_PRESETS = "pulso_saved_presets";

export const PROFILE_KEY = "salud_profile";
export const DAY_KEY_PREFIX = "salud_day_";
export const SAVED_PRESETS_KEY = "salud_saved_presets";

let migrated = false;

export function ensureSaludStorageMigrated() {
  if (migrated || typeof window === "undefined") return;
  migrated = true;

  if (!localStorage.getItem(PROFILE_KEY)) {
    const legacy = localStorage.getItem(LEGACY_PROFILE);
    if (legacy) localStorage.setItem(PROFILE_KEY, legacy);
  }

  if (!localStorage.getItem(SAVED_PRESETS_KEY)) {
    const legacy = localStorage.getItem(LEGACY_PRESETS);
    if (legacy) localStorage.setItem(SAVED_PRESETS_KEY, legacy);
  }

  const dayMoves: { from: string; to: string }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(LEGACY_DAY_PREFIX)) {
      const date = key.slice(LEGACY_DAY_PREFIX.length);
      dayMoves.push({ from: key, to: `${DAY_KEY_PREFIX}${date}` });
    }
  }
  for (const { from, to } of dayMoves) {
    if (!localStorage.getItem(to)) {
      const value = localStorage.getItem(from);
      if (value) localStorage.setItem(to, value);
    }
  }
}
