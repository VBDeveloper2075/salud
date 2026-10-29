"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  daysInMonth,
  formatTagsShort,
  getTagsForDate,
  isoFromParts,
  loadActivityLog,
  saveActivityLog,
  toggleTagOnDate,
} from "@/lib/activities/storage";
import { todayIsoDate } from "@/lib/nutrition/calculations";
import { syncActivityLogToCloud } from "@/lib/supabase/cloud-sync";
import {
  ACTIVITY_TAGS,
  ACTIVITY_TAG_BY_ID,
  MONTH_INITIALS,
  type ActivityLog,
  type ActivityTagId,
} from "@/types/activities";

function parseIso(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return { year: y, monthIndex: m - 1, day: d };
}

export function ActivitiesPanel() {
  const today = todayIsoDate();
  const todayParts = parseIso(today);
  const [year, setYear] = useState(todayParts.year);
  const [log, setLog] = useState<ActivityLog>({});
  const [selectedIso, setSelectedIso] = useState<string>(today);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLog(loadActivityLog());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveActivityLog(log);
    const timer = window.setTimeout(() => {
      void syncActivityLogToCloud(log);
    }, 800);
    return () => window.clearTimeout(timer);
  }, [log, hydrated]);

  const selectedTags = useMemo(
    () => getTagsForDate(log, selectedIso),
    [log, selectedIso],
  );

  const toggleTag = useCallback((tagId: ActivityTagId) => {
    setLog((prev) => toggleTagOnDate(prev, selectedIso, tagId));
  }, [selectedIso]);

  const monthStats = useMemo(() => {
    const counts: Record<ActivityTagId, number> = {
      yoga: 0,
      natacion: 0,
      stretching: 0,
      gym: 0,
      club: 0,
      amigos: 0,
    };
    for (const [iso, tags] of Object.entries(log)) {
      const p = parseIso(iso);
      if (p.year !== year) continue;
      for (const t of tags) counts[t] += 1;
    }
    return counts;
  }, [log, year]);

  if (!hydrated) {
    return (
      <div className="rounded-2xl border border-zinc-100 bg-white p-8 text-center text-sm text-zinc-500">
        Cargando actividades…
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <section className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">
              Hoy —{" "}
              {new Date(selectedIso + "T12:00:00").toLocaleDateString("es-AR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h2>
            <p className="text-xs text-zinc-500">
              Tocá las etiquetas para marcar o quitar
            </p>
          </div>
          {selectedIso !== today && (
            <button
              type="button"
              onClick={() => setSelectedIso(today)}
              className="text-xs font-medium text-emerald-700 hover:underline"
            >
              Ir a hoy
            </button>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {ACTIVITY_TAGS.map((tag) => {
            const active = selectedTags.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? tag.chipClass
                    : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                {tag.label}
                <span className="ml-1.5 text-xs opacity-80">({tag.short})</span>
              </button>
            );
          })}
        </div>
        {selectedTags.length > 0 && (
          <p className="mt-3 text-xs text-zinc-600">
            Registrado:{" "}
            <span className="font-medium text-violet-800">
              {formatTagsShort(selectedTags)}
            </span>
          </p>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-orange-200 bg-orange-500 px-4 py-2.5 text-white">
          <button
            type="button"
            aria-label="Año anterior"
            onClick={() => setYear((y) => y - 1)}
            className="rounded-lg p-1 hover:bg-orange-600"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-sm font-semibold tracking-wide">
            Ejercicios {year}
          </h2>
          <button
            type="button"
            aria-label="Año siguiente"
            onClick={() => setYear((y) => y + 1)}
            className="rounded-lg p-1 hover:bg-orange-600"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-xs">
            <thead>
              <tr className="bg-orange-500 text-white">
                <th className="sticky left-0 z-10 w-10 border-r border-orange-400 bg-emerald-600 px-1 py-2 font-semibold">
                  Día
                </th>
                {MONTH_INITIALS.map((m, i) => (
                  <th
                    key={`${m}-${i}`}
                    className="border-r border-orange-400/80 px-1 py-2 font-semibold"
                  >
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <tr
                  key={day}
                  className={day % 2 === 0 ? "bg-stone-700/90" : "bg-stone-600/85"}
                >
                  <td className="sticky left-0 z-10 border-r border-stone-500 bg-emerald-700 px-1 py-0.5 text-center font-medium text-white">
                    {day}
                  </td>
                  {MONTH_INITIALS.map((_, monthIndex) => {
                    const maxDay = daysInMonth(year, monthIndex);
                    if (day > maxDay) {
                      return (
                        <td
                          key={monthIndex}
                          className="border-r border-stone-500/50 bg-stone-800/40"
                        />
                      );
                    }
                    const iso = isoFromParts(year, monthIndex, day);
                    const tags = getTagsForDate(log, iso);
                    const isSelected = iso === selectedIso;
                    const isToday = iso === today;
                    return (
                      <td
                        key={monthIndex}
                        className={`border-r border-stone-500/50 p-0.5 align-top ${
                          isSelected ? "ring-2 ring-inset ring-emerald-400" : ""
                        }`}
                      >
                        <button
                          type="button"
                          title={iso}
                          onClick={() => setSelectedIso(iso)}
                          className={`flex min-h-[1.75rem] w-full flex-wrap items-center justify-center gap-0.5 rounded-sm px-0.5 py-0.5 text-[10px] leading-tight transition hover:brightness-110 ${
                            tags.length === 0
                              ? "text-stone-300 hover:bg-stone-500/30"
                              : "font-medium"
                          } ${isToday ? "outline outline-1 outline-emerald-300" : ""}`}
                        >
                          {tags.length === 0 ? (
                            <span className="opacity-0 select-none">·</span>
                          ) : (
                            tags.map((id) => (
                              <span
                                key={id}
                                className={`rounded px-0.5 ${ACTIVITY_TAG_BY_ID[id].cellClass}`}
                              >
                                {ACTIVITY_TAG_BY_ID[id].short}
                              </span>
                            ))
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-zinc-100 bg-zinc-50 px-4 py-3">
          <span className="w-full text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            Leyenda
          </span>
          {ACTIVITY_TAGS.map((tag) => (
            <span
              key={tag.id}
              className={`rounded px-2 py-0.5 text-xs font-medium ${tag.cellClass}`}
            >
              {tag.short} — {tag.label}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900">
          Totales {year}
        </h3>
        <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
          {ACTIVITY_TAGS.map((tag) => (
            <li
              key={tag.id}
              className="rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2 text-center"
            >
              <p className="text-lg font-semibold tabular-nums text-zinc-900">
                {monthStats[tag.id]}
              </p>
              <p className="text-xs text-zinc-500">{tag.label}</p>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-zinc-500">
          Clic en una celda del calendario para editar ese día con las etiquetas
          de arriba.
        </p>
      </section>
    </div>
  );
}
