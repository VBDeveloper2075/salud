"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import {
  PROFILE_KEY,
  ensureSaludStorageMigrated,
} from "@/lib/salud/storage";
import type { UserProfile } from "@/types/nutrition";
import { DEFAULT_PROFILE } from "@/types/nutrition";

export default function PerfilPage() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    ensureSaludStorageMigrated();
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-full bg-zinc-50">
      <div className="mx-auto max-w-lg px-4 py-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-emerald-700 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Salud
        </Link>

        <h1 className="text-2xl font-semibold text-zinc-900">Tu perfil</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Metas y datos para personalizar el balance calórico. (Persistencia
          local; con Supabase Auth se sincroniza en la nube.)
        </p>

        <form
          onSubmit={handleSave}
          className="mt-8 space-y-4 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm"
        >
          <label className="block text-sm">
            <span className="font-medium text-zinc-700">Nombre</span>
            <input
              type="text"
              value={profile.displayName}
              onChange={(e) =>
                setProfile((p) => ({ ...p, displayName: e.target.value }))
              }
              className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm">
              <span className="font-medium text-zinc-700">Peso (kg)</span>
              <input
                type="number"
                step="0.1"
                value={profile.weight_kg}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    weight_kg: Number(e.target.value),
                  }))
                }
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-zinc-700">Altura (cm)</span>
              <input
                type="number"
                value={profile.height_cm}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    height_cm: Number(e.target.value),
                  }))
                }
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm">
              <span className="font-medium text-zinc-700">Edad</span>
              <input
                type="number"
                value={profile.age}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, age: Number(e.target.value) }))
                }
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-zinc-700">Peso objetivo (kg)</span>
              <input
                type="number"
                step="0.1"
                value={profile.target_weight_kg}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    target_weight_kg: Number(e.target.value),
                  }))
                }
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2"
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="font-medium text-zinc-700">Meta diaria (kcal)</span>
            <input
              type="number"
              value={profile.daily_calorie_goal}
              onChange={(e) =>
                setProfile((p) => ({
                  ...p,
                  daily_calorie_goal: Number(e.target.value),
                }))
              }
              className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            <span className="font-medium text-zinc-700">
              Rutinas fijas (una por línea)
            </span>
            <textarea
              rows={4}
              value={profile.fixed_routines.join("\n")}
              onChange={(e) =>
                setProfile((p) => ({
                  ...p,
                  fixed_routines: e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                }))
              }
              className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2"
              placeholder="Ej: Yoga lunes y miércoles 19:00"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            {saved ? "Guardado ✓" : "Guardar perfil"}
          </button>
        </form>
      </div>
    </div>
  );
}
