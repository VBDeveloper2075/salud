export type ActivityTagId =
  | "yoga"
  | "natacion"
  | "stretching"
  | "gym"
  | "club"
  | "amigos";

export interface ActivityTagDef {
  id: ActivityTagId;
  label: string;
  short: string;
  /** Clases Tailwind para chips y celdas */
  chipClass: string;
  cellClass: string;
}

export const ACTIVITY_TAGS: ActivityTagDef[] = [
  {
    id: "yoga",
    label: "Yoga",
    short: "y",
    chipClass: "bg-violet-600 text-white hover:bg-violet-700",
    cellClass: "bg-violet-600/90 text-white",
  },
  {
    id: "natacion",
    label: "Natación",
    short: "nat",
    chipClass: "bg-sky-600 text-white hover:bg-sky-700",
    cellClass: "bg-sky-600/90 text-white",
  },
  {
    id: "stretching",
    label: "Stretching",
    short: "str",
    chipClass: "bg-indigo-600 text-white hover:bg-indigo-700",
    cellClass: "bg-indigo-600/90 text-white",
  },
  {
    id: "gym",
    label: "Gym",
    short: "g",
    chipClass: "bg-amber-600 text-white hover:bg-amber-700",
    cellClass: "bg-amber-600/90 text-white",
  },
  {
    id: "club",
    label: "Club",
    short: "club",
    chipClass: "bg-fuchsia-600 text-white hover:bg-fuchsia-700",
    cellClass: "bg-fuchsia-600/90 text-white",
  },
  {
    id: "amigos",
    label: "Amigos",
    short: "am",
    chipClass: "bg-rose-600 text-white hover:bg-rose-700",
    cellClass: "bg-rose-600/90 text-white",
  },
];

export const ACTIVITY_TAG_BY_ID: Record<ActivityTagId, ActivityTagDef> =
  Object.fromEntries(ACTIVITY_TAGS.map((t) => [t.id, t])) as Record<
    ActivityTagId,
    ActivityTagDef
  >;

/** ISO date (YYYY-MM-DD) → actividades del día */
export type ActivityLog = Record<string, ActivityTagId[]>;

export const MONTH_INITIALS = [
  "E",
  "F",
  "M",
  "A",
  "M",
  "J",
  "J",
  "A",
  "S",
  "O",
  "N",
  "D",
] as const;
