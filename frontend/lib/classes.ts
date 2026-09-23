/** Madarasa rasmi: Maandalizi + Darasa la 1–5 (hakuna 6 wala 7). */
export const CLASS_ORDER = [
  "Maandalizi",
  "Darasa la 1",
  "Darasa la 2",
  "Darasa la 3",
  "Darasa la 4",
  "Darasa la 5",
] as const;

export type ClassName = (typeof CLASS_ORDER)[number];

export function allClasses(): string[] {
  return [...CLASS_ORDER];
}

export function isValidClass(name: string): boolean {
  return (CLASS_ORDER as readonly string[]).includes(name.trim());
}

export function sortClasses(names: string[]): string[] {
  const order = CLASS_ORDER as readonly string[];
  return [...names].sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}
