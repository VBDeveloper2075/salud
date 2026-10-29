"use client";

import { PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getDailyVideoForDay,
  getDayOfYear,
  type DailyVideo,
} from "@/lib/videos/daily-videos";

export function DailyVideoPlayer() {
  const [video, setVideo] = useState<DailyVideo | null>(null);

  useEffect(() => {
    const dayOfYear = getDayOfYear(new Date());
    setVideo(getDailyVideoForDay(dayOfYear));
  }, []);

  return (
    <section className="mb-6 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
      <header className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-700">
          <PlayCircle className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Video del día</h2>
          <p className="text-xs text-zinc-500">
            {video
              ? video.title
              : "Cargando recomendación de hoy…"}
          </p>
        </div>
      </header>

      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-100">
        {video ? (
          <iframe
            src={video.embedUrl}
            title={video.title}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <div
            className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-200 to-zinc-100"
            aria-hidden
          />
        )}
      </div>
    </section>
  );
}
