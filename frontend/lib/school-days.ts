/** Siku 6: Jumamosi … Alhamisi; Ijumaa haipo. */
export const FRIDAY_DAY_OF_WEEK = 4;

export const SCHOOL_DAYS = [
  { value: 5, label: "Jumamosi" },
  { value: 6, label: "Jumapili" },
  { value: 0, label: "Jumatatu" },
  { value: 1, label: "Jumanne" },
  { value: 2, label: "Jumatano" },
  { value: 3, label: "Alhamisi" },
] as const;

const LABEL_BY_VALUE: Record<number, string> = Object.fromEntries(
  SCHOOL_DAYS.map((d) => [d.value, d.label])
);

export function isSchoolDay(dayOfWeek: number): boolean {
  return dayOfWeek in LABEL_BY_VALUE;
}

export function formatSchoolDay(
  dayOfWeek?: number | string | null,
  dayLabel?: string | null
): string {
  if (dayOfWeek !== undefined && dayOfWeek !== null && dayOfWeek !== "") {
    const n = typeof dayOfWeek === "number" ? dayOfWeek : Number(dayOfWeek);
    if (!Number.isNaN(n) && isSchoolDay(n)) return LABEL_BY_VALUE[n];
  }
  if (dayLabel && dayLabel.trim()) return dayLabel.trim();
  return "—";
}
