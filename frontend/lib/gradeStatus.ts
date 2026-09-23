/** A–C = Pass (kijani), D–F = Fail (nyekundu), tupu = Incomplete (bahari) */
export type ResultStatus = "pass" | "fail" | "incomplete";

export function resultStatus(grade?: string | null, marks?: number | null): ResultStatus {
  if (grade == null || String(grade).trim() === "") {
    if (marks == null || Number.isNaN(Number(marks))) return "incomplete";
  }
  const g = String(grade || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-F]/g, "")
    .charAt(0);
  if (!g) return "incomplete";
  if (g === "A" || g === "B" || g === "C") return "pass";
  return "fail";
}

export function statusLabel(s: ResultStatus): string {
  if (s === "pass") return "PASS";
  if (s === "fail") return "FAIL";
  return "INCOMPLETE";
}

export function statusStyle(s: ResultStatus): { backgroundColor: string; color: string } {
  if (s === "pass") return { backgroundColor: "#DCFCE7", color: "#166534" }; // green
  if (s === "fail") return { backgroundColor: "#FEE2E2", color: "#991B1B" }; // red
  return { backgroundColor: "#E0F2FE", color: "#075985" }; // ocean / sky
}
