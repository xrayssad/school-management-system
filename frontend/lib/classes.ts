export const CLASS_ORDER = [
  "Maandalizi",
  "Darasa la 1",
  "Darasa la 2",
  "Darasa la 3",
  "Darasa la 4",
  "Darasa la 5",
] as const;

export function allClasses(): string[] {
  return [...CLASS_ORDER];
}
