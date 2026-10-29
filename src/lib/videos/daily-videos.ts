export interface DailyVideo {
  id: string;
  title: string;
  embedUrl: string;
}

function embed(youtubeId: string): string {
  return `https://www.youtube.com/embed/${youtubeId}`;
}

/** Lista estática — IDs de YouTube (embed). Enlaces explícitos del usuario priorizados. */
export const dailyVideos: DailyVideo[] = [
  {
    id: "gluteos-kettlebell",
    title: "Rutina de glúteos perfectos con pesas rusas",
    embedUrl: embed("eS786x0IkSY"),
  },
  {
    id: "abdomen-pesa-rusa",
    title: "Abdomen COMPLETO con Pesa Rusa",
    embedUrl: embed("ijqLOO-y8mw"),
  },
  {
    id: "hombro-kettlebell",
    title: "Ejercicios para hombro con PESA RUSA / KETTLEBELL",
    embedUrl: embed("DTCx_gktDkI"),
  },
  {
    id: "brazos-flacidos-mancuernas",
    title: "Rutina para brazos flácidos con mancuernas desde casa",
    embedUrl: embed("INuDLBpBTe4"),
  },
  {
    id: "brazos-4-movimientos",
    title: "Brazos más fuertes y firmes con 4 movimientos",
    embedUrl: embed("ywYzEkwNZ7s"),
  },
  {
    id: "beginner-homeworkout",
    title: "Simple Beginner's Homeworkout",
    embedUrl: embed("B1KbolzpWD4"),
  },
  {
    id: "ejercicios-kettlebell-casa",
    title: "Ejercicios con kettlebell en casa",
    embedUrl: embed("Us67aj3Us8c"),
  },
  {
    id: "muslos-pesas-rusas",
    title: "La mejor rutina para muslos con pesas rusas",
    embedUrl: embed("5ifEbq3j6oY"),
  },
  {
    id: "rodilla-crujidos",
    title: "Si tienes crujidos en la rodilla, esto necesita tu articulación",
    embedUrl: embed("QUdyWmUhWw8"),
  },
  {
    id: "dolor-rodillas",
    title: "Dolor de rodillas — mira esto",
    embedUrl: embed("rYDcVQ0E0Co"),
  },
  {
    id: "natacion-pecho",
    title: "Pecho (braza) — técnica de brazada",
    embedUrl: embed("5EgDuAjFqSA"),
  },
  {
    id: "nadar-eficiencia",
    title: "Nadar mejor es nadar con eficiencia",
    embedUrl: embed("yiOgJKD5Ow0"),
  },
  {
    id: "respiracion-crol",
    title: "Cómo y cuándo respirar en el crol",
    embedUrl: embed("dDVPgZJ6_os"),
  },
  {
    id: "high-elbow-recovery",
    title: "Master the high elbow recovery (crol)",
    embedUrl: embed("8-sTszGhl4U"),
  },
  {
    id: "ayuno",
    title: "Cómo puede ayudarte el ayuno",
    embedUrl: embed("nv5VaqxYFxw"),
  },
  {
    id: "higado-graso",
    title: "Estar delgado no descarta hígado graso",
    embedUrl: embed("ifOVspx0XUY"),
  },
  {
    id: "recuperarse-entrenar",
    title: "Recuperarse también es entrenar",
    embedUrl: embed("x6TN7mUuQC4"),
  },
  {
    id: "estres-metabolismo",
    title: "El estrés afecta tu metabolismo",
    embedUrl: embed("6Icu5UcUNr0"),
  },
  {
    id: "dieta-longevidad",
    title: "La mejor dieta para tu longevidad",
    embedUrl: embed("91aRRQrQgQA"),
  },
  {
    id: "plan-alimentacion",
    title: "El plan de alimentación ideal",
    embedUrl: embed("2Z-DkKWgXcE"),
  },
  {
    id: "fibra-ingesta",
    title: "Maximiza tu ingesta de fibra — beneficios y fuentes",
    embedUrl: embed("cRx_GMuHJjw"),
  },
  {
    id: "huesos-flora",
    title: "Fortalece tus huesos con tu flora",
    embedUrl: embed("aHRvfHuFwEw"),
  },
  {
    id: "digestion",
    title: "Optimiza tu digestión con estas herramientas",
    embedUrl: embed("SF16CoTvHso"),
  },
  {
    id: "perder-peso",
    title: "Las mejores estrategias para perder peso",
    embedUrl: embed("C8KTF1zAAgk"),
  },
];

/** Día del año en hora local: 1 (1 ene) … 365/366 (31 dic) */
export function getDayOfYear(date: Date = new Date()): number {
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((date.getTime() - startOfYear.getTime()) / msPerDay) + 1;
}

export function getDailyVideoIndex(dayOfYear: number): number {
  const len = dailyVideos.length;
  if (len === 0) return 0;
  return (((dayOfYear - 1) % len) + len) % len;
}

export function getDailyVideoForDay(dayOfYear: number): DailyVideo {
  return dailyVideos[getDailyVideoIndex(dayOfYear)]!;
}
