/** Siku 6 za shule: J.1–J.6 (Jumatatu … Jumapili); Ijumaa haipo. */
export const FRIDAY_DAY_OF_WEEK = 4;

export const SCHOOL_DAYS = [
  { value: 0, label: "Jumatatu", j: "J.1" },
  { value: 1, label: "Jumanne", j: "J.2" },
  { value: 2, label: "Jumatano", j: "J.3" },
  { value: 3, label: "Alhamisi", j: "J.4" },
  { value: 5, label: "Jumamosi", j: "J.5" },
  { value: 6, label: "Jumapili", j: "J.6" },
] as const;

type SchoolDayValue = (typeof SCHOOL_DAYS)[number]["value"];

const J_BY_VALUE: Record<number, string> = Object.fromEntries(
  SCHOOL_DAYS.map((d) => [d.value, d.j])
);
const LABEL_BY_VALUE: Record<number, string> = Object.fromEntries(
  SCHOOL_DAYS.map((d) => [d.value, d.label])
);

export function isSchoolDay(dayOfWeek: number): dayOfWeek is SchoolDayValue {
  return dayOfWeek in J_BY_VALUE;
}

export function formatSchoolDay(
  dayOfWeek?: number | string | null,
  dayLabel?: string | null
): string {
  if (dayOfWeek !== undefined && dayOfWeek !== null && dayOfWeek !== "") {
    const n = typeof dayOfWeek === "number" ? dayOfWeek : Number(dayOfWeek);
    if (!Number.isNaN(n) && isSchoolDay(n)) {
      return `${J_BY_VALUE[n]} ${LABEL_BY_VALUE[n]}`;
    }
  }
  if (dayLabel && dayLabel.trim()) {
    const hit = SCHOOL_DAYS.find((d) => d.label === dayLabel.trim());
    if (hit) return `${hit.j} ${hit.label}`;
    return dayLabel;
  }
  return "—";
}
