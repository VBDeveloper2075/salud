"use client";

import { PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getDailyVideoForDay,
  getDayOfYear,
  type DailyVideo,
} from "@/lib/videos/daily-videos";

interface DailyVideoPlayerProps {
  /** hero: pantalla de inicio (vertical). card: formato compacto opcional */
  variant?: "hero" | "card";
}

export function DailyVideoPlayer({ variant = "hero" }: DailyVideoPlayerProps) {
  const [video, setVideo] = useState<DailyVideo | null>(null);

  useEffect(() => {
    const dayOfYear = getDayOfYear(new Date());
    setVideo(getDailyVideoForDay(dayOfYear));
  }, []);

  const frame = (
    <div
      className={
        variant === "hero"
          ? "relative aspect-[9/16] w-full max-w-[420px] overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl shadow-emerald-950/20 ring-1 ring-white/10"
          : "relative aspect-[9/16] w-full max-w-sm overflow-hidden rounded-2xl bg-zinc-100"
      }
    >
      {video ? (
        <iframe
          src={`${video.embedUrl}?rel=0&modestbranding=1`}
          title={video.title}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <div
          className="absolute inset-0 animate-pulse bg-gradient-to-b from-zinc-800 to-zinc-900"
          aria-hidden
        />
      )}
      {variant === "hero" && video && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-4 pb-4 pt-16">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-300/90">
            Video del día
          </p>
          <p className="mt-1 line-clamp-3 text-sm font-medium leading-snug text-white">
            {video.title}
          </p>
        </div>
      )}
    </div>
  );

  if (variant === "card") {
    return (
      <section className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
        <header className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-700">
            <PlayCircle className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">Video del día</h2>
            <p className="text-xs text-zinc-500">
              {video ? video.title : "Cargando…"}
            </p>
          </div>
        </header>
        {frame}
      </section>
    );
  }

  return (
    <section className="flex w-full flex-col items-center">
      <div className="mb-4 flex items-center gap-2 text-emerald-100/90">
        <PlayCircle className="h-5 w-5" aria-hidden />
        <h2 className="text-sm font-semibold tracking-wide">Tu short de hoy</h2>
      </div>
      {frame}
    </section>
  );
}
